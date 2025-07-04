import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import firmRoutes from './firm.routes';
import hybridAuthRoutes from './hybrid-auth.routes';
import onboardingRoutes from './onboarding.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/firms', firmRoutes);
router.use('/hybrid-auth', hybridAuthRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is operational' });
});

export default router;
