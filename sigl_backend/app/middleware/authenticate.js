// sigl_backend/app/middleware/authenticate.js

/**
 * Middlewares d’authentification (access / refresh tokens)
 * -> Utilise les helpers déjà présents dans auth.service
 */

const authService = require('../auth/auth.service');

/**
 * Middleware pour vérifier un access token (Bearer <token>)
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'MISSING_TOKEN',
      });
    }

    let token;
    try {
      token = authService.extractBearerToken(authHeader);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected: Bearer <token>',
        error: 'INVALID_HEADER_FORMAT',
      });
    }

    let decoded;
    try {
      decoded = authService.verifyToken(token, 'access');
    } catch (err) {
      if (err.message === 'Token has expired') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please refresh your token.',
          error: 'TOKEN_EXPIRED',
        });
      } else if (err.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token provided.',
          error: 'INVALID_TOKEN',
        });
      } else if (err.message === 'Token not active yet') {
        return res.status(401).json({
          success: false,
          message: 'Token is not yet active.',
          error: 'TOKEN_NOT_ACTIVE',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Token verification failed.',
        error: 'TOKEN_VERIFICATION_FAILED',
      });
    }

    if (!decoded.userId || !decoded.email || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
        error: 'INVALID_TOKEN_PAYLOAD',
      });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tokenType: decoded.type,
    };

    console.log(
      `User authenticated: ${decoded.email} (${decoded.role}) - ${new Date().toISOString()}`
    );

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: 'AUTHENTICATION_ERROR',
    });
  }
};

/**
 * Middleware pour vérifier un refresh token (Bearer <token>)
 */
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No refresh token provided.',
        error: 'MISSING_REFRESH_TOKEN',
      });
    }

    let token;
    try {
      token = authService.extractBearerToken(authHeader);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected: Bearer <token>',
        error: 'INVALID_HEADER_FORMAT',
      });
    }

    let decoded;
    try {
      decoded = authService.verifyToken(token, 'refresh');
    } catch (err) {
      if (err.message === 'Token has expired') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has expired. Please login again.',
          error: 'REFRESH_TOKEN_EXPIRED',
        });
      } else if (err.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token provided.',
          error: 'INVALID_REFRESH_TOKEN',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Refresh token verification failed.',
        error: 'REFRESH_TOKEN_VERIFICATION_FAILED',
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token payload.',
        error: 'INVALID_REFRESH_TOKEN_PAYLOAD',
      });
    }

    req.user = {
      userId: decoded.userId,
      tokenType: decoded.type,
    };

    console.log(
      `Refresh token authenticated: ${decoded.userId} - ${new Date().toISOString()}`
    );

    next();
  } catch (error) {
    console.error('Refresh token authentication middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during refresh token authentication.',
      error: 'REFRESH_AUTHENTICATION_ERROR',
    });
  }
};

module.exports = {
  authenticate,
  authenticateRefreshToken,
};