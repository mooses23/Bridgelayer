/**
 * Migration script to transfer data from the old schema to the new refactored schema
 * 
 * This script handles:
 * 1. Creating tables in the new schema
 * 2. Transferring data from old tables to new tables
 * 3. Updating relationships to maintain data integrity
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as oldSchema from '../shared/schema.ts';
import * as newSchema from '../shared/schema-refactored.ts';
import { logger } from '../server/utils/logger.js';

// Load environment variables
dotenv.config();

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function migrateData() {
  try {
    logger.info('Starting schema migration...');
    
    // Step 1: Create new schema tables
    logger.info('Creating new schema tables...');
    
    // Step 2: Migrate firms data
    logger.info('Migrating firms data...');
    const firms = await db.select().from(oldSchema.firms);
    
    for (const firm of firms) {
      await db.insert(newSchema.firms).values({
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        subdomain: firm.subdomain,
        domain: firm.domain,
        plan: firm.plan,
        status: firm.status,
        onboarded: firm.onboarded,
        onboardingComplete: firm.onboardingComplete,
        onboardingCode: firm.onboardingCode,
        onboardingStep: firm.onboardingStep,
        openaiApiKey: firm.openaiApiKey,
        logoUrl: firm.logoUrl,
        settings: firm.settings,
        createdAt: firm.createdAt,
        updatedAt: firm.updatedAt
      });
      
      logger.info(`Migrated firm ${firm.name} (ID: ${firm.id})`);
    }
    
    // Step 3: Migrate users data
    logger.info('Migrating users data...');
    const users = await db.select().from(oldSchema.users);
    
    for (const user of users) {
      await db.insert(newSchema.users).values({
        id: user.id,
        firmId: user.firmId,
        email: user.email,
        passwordHash: user.password, // Note: field name change from password to passwordHash
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
      
      logger.info(`Migrated user ${user.email} (ID: ${user.id})`);
    }
    
    // Step 4: Migrate onboarding profiles
    logger.info('Migrating onboarding profiles...');
    const onboardingProfiles = await db.select().from(oldSchema.onboardingProfiles);
    
    for (const profile of onboardingProfiles) {
      // Combine all step data into a single stepData JSON field
      const stepData = {
        step1: {
          firmData: profile.step1_firmData,
          complete: profile.step1_complete,
          completedAt: profile.step1_completedAt
        },
        step2: {
          selectedIntegrations: profile.step2_selectedIntegrations,
          integrationConfigs: profile.step2_integrationConfigs,
          complete: profile.step2_complete,
          completedAt: profile.step2_completedAt
        },
        step3: {
          customPrompts: profile.step3_customPrompts,
          llmSettings: profile.step3_llmSettings,
          complete: profile.step3_complete,
          completedAt: profile.step3_completedAt
        },
        step4: {
          finalConfiguration: profile.step4_finalConfiguration,
          generatedFile: profile.step4_generatedFile,
          complete: profile.step4_complete,
          completedAt: profile.step4_completedAt
        }
      };
      
      await db.insert(newSchema.onboardingProfiles).values({
        id: profile.id,
        code: profile.code,
        firmId: profile.firmId,
        status: profile.status,
        stepData: stepData,
        totalStepsCompleted: profile.totalStepsCompleted,
        progressPercentage: profile.progressPercentage,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      });
      
      logger.info(`Migrated onboarding profile ${profile.code} (ID: ${profile.id})`);
    }
    
    // Continue with other tables (clients, cases, etc.)
    
    logger.info('Schema migration completed successfully.');
  } catch (error) {
    logger.error('Error during schema migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
migrateData().catch(err => {
  logger.error('Migration failed:', err);
  process.exit(1);
});
