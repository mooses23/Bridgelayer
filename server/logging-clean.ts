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

// Application logs storage
export interface LogEntry {
  id: string;
  timestamp: Date;
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
    byLevel: Record<string, number>;
    sources: string[];
  };
  timestamp: string;
  version: string;
  nodeVersion: string;
  environment: string;
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
    
    // Keep logs within limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
      console.log(`[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}${metaStr}`);
    }
  }

  getLogs(options: {
    level?: LogEntry['level'];
    source?: string;
    limit?: number;
    offset?: number;
  } = {}): LogEntry[] {
    let filtered = this.logs;

    if (options.level) {
      filtered = filtered.filter(log => log.level === options.level);
    }

    if (options.source) {
      filtered = filtered.filter(log => log.source === options.source);
    }

    const start = options.offset || 0;
    const end = start + (options.limit || 50);
    
    return filtered.slice(start, end);
  }

  getLogStats() {
    const byLevel: Record<string, number> = {};
    const sources = Array.from(new Set(this.logs.map(log => log.source)));

    for (const log of this.logs) {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
    }

    return {
      total: this.logs.length,
      byLevel,
      sources
    };
  }

  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logManager = new LogManager();

// Error logging helper
export const logError = (err: Error, context?: any) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorId = `err_${Date.now()}`;
  
  logManager.log('error', err.message, {
    errorId,
    context,
    ...(isDevelopment && { stack: err.stack })
  });
};

// System health checker
export const getSystemHealth = async (): Promise<SystemHealth> => {
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
