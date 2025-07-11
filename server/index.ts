import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes-hybrid";
import { setupVite, serveStatic, log } from "./vite";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { ScheduledTasks } from './utils/scheduled-tasks';
import { logger } from './utils/logger';

import { pool } from "./db";

const app = express();

// Trust proxy for rate limiting and security headers - enable for Replit
app.set('trust proxy', true);

// Security middleware - Helmet for security headers (disabled CSP for Replit dev)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP in development to prevent Vite issues
  hsts: false // Disable HSTS in development
}));

// CORS configuration for Replit session-based authentication
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Replit domains
    if (origin.includes('.replit.dev') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow all origins in development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable trust proxy validation for development
    xForwardedForHeader: false // Disable X-Forwarded-For validation
  }
});

// General API rate limiting with trust proxy configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable trust proxy validation for development
    xForwardedForHeader: false // Disable X-Forwarded-For validation
  }
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Session configuration with PostgreSQL session store
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

(async () => {
  try {
    console.log('Starting FIRMSYNC server...');
    
    const server = await registerRoutes(app);

    // Start scheduled tasks
    logger.info('Starting scheduled tasks');
    ScheduledTasks.startAll();

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Application error:', err);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use port from environment or default to 5001
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
    
    // Check if server is already listening to prevent duplicate listeners
    if (!server.listening) {
      server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
      });
    } else {
      log(`server already listening on port ${port}`);
    }

    // Start scheduled tasks
    ScheduledTasks.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
