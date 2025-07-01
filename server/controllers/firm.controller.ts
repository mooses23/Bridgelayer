import { Request, Response } from 'express';
import { ValidationError } from '../middleware/validation.middleware';
import { firmService } from '../services/firm.service';

export class FirmController {
  /**
   * Get firm by ID
   */
  async getFirm(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const firm = await firmService.getFirmById(Number(id));
      res.json({ success: true, firm });
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
   * Create a new firm
   */
  async createFirm(req: Request, res: Response) {
    try {
      const firm = await firmService.createFirm(req.validated);
      res.status(201).json({ success: true, firm });
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
   * Update a firm
   */
  async updateFirm(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const firm = await firmService.updateFirm(Number(id), req.validated);
      res.json({ success: true, firm });
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
   * Delete a firm
   */
  async deleteFirm(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const result = await firmService.deleteFirm(Number(id));
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
   * Get firm users
   */
  async getFirmUsers(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const users = await firmService.getFirmUsers(Number(id));
      res.json({ success: true, users });
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
   * Add user to firm
   */
  async addUserToFirm(req: Request, res: Response) {
    const { id } = req.params;
    const { userId, isOwner, role } = req.validated;
    
    try {
      const result = await firmService.addUserToFirm(Number(id), userId, { isOwner, role });
      res.status(201).json({ success: true, firmUser: result });
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
   * Remove user from firm
   */
  async removeUserFromFirm(req: Request, res: Response) {
    const { id, userId } = req.params;
    
    try {
      const result = await firmService.removeUserFromFirm(Number(id), Number(userId));
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
   * @swagger
   * /api/firms/{id}:
   *   get:
   *     summary: Retrieve firm details
   *     tags: [Firms]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Firm details retrieved successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Firm not found
   */
  async getFirmDetails(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const firm = await firmService.getFirmById(Number(id));
      res.json({ success: true, firm });
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
   * @swagger
   * /api/firms/{id}:
   *   put:
   *     summary: Update firm details
   *     tags: [Firms]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Firm details updated successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Firm not found
   */
  async updateFirmDetails(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const firm = await firmService.updateFirm(Number(id), req.validated);
      res.json({ success: true, firm });
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
