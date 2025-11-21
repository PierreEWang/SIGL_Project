/**
 * Role-based Authorization Middleware
 * Provides role-based access control for protected routes
 */

/**
 * Valid roles in the system based on UML diagram
 */
const VALID_ROLES = [
    'APPRENTI',
    'MA',
    'TP', 
    'CA',
    'RC',
    'PROF',
    'ADMIN'
];

/**
 * Role hierarchy for hierarchical access control
 * Higher index means higher privilege level
 */
const ROLE_HIERARCHY = [
    'APPRENTI',  // 0 - Lowest privilege
    'MA',        // 1 - Maitre d'Apprentissage
    'TP',        // 2 - Tuteur Pedagogique
    'PROF',      // 3 - Professeur
    'CA',        // 4 - Coordinatrice Alternance
    'RC',        // 5 - Responsable Cursus
    'ADMIN'      // 6 - Highest privilege
];

/**
 * Factory function to create role-based authorization middleware
 * 
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Allow only admins
 * router.get('/admin-only', authenticate, authorizeRoles('ADMIN'), handler);
 * 
 * @example
 * // Allow multiple roles
 * router.get('/staff-only', authenticate, authorizeRoles('CA', 'RC', 'PROF', 'ADMIN'), handler);
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated (should be set by authenticate middleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please login first.',
                    error: 'AUTHENTICATION_REQUIRED'
                });
            }

            // Validate that user has a role
            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found. Access denied.',
                    error: 'ROLE_NOT_FOUND'
                });
            }

            // Validate allowed roles parameter
            if (!allowedRoles || allowedRoles.length === 0) {
                console.error('Authorization middleware error: No allowed roles specified');
                return res.status(500).json({
                    success: false,
                    message: 'Server configuration error.',
                    error: 'NO_ROLES_SPECIFIED'
                });
            }

            // Validate that all specified roles are valid
            const invalidRoles = allowedRoles.filter(role => !VALID_ROLES.includes(role));
            if (invalidRoles.length > 0) {
                console.error(`Authorization middleware error: Invalid roles specified: ${invalidRoles.join(', ')}`);
                return res.status(500).json({
                    success: false,
                    message: 'Server configuration error.',
                    error: 'INVALID_ROLES_SPECIFIED'
                });
            }

            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                // Log authorization failure for monitoring
                console.log(`Authorization denied: User ${req.user.email} (${req.user.role}) attempted to access route requiring roles: ${allowedRoles.join(', ')} - ${new Date().toISOString()}`);
                
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient privileges.',
                    error: 'INSUFFICIENT_PRIVILEGES',
                    requiredRoles: allowedRoles,
                    userRole: req.user.role
                });
            }

            // Log successful authorization
            console.log(`Authorization granted: User ${req.user.email} (${req.user.role}) accessing route - ${new Date().toISOString()}`);

            next();
        } catch (error) {
            console.error('Authorization middleware error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during authorization.',
                error: 'AUTHORIZATION_ERROR'
            });
        }
    };
};

/**
 * Hierarchical authorization middleware
 * Allows access if user's role is at or above the minimum required level
 * 
 * @param {string} minimumRole - Minimum role required to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Allow CA and above (CA, RC, ADMIN)
 * router.get('/coordinator-level', authenticate, authorizeMinimumRole('CA'), handler);
 */
const authorizeMinimumRole = (minimumRole) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please login first.',
                    error: 'AUTHENTICATION_REQUIRED'
                });
            }

            // Validate that user has a role
            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found. Access denied.',
                    error: 'ROLE_NOT_FOUND'
                });
            }

            // Validate minimum role parameter
            if (!minimumRole || !VALID_ROLES.includes(minimumRole)) {
                console.error(`Authorization middleware error: Invalid minimum role specified: ${minimumRole}`);
                return res.status(500).json({
                    success: false,
                    message: 'Server configuration error.',
                    error: 'INVALID_MINIMUM_ROLE'
                });
            }

            // Get role hierarchy levels
            const userRoleLevel = ROLE_HIERARCHY.indexOf(req.user.role);
            const minimumRoleLevel = ROLE_HIERARCHY.indexOf(minimumRole);

            // Check if user's role level meets minimum requirement
            if (userRoleLevel < minimumRoleLevel) {
                console.log(`Hierarchical authorization denied: User ${req.user.email} (${req.user.role}, level ${userRoleLevel}) attempted to access route requiring minimum role: ${minimumRole} (level ${minimumRoleLevel}) - ${new Date().toISOString()}`);
                
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient role level.',
                    error: 'INSUFFICIENT_ROLE_LEVEL',
                    minimumRole: minimumRole,
                    userRole: req.user.role
                });
            }

            console.log(`Hierarchical authorization granted: User ${req.user.email} (${req.user.role}, level ${userRoleLevel}) accessing route requiring minimum: ${minimumRole} (level ${minimumRoleLevel}) - ${new Date().toISOString()}`);

            next();
        } catch (error) {
            console.error('Hierarchical authorization middleware error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during authorization.',
                error: 'AUTHORIZATION_ERROR'
            });
        }
    };
};

/**
 * Self-access authorization middleware
 * Allows users to access their own resources or admins to access any resource
 * 
 * @param {string} userIdParam - Name of the route parameter containing the user ID (default: 'userId')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Allow users to access their own profile or admins to access any profile
 * router.get('/users/:userId/profile', authenticate, authorizeSelfOrAdmin(), handler);
 * 
 * @example
 * // Custom parameter name
 * router.get('/profiles/:id', authenticate, authorizeSelfOrAdmin('id'), handler);
 */
const authorizeSelfOrAdmin = (userIdParam = 'userId') => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please login first.',
                    error: 'AUTHENTICATION_REQUIRED'
                });
            }

            // Get the target user ID from route parameters
            const targetUserId = req.params[userIdParam];
            
            if (!targetUserId) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required parameter: ${userIdParam}`,
                    error: 'MISSING_USER_ID_PARAMETER'
                });
            }

            // Allow if user is admin
            if (req.user.role === 'ADMIN') {
                console.log(`Admin access granted: ${req.user.email} accessing resource for user ${targetUserId} - ${new Date().toISOString()}`);
                return next();
            }

            // Allow if user is accessing their own resource
            if (req.user.userId === targetUserId) {
                console.log(`Self access granted: ${req.user.email} accessing own resource - ${new Date().toISOString()}`);
                return next();
            }

            // Deny access
            console.log(`Self/Admin authorization denied: User ${req.user.email} (${req.user.role}) attempted to access resource for user ${targetUserId} - ${new Date().toISOString()}`);
            
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.',
                error: 'SELF_ACCESS_ONLY'
            });

        } catch (error) {
            console.error('Self/Admin authorization middleware error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during authorization.',
                error: 'AUTHORIZATION_ERROR'
            });
        }
    };
};

/**
 * Helper functions for common role combinations
 */

/**
 * Admin-only access
 * @returns {Function} Express middleware function
 */
const adminOnly = () => authorizeRoles('ADMIN');

/**
 * Staff access (CA, RC, TP, PROF, ADMIN)
 * @returns {Function} Express middleware function
 */
const staffOnly = () => authorizeRoles('CA', 'RC', 'TP', 'PROF', 'ADMIN');

/**
 * Coordinator and above access (CA, RC, ADMIN)
 * @returns {Function} Express middleware function
 */
const coordinatorAndAbove = () => authorizeRoles('CA', 'RC', 'ADMIN');

/**
 * Professor and above access (PROF, CA, RC, ADMIN)
 * @returns {Function} Express middleware function
 */
const professorAndAbove = () => authorizeRoles('PROF', 'CA', 'RC', 'ADMIN');

/**
 * Educational staff access (TP, PROF, CA, RC, ADMIN)
 * @returns {Function} Express middleware function
 */
const educationalStaff = () => authorizeRoles('TP', 'PROF', 'CA', 'RC', 'ADMIN');

/**
 * All authenticated users
 * @returns {Function} Express middleware function
 */
const authenticatedUsers = () => authorizeRoles(...VALID_ROLES);

module.exports = {
    // Main authorization functions
    authorizeRoles,
    authorizeMinimumRole,
    authorizeSelfOrAdmin,
    
    // Helper functions for common role combinations
    adminOnly,
    staffOnly,
    coordinatorAndAbove,
    professorAndAbove,
    educationalStaff,
    authenticatedUsers,
    
    // Constants for external use
    VALID_ROLES,
    ROLE_HIERARCHY
};