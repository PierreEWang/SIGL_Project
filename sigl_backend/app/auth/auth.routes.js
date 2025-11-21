const express = require('express');
const authController = require('./auth.controller');
const { authenticate, authenticateRefreshToken } = require('../middleware/authenticate');

/**
 * Authentication Routes
 * Defines all authentication-related endpoints with appropriate middleware
 */
const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    User login - authenticate with email and password
 * @access  Public
 * @body    { email: string, password: string }
 * @returns { success: boolean, message: string, data: { user: object, tokens: object } }
 * 
 * @example
 * POST /api/auth/login
 * Content-Type: application/json
 * 
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123!"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "user": {
 *       "id": "507f1f77bcf86cd799439011",
 *       "nom": "John Doe",
 *       "email": "user@example.com",
 *       "role": "APPRENTI"
 *     },
 *     "tokens": {
 *       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *       "tokenType": "Bearer",
 *       "expiresIn": "15m"
 *     }
 *   }
 * }
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout - revoke refresh token
 * @access  Private (requires valid access token)
 * @headers Authorization: Bearer <access_token>
 * @returns { success: boolean, message: string }
 * 
 * @example
 * POST /api/auth/logout
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Logout successful"
 * }
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (but requires valid refresh token)
 * @headers Authorization: Bearer <refresh_token>
 * @returns { success: boolean, message: string, data: { accessToken: string, refreshToken: string, tokenType: string, expiresIn: string } }
 * 
 * @example
 * POST /api/auth/refresh
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Token refreshed successfully",
 *   "data": {
 *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "tokenType": "Bearer",
 *     "expiresIn": "15m"
 *   }
 * }
 */
router.post('/refresh', authController.refreshAccessToken);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private (requires valid access token)
 * @headers Authorization: Bearer <access_token>
 * @body    { currentPassword: string, newPassword: string }
 * @returns { success: boolean, message: string }
 * 
 * @example
 * POST /api/auth/change-password
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "currentPassword": "OldPass123!",
 *   "newPassword": "NewSecurePass456!"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Password changed successfully. Please login again with your new password."
 * }
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /api/auth/request-reset
 * @desc    Request password reset - sends reset token via email
 * @access  Public
 * @body    { email: string }
 * @returns { success: boolean, message: string }
 * 
 * @example
 * POST /api/auth/request-reset
 * Content-Type: application/json
 * 
 * {
 *   "email": "user@example.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "If the email address exists in our system, you will receive a password reset link shortly."
 * }
 */
router.post('/request-reset', authController.requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 * @body    { token: string, newPassword: string }
 * @returns { success: boolean, message: string }
 * 
 * @example
 * POST /api/auth/reset-password
 * Content-Type: application/json
 * 
 * {
 *   "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
 *   "newPassword": "NewSecurePass789!"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Password reset successful. Please login with your new password."
 * }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * Rate limiting middleware configuration (to be implemented)
 * 
 * Recommended rate limits:
 * - /login: 5 attempts per 15 minutes per IP
 * - /request-reset: 3 attempts per hour per IP
 * - /reset-password: 5 attempts per hour per IP
 * - /change-password: 10 attempts per hour per user
 * - /refresh: 100 requests per hour per user
 * - /logout: No specific limit needed
 * 
 * Example implementation with express-rate-limit:
 * 
 * const rateLimit = require('express-rate-limit');
 * 
 * const loginLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 5, // limit each IP to 5 requests per windowMs
 *   message: {
 *     success: false,
 *     message: 'Too many login attempts, please try again later.',
 *     error: 'RATE_LIMIT_EXCEEDED'
 *   },
 *   standardHeaders: true,
 *   legacyHeaders: false,
 * });
 * 
 * const resetRequestLimiter = rateLimit({
 *   windowMs: 60 * 60 * 1000, // 1 hour
 *   max: 3, // limit each IP to 3 requests per windowMs
 *   message: {
 *     success: false,
 *     message: 'Too many password reset requests, please try again later.',
 *     error: 'RATE_LIMIT_EXCEEDED'
 *   }
 * });
 * 
 * // Apply rate limiting to specific routes:
 * // router.post('/login', loginLimiter, authController.login);
 * // router.post('/request-reset', resetRequestLimiter, authController.requestPasswordReset);
 */

/**
 * Input validation middleware (to be implemented)
 * 
 * Recommended validation using express-validator:
 * 
 * const { body, validationResult } = require('express-validator');
 * 
 * const validateLogin = [
 *   body('email')
 *     .isEmail()
 *     .normalizeEmail()
 *     .withMessage('Valid email is required'),
 *   body('password')
 *     .isLength({ min: 1 })
 *     .withMessage('Password is required'),
 *   (req, res, next) => {
 *     const errors = validationResult(req);
 *     if (!errors.isEmpty()) {
 *       return res.status(400).json({
 *         success: false,
 *         message: 'Validation failed',
 *         errors: errors.array()
 *       });
 *     }
 *     next();
 *   }
 * ];
 * 
 * const validatePasswordChange = [
 *   body('currentPassword')
 *     .isLength({ min: 1 })
 *     .withMessage('Current password is required'),
 *   body('newPassword')
 *     .isLength({ min: 8 })
 *     .withMessage('New password must be at least 8 characters long')
 *     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
 *     .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
 *   (req, res, next) => {
 *     const errors = validationResult(req);
 *     if (!errors.isEmpty()) {
 *       return res.status(400).json({
 *         success: false,
 *         message: 'Validation failed',
 *         errors: errors.array()
 *       });
 *     }
 *     next();
 *   }
 * ];
 * 
 * // Apply validation to routes:
 * // router.post('/login', validateLogin, authController.login);
 * // router.post('/change-password', authenticate, validatePasswordChange, authController.changePassword);
 */

/**
 * Security headers middleware (to be implemented)
 * 
 * Recommended security headers using helmet:
 * 
 * const helmet = require('helmet');
 * 
 * router.use(helmet({
 *   contentSecurityPolicy: {
 *     directives: {
 *       defaultSrc: ["'self'"],
 *       styleSrc: ["'self'", "'unsafe-inline'"],
 *       scriptSrc: ["'self'"],
 *       imgSrc: ["'self'", "data:", "https:"],
 *     },
 *   },
 *   hsts: {
 *     maxAge: 31536000,
 *     includeSubDomains: true,
 *     preload: true
 *   }
 * }));
 */

/**
 * CORS configuration (to be implemented)
 * 
 * const cors = require('cors');
 * 
 * const corsOptions = {
 *   origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
 *   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 *   allowedHeaders: ['Content-Type', 'Authorization'],
 *   credentials: true,
 *   maxAge: 86400 // 24 hours
 * };
 * 
 * router.use(cors(corsOptions));
 */

/**
 * Request logging middleware (to be implemented)
 * 
 * const morgan = require('morgan');
 * 
 * // Custom format for authentication routes
 * morgan.token('user-id', (req) => {
 *   return req.user ? req.user.userId : 'anonymous';
 * });
 * 
 * const authLogFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
 * 
 * router.use(morgan(authLogFormat, {
 *   stream: {
 *     write: (message) => {
 *       console.log(`[AUTH] ${message.trim()}`);
 *     }
 *   }
 * }));
 */

module.exports = router;