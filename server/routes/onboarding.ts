import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { firms, users, firmSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/branding/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation schemas
const onboardingSchema = z.object({
  firmName: z.string().min(1, 'Firm name is required'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(20, 'Subdomain cannot exceed 20 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Invalid admin email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  openaiApiKey: z.string()
    .regex(/^sk-[A-Za-z0-9]{48}$/, 'Invalid OpenAI API key format'),
  practiceAreas: z.array(z.string()).min(1, 'At least one practice area is required'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal(''))
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Enhanced validation schema for unified onboarding
const unifiedOnboardingSchema = z.object({
  // Step 0: Template Selection
  selectedTemplate: z.string().optional(),
  templateCustomization: z.record(z.any()).optional(),
  
  // Step 1: Enhanced Firm Information
  firmInfo: z.object({
    name: z.string().min(1, 'Firm name is required'),
    subdomain: z.string()
      .min(3, 'Subdomain must be at least 3 characters')
      .max(20, 'Subdomain cannot exceed 20 characters')
      .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
    email: z.string().email('Invalid contact email'),
    phone: z.string().min(1, 'Phone number is required'),
    website: z.string().url().optional().or(z.literal('')),
    address: z.object({
      street: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'ZIP code is required'),
      country: z.string().default('United States')
    }),
    practiceAreas: z.array(z.string()),
    practiceRegion: z.string(),
    firmSize: z.enum(['solo', 'small', 'medium', 'large']),
    description: z.string().optional()
  }),
  
  // Step 2: Branding Content
  brandingContent: z.object({
    logo: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
    customCSS: z.string().optional()
  }).optional(),
  
  // Step 3: API Keys & Integrations
  apiKeysIntegrations: z.object({
    storageProvider: z.enum(['google', 'dropbox', 'onedrive', '']).optional(),
    billingProvider: z.enum(['stripe', 'quickbooks', '']).optional(),
    calendarProvider: z.enum(['google', 'outlook', '']).optional(),
    apiKeys: z.record(z.string()).optional()
  }).optional(),
  
  // Step 4: Account Creation
  accountCreation: z.object({
    adminName: z.string().min(1, 'Admin name is required'),
    adminEmail: z.string().email('Invalid admin email'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    mfaEnabled: z.boolean().default(false),
    acceptedNDA: z.boolean(),
    acceptedTerms: z.boolean()
  }),
  
  // Step 5: Forum/Intake Configuration
  forumIntake: z.object({
    enableClientPortal: z.boolean().default(true),
    intakeFormFields: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.string(),
      required: z.boolean(),
      options: z.array(z.string()).optional()
    })).optional(),
    autoResponseTemplate: z.string().optional()
  }).optional(),
  
  // Step 6: Review & Confirmation
  reviewData: z.object({
    marketingOptIn: z.boolean().default(false),
    newsletterOptIn: z.boolean().default(false),
    dataProcessingConsent: z.boolean(),
    finalConfirmation: z.boolean()
  }).optional(),
  
  // Metadata
  source: z.enum(['admin', 'firm', 'api']).default('admin'),
  completedSteps: z.array(z.number()).default([]),
  currentStep: z.number().default(0)
});

// Check subdomain availability
router.get('/check-subdomain', async (req, res) => {
  try {
    const { subdomain } = req.query;
    
    if (!subdomain || typeof subdomain !== 'string') {
      return res.status(400).json({ message: 'Subdomain is required' });
    }

    const existingFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, subdomain))
      .limit(1);

    res.json({ available: existingFirm.length === 0 });
  } catch (error) {
    console.error('Subdomain check error:', error);
    res.status(500).json({ message: 'Failed to check subdomain availability' });
  }
});

// Save onboarding progress
router.post('/progress', async (req, res) => {
  try {
    const { sessionId, data, currentStep } = req.body;
    
    // Store progress in session or database
    // For now, just acknowledge the save
    res.json({ 
      success: true, 
      message: 'Progress saved successfully',
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
    res.status(500).json({ 
      error: 'Failed to save progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get onboarding progress
router.get('/progress/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve progress from session or database
    // For now, return empty progress
    res.json({
      success: true,
      data: null,
      currentStep: 0
    });
  } catch (error) {
    console.error('Error retrieving onboarding progress:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Complete onboarding
router.post('/complete', upload.single('branding'), async (req, res) => {
  try {
    // Validate the form data
    const validatedData = onboardingSchema.parse(req.body);

    // Check if subdomain is still available
    const existingFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, validatedData.subdomain))
      .limit(1);

    if (existingFirm.length > 0) {
      return res.status(400).json({ message: 'Subdomain is already taken' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Handle uploaded branding file
    let brandingPath = null;
    if (req.file) {
      brandingPath = `/uploads/branding/${req.file.filename}`;
    }

    // Parse OAuth tokens and API keys
    let oauthTokens = {};
    let apiKeys = {};
    
    try {
      if (validatedData.oauthTokens) {
        oauthTokens = JSON.parse(validatedData.oauthTokens);
      }
      if (validatedData.apiKeys) {
        apiKeys = JSON.parse(validatedData.apiKeys);
      }
    } catch (parseError) {
      console.error('Failed to parse tokens/keys:', parseError);
    }

    // Create firm
    const [firm] = await db
      .insert(firms)
      .values({
        name: validatedData.firmName,
        slug: validatedData.subdomain || validatedData.firmName.toLowerCase().replace(/\s+/g, "-"),
        subdomain: validatedData.subdomain,
        logoUrl: brandingPath,
        plan: 'trial',
        onboarded: true, // Use the correct database field name
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        firmId: firm.id,
        email: validatedData.adminEmail,
        firstName: validatedData.adminName.split(" ")[0] || validatedData.adminName,
        lastName: validatedData.adminName.split(" ").slice(1).join(" ") || "",
        password: passwordHash,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create firm settings
    await db
      .insert(firmSettings)
      .values({
        firmId: firm.id,
        storageProvider: validatedData.storageProvider,
        oauthTokens: JSON.stringify(oauthTokens),
        apiKeys: JSON.stringify(apiKeys),
        features: JSON.stringify({
          documentAnalysis: true,
          clientPortal: true,
          timeTracking: true,
          billing: true,
          integrations: true
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      });

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        firmId: firm.id,
        tenantId: firm.subdomain,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set secure cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Onboarding completed successfully',
      firm: {
        id: firm.id,
        name: firm.name,
        subdomain: firm.subdomain
      },
      user: {
        id: adminUser.id,
        name: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
        email: adminUser.email,
        role: adminUser.role
      },
      redirectTo: '/dashboard'
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors
      });
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'File upload error',
        details: error.message
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// UNIFIED ONBOARDING ENDPOINT - Supports UnifiedOnboardingData from OnboardingWizard
router.post('/unified', upload.single('logo'), async (req, res) => {
  try {
    console.log('🎯 UNIFIED ONBOARDING: Processing enhanced onboarding data');
    
    // Validate the unified data structure
    const validatedData = unifiedOnboardingSchema.parse(req.body);
    console.log('✅ Unified data validation successful');
    
    // Check subdomain availability
    const existingFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, validatedData.firmInfo.subdomain))
      .limit(1);

    if (existingFirm.length > 0) {
      return res.status(400).json({ 
        message: 'Subdomain is already taken',
        field: 'firmInfo.subdomain' 
      });
    }

    // Hash admin password
    const passwordHash = await bcrypt.hash(validatedData.accountCreation.password, 12);

    // Handle uploaded logo
    let logoPath = null;
    if (req.file) {
      logoPath = `/uploads/branding/${req.file.filename}`;
      console.log('📁 Logo uploaded:', logoPath);
    }

    // Create firm with unified data structure
    const [newFirm] = await db.insert(firms).values({
      name: validatedData.firmInfo.name,
      slug: validatedData.firmInfo.subdomain,
      subdomain: validatedData.firmInfo.subdomain,
      logoUrl: logoPath,
      onboarded: true, // Use the correct database field name
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('✅ Firm created with unified data:', newFirm.id);

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      email: validatedData.accountCreation.adminEmail,
      firstName: validatedData.accountCreation.adminName.split(" ")[0] || validatedData.accountCreation.adminName,
      lastName: validatedData.accountCreation.adminName.split(" ").slice(1).join(" ") || "",
      password: passwordHash,
      role: 'firm_admin',
      firmId: newFirm.id,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('✅ Admin user created:', adminUser.id);

    // Store enhanced settings with unified data
    const enhancedSettings = {
      selectedTemplate: validatedData.selectedTemplate || 'default',
      templateCustomization: validatedData.templateCustomization || {},
      brandingContent: validatedData.brandingContent || {},
      apiKeysIntegrations: validatedData.apiKeysIntegrations || {},
      forumIntake: validatedData.forumIntake || {},
      reviewData: validatedData.reviewData || {},
      onboardingSource: validatedData.source,
      completedSteps: validatedData.completedSteps,
      onboardingCompletedAt: new Date().toISOString(),
      // Store additional firm info in settings since it's not in the firms table schema
      firmInfo: {
        email: validatedData.firmInfo.email,
        phone: validatedData.firmInfo.phone,
        website: validatedData.firmInfo.website,
        address: validatedData.firmInfo.address,
        practiceAreas: validatedData.firmInfo.practiceAreas,
        firmSize: validatedData.firmInfo.firmSize,
        description: validatedData.firmInfo.description
      }
    };

    await db.insert(firmSettings).values({
      firmId: newFirm.id,
      features: JSON.stringify(enhancedSettings),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Enhanced settings stored with unified data');

    // Generate JWT token for immediate login
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: 'firm_admin',
        firmId: newFirm.id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set secure cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Unified onboarding completed successfully',
      firm: {
        id: newFirm.id,
        name: newFirm.name,
        subdomain: newFirm.subdomain,
        onboarded: true // Use consistent field name
      },
      user: {
        id: adminUser.id,
        name: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
        email: adminUser.email,
        role: adminUser.role
      },
      enhancedData: {
        selectedTemplate: validatedData.selectedTemplate,
        completedSteps: validatedData.completedSteps,
        source: validatedData.source
      },
      redirectTo: '/dashboard'
    });

  } catch (error) {
    console.error('❌ UNIFIED ONBOARDING ERROR:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Unified onboarding validation failed',
        errors: error.errors
      });
    }

    res.status(500).json({
      message: 'Unified onboarding failed',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Internal server error'
    });
  }
});

// Auto-save progress endpoints for unified onboarding
router.post('/progress', async (req, res) => {
  try {
    const { sessionId, step, data } = req.body;
    
    // Store progress data (you can use Redis, database, or session storage)
    // For now, we'll acknowledge the save
    console.log(`💾 Auto-save progress: step ${step} for session ${sessionId}`);
    
    res.json({ 
      success: true, 
      message: 'Progress saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Auto-save error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save progress' 
    });
  }
});

router.get('/progress/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve progress data
    console.log(`📖 Restore progress for session ${sessionId}`);
    
    // For now, return empty state - implement actual storage later
    res.json({ 
      success: true,
      data: null,
      message: 'No saved progress found'
    });
  } catch (error) {
    console.error('❌ Progress retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve progress' 
    });
  }
});

// Get firm configuration  
router.get('/:tenantId/config', async (req, res) => {
  try {
    const { tenantId } = req.params;

    const firmData = await db
      .select({
        firm: firms,
        settings: firmSettings
      })
      .from(firms)
      .leftJoin(firmSettings, eq(firms.id, firmSettings.firmId))
      .where(eq(firms.subdomain, tenantId))
      .limit(1);

    if (firmData.length === 0) {
      return res.status(404).json({ message: 'Firm not found' });
    }

    const { firm, settings } = firmData[0];

    // Mock stats for now - these would come from actual data
    const config = {
      id: firm.subdomain,
      name: firm.name,
      subdomain: firm.subdomain,
      branding: {
        logo: firm.logoUrl,
        primaryColor: '#3B82F6',
        secondaryColor: '#1E3A8A'
      },
      onboardingComplete: firm.onboarded,
      onboardingProgress: firm.onboarded ? 100 : 75,
      features: settings ? JSON.parse(settings.features || '{}') : {},
      templates: [
        { id: '1', name: 'NDA Template', category: 'Contracts', enabled: true },
        { id: '2', name: 'Service Agreement', category: 'Contracts', enabled: true },
        { id: '3', name: 'Employment Contract', category: 'HR', enabled: false },
      ],
      integrations: {
        storage: settings?.storageProvider || null,
        billing: null,
        calendar: null
      },
      stats: {
        documentsAnalyzed: 24,
        activeClients: 8,
        hoursLogged: 156,
        recentActivity: 5
      }
    };

    res.json(config);
  } catch (error) {
    console.error('Firm config error:', error);
    res.status(500).json({ message: 'Failed to load firm configuration' });
  }
});

// POST /api/onboarding/generate-firm-code - Generate unique firm code using OpenAI
router.post('/generate-firm-code', async (req, res) => {
  try {
    const { firmName, practiceAreas } = req.body;

    if (!firmName || firmName.length < 3) {
      return res.status(400).json({ error: 'Firm name must be at least 3 characters' });
    }

    // Use OpenAI to generate a unique, professional firm code
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional firm code generator. Generate a unique, short, professional 6-character alphanumeric code for law firms. The code should be memorable, professional, and relate to the firm name. Use a mix of letters and numbers. Respond only with the code, nothing else.'
          },
          {
            role: 'user',
            content: `Generate a unique firm code for: "${firmName}"${practiceAreas && practiceAreas.length > 0 ? ` with practice areas: ${practiceAreas.join(', ')}` : ''}`
          }
        ],
        max_tokens: 10,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedCode = openaiData.choices[0]?.message?.content?.trim().toUpperCase();

    if (!generatedCode) {
      throw new Error('Failed to generate code from OpenAI');
    }

    // Ensure the code is 6 characters and alphanumeric
    const cleanCode = generatedCode.replace(/[^A-Z0-9]/g, '').substring(0, 6).padEnd(6, '0');

    res.json({ 
      code: cleanCode,
      firmName: firmName 
    });

  } catch (error) {
    console.error('Error generating firm code:', error);
    
    // Fallback: generate a random code if OpenAI fails
    const fallbackCode = `F${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    res.json({ 
      code: fallbackCode,
      firmName: req.body.firmName,
      fallback: true
    });
  }
});

// Create new firm with onboarding code
router.post('/create', async (req, res) => {
  try {
    const {
      firmName,
      subdomain,
      adminName,
      adminEmail,
      password,
      openaiApiKey,
      practiceAreas,
      description,
      website
    } = onboardingSchema.parse(req.body);

    // Check if subdomain is available
    const existingFirm = await db.query.firms.findFirst({
      where: eq(firms.subdomain, subdomain)
    });

    if (existingFirm) {
      return res.status(400).json({ error: 'Subdomain is already taken' });
    }

    // Generate onboarding code
    const onboardingCode = generateOnboardingCode();

    // Create firm with encrypted OpenAI key
    const [firm] = await db.insert(firms).values({
      name: firmName,
      subdomain,
      onboardingCode,
      openaiApiKey: encryptApiKey(openaiApiKey),
      settings: {
        practiceAreas,
        description,
        website
      },
      status: 'onboarding',
      onboardingStep: 1
    }).returning();

    // Create admin user for the firm
    const [admin] = await db.insert(users).values({
      firmId: firm.id,
      name: adminName,
      email: adminEmail,
      password: await hashPassword(password),
      role: 'firm_admin'
    }).returning();

    // Create initial firm settings
    await db.insert(firmSettings).values({
      firmId: firm.id,
      theme: 'light',
      timezone: 'UTC',
      features: {
        documentProcessing: true,
        aiAssistant: true
      }
    });

    res.json({
      success: true,
      firmId: firm.id,
      onboardingCode
    });

  } catch (error) {
    console.error('Firm creation error:', error);
    res.status(500).json({ error: 'Failed to create firm' });
  }
});

export default router;
