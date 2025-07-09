import { checkDatabaseHealth } from '../server/db';

(async () => {
  try {
    await checkDatabaseHealth();
    console.log('✅ Database connection is healthy');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();
