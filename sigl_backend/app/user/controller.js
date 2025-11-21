const userService = require('./service');
const authService = require('../auth/auth.service');
const authRepository = require('../auth/auth.repository');
const userRepository = require('./repository');
const mongoose = require('mongoose');

/**
 * Valid English role codes used throughout the system
 */
const VALID_ROLES = ['APPRENTI', 'MA', 'TP', 'CA', 'RC', 'PROF', 'ADMIN'];

/**
 * Enregistrer un nouvel utilisateur
 * POST /api/users/register
 */
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Valider les champs obligatoires
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Le nom d\'utilisateur, l\'email et le mot de passe sont obligatoires'
            });
        }

        // Valider le format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Format d\'email invalide'
            });
        }

        // Valider la force du mot de passe (minimum 8 caractères pour auth service)
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Le mot de passe doit contenir au moins 8 caractères'
            });
        }

        // Valider le nom d'utilisateur (caractères alphanumériques et underscores uniquement)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères et ne contenir que des lettres, des chiffres et des underscores'
            });
        }

        // Valider le rôle s'il est fourni (English codes only)
        if (role && !VALID_ROLES.includes(role)) {
            return res.status(400).json({
                error: `Le rôle doit être l'un des suivants : ${VALID_ROLES.join(', ')}`
            });
        }

        // Atomic registration process: Create both user and auth records together
        // This ensures complete registration or complete failure (no orphaned records)
        // Uses sequential operations with cleanup on failure (works without replica sets)
        
        try {
            // Check if email or username already exists
            const existingEmail = await userRepository.findUserByEmail(email);
            if (existingEmail) {
                return res.status(409).json({
                    error: 'Email déjà enregistré'
                });
            }

            const existingUsername = await userRepository.findUserByUsername(username);
            if (existingUsername) {
                return res.status(409).json({
                    error: 'Nom d\'utilisateur déjà pris'
                });
            }

            // Step 1: Create user record in 'utilisateurs' collection
            // Uses English role codes only (French roles no longer supported)
            const userData = {
                username,
                email,
                role: role || 'APPRENTI'  // Default to APPRENTI if no role specified
            };

            const newUser = await userRepository.createUser(userData);
            console.log('User created successfully:', newUser._id);

            try {
                // Step 2: Hash password using bcrypt via auth service
                const hashedPassword = await authService.hashPassword(password);
                console.log('Password hashed successfully');

                // Step 3: Create auth record in 'auth_credentials' collection
                // Links to user record via userId field for secure password storage
                const authRecord = await authRepository.createAuthRecord(newUser._id.toString(), hashedPassword);
                console.log('Auth record created successfully:', authRecord.userId);

                // Return success without sensitive data
                const { password: _, ...userWithoutPassword } = newUser;
                
                return res.status(201).json({
                    message: 'Utilisateur enregistré avec succès',
                    user: userWithoutPassword
                });

            } catch (authError) {
                // Cleanup: If auth record creation fails, remove the user record
                // This ensures no orphaned user records exist without authentication
                console.error('Auth record creation failed, cleaning up user:', authError);
                
                try {
                    await userRepository.deleteUser(newUser._id);
                    console.log('User record cleaned up successfully');
                } catch (cleanupError) {
                    console.error('Failed to cleanup user record:', cleanupError);
                }

                // Handle specific auth errors
                if (authError.message && authError.message.includes('Authentication record already exists')) {
                    return res.status(409).json({
                        error: 'Compte d\'authentification déjà existant'
                    });
                }
                
                return res.status(500).json({
                    error: 'Échec de la création du compte d\'authentification',
                    details: 'L\'utilisateur a été supprimé'
                });
            }

        } catch (userError) {
            console.error('User creation failed:', userError);
            
            // Handle duplicate key errors from database constraints
            if (userError.message && userError.message.includes('E11000') || userError.code === 11000) {
                const field = userError.message.includes('email') ? 'email' : 'nom d\'utilisateur';
                return res.status(409).json({
                    error: `${field} déjà utilisé`
                });
            }
            
            throw userError;
        }

    } catch (error) {
        console.error('Controller register - Unexpected error:', error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error.message
        });
    }
};

/**
 * Obtenir le profil utilisateur
 * GET /api/users/:id
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        // Valider l'ObjectId MongoDB
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: 'Format d\'ID utilisateur invalide'
            });
        }

        const result = await userService.getUserProfile(userId);

        if (result.success) {
            return res.status(200).json({
                user: result.data
            });
        } else {
            return res.status(404).json({
                error: result.error
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
};

/**
 * Mettre à jour les informations utilisateur
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, password, role } = req.body;

        // Valider l'ObjectId MongoDB
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: 'Format d\'ID utilisateur invalide'
            });
        }

        // Préparer les données de mise à jour
        const updateData = {};

        if (email) {
            // Valider le format de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Format d\'email invalide'
                });
            }
            updateData.email = email;
        }

        if (username) {
            // Valider le nom d'utilisateur
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(username)) {
                return res.status(400).json({
                    error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères et ne contenir que des lettres, des chiffres et des underscores'
                });
            }
            updateData.username = username;
        }

        if (password) {
            // Password updates should go through auth endpoints, not user update
            return res.status(400).json({
                error: 'La mise à jour du mot de passe doit être effectuée via l\'endpoint de changement de mot de passe'
            });
        }

        if (role) {
            // Valider le rôle (English codes only)
            if (!VALID_ROLES.includes(role)) {
                return res.status(400).json({
                    error: `Le rôle doit être l'un des suivants : ${VALID_ROLES.join(', ')}`
                });
            }
            updateData.role = role;
        }

        // Vérifier s'il y a quelque chose à mettre à jour
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: 'Aucun champ valide fourni pour la mise à jour'
            });
        }

        const result = await userService.updateUserInfo(userId, updateData);

        if (result.success) {
            return res.status(200).json({
                message: 'Utilisateur mis à jour avec succès',
                user: result.data
            });
        } else {
            return res.status(404).json({
                error: result.error
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
};

/**
 * Supprimer le compte utilisateur
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Valider l'ObjectId MongoDB
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: 'Format d\'ID utilisateur invalide'
            });
        }

        const result = await userService.deleteUserAccount(userId);

        if (result.success) {
            return res.status(200).json({
                message: result.message
            });
        } else {
            return res.status(404).json({
                error: result.error
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
};

/**
 * Lister tous les utilisateurs (pour les tests/admin)
 * GET /api/users
 */
const listUsers = async (req, res) => {
    try {
        const result = await userService.listAllUsers();

        if (result.success) {
            return res.status(200).json({
                users: result.data,
                count: result.data.length
            });
        } else {
            return res.status(500).json({
                error: result.error
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
};

module.exports = {
    register,
    getProfile,
    updateUser,
    deleteUser,
    listUsers
};