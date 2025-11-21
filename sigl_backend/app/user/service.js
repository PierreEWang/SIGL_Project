const userRepository = require('./repository');

/**
 * Create a new user (without password - password handled by auth system)
 * @param {Object} userData - User registration data (without password)
 * @returns {Promise<Object>} Result object with success status and data/error
 */
const createUser = async (userData) => {
    try {
        // Validate required fields (password not included)
        if (!userData.username || !userData.email) {
            return {
                success: false,
                error: 'Le nom d\'utilisateur et l\'email sont obligatoires'
            };
        }

        // Create user without password (password handled by auth system)
        const newUser = await userRepository.createUser({
            username: userData.username,
            email: userData.email,
            role: userData.role || 'APPRENTI'
        });

        return {
            success: true,
            data: newUser
        };
    } catch (error) {
        console.error('Service createUser error:', error);
        return {
            success: false,
            error: 'Échec de la création de l\'utilisateur',
            details: error.message
        };
    }
};

/**
 * Register a new user (deprecated - use createUser instead)
 * This function is kept for backward compatibility but should not be used for new registrations
 * @deprecated Use createUser instead - password handling moved to auth system
 */
const registerUser = async (userData) => {
    console.warn('registerUser is deprecated. Use createUser instead. Password handling moved to auth system.');
    
    // Remove password from userData if present
    const { password, ...userDataWithoutPassword } = userData;
    
    return await createUser(userDataWithoutPassword);
};

/**
 * Obtenir le profil utilisateur par ID
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Objet résultat avec le statut de succès et les données/erreur
 */
const getUserProfile = async (userId) => {
    try {
        const user = await userRepository.findUserById(userId);
        
        if (!user) {
            return {
                success: false,
                error: 'Utilisateur non trouvé'
            };
        }

        // User model no longer contains password field
        return {
            success: true,
            data: user
        };
    } catch (error) {
        return {
            success: false,
            error: 'Échec de la récupération du profil utilisateur'
        };
    }
};

/**
 * Mettre à jour les informations utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Objet résultat avec le statut de succès et les données/erreur
 */
const updateUserInfo = async (userId, updateData) => {
    try {
        // Vérifier si l'utilisateur existe
        const user = await userRepository.findUserById(userId);
        if (!user) {
            return {
                success: false,
                error: 'Utilisateur non trouvé'
            };
        }

        // Si mise à jour de l'email, vérifier si le nouvel email existe déjà
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await userRepository.findUserByEmail(updateData.email);
            if (existingEmail) {
                return {
                    success: false,
                    error: 'Email déjà utilisé'
                };
            }
        }

        // Si mise à jour du nom d'utilisateur, vérifier si le nouveau nom d'utilisateur existe déjà
        if (updateData.username && updateData.username !== user.username) {
            const existingUsername = await userRepository.findUserByUsername(updateData.username);
            if (existingUsername) {
                return {
                    success: false,
                    error: 'Nom d\'utilisateur déjà pris'
                };
            }
        }

        // Mettre à jour l'utilisateur
        const updatedUser = await userRepository.updateUser(userId, updateData);

        // User model no longer contains password field
        return {
            success: true,
            data: updatedUser
        };
    } catch (error) {
        console.error('Service updateUserInfo error:', error);
        return {
            success: false,
            error: 'Échec de la mise à jour de l\'utilisateur',
            details: error.message // Add detailed error for debugging
        };
    }
};

/**
 * Supprimer le compte utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Objet résultat avec le statut de succès et le message/erreur
 */
const deleteUserAccount = async (userId) => {
    try {
        // Vérifier si l'utilisateur existe
        const user = await userRepository.findUserById(userId);
        if (!user) {
            return {
                success: false,
                error: 'Utilisateur non trouvé'
            };
        }

        // Supprimer l'utilisateur
        const deleted = await userRepository.deleteUser(userId);

        if (deleted) {
            return {
                success: true,
                message: 'Compte utilisateur supprimé avec succès'
            };
        } else {
            return {
                success: false,
                error: 'Échec de la suppression du compte utilisateur'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: 'Échec de la suppression du compte utilisateur'
        };
    }
};

/**
 * Lister tous les utilisateurs (pour les tests/admin)
 * @returns {Promise<Object>} Objet résultat avec le statut de succès et les données/erreur
 */
const listAllUsers = async () => {
    try {
        const users = await userRepository.listAllUsers();
        
        return {
            success: true,
            data: users
        };
    } catch (error) {
        return {
            success: false,
            error: 'Échec de la récupération de la liste des utilisateurs'
        };
    }
};

module.exports = {
    createUser,
    registerUser, // Deprecated - kept for backward compatibility
    getUserProfile,
    updateUserInfo,
    deleteUserAccount,
    listAllUsers
};
