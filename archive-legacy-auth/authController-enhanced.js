const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { platformDB } = require('../config/database');

// Enhanced environment variable handling with validation
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const OWNER_MASTER_KEY = process.env.OWNER_MASTER_KEY;

// Validate critical environment variables on startup
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('❌ CRITICAL: JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

if (!OWNER_MASTER_KEY) {
  console.warn('⚠️  WARNING: OWNER_MASTER_KEY not set - owner login will not work');
}

/**
 * Enhanced Authentication Controller with Smart Error Handling and Security
 */

// Input validation helper
const validateLoginInput = (email, password, additionalFields = {}) => {
  const errors = [];
  
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Invalid email format');
    }
  }
  
  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Validate additional fields (like masterKey for owner login)
  Object.entries(additionalFields).forEach(([field, value]) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${field} is required`);
    }
  });
  
  return errors;
};

// Generate secure JWT token with user info
const generateJWTToken = (user, role) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: role,
    firmId: user.firmId || null,
    iat: Math.floor(Date.now() / 1000),
    type: 'access'
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'firmsync-legal',
    audience: 'firmsync-users'
  });
};

// Enhanced security response helper
const createSecureResponse = (user, token, role, message = 'Login successful') => {
  return {
    success: true,
    message,
    user: {
      id: user.id,
      email: user.email,
      role: role,
      firmId: user.firmId || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null
    },
    token,
    tokenType: 'Bearer',
    expiresIn: JWT_EXPIRES_IN,
    loginTime: new Date().toISOString(),
    authMethod: 'jwt'
  };
};

// Enhanced error response helper
const createErrorResponse = (message, code, statusCode = 400, additionalInfo = {}) => {
  const errorResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    errorResponse.error = 'Internal server error';
    errorResponse.message = 'Please try again later or contact support';
  }
  
  return errorResponse;
};

// Rate limiting helper (simple in-memory implementation)
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const checkRateLimit = (identifier) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || [];
  
  // Clean old attempts
  const recentAttempts = attempts.filter(attempt => now - attempt < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return {
      blocked: true,
      resetTime: new Date(recentAttempts[0] + RATE_LIMIT_WINDOW).toISOString()
    };
  }
  
  // Add current attempt
  recentAttempts.push(now);
  loginAttempts.set(identifier, recentAttempts);
  
  return { blocked: false, attemptsRemaining: MAX_ATTEMPTS - recentAttempts.length };
};

/**
 * Enhanced Owner Login
 * Requires email, password, and master key for highest security
 */
exports.loginOwner = async (req, res) => {
  try {
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    const { email, password, masterKey } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    console.log(`🔐 Owner login attempt from IP: ${clientIP}, Email: ${email}`);
    
    // Rate limiting check
    const rateLimitCheck = checkRateLimit(`owner_${clientIP}`);
    if (rateLimitCheck.blocked) {
      console.warn(`🚫 Rate limit exceeded for owner login from IP: ${clientIP}`);
      return res.status(429).json(createErrorResponse(
        'Too many login attempts',
        'RATE_LIMIT_EXCEEDED',
        429,
        { resetTime: rateLimitCheck.resetTime }
      ));
    }
    
    // Input validation
    const validationErrors = validateLoginInput(email, password, { masterKey });
    if (validationErrors.length > 0) {
      console.log(`❌ Owner login validation failed: ${validationErrors.join(', ')}`);
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        { details: validationErrors }
      ));
    }
    
    // Master key verification (critical security check)
    if (masterKey !== OWNER_MASTER_KEY) {
      console.warn(`🚨 Invalid master key attempt for owner login. Email: ${email}, IP: ${clientIP}`);
      return res.status(403).json(createErrorResponse(
        'Invalid master key',
        'INVALID_MASTER_KEY',
        403
      ));
    }
    
    // Database lookup
    const owner = await platformDB.owner.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });
    
    if (!owner) {
      console.warn(`🚫 Owner login failed - user not found: ${email}`);
      return res.status(401).json(createErrorResponse(
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        401
      ));
    }
    
    // Password verification
    const isPasswordValid = await bcrypt.compare(password, owner.password);
    if (!isPasswordValid) {
      console.warn(`🚫 Owner login failed - invalid password: ${email}`);
      return res.status(401).json(createErrorResponse(
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        401
      ));
    }
    
    // Generate secure token
    const token = generateJWTToken(owner, 'owner');
    
    // Success logging
    console.log(`✅ Successful owner login: ${owner.email} (ID: ${owner.id})`);
    
    // Return success response
    return res.status(200).json(createSecureResponse(
      owner, 
      token, 
      'owner', 
      'Owner login successful'
    ));
    
  } catch (error) {
    console.error('💥 Owner login error:', error);
    
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.name === 'PrismaClientKnownRequestError') {
      return res.status(503).json(createErrorResponse(
        'Database connection error',
        'DATABASE_ERROR',
        503,
        { message: 'Please try again later' }
      ));
    }
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json(createErrorResponse(
        'Token generation failed',
        'TOKEN_ERROR',
        500
      ));
    }
    
    // Generic error response
    return res.status(500).json(createErrorResponse(
      'Internal server error',
      'INTERNAL_ERROR',
      500
    ));
  }
};

/**
 * Enhanced Admin Login
 * Standard admin authentication with role verification
 */
exports.loginAdmin = async (req, res) => {
  try {
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    console.log(`🔐 Admin login attempt from IP: ${clientIP}, Email: ${email}`);
    
    // Rate limiting check
    const rateLimitCheck = checkRateLimit(`admin_${clientIP}`);
    if (rateLimitCheck.blocked) {
      console.warn(`🚫 Rate limit exceeded for admin login from IP: ${clientIP}`);
      return res.status(429).json(createErrorResponse(
        'Too many login attempts',
        'RATE_LIMIT_EXCEEDED',
        429,
        { resetTime: rateLimitCheck.resetTime }
      ));
    }
    
    // Input validation
    const validationErrors = validateLoginInput(email, password);
    if (validationErrors.length > 0) {
      console.log(`❌ Admin login validation failed: ${validationErrors.join(', ')}`);
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        { details: validationErrors }
      ));
    }
    
    // Database lookup
    const admin = await platformDB.admin.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });
    
    if (!admin) {
      console.warn(`🚫 Admin login failed - user not found: ${email}`);
      return res.status(401).json(createErrorResponse(
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        401
      ));
    }
    
    // Password verification
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      console.warn(`🚫 Admin login failed - invalid password: ${email}`);
      return res.status(401).json(createErrorResponse(
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        401
      ));
    }
    
    // Generate secure token
    const token = generateJWTToken(admin, 'admin');
    
    // Success logging
    console.log(`✅ Successful admin login: ${admin.email} (ID: ${admin.id})`);
    
    // Return success response
    return res.status(200).json(createSecureResponse(
      admin, 
      token, 
      'admin', 
      'Admin login successful'
    ));
    
  } catch (error) {
    console.error('💥 Admin login error:', error);
    
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.name === 'PrismaClientKnownRequestError') {
      return res.status(503).json(createErrorResponse(
        'Database connection error',
        'DATABASE_ERROR',
        503,
        { message: 'Please try again later' }
      ));
    }
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json(createErrorResponse(
        'Token generation failed',
        'TOKEN_ERROR',
        500
      ));
    }
    
    // Generic error response
    return res.status(500).json(createErrorResponse(
      'Internal server error',
      'INTERNAL_ERROR',
      500
    ));
  }
};

/**
 * Token verification middleware
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json(createErrorResponse(
        'Access token required',
        'TOKEN_REQUIRED',
        401
      ));
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(createErrorResponse(
        'Token expired',
        'TOKEN_EXPIRED',
        401
      ));
    }
    
    return res.status(403).json(createErrorResponse(
      'Invalid token',
      'INVALID_TOKEN',
      403
    ));
  }
};

/**
 * Role-based access control middleware
 */
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createErrorResponse(
        'Authentication required',
        'AUTH_REQUIRED',
        401
      ));
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(createErrorResponse(
        'Insufficient permissions',
        'INSUFFICIENT_PERMISSIONS',
        403,
        { required: roles, current: req.user.role }
      ));
    }
    
    next();
  };
};

/**
 * Health check endpoint for authentication system
 */
exports.healthCheck = (req, res) => {
  res.json({
    success: true,
    service: 'FirmSync Authentication',
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      jwtAuth: !!JWT_SECRET,
      ownerAuth: !!OWNER_MASTER_KEY,
      rateLimit: true,
      inputValidation: true
    }
  });
};

module.exports = exports;
