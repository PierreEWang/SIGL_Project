const mongoose = require('mongoose');
const Auth = require('./auth.model');
const Utilisateur = require('../common/models/user.model');

/**
 * Authentication Repository
 * Handles all database operations for authentication credentials
 */
class AuthRepository {
  /**
   * Create a new authentication record for a user
   * @param {string} userId - User's unique identifier
   * @param {string} hashedPassword - Bcrypt hashed password
   * @returns {Promise<Object>} Created auth record (safe object without sensitive data)
   * @throws {Error} If creation fails
   */
  async createAuthRecord(userId, hashedPassword) {
    try {
      // Validate inputs
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      if (
        !hashedPassword ||
        typeof hashedPassword !== 'string' ||
        hashedPassword.length < 60
      ) {
        throw new Error('Valid hashed password is required');
      }

      // Check if user exists
      const userExists = await Utilisateur.findById(userId);
      if (!userExists) {
        throw new Error('User not found');
      }

      // Check if auth record already exists
      const existingAuth = await Auth.findOne({ userId });
      if (existingAuth) {
        throw new Error(
          'Authentication record already exists for this user'
        );
      }

      const authRecord = new Auth({
        userId,
        passwordHash: hashedPassword,
        isActive: true,
        failedLoginAttempts: 0,
      });

      const savedAuth = await authRecord.save();
      return savedAuth.toSafeObject();
    } catch (error) {
      console.error('Create auth record failed:', error.message);
      throw new Error(
        `Failed to create authentication record: ${error.message}`
      );
    }
  }

  /**
   * Find authentication record by user ID
   * @param {string} userId - User's unique identifier
   * @returns {Promise<Object|null>} Auth record or null if not found
   * @throws {Error} If query fails
   */
  async findAuthByUserId(userId) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      const authRecord = await Auth.findOne({
        userId,
        isActive: true,
      }).populate('userId', 'nom email role');

      return authRecord;
    } catch (error) {
      console.error('Find auth by userId failed:', error.message);
      throw new Error('Failed to find authentication record by userId');
    }
  }

  /**
   * Find authentication record by email (requires join with user collection)
   * @param {string} email - User's email address
   * @returns {Promise<Object|null>} Auth record with user data or null if not found
   * @throws {Error} If query fails
   */
  async findAuthByEmail(email) {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Valid email is required');
      }

      const results = await Auth.aggregate([
        {
          $lookup: {
            from: 'utilisateurs',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            'user.email': email.toLowerCase(),
            isActive: true,
          },
        },
        {
          $limit: 1,
        },
      ]);

      return results[0] || null;
    } catch (error) {
      console.error('Find auth by email failed:', error.message);
      throw new Error('Failed to find authentication record by email');
    }
  }

  /**
   * Update password for a user
   * @param {string} userId - User's unique identifier
   * @param {string} newHashedPassword - New bcrypt hashed password
   * @returns {Promise<Object>} Updated auth record (safe object)
   * @throws {Error} If update fails
   */
  async updatePassword(userId, newHashedPassword) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      if (
        !newHashedPassword ||
        typeof newHashedPassword !== 'string' ||
        newHashedPassword.length < 60
      ) {
        throw new Error('Valid hashed password is required');
      }

      const authRecord = await Auth.findOneAndUpdate(
        { userId, isActive: true },
        {
          passwordHash: newHashedPassword,
          $unset: {
            refreshToken: 1, // Clear refresh token on password change
            accountLockedUntil: 1, // Clear any account lock
          },
          failedLoginAttempts: 0, // Reset failed attempts
        },
        { new: true }
      );

      if (!authRecord) {
        throw new Error('Authentication record not found');
      }

      return authRecord.toSafeObject();
    } catch (error) {
      console.error('Update password failed:', error.message);
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  /**
   * Update refresh token for a user
   * @param {string} userId - User's unique identifier
   * @param {string} refreshToken - New refresh token (or null/undefined to clear)
   * @returns {Promise<Object>} Updated auth record (safe object)
   * @throws {Error} If update fails
   */
  async updateRefreshToken(userId, refreshToken) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      const updateData = refreshToken
        ? { refreshToken }
        : { $unset: { refreshToken: 1 } };

      const authRecord = await Auth.findOneAndUpdate(
        { userId, isActive: true },
        updateData,
        { new: true }
      );

      if (!authRecord) {
        throw new Error('Authentication record not found');
      }

      return authRecord.toSafeObject();
    } catch (error) {
      console.error('Update refresh token failed:', error.message);
      throw new Error('Failed to update refresh token');
    }
  }

  /**
   * Increment failed login attempts for a user
   * @param {string} userId - User's unique identifier
   * @returns {Promise<Object>} Updated auth record with incremented attempts
   * @throws {Error} If update fails
   */
  async incrementFailedAttempts(userId) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      const authRecord = await Auth.findOne({ userId, isActive: true });

      if (!authRecord) {
        throw new Error('Authentication record not found');
      }

      // Use the model method to handle the logic
      authRecord.incrementFailedAttempts();
      const updatedRecord = await authRecord.save();

      return updatedRecord.toSafeObject();
    } catch (error) {
      console.error('Increment failed attempts failed:', error.message);
      throw new Error('Failed to increment failed login attempts');
    }
  }

  /**
   * Reset failed login attempts after successful login
   * @param {string} userId - User's unique identifier
   * @returns {Promise<Object>} Updated auth record with reset attempts
   * @throws {Error} If update fails
   */
  async resetFailedAttempts(userId) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      const authRecord = await Auth.findOne({ userId, isActive: true });

      if (!authRecord) {
        throw new Error('Authentication record not found');
      }

      // Use the model method to handle the logic
      authRecord.resetFailedAttempts();
      const updatedRecord = await authRecord.save();

      return updatedRecord.toSafeObject();
    } catch (error) {
      console.error('Reset failed attempts failed:', error.message);
      throw new Error('Failed to reset failed login attempts');
    }
  }

  /**
   * Lock user account until specified time
   * @param {string} userId - User's unique identifier
   * @param {Date} lockUntilTime - Time until which account should be locked
   * @returns {Promise<Object>} Updated auth record with lock information
   * @throws {Error} If update fails
   */
  async lockAccount(userId, lockUntilTime) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      if (!lockUntilTime || !(lockUntilTime instanceof Date)) {
        throw new Error('Valid lock until time is required');
      }

      const authRecord = await Auth.findOneAndUpdate(
        { userId, isActive: true },
        {
          accountLockedUntil: lockUntilTime,
          failedLoginAttempts: 0, // Reset attempts when locking
        },
        { new: true }
      );

      if (!authRecord) {
        throw new Error('Authentication record not found');
      }

      return authRecord.toSafeObject();
    } catch (error) {
      console.error('Lock account failed:', error.message);
      throw new Error('Failed to lock user account');
    }
  }

  /**
   * Check if user account is currently locked
   * ⚠ IMPORTANT : ne doit jamais faire crasher le serveur
   * @param {string|Object} userIdOrAuth - User's id OR un authRecord
   * @returns {Promise<boolean>} True if account is locked, false otherwise
   */
  async isAccountLocked(userIdOrAuth) {
    try {
      let userId = null;

      // On accepte soit un string, soit un document Auth
      if (typeof userIdOrAuth === 'string') {
        userId = userIdOrAuth;
      } else if (userIdOrAuth && typeof userIdOrAuth === 'object') {
        if (userIdOrAuth.userId) {
          userId = userIdOrAuth.userId.toString();
        } else if (userIdOrAuth._id) {
          userId = userIdOrAuth._id.toString();
        }
      }

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.warn(
          '[AuthRepository.isAccountLocked] called with invalid userId, returning false'
        );
        return false;
      }

      const authRecord = await Auth.findOne({ userId, isActive: true });

      if (!authRecord) {
        // Pas d’enregistrement => on considère non verrouillé
        return false;
      }

      return !!authRecord.isLocked;
    } catch (error) {
      console.error(
        '[AuthRepository.isAccountLocked] Check account lock failed:',
        error.message
      );
      // On ne jette plus d'erreur ici pour éviter les UNHANDLED_REJECTION
      return false;
    }
  }

  /**
   * Deactivate authentication record (soft delete)
   * @param {string} userId - User's unique identifier
   * @returns {Promise<Object>} Deactivated auth record
   * @throws {Error} If deactivation fails
   */
  async deactivateAuth(userId) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Valid userId is required');
      }

      const authRecord = await Auth.findOneAndUpdate(
        { userId, isActive: true },
        {
          isActive: false,
          $unset: { refreshToken: 1 }, // Clear refresh token on deactivation
        },
        { new: true }
      );

      if (!authRecord) {
        throw new Error('Authentication record not found');
      }

      return authRecord.toSafeObject();
    } catch (error) {
      console.error('Deactivate auth failed:', error.message);
      throw new Error('Failed to deactivate authentication record');
    }
  }

  /**
   * Find authentication record by refresh token
   * @param {string} refreshToken - Refresh token to search for
   * @returns {Promise<Object|null>} Auth record or null if not found
   * @throws {Error} If query fails
   */
  async findAuthByRefreshToken(refreshToken) {
    try {
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new Error('Valid refresh token is required');
      }

      const authRecord = await Auth.findOne({
        refreshToken,
        isActive: true,
      }).populate('userId', 'nom email role');

      return authRecord;
    } catch (error) {
      console.error('Find auth by refresh token failed:', error.message);
      throw new Error('Failed to find authentication record by refresh token');
    }
  }
}

module.exports = new AuthRepository();