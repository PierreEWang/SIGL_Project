// sigl_backend/app/user/service.js
const userRepository = require('./repository');

/**
 * Create a new user (without password).
 */
const createUser = async (userData) => {
  try {
    if (!userData.username || !userData.email) {
      return {
        success: false,
        error: "Le nom d'utilisateur et l'email sont obligatoires",
      };
    }

    const newUser = await userRepository.createUser(userData);

    return {
      success: true,
      data: newUser,
    };
  } catch (error) {
    console.error('Service createUser error:', error);
    return {
      success: false,
      error: "Échec de la création de l'utilisateur",
      details: error.message,
    };
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Service getUserProfile error:', error);
    return {
      success: false,
      error: 'Échec de la récupération du profil',
      details: error.message,
    };
  }
};

/**
 * Mise à jour des infos utilisateur (profil).
 */
const updateUserInfo = async (userId, updateData) => {
  try {
    const updatedUser = await userRepository.updateUser(userId, updateData);
    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error('Service updateUserInfo error:', error);
    return {
      success: false,
      error: "Échec de la mise à jour de l'utilisateur",
      details: error.message,
    };
  }
};

const deleteUserAccount = async (userId) => {
  try {
    const deleted = await userRepository.deleteUser(userId);
    if (!deleted) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      };
    }

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    };
  } catch (error) {
    console.error('Service deleteUserAccount error:', error);
    return {
      success: false,
      error: "Échec de la suppression de l'utilisateur",
      details: error.message,
    };
  }
};

const approveUser = async (userId, approvedBy) => {
  try {
    const user = await userRepository.updateUserStatus(userId, 'ACTIF', { approvedBy });
    return { success: true, data: user };
  } catch (error) {
    console.error('Service approveUser error:', error);
    return {
      success: false,
      error: 'Échec de la validation de l’utilisateur',
      details: error.message,
    };
  }
};

const rejectUser = async (userId, rejectionReason) => {
  try {
    const user = await userRepository.updateUserStatus(userId, 'REJETE', { rejectionReason });
    return { success: true, data: user };
  } catch (error) {
    console.error('Service rejectUser error:', error);
    return {
      success: false,
      error: 'Échec du rejet de l’utilisateur',
      details: error.message,
    };
  }
};

const listAllUsers = async () => {
  try {
    const users = await userRepository.listAllUsers();
    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error('Service listAllUsers error:', error);
    return {
      success: false,
      error: 'Échec de la récupération de la liste des utilisateurs',
      details: error.message,
    };
  }
};

module.exports = {
  createUser,
  getUserProfile,
  updateUserInfo,
  deleteUserAccount,
  listAllUsers,
  approveUser,
  rejectUser,
};