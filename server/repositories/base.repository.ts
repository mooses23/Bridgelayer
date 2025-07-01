import { db } from '../config/database';
import { logger } from '../utils/logger';
import { QueryOptimizationService } from '../services/query-optimization.service';

/**
 * Base Repository class that provides common database operations
 * All specific repositories should extend this class
 */
export abstract class BaseRepository<T, InsertT, UpdateT, IdType = number> {
  protected tableName: string;
  protected idField: string;

  private queryOptService: QueryOptimizationService;

  constructor(tableName: string, idField: string = 'id') {
    this.tableName = tableName;
    this.idField = idField;
    this.queryOptService = QueryOptimizationService.getInstance();
  }

  /**
   * Find a record by its ID
   */
  async findById(id: IdType): Promise<T | undefined> {
    const results = await db.query[this.tableName].findMany({
      where: eq(db.query[this.tableName][this.idField], id as any)
    }) as T[];
    
    return results[0];
  }

  /**
   * Find all records in the table
   */
  async findAll(options?: { limit?: number; offset?: number }): Promise<T[]> {
    const query = db.query[this.tableName].findMany();
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    if (options?.offset) {
      query.offset(options.offset);
    }
    
    return query as Promise<T[]>;
  }

  /**
   * Find records that match the given conditions
   */
  async findWhere(condition: SQL): Promise<T[]> {
    return db.query[this.tableName].findMany({
      where: condition
    }) as Promise<T[]>;
  }

  /**
   * Create a new record
   */
  async create(data: InsertT): Promise<T> {
    const [result] = await db.insert(db.query[this.tableName])
      .values(data as any)
      .returning() as T[];
    
    return result;
  }

  /**
   * Update a record by its ID
   */
  async updateById(id: IdType, data: UpdateT): Promise<T | undefined> {
    const [result] = await db.update(db.query[this.tableName])
      .set(data as any)
      .where(eq(db.query[this.tableName][this.idField], id as any))
      .returning() as T[];
    
    return result;
  }

  /**
   * Delete a record by its ID
   */
  async deleteById(id: IdType): Promise<boolean> {
    const result = await db.delete(db.query[this.tableName])
      .where(eq(db.query[this.tableName][this.idField], id as any));
    
    return result.rowCount > 0;
  }

  /**
   * Check if a record exists by its ID
   */
  async existsById(id: IdType): Promise<boolean> {
    const result = await this.findById(id);
    return !!result;
  }

  /**
   * Count all records in the table
   */
  async count(condition?: SQL): Promise<number> {
    const query = db.select({ count: count() }).from(db.query[this.tableName]);
    
    if (condition) {
      query.where(condition);
    }
    
    const result = await query;
    return result[0]?.count || 0;
  }

  protected async executeQuery<R>(
    queryFn: () => Promise<R>,
    queryName: string
  ): Promise<R> {
    return this.queryOptService.monitorQueryExecution(queryFn, queryName);
  }

  protected addPagination<R>(query: any, page?: number, pageSize?: number): any {
    if (page && pageSize) {
      return this.queryOptService.addPagination(query, page, pageSize);
    }
    return query;
  }

  protected async analyzeMaintenance(): Promise<void> {
    await this.queryOptService.analyzeTable(this.tableName);
  }

  // Add tenant-aware query helpers
  protected addTenantFilter(query: any, firmId: number): any {
    return query.where({ firm_id: firmId });
  }

  // Add index-aware sorting
  protected addIndexedSort(query: any, sortField: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
    // Ensure we're sorting on an indexed column
    const indexedColumns = ['created_at', 'updated_at', 'id', 'firm_id'];
    if (indexedColumns.includes(sortField)) {
      return query.orderBy(sortField, sortOrder);
    }
    logger.warn(`Sorting on non-indexed column: ${sortField}`);
    return query;
  }
}
