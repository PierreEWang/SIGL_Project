const authService = require('../auth/auth.service');

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user information to the request object
 */

/**
 * Middleware to authenticate JWT tokens
 * Extracts JWT from Authorization header, verifies it, and attaches user info to req.user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                error: 'MISSING_TOKEN'
            });
        }

        // Extract bearer token using auth service
        let token;
        try {
            token = authService.extractBearerToken(authHeader);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization header format. Expected: Bearer <token>',
                error: 'INVALID_HEADER_FORMAT'
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = authService.verifyToken(token, 'access');
        } catch (error) {
            // Handle specific token errors
            if (error.message === 'Token has expired') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired. Please refresh your token.',
                    error: 'TOKEN_EXPIRED'
                });
            } else if (error.message === 'Invalid token') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token provided.',
                    error: 'INVALID_TOKEN'
                });
            } else if (error.message === 'Token not active yet') {
                return res.status(401).json({
                    success: false,
                    message: 'Token is not yet active.',
                    error: 'TOKEN_NOT_ACTIVE'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Token verification failed.',
                    error: 'TOKEN_VERIFICATION_FAILED'
                });
            }
        }

        // Validate token payload structure
        if (!decoded.userId || !decoded.email || !decoded.role) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload.',
                error: 'INVALID_TOKEN_PAYLOAD'
            });
        }

        // Attach user information to request object
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            tokenType: decoded.type
        };

        // Log authentication event for monitoring
        console.log(`User authenticated: ${decoded.email} (${decoded.role}) - ${new Date().toISOString()}`);

        next();
    } catch (error) {
        console.error('Authentication middleware error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.',
            error: 'AUTHENTICATION_ERROR'
        });
    }
};

/**
 * Middleware to authenticate refresh tokens
 * Similar to authenticate but specifically for refresh token verification
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateRefreshToken = async (req, res, next) => {
    try {
        // Extract Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No refresh token provided.',
                error: 'MISSING_REFRESH_TOKEN'
            });
        }

        // Extract bearer token
        let token;
        try {
            token = authService.extractBearerToken(authHeader);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization header format. Expected: Bearer <token>',
                error: 'INVALID_HEADER_FORMAT'
            });
        }

        // Verify the refresh token
        let decoded;
        try {
            decoded = authService.verifyToken(token, 'refresh');
        } catch (error) {
            if (error.message === 'Token has expired') {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token has expired. Please login again.',
                    error: 'REFRESH_TOKEN_EXPIRED'
                });
            } else if (error.message === 'Invalid token') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token provided.',
                    error: 'INVALID_REFRESH_TOKEN'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token verification failed.',
                    error: 'REFRESH_TOKEN_VERIFICATION_FAILED'
                });
            }
        }

        // Validate refresh token payload structure
        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token payload.',
                error: 'INVALID_REFRESH_TOKEN_PAYLOAD'
            });
        }

        // Attach user information to request object
        req.user = {
            userId: decoded.userId,
            tokenType: decoded.type
        };

        // Log refresh token authentication event
        console.log(`Refresh token authenticated: ${decoded.userId} - ${new Date().toISOString()}`);

        next();
    } catch (error) {
        console.error('Refresh token authentication middleware error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during refresh token authentication.',
            error: 'REFRESH_AUTHENTICATION_ERROR'
        });
    }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token is provided
 * Useful for routes that have different behavior for authenticated vs anonymous users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // If no auth header, continue without authentication
        if (!authHeader) {
            req.user = null;
            return next();
        }

        // Try to authenticate, but don't fail if token is invalid
        try {
            const token = authService.extractBearerToken(authHeader);
            const decoded = authService.verifyToken(token, 'access');
            
            if (decoded.userId && decoded.email && decoded.role) {
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    role: decoded.role,
                    tokenType: decoded.type
                };
            } else {
                req.user = null;
            }
        } catch (error) {
            // Log the error but continue without authentication
            console.log(`Optional authentication failed: ${error.message}`);
            req.user = null;
        }

        next();
    } catch (error) {
        console.error('Optional authentication middleware error:', error.message);
        req.user = null;
        next();
    }
};

/**
 * Middleware to check if token is about to expire
 * Adds a warning header if token expires within the next 5 minutes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const checkTokenExpiry = (req, res, next) => {
    try {
        if (req.user && req.user.tokenType === 'access') {
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authService.extractBearerToken(authHeader);
                
                // Check if token expires within 5 minutes
                if (authService.isTokenExpired(token, 'access')) {
                    res.setHeader('X-Token-Warning', 'Token will expire soon. Consider refreshing.');
                }
            }
        }
        next();
    } catch (error) {
        // Don't fail the request, just log the error
        console.error('Token expiry check error:', error.message);
        next();
    }
};

module.exports = {
    authenticate,
    authenticateRefreshToken,
    optionalAuthenticate,
    checkTokenExpiry
};