import { Router } from 'express';

const router = Router();

// Basic CRUD endpoints for calendar events
router.get('/', (req, res) => res.send('Get all calendar events'));
router.get('/:id', (req, res) => res.send(`Get calendar event ${req.params.id}`));
router.post('/', (req, res) => res.send('Create calendar event'));
router.put('/:id', (req, res) => res.send(`Update calendar event ${req.params.id}`));
router.delete('/:id', (req, res) => res.send(`Delete calendar event ${req.params.id}`));

export default router;
