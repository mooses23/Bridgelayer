import { Request, Response } from 'express';
import { ValidationError } from '../middleware/validation.middleware';
import { onboardingService } from '../services/onboarding.service';

export class OnboardingController {
  /**
   * Check if a subdomain is available
   */
  async checkSubdomain(req: Request, res: Response) {
    const { subdomain } = req.query;
    
    if (!subdomain || typeof subdomain !== 'string') {
      return res.status(400).json({ 
        success: false, 
        errors: { subdomain: ['Subdomain is required'] } 
      });
    }
    
    try {
      const result = await onboardingService.checkSubdomain(subdomain);
      res.json({ success: true, ...result });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Initialize a new onboarding session
   */
  async initializeSession(req: Request, res: Response) {
    try {
      const result = await onboardingService.initializeSession(req.validated);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Verify an onboarding code
   */
  async verifyCode(req: Request, res: Response) {
    const { code } = req.params;
    
    try {
      const session = await onboardingService.verifyCode(code);
      res.json({ 
        success: true, 
        session: {
          id: session.id,
          firmName: session.firmName,
          subdomain: session.subdomain,
          adminEmail: session.adminEmail,
          currentStep: session.currentStep,
          formData: session.formData,
          expiresAt: session.expiresAt
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Save progress for an onboarding session
   */
  async saveProgress(req: Request, res: Response) {
    const { sessionId } = req.params;
    const { step, ...formData } = req.validated;
    
    try {
      const session = await onboardingService.saveProgress(parseInt(sessionId), step, formData);
      res.json({ 
        success: true, 
        currentStep: session.currentStep
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * @swagger
   * /api/onboarding/start:
   *   post:
   *     summary: Start onboarding process
   *     tags: [Onboarding]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firmId:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Onboarding started successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   */
  async startOnboarding(req: Request, res: Response) {
    // ...existing code...
  }

  /**
   * @swagger
   * /api/onboarding/complete:
   *   post:
   *     summary: Complete onboarding process
   *     tags: [Onboarding]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firmId:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Onboarding completed successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   */
  async completeOnboarding(req: Request, res: Response) {
    const { sessionId } = req.params;
    
    try {
      const result = await onboardingService.completeOnboarding(
        parseInt(sessionId), 
        req.validated, 
        req.files
      );
      
      res.json({ 
        success: true, 
        ...result
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Get onboarding statistics
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await onboardingService.getStatistics();
      res.json({ success: true, statistics: stats });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clean up expired sessions (admin endpoint)
   */
  async cleanupExpiredSessions(req: Request, res: Response) {
    try {
      const count = await onboardingService.cleanupExpiredSessions();
      res.json({ 
        success: true, 
        message: `Cleaned up ${count} expired sessions` 
      });
    } catch (error) {
      throw error;
    }
  }
}
