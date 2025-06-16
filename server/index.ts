import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes-minimal";
import { setupVite, serveStatic, log } from "./vite";
import { seedAuthData } from "./seed-auth-data";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const app = express();

// Trust proxy for rate limiting and security headers - enable for Replit
app.set('trust proxy', true);

// Security middleware - Helmet for security headers (disabled CSP for Replit dev)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP in development to prevent Vite issues
  hsts: false // Disable HSTS in development
}));

// CORS configuration for development environment
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from Replit domains and localhost
    const allowedOrigins = [
      /\.replit\.dev$/,
      /localhost/,
      /127\.0\.0\.1/
    ];
    
    if (!origin || allowedOrigins.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Cookie parser for JWT tokens
app.use(cookieParser());

// Configure session middleware with PostgreSQL store
const PgSession = ConnectPgSimple(session);
// Configure express-session for Replit environment
app.use(session({
  secret: process.env.SESSION_SECRET || 'firmsync-dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid', // Use standard session name
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
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

(async () => {
  try {
    // Auto-seed authentication data on startup if needed
    await seedAuthData();
    
    const server = await registerRoutes(app);

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

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    
    // Check if server is already listening to prevent duplicate listeners
    if (!server.listening) {
      server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
      });
    } else {
      log(`server already listening on port ${port}`);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
