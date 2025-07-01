import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AuditService } from '../services/audit.service';

// Custom error class for application errors
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler for async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Main error handling middleware
export const errorHandler = async (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details = undefined;

  // Handle different types of errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || `ERROR_${statusCode}`;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = err.errors;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Log the error
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: err.name,
    message: err.message,
    statusCode,
    code,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
    firmId: (req as any).user?.firmId
  };

  // Log to audit service
  await AuditService.log({
    userId: (req as any).user?.id,
    firmId: (req as any).user?.firmId,
    action: `${req.method} ${req.path}`,
    resourceType: 'error',
    details: errorLog,
    status: 'failure',
    errorMessage: err.message
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
      details
    })
  });
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = new AppError(
    404,
    `Route ${req.originalUrl} not found`,
    'NOT_FOUND'
  );
  next(err);
};

// Rate limit error handler
export const rateLimitHandler = (
  req: Request,
  res: Response
) => {
  const err = new AppError(
    429,
    'Too many requests, please try again later',
    'RATE_LIMIT_EXCEEDED'
  );
  res.status(429).json({
    success: false,
    error: err.message,
    code: err.code
  });
};

// Database error handler
export const handleDatabaseError = (error: any) => {
  if (error.code === '23505') { // Unique violation
    return new AppError(
      409,
      'Resource already exists',
      'DUPLICATE_RESOURCE',
      { constraint: error.constraint }
    );
  }
  
  if (error.code === '23503') { // Foreign key violation
    return new AppError(
      400,
      'Invalid reference',
      'INVALID_REFERENCE',
      { constraint: error.constraint }
    );
  }
  
  // Default database error
  return new AppError(
    500,
    'Database error occurred',
    'DATABASE_ERROR',
    env.NODE_ENV === 'development' ? error : undefined
  );
};
