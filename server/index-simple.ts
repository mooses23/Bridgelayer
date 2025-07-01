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
  origin: true, // Allow any origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.startsWith('192.168.'));
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
const PgSession = connectPgSimple(session);

const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    },
    name: 'firmsync.sid'
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Documentation endpoint (simplified for now)
app.get('/api/docs', (req, res) => {
  res.json({ 
    message: 'API Documentation - Coming Soon',
    endpoints: [
      'GET /health',
      'POST /api/auth/login',
      'GET /api/user/profile',
      'GET /api/firms'
    ]
  });
});

// Register application routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message || 'Something went wrong!'
  });
});

// Setup Vite in development, serve static files in production
if (app.get("env") === "development") {
  await setupVite(app);
} else {
  serveStatic(app);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`);
  console.log(`🚀 FirmSync Platform started successfully!`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
});
