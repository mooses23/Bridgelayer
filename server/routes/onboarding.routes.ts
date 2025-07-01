import { Router } from 'express';
import multer from 'multer';
import { sanitizeInput } from '../middleware/sanitization';
import { validateRequest } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  initOnboardingSchema,
  saveProgressSchema,
  completeOnboardingSchema
} from '../services/validation.service';
import { OnboardingController } from '../controllers/onboarding.controller';

const router = Router();
const onboardingController = new OnboardingController();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public onboarding endpoints
router.get('/check-subdomain',
  asyncHandler(onboardingController.checkSubdomain)
);

router.post('/initialize',
  sanitizeInput(),
  validateRequest(initOnboardingSchema),
  asyncHandler(onboardingController.initializeSession)
);

router.get('/code/:code',
  asyncHandler(onboardingController.verifyCode)
);

// Session-based endpoints
router.post('/session/:sessionId/progress',
  sanitizeInput(),
  validateRequest(saveProgressSchema),
  asyncHandler(onboardingController.saveProgress)
);

router.post('/session/:sessionId/complete',
  upload.single('logo'),
  sanitizeInput(),
  validateRequest(completeOnboardingSchema),
  asyncHandler(onboardingController.completeOnboarding)
);

// Admin-only endpoints
router.get('/statistics',
  requireAuth,
  requireAdmin,
  asyncHandler(onboardingController.getStatistics)
);

router.post('/cleanup-expired',
  requireAuth,
  requireAdmin,
  asyncHandler(onboardingController.cleanupExpiredSessions)
);

export default router;
