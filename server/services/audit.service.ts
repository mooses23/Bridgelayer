import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Create the audit logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'firmsync-audit' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Add production logging
if (env.NODE_ENV === 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

interface AuditLogData {
  userId?: number;
  firmId?: number;
  action: string;
  resourceType: string;
  resourceId?: string | number;
  details?: any;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export class AuditService {
  static async log({
    userId,
    firmId,
    action,
    resourceType,
    resourceId,
    details,
    status,
    errorMessage
  }: AuditLogData): Promise<void> {
    const logData = {
      timestamp: new Date().toISOString(),
      userId,
      firmId,
      action,
      resourceType,
      resourceId,
      details,
      status,
      errorMessage,
      environment: env.NODE_ENV
    };

    auditLogger.info('audit_event', logData);

    // If in production, also store in database
    if (env.NODE_ENV === 'production') {
      try {
        await db.insert(auditLogs).values(logData);
      } catch (error) {
        console.error('Failed to store audit log in database:', error);
      }
    }
  }
}

// Middleware to audit API requests
export function auditMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;
  const chunks: Buffer[] = [];

  // Override end function to capture response
  res.end = function(chunk: any) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    
    const responseTime = Date.now() - startTime;
    const responseBody = Buffer.concat(chunks).toString('utf8');

    // Log the request/response
    AuditService.log({
      userId: (req as any).user?.id,
      firmId: (req as any).user?.firmId,
      action: `${req.method} ${req.path}`,
      resourceType: 'api_endpoint',
      details: {
        requestMethod: req.method,
        requestPath: req.path,
        requestQuery: req.query,
        requestBody: req.body,
        responseStatus: res.statusCode,
        responseTime,
        responseBody: responseBody.length > 1000 
          ? `${responseBody.substring(0, 1000)}...` 
          : responseBody,
        userAgent: req.get('user-agent'),
        ip: req.ip
      },
      status: res.statusCode >= 400 ? 'failure' : 'success',
      errorMessage: res.statusCode >= 400 ? responseBody : undefined
    }).catch(console.error);

    // Call the original end function
    return originalEnd.apply(res, arguments as any);
  };

  next();
}
