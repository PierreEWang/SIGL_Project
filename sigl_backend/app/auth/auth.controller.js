const authService = require('./auth.service');
const authRepository = require('./auth.repository');
const crypto = require('crypto');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints including login, logout,
 * token refresh, and password management operations
 */
class AuthController {
    /**
     * User login endpoint
     * Validates credentials and returns access and refresh tokens
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                    error: 'MISSING_CREDENTIALS'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    error: 'INVALID_EMAIL_FORMAT'
                });
            }

            // Find user by email
            const authRecord = await authRepository.findAuthByEmail(email);
            if (!authRecord || !authRecord.user) {
                // Log failed login attempt for security monitoring
                console.log(`Failed login attempt for email: ${email} - User not found - ${new Date().toISOString()}`);
                
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    error: 'INVALID_CREDENTIALS'
                });
            }

            // Check if account is locked
            if (authRecord.isLocked) {
                console.log(`Login attempt on locked account: ${email} - ${new Date().toISOString()}`);
                
                return res.status(403).json({
                    success: false,
                    message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
                    error: 'ACCOUNT_LOCKED'
                });
            }

            // Verify password
            const isPasswordValid = await authService.comparePassword(password, authRecord.passwordHash);
            
            if (!isPasswordValid) {
                // Increment failed login attempts
                await authRepository.incrementFailedAttempts(authRecord.userId);
                
                // Log failed login attempt
                console.log(`Failed login attempt for email: ${email} - Invalid password - ${new Date().toISOString()}`);
                
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    error: 'INVALID_CREDENTIALS'
                });
            }

            // Generate JWT tokens with English role codes
            // Role system now uses standardized English codes only
            const tokens = authService.generateTokenPair(
                authRecord.userId.toString(),
                authRecord.user.email,
                authRecord.user.role  // English role code (APPRENTI, MA, TP, CA, RC, PROF, ADMIN)
            );

            // Store refresh token and reset failed attempts
            await authService.storeRefreshToken(authRecord.userId, tokens.refreshToken);
            await authRepository.resetFailedAttempts(authRecord.userId);

            // Log successful login
            console.log(`Successful login: ${email} (${authRecord.user.role}) - ${new Date().toISOString()}`);

            // Return success response with tokens and user info
            // User role returned as English code for consistency across system
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: authRecord.user._id,
                        nom: authRecord.user.nom,
                        email: authRecord.user.email,
                        role: authRecord.user.role  // English role code
                    },
                    tokens: {
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        tokenType: tokens.tokenType,
                        expiresIn: tokens.expiresIn
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login',
                error: 'LOGIN_ERROR'
            });
        }
    }

    /**
     * User logout endpoint
     * Revokes the user's refresh token
     * 
     * @param {Object} req - Express request object (requires authentication)
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async logout(req, res) {
        try {
            const { userId } = req.user;

            // Revoke refresh token
            await authService.revokeRefreshToken(userId);

            // Log logout event
            console.log(`User logout: ${req.user.email} - ${new Date().toISOString()}`);

            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            console.error('Logout error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error during logout',
                error: 'LOGOUT_ERROR'
            });
        }
    }

    /**
     * Refresh access token endpoint
     * Generates a new access token from a valid refresh token
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async refreshAccessToken(req, res) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token is required',
                    error: 'MISSING_REFRESH_TOKEN'
                });
            }

            // Extract refresh token
            let refreshToken;
            try {
                refreshToken = authService.extractBearerToken(authHeader);
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid authorization header format',
                    error: 'INVALID_HEADER_FORMAT'
                });
            }

            // Verify refresh token
            let decoded;
            try {
                decoded = authService.verifyToken(refreshToken, 'refresh');
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired refresh token',
                    error: 'INVALID_REFRESH_TOKEN'
                });
            }

            // Find auth record by refresh token to ensure it's still valid in database
            const authRecord = await authRepository.findAuthByRefreshToken(refreshToken);
            if (!authRecord || !authRecord.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token not found or revoked',
                    error: 'REFRESH_TOKEN_REVOKED'
                });
            }

            // Generate new access token
            const newAccessToken = authService.generateAccessToken(
                authRecord.userId._id.toString(),
                authRecord.userId.email,
                authRecord.userId.role
            );

            // Optionally rotate refresh token for enhanced security
            const shouldRotateRefreshToken = process.env.ROTATE_REFRESH_TOKENS === 'true';
            let newRefreshToken = refreshToken;
            
            if (shouldRotateRefreshToken) {
                newRefreshToken = authService.generateRefreshToken(authRecord.userId._id.toString());
                await authService.storeRefreshToken(authRecord.userId._id, newRefreshToken);
            }

            // Log token refresh
            console.log(`Token refreshed: ${authRecord.userId.email} - ${new Date().toISOString()}`);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    tokenType: 'Bearer',
                    expiresIn: '15m'
                }
            });

        } catch (error) {
            console.error('Token refresh error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error during token refresh',
                error: 'TOKEN_REFRESH_ERROR'
            });
        }
    }

    /**
     * Change password endpoint
     * Allows authenticated users to change their password
     * 
     * @param {Object} req - Express request object (requires authentication)
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async changePassword(req, res) {
        try {
            const { userId } = req.user;
            const { currentPassword, newPassword } = req.body;

            // Input validation
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required',
                    error: 'MISSING_PASSWORDS'
                });
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters long',
                    error: 'WEAK_PASSWORD'
                });
            }

            // Additional password complexity validation
            const hasUpperCase = /[A-Z]/.test(newPassword);
            const hasLowerCase = /[a-z]/.test(newPassword);
            const hasNumbers = /\d/.test(newPassword);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

            if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                    error: 'WEAK_PASSWORD_COMPLEXITY'
                });
            }

            // Find current auth record
            const authRecord = await authRepository.findAuthByUserId(userId);
            if (!authRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'User authentication record not found',
                    error: 'AUTH_RECORD_NOT_FOUND'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await authService.comparePassword(currentPassword, authRecord.passwordHash);
            if (!isCurrentPasswordValid) {
                // Log failed password change attempt
                console.log(`Failed password change attempt: ${req.user.email} - Invalid current password - ${new Date().toISOString()}`);
                
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect',
                    error: 'INVALID_CURRENT_PASSWORD'
                });
            }

            // Check if new password is different from current
            const isSamePassword = await authService.comparePassword(newPassword, authRecord.passwordHash);
            if (isSamePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password',
                    error: 'SAME_PASSWORD'
                });
            }

            // Hash new password
            const newHashedPassword = await authService.hashPassword(newPassword);

            // Update password and revoke all refresh tokens for security
            await authRepository.updatePassword(userId, newHashedPassword);

            // Log successful password change
            console.log(`Password changed successfully: ${req.user.email} - ${new Date().toISOString()}`);

            res.status(200).json({
                success: true,
                message: 'Password changed successfully. Please login again with your new password.'
            });

        } catch (error) {
            console.error('Change password error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error during password change',
                error: 'PASSWORD_CHANGE_ERROR'
            });
        }
    }

    /**
     * Request password reset endpoint
     * Initiates password reset flow by generating a reset token
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;

            // Input validation
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required',
                    error: 'MISSING_EMAIL'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    error: 'INVALID_EMAIL_FORMAT'
                });
            }

            // Find user by email (don't reveal if email exists for security)
            const authRecord = await authRepository.findAuthByEmail(email);
            
            if (authRecord && authRecord.user) {
                // Generate secure reset token
                const resetToken = crypto.randomBytes(32).toString('hex');
                const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

                // Store reset token (you would typically store this in a separate collection or add fields to auth model)
                // For now, we'll use a simple in-memory store or extend the auth model
                // This is a simplified implementation - in production, you'd want to store this properly
                
                // Log password reset request
                console.log(`Password reset requested: ${email} - ${new Date().toISOString()}`);
                
                // In a real implementation, you would:
                // 1. Store the reset token and expiry in the database
                // 2. Send an email with the reset link
                // For this implementation, we'll just log the token (DO NOT do this in production)
                console.log(`Reset token for ${email}: ${resetToken} (expires: ${resetTokenExpiry})`);
            }

            // Always return success to prevent email enumeration attacks
            res.status(200).json({
                success: true,
                message: 'If the email address exists in our system, you will receive a password reset link shortly.'
            });

        } catch (error) {
            console.error('Request password reset error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error during password reset request',
                error: 'PASSWORD_RESET_REQUEST_ERROR'
            });
        }
    }

    /**
     * Reset password endpoint
     * Completes password reset with token validation
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Input validation
            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Reset token and new password are required',
                    error: 'MISSING_RESET_DATA'
                });
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters long',
                    error: 'WEAK_PASSWORD'
                });
            }

            // Additional password complexity validation
            const hasUpperCase = /[A-Z]/.test(newPassword);
            const hasLowerCase = /[a-z]/.test(newPassword);
            const hasNumbers = /\d/.test(newPassword);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

            if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                    error: 'WEAK_PASSWORD_COMPLEXITY'
                });
            }

            // In a real implementation, you would:
            // 1. Find the reset token in the database
            // 2. Check if it's expired
            // 3. Find the associated user
            // 4. Update their password
            // 5. Invalidate the reset token
            
            // For this simplified implementation, we'll return an error since we don't have
            // the reset token storage implemented
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
                error: 'INVALID_RESET_TOKEN'
            });

            // This is what the implementation would look like:
            /*
            // Find and validate reset token
            const resetRecord = await ResetToken.findOne({ 
                token, 
                expiresAt: { $gt: new Date() } 
            });
            
            if (!resetRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token',
                    error: 'INVALID_RESET_TOKEN'
                });
            }

            // Hash new password
            const newHashedPassword = await authService.hashPassword(newPassword);

            // Update password and revoke all refresh tokens
            await authRepository.updatePassword(resetRecord.userId, newHashedPassword);

            // Delete the used reset token
            await ResetToken.deleteOne({ _id: resetRecord._id });

            // Log successful password reset
            console.log(`Password reset completed: ${resetRecord.email} - ${new Date().toISOString()}`);

            res.status(200).json({
                success: true,
                message: 'Password reset successful. Please login with your new password.'
            });
            */

        } catch (error) {
            console.error('Reset password error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error during password reset',
                error: 'PASSWORD_RESET_ERROR'
            });
        }
    }
}

// Export singleton instance
module.exports = new AuthController();