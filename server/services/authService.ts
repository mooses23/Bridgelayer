import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { loginRequestSchema, type LoginRequest, type LoginResponse } from '../types/auth';
import { storage } from '../storage';
import { JWTManager } from '../auth/core/jwt-manager';
import { eq } from 'drizzle-orm';
import { onboardingProfiles, firms, users, firmUsers } from '@shared/schema';
import { db } from '../db';

export async function loginHandler(req: Request, res: Response) {
  // Validate input
  const parse = loginRequestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid login payload', errors: parse.error.errors });
  }
  const { email, password, mode, code } = parse.data;

  try {
    let userRecord;
    if (mode === 'bridgelayer') {
      userRecord = await storage.getUserByEmail(email);
      if (!userRecord) return res.status(401).json({ message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, userRecord.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    } else {
      // Firm mode: handle both first-time (with code) and subsequent logins
      if (code) {
        // First-time login with onboarding code
        const [profileRow] = await db.select().from(onboardingProfiles).where(eq(onboardingProfiles.code, code)).limit(1);
        if (!profileRow) {
          return res.status(401).json({ message: 'Invalid onboarding code' });
        }
        
        if (profileRow.status !== 'completed' || !profileRow.firmId) {
          return res.status(400).json({ 
            message: 'Onboarding not completed',
            action: 'complete_onboarding',
            code 
          });
        }
        
        // Check if firm user already exists
        const existingFirmUser = await db.select().from(firmUsers).where(eq(firmUsers.email, email)).limit(1);
        
        if (existingFirmUser.length > 0) {
          // Existing user - validate password
          const match = await bcrypt.compare(password, existingFirmUser[0].password);
          if (!match) return res.status(401).json({ message: 'Invalid credentials' });
          userRecord = existingFirmUser[0];
        } else {
          // First-time login - create firm user account
          const hashedPassword = await bcrypt.hash(password, 12);
          const [newFirmUser] = await db
            .insert(firmUsers)
            .values({
              firmId: profileRow.firmId,
              email: email,
              password: hashedPassword,
              role: 'firm_user',
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          userRecord = newFirmUser;
        }
      } else {
        // Subsequent login without code - look up firm user directly
        const firmUser = await db.select().from(firmUsers).where(eq(firmUsers.email, email)).limit(1);
        if (firmUser.length === 0) {
          return res.status(401).json({ message: 'No firm account found. Please use your onboarding code.' });
        }
        
        const match = await bcrypt.compare(password, firmUser[0].password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });
        
        userRecord = firmUser[0];
      }
    }

    // Session and JWT
    req.session.userId = userRecord.id;
    req.session.userRole = userRecord.role;
    req.session.firmId = userRecord.firmId;
    await new Promise<void>((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    const token = JWTManager.generateAccessToken({
      userId: userRecord.id,
      tenantId: userRecord.firmId?.toString() || 'default',
      role: userRecord.role,
      email: userRecord.email,
      firmId: userRecord.firmId || undefined
    });
    res.cookie('accessToken', token, { httpOnly: true, sameSite: 'lax' });

    // Redirect logic
    const redirectPath = mode === 'firm' ? '/app/dashboard' : '/admin';
    res.json({ user: userRecord, redirectPath });
  } catch (err) {
    console.error('Unified login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
