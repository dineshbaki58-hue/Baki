import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscription?: {
      status: string;
      planSlug: string;
    };
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      subscription: user.subscription ? {
        status: user.subscription.status,
        planSlug: user.subscription.planSlug
      } : undefined
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

export const requireSubscription = (requiredPlan?: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.subscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    if (req.user.subscription.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        code: 'INACTIVE_SUBSCRIPTION'
      });
    }

    if (requiredPlan && req.user.subscription.planSlug !== requiredPlan) {
      return res.status(403).json({
        success: false,
        message: `Plan upgrade required. Current plan: ${req.user.subscription.planSlug}`,
        code: 'PLAN_UPGRADE_REQUIRED'
      });
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          subscription: true
        }
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          subscription: user.subscription ? {
            status: user.subscription.status,
            planSlug: user.subscription.planSlug
          } : undefined
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    next();
  }
};