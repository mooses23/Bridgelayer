import os from 'os';
import { performance } from 'perf_hooks';

/**
 * System health monitoring utilities
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  database: {
    connected: boolean;
    responseTime?: number;
  };
  environment: string;
  timestamp: Date;
}

/**
 * Log management for system monitoring
 */
export class LogManager {
  private logs: Array<{
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    timestamp: Date;
    source?: string;
  }> = [];

  log(level: 'error' | 'warn' | 'info' | 'debug', message: string, source?: string) {
    this.logs.push({
      level,
      message,
      timestamp: new Date(),
      source
    });

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
  }

  getLogs(limit = 100) {
    return this.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getLogsByLevel(level: string, limit = 100) {
    return this.logs
      .filter(log => log.level === level)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  clearLogs() {
    this.logs = [];
  }

  getLogStats() {
    const total = this.logs.length;
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byLevel,
      lastHour: this.logs.filter(log => 
        Date.now() - log.timestamp.getTime() < 3600000
      ).length
    };
  }
}

export const logManager = new LogManager();

/**
 * Get current system health status
 */
export function getSystemHealth(): SystemHealth {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    status: 'healthy',
    uptime: process.uptime(),
    memory: {
      used: usedMem,
      total: totalMem,
      percentage: (usedMem / totalMem) * 100
    },
    cpu: {
      usage: 0 // Would need more complex calculation for real CPU usage
    },
    database: {
      connected: true // Would check actual database connection
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  };
}

/**
 * Error handling utilities
 */
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}