const mongoose = require('mongoose');

/**
 * Authentication Schema
 * Stores authentication credentials separately from user profiles
 * Includes security features like account locking and failed attempt tracking
 */
const authSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true,
        unique: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: 60 // bcrypt hash length
    },
    refreshToken: {
        type: String,
        default: null,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    accountLockedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'auth_credentials'
});

// Compound index for performance optimization
authSchema.index({ userId: 1, isActive: 1 });
authSchema.index({ refreshToken: 1 }, { sparse: true });

/**
 * Virtual property to check if account is currently locked
 */
authSchema.virtual('isLocked').get(function() {
    return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
});

/**
 * Method to check if account should be locked based on failed attempts
 * @returns {boolean} True if account should be locked
 */
authSchema.methods.shouldLockAccount = function() {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
    return this.failedLoginAttempts >= maxAttempts;
};

/**
 * Method to lock the account for a specified duration
 */
authSchema.methods.lockAccount = function() {
    const lockTime = parseInt(process.env.ACCOUNT_LOCK_TIME) || 900000; // 15 minutes default
    this.accountLockedUntil = Date.now() + lockTime;
    this.failedLoginAttempts = 0; // Reset attempts after locking
};

/**
 * Method to increment failed login attempts
 */
authSchema.methods.incrementFailedAttempts = function() {
    // If account was previously locked and lock time has expired, reset attempts
    if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
        this.failedLoginAttempts = 1;
        this.accountLockedUntil = null;
    } else {
        this.failedLoginAttempts += 1;
    }
    
    // Lock account if max attempts reached
    if (this.shouldLockAccount()) {
        this.lockAccount();
    }
};

/**
 * Method to reset failed login attempts after successful login
 */
authSchema.methods.resetFailedAttempts = function() {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
    this.lastLogin = new Date();
};

/**
 * Method to safely return auth data without sensitive information
 */
authSchema.methods.toSafeObject = function() {
    const authObj = this.toObject();
    delete authObj.passwordHash;
    delete authObj.refreshToken;
    return authObj;
};

/**
 * Pre-save middleware to ensure security constraints
 */
authSchema.pre('save', function(next) {
    // Ensure passwordHash is never empty
    if (!this.passwordHash || this.passwordHash.length < 60) {
        return next(new Error('Invalid password hash format'));
    }
    
    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
        return next(new Error('Invalid userId format'));
    }
    
    next();
});

/**
 * Static method to find auth record by user ID with user details
 * @param {string} userId - The user ID to search for
 * @returns {Promise} Auth record with populated user data
 */
authSchema.statics.findByUserIdWithUser = function(userId) {
    return this.findOne({ userId, isActive: true })
        .populate('userId', 'nom email role')
        .exec();
};

/**
 * Static method to find auth record by email (requires join with user collection)
 * @param {string} email - The email to search for
 * @returns {Promise} Auth record with user data
 */
authSchema.statics.findByEmail = function(email) {
    return this.aggregate([
        {
            $lookup: {
                from: 'utilisateurs',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $match: {
                'user.email': email.toLowerCase(),
                isActive: true
            }
        }
    ]);
};

const Auth = mongoose.model('Auth', authSchema);

module.exports = Auth;