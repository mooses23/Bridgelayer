import { CronJob } from 'cron';
import { refreshTokenService } from '../services/refresh-token.service';
import { logger } from '../utils/logger';
import { QueryOptimizationService } from '../services/query-optimization.service';
import { exec } from 'child_process';
import path from 'path';

/**
 * Helper class for scheduled tasks
 */
export class ScheduledTasks {
  /**
   * Start all scheduled tasks
   */
  static startAll() {
    this.scheduleTokenCleanup();
    this.scheduleDbMaintenance();
  }
  
  /**
   * Schedule token cleanup task
   * Runs daily to clean up expired refresh tokens
   */
  private static scheduleTokenCleanup() {
    // Clean up expired tokens daily at midnight
    const runCleanup = async () => {
      try {
        logger.info('Running scheduled refresh token cleanup');
        const count = await refreshTokenService.cleanupExpiredTokens();
        logger.info(`Cleaned up ${count} expired refresh tokens`);
      } catch (error) {
        logger.error('Error during token cleanup:', error);
      }
    };
    
    // Calculate time until midnight
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    // Schedule first run at midnight
    logger.info(`Scheduling token cleanup to run in ${Math.round(timeUntilMidnight/1000/60)} minutes`);
    setTimeout(() => {
      runCleanup();
      
      // Then schedule to run every 24 hours
      setInterval(runCleanup, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }
  
  /**
   * Schedule database maintenance task
   * Runs weekly on Sundays at 2 AM
   */
  private static scheduleDbMaintenance() {
    const runDbMaintenance = async () => {
      try {
        logger.info('Running scheduled database maintenance');
        const queryOptService = QueryOptimizationService.getInstance();
        
        // Run ANALYZE on important tables
        await queryOptService.analyzeTable('firm_users');
        await queryOptService.analyzeTable('audit_logs');
        await queryOptService.analyzeTable('ai_triage_results');
        
        // Check index usage
        await queryOptService.checkIndexUsage();
        
        // Get table sizes
        await queryOptService.getTableSizes();
        
        // Run the maintenance script
        exec(path.join(__dirname, '../../scripts/db-maintenance.sh'), (error, stdout, stderr) => {
          if (error) {
            logger.error('Error running maintenance script:', error);
            return;
          }
          logger.info('Database maintenance completed successfully');
          logger.debug('Maintenance script output:', stdout);
        });
      } catch (error) {
        logger.error('Error during database maintenance:', error);
      }
    };
    
    // Schedule the task
    logger.info('Scheduling database maintenance to run every Sunday at 2 AM');
    const job = new CronJob('0 2 * * 0', runDbMaintenance);
    job.start();
  }
}
