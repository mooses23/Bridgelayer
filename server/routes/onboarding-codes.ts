import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { onboardingProfiles, firms, users, firmUsers } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { requireAuth, requireAdmin } from '../auth/middleware/auth-middleware';

const router = Router();

// Validation schemas
const createOnboardingCodeSchema = z.object({
  notes: z.string().optional(),
});

// Generate unique onboarding code (#101, #102, etc.)
async function generateUniqueCode(): Promise<string> {
  try {
    // Get the latest code to determine next number
    const latestProfile = await db
      .select({ code: onboardingProfiles.code })
      .from(onboardingProfiles)
      .orderBy(desc(onboardingProfiles.id))
      .limit(1);

    let nextNumber = 101; // Start with #101
    
    if (latestProfile.length > 0) {
      const latestCode = latestProfile[0].code;
      const match = latestCode.match(/^#(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `#${nextNumber}`;
  } catch (error) {
    console.error('Error generating unique code:', error);
    // Fallback: generate random code if DB query fails
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `#${randomNum}`;
  }
}

// POST /api/onboarding/codes - Create new onboarding code
router.post('/codes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validatedData = createOnboardingCodeSchema.parse(req.body);
    
    // Get authenticated admin user (assuming auth middleware sets req.user)
    const adminUserId = req.user?.id;
    if (!adminUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Generate unique code
    const code = await generateUniqueCode();

    // Create onboarding profile
    const newProfile = await db
      .insert(onboardingProfiles)
      .values({
        code,
        createdBy: adminUserId || 1, // Fallback to first admin user
        notes: validatedData.notes,
        status: 'in_progress',
        totalStepsCompleted: 0,
        progressPercentage: 0,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: {
        id: newProfile[0].id,
        code: newProfile[0].code,
        status: newProfile[0].status,
        createdAt: newProfile[0].createdAt,
      }
    });

  } catch (error) {
    console.error('Error creating onboarding code:', error);
    res.status(500).json({ 
      error: 'Failed to create onboarding code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/onboarding/codes - List all onboarding codes
router.get('/codes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const profiles = await db
      .select({
        id: onboardingProfiles.id,
        code: onboardingProfiles.code,
        status: onboardingProfiles.status,
        firmId: onboardingProfiles.firmId,
        totalStepsCompleted: onboardingProfiles.totalStepsCompleted,
        progressPercentage: onboardingProfiles.progressPercentage,
        notes: onboardingProfiles.notes,
        createdAt: onboardingProfiles.createdAt,
        updatedAt: onboardingProfiles.updatedAt,
      })
      .from(onboardingProfiles)
      .orderBy(desc(onboardingProfiles.createdAt));

    res.json({
      success: true,
      data: profiles
    });

  } catch (error) {
    console.error('Error fetching onboarding codes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch onboarding codes'
    });
  }
});

// GET /api/onboarding/codes/:code - Get specific onboarding profile by code
router.get('/codes/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const profile = await db
      .select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.code, code))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ 
        error: 'Onboarding code not found' 
      });
    }

    res.json({
      success: true,
      data: profile[0]
    });

  } catch (error) {
    console.error('Error fetching onboarding profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch onboarding profile'
    });
  }
});

// PUT /api/onboarding/codes/:code/step/:stepNumber - Update specific step
router.put('/codes/:code/step/:stepNumber', async (req, res) => {
  try {
    const { code, stepNumber } = req.params;
    const stepNum = parseInt(stepNumber, 10);

    if (stepNum < 1 || stepNum > 4) {
      return res.status(400).json({ 
        error: 'Invalid step number. Must be 1-4.' 
      });
    }

    // Get current profile
    const existingProfile = await db
      .select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.code, code))
      .limit(1);

    if (existingProfile.length === 0) {
      return res.status(404).json({ 
        error: 'Onboarding code not found' 
      });
    }

    // Build update object based on step
    const updateData: any = {};
    const now = new Date();

    switch (stepNum) {
      case 1:
        updateData.step1_firmData = req.body.data;
        updateData.step1_complete = req.body.complete || false;
        if (req.body.complete) {
          updateData.step1_completedAt = now;
        }
        break;
      case 2:
        updateData.step2_selectedIntegrations = req.body.selectedIntegrations;
        updateData.step2_integrationConfigs = req.body.integrationConfigs;
        updateData.step2_complete = req.body.complete || false;
        if (req.body.complete) {
          updateData.step2_completedAt = now;
        }
        break;
      case 3:
        updateData.step3_customPrompts = req.body.customPrompts;
        updateData.step3_llmSettings = req.body.llmSettings;
        updateData.step3_complete = req.body.complete || false;
        if (req.body.complete) {
          updateData.step3_completedAt = now;
        }
        break;
      case 4:
        updateData.step4_finalConfiguration = req.body.finalConfiguration;
        updateData.step4_generatedFile = req.body.generatedFile;
        updateData.step4_complete = req.body.complete || false;
        if (req.body.complete) {
          updateData.step4_completedAt = now;
        }
        break;
    }

    // Calculate progress
    const current = existingProfile[0];
    const completedSteps = [
      stepNum === 1 ? updateData.step1_complete : current.step1_complete,
      stepNum === 2 ? updateData.step2_complete : current.step2_complete,
      stepNum === 3 ? updateData.step3_complete : current.step3_complete,
      stepNum === 4 ? updateData.step4_complete : current.step4_complete,
    ].filter(Boolean).length;

    updateData.totalStepsCompleted = completedSteps;
    updateData.progressPercentage = Math.round((completedSteps / 4) * 100);
    updateData.updatedAt = now;

    // If all steps complete, mark as completed
    if (completedSteps === 4) {
      updateData.status = 'completed';
    }

    // Update the profile
    const updatedProfile = await db
      .update(onboardingProfiles)
      .set(updateData)
      .where(eq(onboardingProfiles.code, code))
      .returning();

    res.json({
      success: true,
      data: updatedProfile[0]
    });

  } catch (error) {
    console.error('Error updating onboarding step:', error);
    res.status(500).json({ 
      error: 'Failed to update onboarding step',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/onboarding/codes/:code/assign-firm - Assign firm to onboarding code
router.post('/codes/:code/assign-firm', async (req, res) => {
  try {
    const { code } = req.params;
    const { firmId } = req.body;

    if (!firmId) {
      return res.status(400).json({ 
        error: 'firmId is required' 
      });
    }

    // Verify firm exists
    const firm = await db
      .select()
      .from(firms)
      .where(eq(firms.id, firmId))
      .limit(1);

    if (firm.length === 0) {
      return res.status(404).json({ 
        error: 'Firm not found' 
      });
    }

    // Update onboarding profile with firm ID
    const updatedProfile = await db
      .update(onboardingProfiles)
      .set({ 
        firmId,
        updatedAt: new Date()
      })
      .where(eq(onboardingProfiles.code, code))
      .returning();

    if (updatedProfile.length === 0) {
      return res.status(404).json({ 
        error: 'Onboarding code not found' 
      });
    }

    res.json({
      success: true,
      data: updatedProfile[0]
    });

  } catch (error) {
    console.error('Error assigning firm to onboarding code:', error);
    res.status(500).json({ 
      error: 'Failed to assign firm to onboarding code'
    });
  }
});

// POST /api/onboarding/finish/:code - Complete onboarding process
router.post('/finish/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Get onboarding profile
    const profile = await db
      .select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.code, code))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ 
        error: 'Onboarding code not found' 
      });
    }

    if (profile[0].status === 'completed') {
      return res.status(400).json({ 
        error: 'Onboarding code already used' 
      });
    }

    // Parse onboarding data from request body
    const onboardingData = req.body || {};

    // Extract firm data from the submitted form
    const firmInfo = onboardingData.firmInfo || {};
    const firmName = firmInfo.name || 'New Firm';
    const subdomain = firmInfo.subdomain || firmName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if subdomain already exists
    const existingFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, subdomain))
      .limit(1);

    let firm;
    if (existingFirm.length > 0) {
      // Update existing firm
      [firm] = await db
        .update(firms)
        .set({
          name: firmName,
          onboarded: true,
          updatedAt: new Date()
        })
        .where(eq(firms.subdomain, subdomain))
        .returning();
    } else {
      // Create new firm
      [firm] = await db
        .insert(firms)
        .values({
          name: firmName,
          slug: subdomain,
          subdomain: subdomain,
          plan: 'trial',
          onboarded: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }

    // Create initial firm_user account from admin creation step
    let firmUser = null;
    const adminData = onboardingData.adminCreation || {};
    if (adminData.adminEmail && adminData.password) {
      // Check if firm user already exists
      const existingFirmUser = await db
        .select()
        .from(firmUsers)
        .where(eq(firmUsers.email, adminData.adminEmail))
        .limit(1);

      if (existingFirmUser.length === 0) {
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        [firmUser] = await db
          .insert(firmUsers)
          .values({
            firmId: firm.id,
            email: adminData.adminEmail,
            password: hashedPassword,
            role: 'firm_admin',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      } else {
        // Update existing firm user to be linked to this firm
        [firmUser] = await db
          .update(firmUsers)
          .set({
            firmId: firm.id,
            role: 'firm_admin',
            status: 'active',
            updatedAt: new Date()
          })
          .where(eq(firmUsers.email, adminData.adminEmail))
          .returning();
      }
    }

    // Mark onboarding as completed
    await db
      .update(onboardingProfiles)
      .set({ 
        status: 'completed',
        firmId: firm.id,
        progressPercentage: 100,
        updatedAt: new Date()
      })
      .where(eq(onboardingProfiles.code, code));

    res.json({
      success: true,
      firm: {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        subdomain: firm.subdomain
      },
      user: firmUser ? {
        id: firmUser.id,
        email: firmUser.email,
        role: firmUser.role
      } : null,
      code,
      redirectTo: `/login?mode=firm&code=${code}`
    });

  } catch (error) {
    console.error('Error finishing onboarding:', error);
    res.status(500).json({ 
      error: 'Failed to complete onboarding',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Validation schema for create firm
const createFirmSchema = z.object({
  firmName: z.string().min(1, 'Firm name is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  contactEmail: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  practiceAreas: z.array(z.string()).optional(),
  firmSize: z.enum(['solo', 'small', 'medium', 'large']).optional(),
  description: z.string().optional(),
});

// POST /api/onboarding/create-firm - Create new firm and start onboarding wizard
router.post('/create-firm', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validatedData = createFirmSchema.parse(req.body);
    
    // Check if subdomain is available
    const existingFirm = await db
      .select()
      .from(firms)
      .where(eq(firms.subdomain, validatedData.subdomain))
      .limit(1);

    if (existingFirm.length > 0) {
      return res.status(400).json({ 
        error: 'Subdomain already exists. Please choose a different subdomain.' 
      });
    }

    // Generate unique onboarding code
    const code = await generateUniqueCode();
    
    // Create firm record
    const [firm] = await db
      .insert(firms)
      .values({
        name: validatedData.firmName,
        slug: validatedData.subdomain,
        subdomain: validatedData.subdomain,
        onboarded: false, // Not onboarded until wizard is complete
        status: 'pending', // Pending until onboarding is complete
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create onboarding profile linked to this firm
    const [profile] = await db
      .insert(onboardingProfiles)
      .values({
        code,
        status: 'step_1_in_progress',
        progressPercentage: 10, // Step 1 started
        firmId: firm.id,
        step1_firmData: validatedData, // Save the form data
        step1_complete: true,
        step1_completedAt: new Date(),
        totalStepsCompleted: 1,
        createdBy: (req as any).user?.id || 1, // Admin user ID
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.json({
      success: true,
      code,
      firmId: firm.id,
      firmName: firm.name,
      subdomain: firm.subdomain,
      step: 'firm-setup',
      progress: 10,
      message: 'Firm created successfully. Continue with onboarding wizard.'
    });

  } catch (error) {
    console.error('Error creating firm:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    res.status(500).json({ 
      error: 'Failed to create firm',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
