import { Router } from 'express';

const router = Router();

// Basic CRUD endpoints for documents
router.get('/', (req, res) => res.send('Get all documents'));
router.get('/:id', (req, res) => res.send(`Get document ${req.params.id}`));
router.post('/', (req, res) => res.send('Create document'));
router.put('/:id', (req, res) => res.send(`Update document ${req.params.id}`));
router.delete('/:id', (req, res) => res.send(`Delete document ${req.params.id}`));

export default router;
