import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ValidationService } from '../services/validation.service';

// Custom error for validation failures
export class ValidationError extends Error {
  constructor(
    public errors: { [key: string]: string[] },
    public status: number = 400
  ) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

// Generic validation middleware factory
export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = ValidationService.validateRequest(schema, req);
      // Add validated data to request for use in route handlers
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.reduce((acc: { [key: string]: string[] }, curr) => {
          const path = curr.path.join('.') || 'general';
          if (!acc[path]) acc[path] = [];
          acc[path].push(curr.message);
          return acc;
        }, {});
        
        next(new ValidationError(errors));
      } else {
        next(error);
      }
    }
  };
};
