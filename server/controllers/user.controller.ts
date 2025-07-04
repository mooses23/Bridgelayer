import { Request, Response } from 'express';
import { ValidationError } from '../middleware/validation.middleware';
import { userService } from '../services/user.service';

export class UserController {
  /**
   * Get user by ID
   */
  async getUser(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const user = await userService.getById(Number(id));
      res.json({ success: true, user });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(404).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.validated);
      res.status(201).json({ success: true, user });
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
   * Update a user
   */
  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const user = await userService.updateUser(Number(id), req.validated);
      res.json({ success: true, user });
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
   * Delete a user
   */
  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const result = await userService.deleteUser(Number(id));
      res.json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(404).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Get user profile (for currently authenticated user)
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Retrieve user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  async getUserProfile(req: Request, res: Response) {
    try {
      const user = await userService.getUserProfile(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(404).json({
          success: false,
          errors: error.errors
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Update user profile (for currently authenticated user)
   * @swagger
   * /api/users/profile:
   *   put:
   *     summary: Update user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *     responses:
   *       200:
   *         description: User profile updated successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   */
  async updateUserProfile(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(req.user.id, req.validated);
      res.json({ success: true, user });
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
   * Change password (for currently authenticated user)
   */
  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.validated;
    
    try {
      const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
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
   * Get users by role
   */
  async getUsersByRole(req: Request, res: Response) {
    const { role } = req.params;
    
    try {
      const users = await userService.getUsersByRole(role);
      res.json({ success: true, users });
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
}
