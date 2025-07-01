import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

const sanitizeOptions = {
  allowedTags: [], // No HTML tags allowed
  allowedAttributes: {}, // No HTML attributes allowed
  disallowedTagsMode: 'discard',
};

export function sanitizeInput(schema?: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize query parameters
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            req.query[key] = sanitizeHtml(value, sanitizeOptions);
          }
        }
      }

      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        const sanitizeObject = (obj: any): any => {
          const sanitized: any = {};
          
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
              sanitized[key] = sanitizeHtml(value, sanitizeOptions);
            } else if (Array.isArray(value)) {
              sanitized[key] = value.map(item => 
                typeof item === 'string' 
                  ? sanitizeHtml(item, sanitizeOptions)
                  : typeof item === 'object' 
                    ? sanitizeObject(item)
                    : item
              );
            } else if (value && typeof value === 'object') {
              sanitized[key] = sanitizeObject(value);
            } else {
              sanitized[key] = value;
            }
          }
          
          return sanitized;
        };

        req.body = sanitizeObject(req.body);
      }

      // If a schema is provided, validate the sanitized data
      if (schema) {
        const validated = schema.parse(req.body);
        req.body = validated;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

// SQL Injection prevention
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i
];

export function preventSqlInjection(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const checkValue = (value: string): boolean => {
    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: any): boolean => {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && checkValue(value)) {
        return true;
      }
      if (value && typeof value === 'object') {
        if (checkObject(value)) return true;
      }
    }
    return false;
  };

  if (
    (req.query && checkObject(req.query)) ||
    (req.body && checkObject(req.body)) ||
    (req.params && checkObject(req.params))
  ) {
    return res.status(403).json({
      success: false,
      error: 'Potential malicious input detected'
    });
  }

  next();
}

// XSS Prevention Headers
export function xssPreventionHeaders(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}
