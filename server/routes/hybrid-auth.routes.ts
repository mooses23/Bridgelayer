import express from 'express';
import hybridAuthController from '../controllers/hybrid-auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { requireAuth } from '../middleware/auth';
import { loginSchema, registerSchema, oauthLoginSchema, 
  resetPasswordRequestSchema, resetPasswordSchema, changePasswordSchema } from '../services/validation.service';

const router = express.Router();

/**
 * @swagger
 * /api/hybrid-auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateRequest(loginSchema), hybridAuthController.login.bind(hybridAuthController));

/**
 * @swagger
 * /api/hybrid-auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               firmCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Invalid input or email already exists
 */
router.post('/register', validateRequest(registerSchema), hybridAuthController.register.bind(hybridAuthController));

/**
 * @swagger
 * /api/hybrid-auth/oauth:
 *   post:
 *     summary: Login or register with OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - token
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [google, microsoft, github]
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: OAuth authentication successful
 *       401:
 *         description: Invalid OAuth credentials
 */
router.post('/oauth', validateRequest(oauthLoginSchema), hybridAuthController.oauthLogin.bind(hybridAuthController));

/**
 * @swagger
 * /api/hybrid-auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', hybridAuthController.refreshToken.bind(hybridAuthController));

/**
 * @swagger
 * /api/hybrid-auth/logout:
 *   post:
 *     summary: Logout and invalidate tokens
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post('/logout', hybridAuthController.logout.bind(hybridAuthController));

/**
 * @swagger
 * /api/hybrid-auth/session:
 *   get:
 *     summary: Get current user session information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current session information
 *       401:
 *         description: Not authenticated
 */
router.get('/session', requireAuth, hybridAuthController.getSessionInfo.bind(hybridAuthController));

/**
 * @swagger
 * /api/hybrid-auth/password-reset-request:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset request processed
 */
router.post(
  '/password-reset-request', 
  validateRequest(resetPasswordRequestSchema), 
  hybridAuthController.requestPasswordReset.bind(hybridAuthController)
);

/**
 * @swagger
 * /api/hybrid-auth/password-reset:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/password-reset', 
  validateRequest(resetPasswordSchema), 
  hybridAuthController.resetPassword.bind(hybridAuthController)
);

/**
 * @swagger
 * /api/hybrid-auth/change-password:
 *   post:
 *     summary: Change password (authenticated)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password change successful
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Not authenticated
 */
router.post(
  '/change-password', 
  requireAuth, 
  validateRequest(changePasswordSchema),
  hybridAuthController.changePassword.bind(hybridAuthController)
);

/**
 * @swagger
 * /api/hybrid-auth/health:
 *   get:
 *     summary: Service health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is operational
 */
router.get('/health', hybridAuthController.healthCheck.bind(hybridAuthController));

export default router;
