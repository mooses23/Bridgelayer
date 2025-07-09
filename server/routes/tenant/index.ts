import express, { Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireTenantAccess, addTenantScope } from '../../middleware/tenant-isolation.js';

const router = express.Router();

// Apply tenant middleware to all routes
router.use('/:firmCode/*', requireAuth, requireTenantAccess, addTenantScope);

// Health check for tenant access
router.get('/:firmCode/health', async (req, res) => {
  try {
    const { firm, firmId } = req.tenant!;
    res.json({ 
      status: 'ok', 
      firmCode: req.params.firmCode,
      firmId,
      firmName: firm.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Tenant health check error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Health check failed'
    });
  }
});

export default router;
