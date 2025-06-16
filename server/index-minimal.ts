import express from "express";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5000"],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Basic routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/session", (req, res) => {
  res.json({ user: null });
});

app.get("/api/tenant/:subdomain", (req, res) => {
  const { subdomain } = req.params;
  
  const tenant = {
    id: "1",
    name: "Demo Firm",
    subdomain: subdomain,
    features: {
      billingEnabled: true,
      documentsEnabled: true,
      intakeEnabled: true,
      communicationsEnabled: true,
      calendarEnabled: true
    }
  };

  res.json({ tenant });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error('Application error:', err);
  res.status(status).json({ message });
});

async function main() {
  try {
    const server = createServer(app);

    // Setup Vite in development
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000;
    
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
}

main();