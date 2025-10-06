import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  resendVerification
} from '../controllers/authController';
import { validate } from '../middleware/validation';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  emailVerificationSchema
} from '../validators/authValidators';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/verify-email', validate(emailVerificationSchema), verifyEmail);
router.post('/resend-verification', validate(emailVerificationSchema), resendVerification);

// Protected routes
router.post('/logout', authenticateToken, logout);

export { router as authRoutes };