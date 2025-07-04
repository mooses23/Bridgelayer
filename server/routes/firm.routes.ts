import { Router } from 'express';
import { sanitizeInput } from '../middleware/sanitization';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  createFirmSchema,
  updateFirmSchema,
  addUserToFirmSchema
} from '../services/validation.service';
import { FirmController } from '../controllers/firm.controller';

const router = Router();
const firmController = new FirmController();

// Admin-only routes
router.post('/',
  requireAuth,
  requireAdmin,
  sanitizeInput(),
  validateRequest(createFirmSchema),
  asyncHandler(firmController.createFirm)
);

// Firm management routes (require authentication)
router.get('/:id',
  requireAuth,
  asyncHandler(firmController.getFirm)
);

router.put('/:id',
  requireAuth,
  sanitizeInput(),
  validateRequest(updateFirmSchema),
  asyncHandler(firmController.updateFirm)
);

router.delete('/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(firmController.deleteFirm)
);

// Firm users routes
router.get('/:id/users',
  requireAuth,
  asyncHandler(firmController.getFirmUsers)
);

router.post('/:id/users',
  requireAuth,
  sanitizeInput(),
  validateRequest(addUserToFirmSchema),
  asyncHandler(firmController.addUserToFirm)
);

router.delete('/:id/users/:userId',
  requireAuth,
  asyncHandler(firmController.removeUserFromFirm)
);

export default router;
