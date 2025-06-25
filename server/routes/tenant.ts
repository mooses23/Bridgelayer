import express from 'express';
import { storage } from '../storage';

const router = express.Router();

router.get('/api/tenant/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await storage.getFirmBySlug(slug);
    if (!tenant) {
      console.error('Tenant not found for slug:', slug);
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

export default router;