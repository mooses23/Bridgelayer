import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { promClient, register } from '../config/prometheus';
import { statsd } from '../config/datadog';
import os from 'os';

// Prometheus metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

const cpuUsageGauge = new promClient.Gauge({
  name: 'process_cpu_usage',
  help: 'Process CPU usage',
});

const memoryUsageGauge = new promClient.Gauge({
  name: 'process_memory_usage_bytes',
  help: 'Process memory usage in bytes',
});

// Update system metrics every 15 seconds
setInterval(() => {
  cpuUsageGauge.set(process.cpuUsage().system / 1000000);
  memoryUsageGauge.set(process.memoryUsage().heapUsed);
}, 15000);

export class MonitoringService {
  private static instance: MonitoringService;

  private constructor() {
    this.setupMetrics();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Middleware for request monitoring
  public requestMonitoring(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    // Record request start
    statsd.increment('http.requests', 1, [`method:${req.method}`, `path:${req.path}`]);

    // Add response listener
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // Record metrics
      httpRequestDurationMicroseconds
        .labels(req.method, req.path, res.statusCode.toString())
        .observe(duration);

      statsd.timing('http.response_time', duration, [
        `method:${req.method}`,
        `path:${req.path}`,
        `status:${res.statusCode}`,
      ]);

      // Log request details
      logger.info('Request processed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      });
    });

    next();
  }

  // System health check
  public async healthCheck(): Promise<{
    status: string;
    version: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
    };
    cpu: {
      usage: number;
      count: number;
    };
  }> {
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: memory.heapUsed,
        total: memory.heapTotal,
      },
      cpu: {
        usage: cpuUsage.system / 1000000,
        count: os.cpus().length,
      },
    };
  }

  private setupMetrics(): void {
    // Add default metrics
    promClient.collectDefaultMetrics();

    // Custom business metrics setup
    this.setupBusinessMetrics();
  }

  private setupBusinessMetrics(): void {
    // Add your custom business metrics here
    const activeUsersGauge = new promClient.Gauge({
      name: 'active_users',
      help: 'Number of currently active users',
    });

    const firmCountGauge = new promClient.Gauge({
      name: 'total_firms',
      help: 'Total number of registered firms',
    });

    // Update business metrics periodically
    setInterval(async () => {
      try {
        // Update metrics (implement these methods based on your needs)
        // await this.updateActiveUsers(activeUsersGauge);
        // await this.updateFirmCount(firmCountGauge);
      } catch (error) {
        logger.error('Error updating business metrics:', error);
      }
    }, 60000); // Every minute
  }
}

export const monitoringService = MonitoringService.getInstance();
