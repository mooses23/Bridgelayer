import { Request, Response, NextFunction } from "express";

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}`);
  
  // Track response time
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - ${status} - ${duration}ms`);
  });
  
  next();
};

// Application logs storage (in-memory for demo, would be database in production)
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
  source: string;
}

class LogManager {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  log(level: LogEntry['level'], message: string, metadata?: any, source = 'application') {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      metadata,
      source
    };

    this.logs.unshift(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console with proper formatting
    const timestamp = entry.timestamp.toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, metadata);
        break;
      case 'warn':
        console.warn(logMessage, metadata);
        break;
      case 'debug':
        console.debug(logMessage, metadata);
        break;
      default:
        console.log(logMessage, metadata);
    }
  }

  getLogs(filters?: {
    level?: LogEntry['level'];
    source?: string;
    limit?: number;
    since?: Date;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters?.source) {
      filteredLogs = filteredLogs.filter(log => log.source === filters.source);
    }

    if (filters?.since) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.since!);
    }

    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  getLogStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => log.timestamp >= oneHourAgo);
    const dailyLogs = this.logs.filter(log => log.timestamp >= oneDayAgo);

    return {
      total: this.logs.length,
      lastHour: recentLogs.length,
      lastDay: dailyLogs.length,
      errorCount: this.logs.filter(log => log.level === 'error').length,
      warnCount: this.logs.filter(log => log.level === 'warn').length,
      sources: [...new Set(this.logs.map(log => log.source))]
    };
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logManager = new LogManager();

// Enhanced error handler with logging
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  logManager.log('error', err.message || 'Unknown error', {
    errorId,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  }, 'error-handler');

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: true,
    message: isDevelopment ? err.message : 'Internal server error',
    errorId,
    ...(isDevelopment && { stack: err.stack })
  });
};

// System health checker
export const getSystemHealth = async () => {
  const stats = logManager.getLogStats();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  return {
    status: 'healthy',
    uptime: Math.floor(uptime),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    logs: stats,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
};
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
  source: string;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    external: number;
  };
  logs: {
    total: number;
    lastHour: number;
    lastDay: number;
    errorCount: number;
    warnCount: number;
    sources: string[];
  };
  timestamp: string;
  version: string;
  nodeVersion: string;
  environment: string;
}

class LogManager {
  private logs: LogEntry[] = [];
  private maxLogs = 10000;

  log(level: LogEntry['level'], message: string, metadata: any = {}, source: string = 'server') {
    const entry: LogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      source
    };

    this.logs.unshift(entry);
    
    // Keep only maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${source}: ${message}`, metadata);
    }
  }

  getLogs(filters: {
    level?: string;
    source?: string;
    limit?: number;
    since?: Date;
  } = {}): LogEntry[] {
    let filtered = [...this.logs];

    if (filters.level && filters.level !== 'all') {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    if (filters.source && filters.source !== 'all') {
      filtered = filtered.filter(log => log.source === filters.source);
    }

    if (filters.since) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= filters.since!);
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  getSystemHealth(): SystemHealth {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => new Date(log.timestamp) >= oneDayAgo);
    const hourlyLogs = this.logs.filter(log => new Date(log.timestamp) >= oneHourAgo);
    
    const errorCount = recentLogs.filter(log => log.level === 'error').length;
    const warnCount = recentLogs.filter(log => log.level === 'warn').length;
    
    const sources = [...new Set(this.logs.map(log => log.source))];
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    const memUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memExternal = Math.round(memUsage.external / 1024 / 1024);

    // Determine system status
    let status = 'healthy';
    if (errorCount > 10) status = 'error';
    else if (errorCount > 5 || warnCount > 20) status = 'warning';

    return {
      status,
      uptime: Math.floor(process.uptime()),
      memory: {
        used: memUsed,
        total: memTotal,
        external: memExternal
      },
      logs: {
        total: this.logs.length,
        lastHour: hourlyLogs.length,
        lastDay: recentLogs.length,
        errorCount,
        warnCount,
        sources
      },
      timestamp: now.toISOString(),
      version: '1.0.0',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logManager = new LogManager();

export async function getSystemHealth(): Promise<SystemHealth> {
  return logManager.getSystemHealth();
}

// Initialize with some sample logs
logManager.log('info', 'System started successfully', { pid: process.pid }, 'server');
logManager.log('info', 'Database connection established', {}, 'database');
logManager.log('info', 'Authentication system initialized', {}, 'auth');
