import cors from 'cors';
import helmet from 'helmet';
import { Express } from 'express';

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://app.firmsync.com',
      'https://admin.bridgelayer.com',
      /\.firmsync\.com$/  // Allow all subdomains for firms
    ]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      /^http:\/\/localhost:\d+$/
    ];

export function configureSecurityMiddleware(app: Express) {
  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is allowed
      const isAllowed = allowedOrigins.some(allowed => 
        typeof allowed === 'string' 
          ? allowed === origin
          : allowed.test(origin)
      );
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Tenant-ID'
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count']
  }));

  // Helmet security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  }));

  // Additional security measures
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
}
