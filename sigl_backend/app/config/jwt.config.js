const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * JWT Configuration
 * Centralized configuration for JWT tokens with proper validation
 */
class JWTConfig {
    constructor() {
        this.validateEnvironmentVariables();
        
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
        this.ACCESS_TOKEN_EXPIRY = '15m';
        this.REFRESH_TOKEN_EXPIRY = '7d';
        this.ISSUER = 'learning-management-system';
        this.AUDIENCE = 'lms-users';
        this.ALGORITHM = 'HS256';
    }

    /**
     * Validate that all required environment variables are present
     * @throws {Error} If any required environment variable is missing
     */
    validateEnvironmentVariables() {
        const requiredVars = [
            'JWT_SECRET',
            'JWT_REFRESH_SECRET'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missingVars.join(', ')}. ` +
                'Please check your .env file and ensure all JWT configuration variables are set.'
            );
        }

        // Validate JWT secret strength
        if (process.env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long for security.');
        }

        if (process.env.JWT_REFRESH_SECRET.length < 32) {
            throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long for security.');
        }

        // Ensure secrets are different
        if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different for security.');
        }
    }

    /**
     * Get access token configuration
     * @returns {Object} Access token configuration
     */
    getAccessTokenConfig() {
        return {
            secret: this.JWT_SECRET,
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
            issuer: this.ISSUER,
            audience: this.AUDIENCE,
            algorithm: this.ALGORITHM
        };
    }

    /**
     * Get refresh token configuration
     * @returns {Object} Refresh token configuration
     */
    getRefreshTokenConfig() {
        return {
            secret: this.JWT_REFRESH_SECRET,
            expiresIn: this.REFRESH_TOKEN_EXPIRY,
            issuer: this.ISSUER,
            audience: this.AUDIENCE,
            algorithm: this.ALGORITHM
        };
    }

    /**
     * Get verification options for JWT tokens
     * @returns {Object} Verification options
     */
    getVerifyOptions() {
        return {
            issuer: this.ISSUER,
            audience: this.AUDIENCE,
            algorithms: [this.ALGORITHM]
        };
    }
}

// Create and export singleton instance
const jwtConfig = new JWTConfig();

module.exports = {
    JWT_SECRET: jwtConfig.JWT_SECRET,
    JWT_REFRESH_SECRET: jwtConfig.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRY: jwtConfig.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: jwtConfig.REFRESH_TOKEN_EXPIRY,
    ISSUER: jwtConfig.ISSUER,
    AUDIENCE: jwtConfig.AUDIENCE,
    ALGORITHM: jwtConfig.ALGORITHM,
    getAccessTokenConfig: () => jwtConfig.getAccessTokenConfig(),
    getRefreshTokenConfig: () => jwtConfig.getRefreshTokenConfig(),
    getVerifyOptions: () => jwtConfig.getVerifyOptions()
};