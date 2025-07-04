import { db } from '../config/database';
import { logger } from '../utils/logger';

export class QueryOptimizationService {
  private static instance: QueryOptimizationService;

  private constructor() {}

  public static getInstance(): QueryOptimizationService {
    if (!QueryOptimizationService.instance) {
      QueryOptimizationService.instance = new QueryOptimizationService();
    }
    return QueryOptimizationService.instance;
  }

  /**
   * Add pagination to a query
   */
  public addPagination<T>(query: any, page: number = 1, pageSize: number = 20): any {
    const offset = (page - 1) * pageSize;
    return query.limit(pageSize).offset(offset);
  }

  /**
   * Execute an EXPLAIN ANALYZE for query optimization
   */
  public async explainQuery(query: string, params: any[] = []): Promise<void> {
    try {
      const explainResults = await db.execute(`EXPLAIN ANALYZE ${query}`, params);
      logger.debug('Query Plan:', explainResults);
    } catch (error) {
      logger.error('Error analyzing query:', error);
    }
  }

  /**
   * Monitor query execution time
   */
  public async monitorQueryExecution<T>(
    queryFn: () => Promise<T>,
    queryName: string
  ): Promise<T> {
    const startTime = process.hrtime();
    try {
      const result = await queryFn();
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const executionTime = seconds * 1000 + nanoseconds / 1000000;
      
      logger.info(`Query '${queryName}' execution time: ${executionTime.toFixed(2)}ms`);
      return result;
    } catch (error) {
      logger.error(`Error executing query '${queryName}':`, error);
      throw error;
    }
  }

  /**
   * Check index usage statistics
   */
  public async checkIndexUsage(): Promise<void> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM 
        pg_stat_user_indexes
      ORDER BY 
        idx_scan DESC;
    `;

    try {
      const results = await db.execute(query);
      logger.info('Index Usage Statistics:', results);
    } catch (error) {
      logger.error('Error checking index usage:', error);
    }
  }

  /**
   * Analyze table statistics
   */
  public async analyzeTable(tableName: string): Promise<void> {
    try {
      await db.execute(`ANALYZE ${tableName};`);
      logger.info(`Successfully analyzed table: ${tableName}`);
    } catch (error) {
      logger.error(`Error analyzing table ${tableName}:`, error);
    }
  }

  /**
   * Get table and index sizes
   */
  public async getTableSizes(): Promise<void> {
    const query = `
      SELECT
        table_name,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as total_size,
        pg_size_pretty(pg_table_size(quote_ident(table_name))) as table_size,
        pg_size_pretty(pg_indexes_size(quote_ident(table_name))) as index_size
      FROM
        information_schema.tables
      WHERE
        table_schema = 'public'
      ORDER BY
        pg_total_relation_size(quote_ident(table_name)) DESC;
    `;

    try {
      const results = await db.execute(query);
      logger.info('Table and Index Sizes:', results);
    } catch (error) {
      logger.error('Error getting table sizes:', error);
    }
  }
}
