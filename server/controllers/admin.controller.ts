import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { ValidationError } from '../middleware/validation.middleware';

/**
 * Controller for admin operations
 */
export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(req: Request, res: Response) {
    try {
      const tenantId = req.query.tenantId as string;
      const adminUsers = await this.adminService.getAdminUsers(tenantId);
      res.json({ success: true, adminUsers });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, errors: error.errors });
      } else {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin users' });
      }
    }
  }

  /**
   * Start a ghost mode session
   */
  async startGhostSession(req: Request, res: Response) {
    try {
      const { targetFirmId, purpose, notes } = req.validated;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const ghostSession = await this.adminService.startGhostSession(
        adminId,
        targetFirmId,
        purpose,
        notes
      );

      res.json({
        success: true,
        ghostSession
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, errors: error.errors });
      } else {
        console.error('Error starting ghost session:', error);
        res.status(500).json({ success: false, message: 'Failed to start ghost session' });
      }
    }
  }

  /**
   * End a ghost mode session
   */
  async endGhostSession(req: Request, res: Response) {
    try {
      const { sessionToken } = req.validated;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const result = await this.adminService.endGhostSession(sessionToken, adminId);

      res.json({
        success: result,
        message: result ? 'Ghost session ended successfully' : 'Failed to end ghost session'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, errors: error.errors });
      } else {
        console.error('Error ending ghost session:', error);
        res.status(500).json({ success: false, message: 'Failed to end ghost session' });
      }
    }
  }

  /**
   * Get active ghost sessions
   */
  async getActiveGhostSessions(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // Only super admins can see all sessions
      const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'platform_admin';
      const sessions = await this.adminService.getActiveGhostSessions(
        isAdmin ? undefined : adminId
      );

      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      console.error('Error fetching ghost sessions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch ghost sessions' });
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      const stats = await this.adminService.getSystemStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch system statistics' });
    }
  }

  /**
   * @swagger
   * /api/admin/dashboard:
   *   get:
   *     summary: Retrieve admin dashboard
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Admin dashboard retrieved successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async getDashboard(req: Request, res: Response) {
    // Implementation for retrieving admin dashboard
  }
}
