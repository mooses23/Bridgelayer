import { Router } from 'express';
import { loginLimiter, adminLoginLimiter } from '../middleware/rate-limit';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error';
import { sanitizeInput } from '../middleware/sanitization';
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  refreshTokenSchema,
  logoutSchema
} from '../services/validation.service';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Login routes
router.post('/login',
  loginLimiter,
  sanitizeInput(),
  validateRequest(loginSchema),
  asyncHandler(authController.login)
);

router.post('/login/admin',
  adminLoginLimiter,
  sanitizeInput(),
  validateRequest(loginSchema),
  asyncHandler(authController.adminLogin)
);

// Registration route
router.post('/register',
  loginLimiter,
  sanitizeInput(),
  validateRequest(registerSchema),
  asyncHandler(authController.register)
);

// OAuth routes - if implemented
router.get('/oauth/:provider',
  loginLimiter,
  asyncHandler((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

router.get('/oauth/:provider/callback',
  asyncHandler((req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
  })
);

// Password reset
router.post('/forgot-password',
  loginLimiter,
  sanitizeInput(),
  validateRequest(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);

router.post('/reset-password',
  loginLimiter,
  sanitizeInput(),
  validateRequest(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

// Token refresh
router.post('/refresh',
  sanitizeInput(),
  validateRequest(refreshTokenSchema),
  asyncHandler(authController.refreshToken)
);

// Logout route
router.post('/logout',
  sanitizeInput(),
  validateRequest(logoutSchema),
  asyncHandler(authController.logout)
);
);

// Logout
router.post('/logout',
  sanitizeInput(),
  asyncHandler(authController.logout)
);

// Get current user
router.get('/me',
  asyncHandler(authController.getCurrentUser)
);

export default router;
