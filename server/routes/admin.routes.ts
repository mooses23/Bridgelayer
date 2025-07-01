import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { sanitizeInput } from '../middleware/sanitization';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const adminController = new AdminController();

// Validation schemas
const startGhostSessionSchema = z.object({
  targetFirmId: z.number().int().positive('Target firm ID must be positive'),
  purpose: z.string().min(1, 'Purpose is required'),
  notes: z.string().optional(),
});

const endGhostSessionSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
});

const platformSettingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
});

// Admin users
router.get('/users',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.getAdminUsers.bind(adminController))
);

// Ghost mode
router.post('/ghost/start',
  requireAuth,
  requireAdmin,
  sanitizeInput(),
  validateRequest(startGhostSessionSchema),
  asyncHandler(adminController.startGhostSession.bind(adminController))
);

router.post('/ghost/end',
  requireAuth,
  requireAdmin,
  sanitizeInput(),
  validateRequest(endGhostSessionSchema),
  asyncHandler(adminController.endGhostSession.bind(adminController))
);

router.get('/ghost/active',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.getActiveGhostSessions.bind(adminController))
);

// System statistics
router.get('/stats',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.getSystemStats.bind(adminController))
);

export default router;
