import { Router } from 'express';

const router = Router();

// Basic CRUD endpoints for notifications
router.get('/', (req, res) => res.send('Get all notifications'));
router.get('/:id', (req, res) => res.send(`Get notification ${req.params.id}`));
router.post('/', (req, res) => res.send('Create notification'));
router.put('/:id', (req, res) => res.send(`Update notification ${req.params.id}`));
router.delete('/:id', (req, res) => res.send(`Delete notification ${req.params.id}`));

export default router;
