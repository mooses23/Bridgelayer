import { Request, Response } from 'express';
import { ValidationError } from '../middleware/validation.middleware';
import { authService } from '../services/auth.service';
import { refreshTokenService } from '../services/refresh-token.service';

export class AuthController {
  /**
   * Login endpoint
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User login
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  async login(req: Request, res: Response) {
    // Validated data is already available through validation middleware
    const { email, password, mode } = req.validated;
    
    try {
      // Attempt login with validated data
      const result = await authService.login(email, password, mode);
      res.json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error; // Let the error middleware handle it
      }
    }
  }

  /**
   * Admin login endpoint
   */
  async adminLogin(req: Request, res: Response) {
    const { email, password } = req.validated;
    
    try {
      const result = await authService.adminLogin(email, password);
      res.json(result);
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
   * Register endpoint
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: User registration
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Registration successful
   *       400:
   *         description: Invalid input
   */
  async register(req: Request, res: Response) {
    const userData = req.validated;
    
    try {
      const result = await authService.register(userData);
      res.json(result);
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
   * Forgot password endpoint
   */
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.validated;
    
    try {
      const result = await authService.initiatePasswordReset(email);
      res.json({
        success: true,
        message: 'If your email is registered, password reset instructions have been sent'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password endpoint
   */
  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.validated;
    
    try {
      const result = await authService.resetPassword(token, password);
      res.json({
        success: true,
        message: 'Password has been successfully reset'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh token endpoint
   */
  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.validated;
    
    try {
      const result = await refreshTokenService.refreshToken(refreshToken);
      res.json(result);
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
   * Logout endpoint
   */
  async logout(req: Request, res: Response) {
    const { refreshToken } = req.validated;
    
    try {
      const result = await refreshTokenService.logout(refreshToken);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }
}
