import express from 'express';
import { configureSecurityMiddleware } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/error';
import { auditMiddleware } from './services/audit.service';
import { env } from './config/env';
import routes from './routes';

const app = express();

// Security middleware
configureSecurityMiddleware(app);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Audit logging for all requests
if (env.NODE_ENV === 'production') {
  app.use(auditMiddleware);
}

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
