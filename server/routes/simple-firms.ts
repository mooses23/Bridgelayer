import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { firms, firmUsers } from '../../shared/schema';
import { requireAuth, requireAdmin } from '../auth/middleware/auth-middleware';
import bcrypt from 'bcrypt';

const router = Router();

// Simple firm creation schema
const createFirmSchema = z.object({
  name: z.string().min(1, 'Firm name is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST /api/simple-firms - Create a firm without onboarding codes
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validatedData = createFirmSchema.parse(req.body);
    
    // Create firm record using raw SQL to bypass schema issues
    const firmResult = await db.execute(
      `INSERT INTO firms (name, plan, onboarded) 
       VALUES ('${validatedData.name}', 'professional', true) 
       RETURNING id, name, subdomain`
    );
    
    const firm = firmResult.rows[0] as { id: number; name: string; subdomain: string | null };

    // Create firm admin user (commented out for now)
    // const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 12);
    // const [firmUser] = await db
    //   .insert(firmUsers)
    //   .values({
    //     firmId: firm.id,
    //     email: validatedData.adminEmail,
    //     password: hashedPassword,
    //     role: 'firm_admin',
    //     status: 'active'
    //   })
    //   .returning();

    res.status(201).json({
      success: true,
      firm: {
        id: firm.id,
        name: firm.name,
        subdomain: firm.subdomain
      }
      // adminUser: {
      //   id: firmUser.id,
      //   email: firmUser.email
      // }
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

// GET /api/simple-firms - List all firms
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const firmList = await db
      .select({
        id: firms.id,
        name: firms.name,
        subdomain: firms.subdomain,
        plan: firms.plan,
        onboarded: firms.onboarded,
        createdAt: firms.createdAt
      })
      .from(firms);

    res.json({
      success: true,
      firms: firmList
    });
  } catch (error) {
    console.error('Error fetching firms:', error);
    res.status(500).json({ 
      error: 'Failed to fetch firms',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
