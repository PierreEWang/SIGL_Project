const Utilisateur = require('../common/models/user.model');

const VALID_ROLES = ['APPRENTI', 'MA', 'TP', 'CA', 'RC', 'PROF', 'ADMIN'];
const VALID_STATUS = ['ACTIF', 'EN_ATTENTE', 'REJETE'];

/**
 * Créer un nouvel utilisateur (sans mot de passe).
 */
const createUser = async (userData) => {
  try {
    console.log('Repository createUser - Input data:', userData);

    if (userData.password) {
      throw new Error(
        'Password should not be included in user data. Use auth system for password management.'
      );
    }

    const dbRole = userData.role || 'APPRENTI';
    if (!VALID_ROLES.includes(dbRole)) {
      throw new Error(`Invalid role: ${dbRole}. Must be one of: ${VALID_ROLES.join(', ')}`);
    }

    const userDoc = {
      nom: userData.username,
      email: userData.email.toLowerCase(),
      role: dbRole,
      status: userData.status || 'ACTIF',
    };

    if (userData.firstName) {
      userDoc.firstName = userData.firstName;
    }
    if (userData.lastName) {
      userDoc.lastName = userData.lastName;
    }
    if (userData.telephone) {
      userDoc.phone = userData.telephone;
    }
    if (typeof userData.mfaEnabled === 'boolean') {
      userDoc.mfaEnabled = userData.mfaEnabled;
    }
    if (userData.mfaMethod) {
      userDoc.mfaMethod = userData.mfaMethod;
    }
    if (userData.avatar) {
      userDoc.avatar = userData.avatar;
    }

    console.log('Repository createUser - User object before save:', userDoc);

    const user = new Utilisateur(userDoc);
    const savedUser = await user.save();
    return savedUser.toSafeObject();
  } catch (error) {
    console.error('Repository createUser - Database error:', error);
    throw new Error(`Échec de la création de l'utilisateur : ${error.message}`);
  }
};

const findUserById = async (userId) => {
  try {
    const user = await Utilisateur.findById(userId);
    return user ? user.toSafeObject() : null;
  } catch (error) {
    throw new Error(`Échec de la récupération de l'utilisateur : ${error.message}`);
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await Utilisateur.findOne({ email: email.toLowerCase() });
    return user ? user.toSafeObject() : null;
  } catch (error) {
    throw new Error(`Échec de la récupération par email : ${error.message}`);
  }
};

const findUserByUsername = async (username) => {
  try {
    const user = await Utilisateur.findOne({ nom: username });
    return user ? user.toSafeObject() : null;
  } catch (error) {
    throw new Error(`Échec de la récupération par username : ${error.message}`);
  }
};

/**
 * Mettre à jour un utilisateur.
 */
const updateUser = async (userId, updateData) => {
  try {
    console.log('Repository updateUser - Input data:', updateData);

    if (updateData.password || updateData.newPassword || updateData.currentPassword) {
      throw new Error(
        'Password updates are not allowed via user.updateUser. Use auth system for password changes.'
      );
    }

    const mappedData = { ...updateData };

    // username → nom
    if (mappedData.username) {
      mappedData.nom = mappedData.username;
      delete mappedData.username;
    }

    // telephone → phone
    if (mappedData.telephone) {
      mappedData.phone = mappedData.telephone;
      delete mappedData.telephone;
    }

    // role
    if (mappedData.role) {
      if (!VALID_ROLES.includes(mappedData.role)) {
        throw new Error(`Invalid role: ${mappedData.role}. Must be one of: ${VALID_ROLES.join(', ')}`);
      }
    }

    // email lowercase
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
    return updatedUser.toSafeObject();
  } catch (error) {
    console.error('Repository updateUser - Database error:', error);
    throw new Error(`Échec de la mise à jour de l'utilisateur : ${error.message}`);
  }
};

const deleteUser = async (userId) => {
  try {
    const result = await Utilisateur.findByIdAndDelete(userId);
    return result !== null;
  } catch (error) {
    throw new Error(`Échec de la suppression de l'utilisateur : ${error.message}`);
  }
};

const listAllUsers = async () => {
  try {
    const users = await Utilisateur.find();
    return users.map((u) => u.toSafeObject());
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
  listAllUsers,
};

const updateUserStatus = async (userId, status, { approvedBy, rejectionReason } = {}) => {
  try {
    if (!VALID_STATUS.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${VALID_STATUS.join(', ')}`);
    }

    const update = {
      status,
      approvedBy: approvedBy || null,
    };

    if (status === 'ACTIF') {
      update.approvedAt = new Date();
      update.rejectedAt = null;
      update.rejectionReason = null;
    }

    if (status === 'REJETE') {
      update.rejectedAt = new Date();
      update.rejectionReason = rejectionReason || null;
      update.approvedAt = null;
    }

    if (status === 'EN_ATTENTE') {
      update.approvedAt = null;
      update.rejectedAt = null;
      update.rejectionReason = null;
      update.approvedBy = null;
    }

    const updatedUser = await Utilisateur.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error('Utilisateur non trouvé');
    }

    return updatedUser.toSafeObject();
  } catch (error) {
    console.error('Repository updateUserStatus - Database error:', error);
    throw new Error(`Échec de la mise à jour du statut : ${error.message}`);
  }
};