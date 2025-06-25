import { Router, Request, Response } from 'express';
import { documentStencilService } from '../services/documentStencilService.js';
import { documentUpload, FileParsingService, handleUploadError } from '../services/fileUploadService.js';
import { requireModernJWTAuth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireModernJWTAuth);

// GET /api/document-stencils - List document stencils
router.get('/', async (req: Request, res: Response) => {
  try {
    const { firmId, category } = req.query;
    const userFirmId = req.user?.firmId || undefined;
    
    let stencils;
    if (category) {
      stencils = await documentStencilService.getStencilsByCategory(
        category as string,
        userFirmId
      );
    } else {
      stencils = await documentStencilService.listStencils(userFirmId);
    }
    
    res.json({
      success: true,
      data: stencils,
    });
  } catch (error) {
    console.error('Error fetching document stencils:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document stencils',
      error: (error as Error).message,
    });
  }
});

// GET /api/document-stencils/:id - Get specific document stencil
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stencil = await documentStencilService.getStencil(parseInt(id));
    
    if (!stencil) {
      return res.status(404).json({
        success: false,
        message: 'Document stencil not found',
      });
    }
    
    res.json({
      success: true,
      data: stencil,
    });
  } catch (error) {
    console.error('Error fetching document stencil:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document stencil',
      error: (error as Error).message,
    });
  }
});

// GET /api/document-stencils/:id/preview - Get stencil preview
router.get('/:id/preview', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { maxLength = 300 } = req.query;
    
    const preview = await documentStencilService.getStencilPreview(
      parseInt(id),
      parseInt(maxLength as string)
    );
    
    if (preview === null) {
      return res.status(404).json({
        success: false,
        message: 'Document stencil not found',
      });
    }
    
    res.json({
      success: true,
      data: { preview },
    });
  } catch (error) {
    console.error('Error fetching stencil preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stencil preview',
      error: (error as Error).message,
    });
  }
});

// POST /api/document-stencils/upload - Upload and create new document stencil
router.post('/upload', documentUpload, handleUploadError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { name, description, category } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Stencil name is required',
      });
    }

    // Process the uploaded file
    const processedFile = await FileParsingService.processUploadedFile(req.file);
    
    // Create the document stencil
    const stencil = await documentStencilService.createStencil({
      firmId: req.user?.firmId || undefined,
      name,
      fileName: processedFile.originalName,
      fullText: processedFile.text,
      description,
      category,
      uploadedBy: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: 'Document stencil created successfully',
      data: {
        ...stencil,
        metadata: {
          wordCount: processedFile.wordCount,
          characterCount: processedFile.characterCount,
          fileSize: processedFile.fileSize,
        },
      },
    });
  } catch (error) {
    console.error('Error creating document stencil:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document stencil',
      error: (error as Error).message,
    });
  }
});

// PUT /api/document-stencils/:id - Update document stencil
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, isActive } = req.body;
    
    const updatedStencil = await documentStencilService.updateStencil(
      parseInt(id),
      { name, description, category, isActive }
    );
    
    if (!updatedStencil) {
      return res.status(404).json({
        success: false,
        message: 'Document stencil not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Document stencil updated successfully',
      data: updatedStencil,
    });
  } catch (error) {
    console.error('Error updating document stencil:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document stencil',
      error: (error as Error).message,
    });
  }
});

// DELETE /api/document-stencils/:id - Delete document stencil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await documentStencilService.deleteStencil(parseInt(id));
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Document stencil not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Document stencil deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document stencil:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document stencil',
      error: (error as Error).message,
    });
  }
});

// GET /api/document-stencils/search/:query - Search document stencils
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const userFirmId = req.user?.firmId || undefined;
    
    const stencils = await documentStencilService.searchStencils(query, userFirmId);
    
    res.json({
      success: true,
      data: stencils,
    });
  } catch (error) {
    console.error('Error searching document stencils:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search document stencils',
      error: (error as Error).message,
    });
  }
});

export default router;
