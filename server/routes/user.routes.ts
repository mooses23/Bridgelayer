import { Router } from 'express';
import { sanitizeInput } from '../middleware/sanitization';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema
} from '../services/validation.service';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// Admin-only routes
router.get('/role/:role',
  requireAuth,
  requireAdmin,
  asyncHandler(userController.getUsersByRole)
);

router.post('/',
  requireAuth,
  requireAdmin,
  sanitizeInput(),
  validateRequest(createUserSchema),
  asyncHandler(userController.createUser)
);

router.get('/:id',
  requireAuth,
  asyncHandler(userController.getUser)
);

router.put('/:id',
  requireAuth,
  requireAdmin,
  sanitizeInput(),
  validateRequest(updateUserSchema),
  asyncHandler(userController.updateUser)
);

router.delete('/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(userController.deleteUser)
);

// User profile routes (current authenticated user)
router.get('/profile/me',
  requireAuth,
  asyncHandler(userController.getUserProfile)
);

router.put('/profile/me',
  requireAuth,
  sanitizeInput(),
  validateRequest(updateUserSchema),
  asyncHandler(userController.updateUserProfile)
);

router.post('/profile/change-password',
  requireAuth,
  sanitizeInput(),
  validateRequest(changePasswordSchema),
  asyncHandler(userController.changePassword)
);

export default router;
