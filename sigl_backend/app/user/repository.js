const Utilisateur = require('../common/models/user.model');

/**
 * Map French role names to database schema role codes
 * @param {string} role - French role name
 * @returns {string} Database role code
 */
// Valid English role codes (must match database schema)
const VALID_ROLES = ['APPRENTI', 'MA', 'TP', 'CA', 'RC', 'PROF', 'ADMIN'];

/**
 * Créer un nouvel utilisateur
 * @param {Object} userData - Données utilisateur
 * @returns {Promise<Object>} Utilisateur créé
 */
const createUser = async (userData) => {
    try {
        console.log('Repository createUser - Input data:', userData);
        
        // Validate that password is not included (should be handled by auth system)
        if (userData.password) {
            throw new Error('Password should not be included in user data. Use auth system for password management.');
        }
        
        // Validate role (should already be in English code format from controller)
        const dbRole = userData.role || 'APPRENTI';
        if (!VALID_ROLES.includes(dbRole)) {
            throw new Error(`Invalid role: ${dbRole}. Must be one of: ${VALID_ROLES.join(', ')}`);
        }
        
        // Create user object with only fields allowed by the schema (no password)
        const userDoc = {
            nom: userData.username, // Mapper username vers nom
            email: userData.email.toLowerCase(), // Ensure lowercase as per schema
            role: dbRole
        };

        console.log('Repository createUser - User object before save:', userDoc);
        
        const user = new Utilisateur(userDoc);
        const savedUser = await user.save();
        return savedUser.toJSON(); // Return clean user object
    } catch (error) {
        console.error('Repository createUser - Database error:', error);
        console.error('Repository createUser - Error name:', error.name);
        console.error('Repository createUser - Error code:', error.code);
        console.error('Repository createUser - Error message:', error.message);
        
        // Log detailed validation error information
        if (error.name === 'ValidationError') {
            console.error('Repository createUser - Validation errors:', error.errors);
        }
        
        if (error.code === 121 && error.errInfo && error.errInfo.details) {
            console.error('Repository createUser - Validation details:', JSON.stringify(error.errInfo.details, null, 2));
        }
        
        throw new Error(`Échec de la création de l'utilisateur : ${error.message}`);
    }
};

/**
 * Trouver un utilisateur par ID
 * @param {string} userId - ID utilisateur (MongoDB ObjectId)
 * @returns {Promise<Object|null>} Objet utilisateur ou null
 */
const findUserById = async (userId) => {
    try {
        const user = await Utilisateur.findById(userId);
        return user ? user.toObject() : null;
    } catch (error) {
        throw new Error(`Échec de la recherche d'utilisateur par ID : ${error.message}`);
    }
};

/**
 * Trouver un utilisateur par email
 * @param {string} email - Adresse email
 * @returns {Promise<Object|null>} Objet utilisateur ou null
 */
const findUserByEmail = async (email) => {
    try {
        const user = await Utilisateur.findOne({ email: email.toLowerCase() });
        return user ? user.toObject() : null;
    } catch (error) {
        throw new Error(`Échec de la recherche d'utilisateur par email : ${error.message}`);
    }
};

/**
 * Trouver un utilisateur par nom d'utilisateur (nom)
 * @param {string} username - Nom d'utilisateur
 * @returns {Promise<Object|null>} Objet utilisateur ou null
 */
const findUserByUsername = async (username) => {
    try {
        const user = await Utilisateur.findOne({ nom: username });
        return user ? user.toObject() : null;
    } catch (error) {
        throw new Error(`Échec de la recherche d'utilisateur par nom d'utilisateur : ${error.message}`);
    }
};

/**
 * Mettre à jour les informations utilisateur
 * @param {string} userId - ID utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Utilisateur mis à jour
 */
const updateUser = async (userId, updateData) => {
    try {
        console.log('Repository updateUser - Input data:', updateData);
        
        // Validate that password is not included (should be handled by auth system)
        if (updateData.password) {
            throw new Error('Password updates are not allowed through user repository. Use auth system for password changes.');
        }
        
        // Mapper username vers nom si fourni
        const mappedData = { ...updateData };
        if (mappedData.username) {
            mappedData.nom = mappedData.username;
            delete mappedData.username;
        }
        
        // Validate role if provided (should already be in English code format from controller)
        if (mappedData.role) {
            if (!VALID_ROLES.includes(mappedData.role)) {
                throw new Error(`Invalid role: ${mappedData.role}. Must be one of: ${VALID_ROLES.join(', ')}`);
            }
        }
        
        // Ensure email is lowercase if provided
        if (mappedData.email) {
            mappedData.email = mappedData.email.toLowerCase();
        }

        console.log('Repository updateUser - Final update data:', mappedData);

        const updatedUser = await Utilisateur.findByIdAndUpdate(
            userId,
            { $set: mappedData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error('Utilisateur non trouvé');
        }

        console.log('Repository updateUser - User updated successfully:', updatedUser._id);
        return updatedUser.toObject();
    } catch (error) {
        console.error('Repository updateUser - Database error:', error);
        console.error('Repository updateUser - Error name:', error.name);
        console.error('Repository updateUser - Error code:', error.code);
        
        // Log detailed validation error information
        if (error.code === 121 && error.errInfo && error.errInfo.details) {
            console.error('Repository updateUser - Validation details:', JSON.stringify(error.errInfo.details, null, 2));
        }
        
        throw new Error(`Échec de la mise à jour de l'utilisateur : ${error.message}`);
    }
};

/**
 * Supprimer un utilisateur
 * @param {string} userId - ID utilisateur
 * @returns {Promise<boolean>} True si supprimé avec succès
 */
const deleteUser = async (userId) => {
    try {
        const result = await Utilisateur.findByIdAndDelete(userId);
        return result !== null;
    } catch (error) {
        throw new Error(`Échec de la suppression de l'utilisateur : ${error.message}`);
    }
};

/**
 * Lister tous les utilisateurs (à des fins de test/admin)
 * @returns {Promise<Array>} Tableau d'utilisateurs
 */
const listAllUsers = async () => {
    try {
        // No need to exclude password field as it's not stored in user model
        const users = await Utilisateur.find();
        return users;
    } catch (error) {
        throw new Error(`Échec de la liste des utilisateurs : ${error.message}`);
    }
};

module.exports = {
    createUser,
    findUserById,
    findUserByEmail,
    findUserByUsername,
    updateUser,
    deleteUser,
    listAllUsers
};