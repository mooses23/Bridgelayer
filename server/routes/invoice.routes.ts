import { Router } from 'express';

const router = Router();

// Basic CRUD endpoints for invoices
router.get('/', (req, res) => res.send('Get all invoices'));
router.get('/:id', (req, res) => res.send(`Get invoice ${req.params.id}`));
router.post('/', (req, res) => res.send('Create invoice'));
router.put('/:id', (req, res) => res.send(`Update invoice ${req.params.id}`));
router.delete('/:id', (req, res) => res.send(`Delete invoice ${req.params.id}`));

export default router;
