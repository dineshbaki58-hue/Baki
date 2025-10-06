import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';
import { redis } from '../config/redis';

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Calculate BMR using Mifflin-St Jeor equation
const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'MALE' ? baseBMR + 5 : baseBMR - 161;
};

// Calculate TDEE based on activity level
const calculateTDEE = (bmr: number, activityLevel: string) => {
  const activityMultipliers = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers]);
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      height,
      weight,
      activityLevel,
      goals,
      allergies,
      dietType
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // Calculate BMR and TDEE
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        height,
        weight,
        activityLevel,
        goals,
        allergies: allergies || [],
        dietType,
        emailVerificationToken,
        onboardingCompleted: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        onboardingCompleted: true
      }
    });

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to BakiFitness - Verify Your Email',
        template: 'email-verification',
        data: {
          firstName,
          verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
        }
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in Redis
    await redis.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true
      }
    });

    if (!user) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in Redis
    await redis.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError('Refresh token required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new CustomError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Update refresh token in Redis
    await redis.setEx(`refresh_token:${decoded.userId}`, 7 * 24 * 60 * 60, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Remove refresh token from Redis
    await redis.del(`refresh_token:${userId}`);

    logger.info(`User logged out: ${userId}`);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: 'BakiFitness - Password Reset',
        template: 'password-reset',
        data: {
          firstName: user.firstName,
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      throw new CustomError('Failed to send password reset email', 500);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new CustomError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    // Invalidate all refresh tokens
    await redis.del(`refresh_token:${user.id}`);

    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    throw error;
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    });

    if (!user) {
      throw new CustomError('Invalid verification token', 400);
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null
      }
    });

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    throw error;
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken
      }
    });

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'BakiFitness - Verify Your Email',
        template: 'email-verification',
        data: {
          firstName: user.firstName,
          verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
        }
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      throw new CustomError('Failed to send verification email', 500);
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    throw error;
  }
};