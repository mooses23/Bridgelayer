import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import firmRoutes from './firm.routes';
import hybridAuthRoutes from './hybrid-auth.routes';
import onboardingRoutes from './onboarding.routes';
import adminRoutes from './admin.routes';
import { handleAgentSubmit, handleAgentQuery } from './agent';
import invoiceRoutes from './invoice.routes';
import documentRoutes from './document.routes';
import notificationRoutes from './notification.routes';
import calendarRoutes from './calendar.routes';
import tenantRoutes from './tenant.routes';

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/firms', firmRoutes);
router.use('/hybrid-auth', hybridAuthRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/admin', adminRoutes);

// Tenant portal routes
router.use('/tenant', tenantRoutes);

// Agent routes for universal form handling
router.post('/agent/submit', handleAgentSubmit);
router.post('/agent/query', handleAgentQuery);

// Register additional routes
router.use('/invoices', invoiceRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/calendar', calendarRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is operational' });
});

export default router;
