import { Router, Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { OnboardingService } from '../services/onboardingService';
// Import our new unified authentication controller
const authController = require('../src/controllers/authController');

const router = Router();

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: { 
    success: false, 
    error: 'Too many login attempts. Please try again later.' 
  }
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // Stricter limit for admin login
  message: { 
    success: false, 
    error: 'Too many admin login attempts. Please try again later.' 
  }
});

// Request validation schemas
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
  tenantId: z.string().optional()
});

const onboardingCodeSchema = z.object({
  code: z.string().length(8, 'Invalid code format')
});

// Standard response format
const createResponse = (success: boolean, data?: any, error?: string) => ({
  success,
  ...(data && { data }),
  ...(error && { error })
});

// Use our new unified authentication controller
router.post('/login', loginLimiter, authController.loginTenant);

// Owner login endpoint (highest privilege level)
router.post('/owner-login', adminLoginLimiter, authController.loginOwner);

// Enhanced admin login endpoint
router.post('/admin-login', adminLoginLimiter, authController.loginAdmin);

// Onboarding code validation endpoint
router.post('/validate-onboarding-code', async (req: Request, res: Response) => {
  const validation = onboardingCodeSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json(createResponse(false, null, validation.error.message));
  }

  const { code } = validation.data;

  try {
    const onboardingCode = await OnboardingService.validateCode(code);
    
    if (!onboardingCode) {
      return res.status(400).json(createResponse(false, null, 'Invalid or expired code'));
    }

    if (onboardingCode.status !== 'active') {
      return res.status(400).json(createResponse(false, null, `Code is ${onboardingCode.status}`));
    }

    // Mark code as used
    await OnboardingService.markCodeAsUsed(code);

    res.json(createResponse(true, { onboardingCode }));
  } catch (error) {
    console.error('Code validation error:', error);
    res.status(500).json(createResponse(false, null, 'Internal server error'));
  }
});

// Session refresh endpoint
router.post('/refresh', authController.refreshTokens);

// Session validation endpoint
router.get('/session', authController.validateSession);

// Enhanced logout with cleanup
router.post('/logout', authController.logout);

export default router;
