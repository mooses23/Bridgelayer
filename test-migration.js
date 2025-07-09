/**
 * Migration Validation Script
 * 
 * This script validates the successful migration of data from the old schema to the new schema.
 * It runs a series of checks to ensure data integrity across all tables.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as oldSchema from './shared/schema.ts.bak'; // Using backup of old schema
import * as newSchema from './shared/schema.ts';  // Using new schema
import { logger } from './server/utils/logger.js';

// Load environment variables
dotenv.config();

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client);

// Validation statistics
const stats = {
  tables: {},
  success: true,
  errors: []
};

async function validateMigration() {
  try {
    logger.info('Starting migration validation...');
    
    // Validate firms
    await validateTable('firms', 
      () => db.select().from(oldSchema.firms), 
      () => db.select().from(newSchema.firms),
      (oldItem, newItem) => {
        return oldItem.id === newItem.id && 
               oldItem.name === newItem.name &&
               oldItem.slug === newItem.slug;
      }
    );
    
    // Validate users
    await validateTable('users', 
      () => db.select().from(oldSchema.users), 
      () => db.select().from(newSchema.users),
      (oldItem, newItem) => {
        return oldItem.id === newItem.id && 
               oldItem.email === newItem.email &&
               oldItem.password === newItem.passwordHash;
      }
    );
    
    // Validate onboarding profiles
    await validateTable('onboardingProfiles', 
      () => db.select().from(oldSchema.onboardingProfiles), 
      () => db.select().from(newSchema.onboardingProfiles),
      (oldItem, newItem) => {
        return oldItem.id === newItem.id && 
               oldItem.code === newItem.code &&
               oldItem.firmId === newItem.firmId;
      }
    );
    
    // Validate clients (if they exist in both schemas)
    if (oldSchema.clients && newSchema.clients) {
      await validateTable('clients', 
        () => db.select().from(oldSchema.clients), 
        () => db.select().from(newSchema.clients),
        (oldItem, newItem) => {
          return oldItem.id === newItem.id && 
                 oldItem.firmId === newItem.firmId &&
                 oldItem.name === newItem.name;
        }
      );
    }
    
    // Validate cases (if they exist in both schemas)
    if (oldSchema.cases && newSchema.cases) {
      await validateTable('cases', 
        () => db.select().from(oldSchema.cases), 
        () => db.select().from(newSchema.cases),
        (oldItem, newItem) => {
          return oldItem.id === newItem.id && 
                 oldItem.firmId === newItem.firmId &&
                 oldItem.title === newItem.title;
        }
      );
    }
    
    // Print validation results
    logger.info('Migration validation complete!');
    logger.info('Results:');
    
    for (const [table, tableStats] of Object.entries(stats.tables)) {
      logger.info(`- ${table}: ${tableStats.matches}/${tableStats.total} records match (${Math.round(tableStats.matches/tableStats.total*100)}%)`);
      
      if (tableStats.errors.length > 0) {
        logger.warn(`  Issues found in ${tableStats.errors.length} records`);
      }
    }
    
    if (stats.errors.length > 0) {
      logger.error(`Found ${stats.errors.length} issues during validation`);
      logger.error('First 5 issues:');
      
      stats.errors.slice(0, 5).forEach((error, i) => {
        logger.error(`[${i+1}] ${error}`);
      });
      
      process.exit(1);
    } else {
      logger.info('All data validated successfully!');
    }
  } catch (error) {
    logger.error('Error during validation:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

/**
 * Validates data migration between old and new tables
 */
async function validateTable(tableName, getOldData, getNewData, compareFunction) {
  try {
    logger.info(`Validating ${tableName}...`);
    
    const oldData = await getOldData();
    const newData = await getNewData();
    
    stats.tables[tableName] = {
      total: oldData.length,
      matches: 0,
      errors: []
    };
    
    for (const oldItem of oldData) {
      const newItem = newData.find(item => item.id === oldItem.id);
      
      if (!newItem) {
        const error = `Record not found in new schema: ${tableName} ID ${oldItem.id}`;
        stats.tables[tableName].errors.push(error);
        stats.errors.push(error);
        continue;
      }
      
      if (!compareFunction(oldItem, newItem)) {
        const error = `Data mismatch in ${tableName} ID ${oldItem.id}`;
        stats.tables[tableName].errors.push(error);
        stats.errors.push(error);
      } else {
        stats.tables[tableName].matches++;
      }
    }
    
    logger.info(`Validated ${stats.tables[tableName].matches}/${stats.tables[tableName].total} records in ${tableName}`);
  } catch (error) {
    logger.error(`Error validating ${tableName}:`, error);
    stats.success = false;
  }
}

// Run the validation
validateMigration();
