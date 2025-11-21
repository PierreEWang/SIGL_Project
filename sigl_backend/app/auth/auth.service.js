const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const Auth = require('./auth.model');

/**
 * Authentication Service
 * Handles password hashing, JWT operations, and authentication business logic
 */
class AuthService {
    /**
     * Hash a plain text password using bcrypt
     * @param {string} password - Plain text password to hash
     * @returns {Promise<string>} Hashed password
     * @throws {Error} If password is invalid or hashing fails
     */
    async hashPassword(password) {
        try {
            // Validate password input
            if (!password || typeof password !== 'string') {
                throw new Error('Password must be a non-empty string');
            }

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            return hashedPassword;
        } catch (error) {
            console.error('Password hashing failed:', error.message);
            throw new Error('Failed to hash password');
        }
    }

    /**
     * Compare a plain text password with a hashed password
     * @param {string} plainPassword - Plain text password
     * @param {string} hashedPassword - Hashed password to compare against
     * @returns {Promise<boolean>} True if passwords match, false otherwise
     * @throws {Error} If comparison fails
     */
    async comparePassword(plainPassword, hashedPassword) {
        try {
            // Validate inputs
            if (!plainPassword || typeof plainPassword !== 'string') {
                throw new Error('Plain password must be a non-empty string');
            }

            if (!hashedPassword || typeof hashedPassword !== 'string') {
                throw new Error('Hashed password must be a non-empty string');
            }

            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error('Password comparison failed:', error.message);
            throw new Error('Failed to compare passwords');
        }
    }

    /**
     * Generate an access token for a user
     * @param {string} userId - User's unique identifier
     * @param {string} email - User's email address
     * @param {string} role - User's role
     * @returns {string} JWT access token
     * @throws {Error} If token generation fails
     */
    generateAccessToken(userId, email, role) {
        try {
            // Validate required parameters
            if (!userId || !email || !role) {
                throw new Error('userId, email, and role are required for access token generation');
            }

            const payload = {
                userId,
                email: email.toLowerCase(),
                role,
                type: 'access'
            };

            const config = jwtConfig.getAccessTokenConfig();
            
            const token = jwt.sign(payload, config.secret, {
                expiresIn: config.expiresIn,
                issuer: config.issuer,
                audience: config.audience,
                algorithm: config.algorithm
            });

            return token;
        } catch (error) {
            console.error('Access token generation failed:', error.message);
            throw new Error('Failed to generate access token');
        }
    }

    /**
     * Generate a refresh token for a user
     * @param {string} userId - User's unique identifier
     * @returns {string} JWT refresh token
     * @throws {Error} If token generation fails
     */
    generateRefreshToken(userId) {
        try {
            // Validate required parameter
            if (!userId) {
                throw new Error('userId is required for refresh token generation');
            }

            const payload = {
                userId,
                type: 'refresh'
            };

            const config = jwtConfig.getRefreshTokenConfig();
            
            const token = jwt.sign(payload, config.secret, {
                expiresIn: config.expiresIn,
                issuer: config.issuer,
                audience: config.audience,
                algorithm: config.algorithm
            });

            return token;
        } catch (error) {
            console.error('Refresh token generation failed:', error.message);
            throw new Error('Failed to generate refresh token');
        }
    }

    /**
     * Verify and decode a JWT token
     * @param {string} token - JWT token to verify
     * @param {string} tokenType - Type of token ('access' or 'refresh')
     * @returns {Object} Decoded token payload
     * @throws {Error} If token is invalid or verification fails
     */
    verifyToken(token, tokenType = 'access') {
        try {
            // Validate inputs
            if (!token || typeof token !== 'string') {
                throw new Error('Token must be a non-empty string');
            }

            if (!['access', 'refresh'].includes(tokenType)) {
                throw new Error('Token type must be either "access" or "refresh"');
            }

            const secret = tokenType === 'access' 
                ? jwtConfig.JWT_SECRET 
                : jwtConfig.JWT_REFRESH_SECRET;

            const verifyOptions = jwtConfig.getVerifyOptions();
            
            const decoded = jwt.verify(token, secret, verifyOptions);

            // Verify token type matches expected type
            if (decoded.type !== tokenType) {
                throw new Error(`Invalid token type. Expected ${tokenType}, got ${decoded.type}`);
            }

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            } else if (error.name === 'NotBeforeError') {
                throw new Error('Token not active yet');
            } else {
                console.error('Token verification failed:', error.message);
                throw new Error('Token verification failed');
            }
        }
    }

    /**
     * Store a refresh token for a user
     * @param {string} userId - User's unique identifier
     * @param {string} refreshToken - Refresh token to store
     * @returns {Promise<Object>} Updated auth record
     * @throws {Error} If storage fails
     */
    async storeRefreshToken(userId, refreshToken) {
        try {
            // Validate inputs
            if (!userId) {
                throw new Error('userId is required');
            }

            if (!refreshToken || typeof refreshToken !== 'string') {
                throw new Error('refreshToken must be a non-empty string');
            }

            // Verify the refresh token is valid before storing
            this.verifyToken(refreshToken, 'refresh');

            const authRecord = await Auth.findOneAndUpdate(
                { userId, isActive: true },
                { 
                    refreshToken,
                    $unset: { accountLockedUntil: 1 } // Clear any account lock
                },
                { new: true }
            );

            if (!authRecord) {
                throw new Error('Auth record not found for user');
            }

            return authRecord.toSafeObject();
        } catch (error) {
            console.error('Refresh token storage failed:', error.message);
            throw new Error('Failed to store refresh token');
        }
    }

    /**
     * Revoke a refresh token for a user
     * @param {string} userId - User's unique identifier
     * @returns {Promise<Object>} Updated auth record
     * @throws {Error} If revocation fails
     */
    async revokeRefreshToken(userId) {
        try {
            // Validate input
            if (!userId) {
                throw new Error('userId is required');
            }

            const authRecord = await Auth.findOneAndUpdate(
                { userId, isActive: true },
                { 
                    $unset: { refreshToken: 1 } // Remove refresh token
                },
                { new: true }
            );

            if (!authRecord) {
                throw new Error('Auth record not found for user');
            }

            return authRecord.toSafeObject();
        } catch (error) {
            console.error('Refresh token revocation failed:', error.message);
            throw new Error('Failed to revoke refresh token');
        }
    }

    /**
     * Generate both access and refresh tokens for a user
     * @param {string} userId - User's unique identifier
     * @param {string} email - User's email address
     * @param {string} role - User's role
     * @returns {Object} Object containing both tokens
     * @throws {Error} If token generation fails
     */
    generateTokenPair(userId, email, role) {
        try {
            const accessToken = this.generateAccessToken(userId, email, role);
            const refreshToken = this.generateRefreshToken(userId);

            return {
                accessToken,
                refreshToken,
                tokenType: 'Bearer',
                expiresIn: jwtConfig.ACCESS_TOKEN_EXPIRY
            };
        } catch (error) {
            console.error('Token pair generation failed:', error.message);
            throw new Error('Failed to generate token pair');
        }
    }

    /**
     * Validate token format and extract bearer token
     * @param {string} authHeader - Authorization header value
     * @returns {string} Extracted token
     * @throws {Error} If header format is invalid
     */
    extractBearerToken(authHeader) {
        if (!authHeader) {
            throw new Error('Authorization header is required');
        }

        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Error('Invalid authorization header format. Expected: Bearer <token>');
        }

        return parts[1];
    }

    /**
     * Check if a token is expired without throwing an error
     * @param {string} token - JWT token to check
     * @param {string} tokenType - Type of token ('access' or 'refresh')
     * @returns {boolean} True if token is expired, false otherwise
     */
    isTokenExpired(token, tokenType = 'access') {
        try {
            this.verifyToken(token, tokenType);
            return false;
        } catch (error) {
            return error.message === 'Token has expired';
        }
    }
}

// Export singleton instance
module.exports = new AuthService();