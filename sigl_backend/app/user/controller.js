// sigl_backend/app/user/controller.js
const mongoose = require('mongoose');
const userService = require('./service');

const VALID_ROLES = ['APPRENTI', 'MA', 'TP', 'CA', 'RC', 'PROF', 'ADMIN'];

const normalizeName = (value) => {
  if (!value) return '';
  return String(value).trim();
};

/**
 * POST /api/users/register
 */
const register = async (req, res) => {
  try {
    const { username, email, role, firstName, lastName, prenom, nom, telephone } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        error: "Le nom d'utilisateur et l'email sont obligatoires",
      });
    }

    let dbRole = role || 'APPRENTI';
    if (!VALID_ROLES.includes(dbRole)) {
      return res.status(400).json({
        error: `Le rôle doit être l'un des suivants : ${VALID_ROLES.join(', ')}`,
      });
    }

    const result = await userService.createUser({
      username,
      email,
      role: dbRole,
      firstName: normalizeName(firstName ?? prenom),
      lastName: normalizeName(lastName ?? nom),
      telephone,
    });

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        details: result.details,
      });
    }

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: result.data,
    });
  } catch (error) {
    console.error('register error:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * GET /api/users/:id
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Format d'ID utilisateur invalide",
      });
    }

    const result = await userService.getUserProfile(userId);

    if (!result.success) {
      return res.status(404).json({
        error: result.error,
      });
    }

    return res.status(200).json({
      user: result.data,
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Format d'ID utilisateur invalide",
      });
    }

    const {
      username,
      email,
      role,
      firstName,
      lastName,
      prenom,
      nom,
      telephone,
      mfaEnabled,
      mfaMethod,
      avatar,
    } = req.body;

    const updateData = {};

    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          error:
            "Le nom d'utilisateur doit contenir entre 3 et 20 caractères et ne contenir que des lettres, des chiffres et des underscores",
        });
      }
      updateData.username = username;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Format d'email invalide",
        });
      }
      updateData.email = email;
    }

    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
          error: `Le rôle doit être l'un des suivants : ${VALID_ROLES.join(', ')}`,
        });
      }
      updateData.role = role;
    }

    if (telephone) {
      const phoneDigits = String(telephone).replace(/\D/g, '');
      if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        return res.status(400).json({
          error: 'Le numéro de téléphone doit contenir entre 8 et 15 chiffres',
        });
      }
      updateData.telephone = telephone;
    }

    if (typeof mfaEnabled === 'boolean') {
      updateData.mfaEnabled = mfaEnabled;
    }

    if (mfaMethod) {
      if (!['email', 'sms'].includes(mfaMethod)) {
        return res.status(400).json({
          error: 'La méthode MFA doit être "email" ou "sms"',
        });
      }
      if (mfaMethod === 'sms' && !telephone) {
        return res.status(400).json({
          error: 'Un numéro de téléphone est requis pour la méthode MFA "sms"',
        });
      }
      updateData.mfaMethod = mfaMethod;
    }

    const resolvedFirstName = normalizeName(firstName ?? prenom);
    const resolvedLastName = normalizeName(lastName ?? nom);

    if (resolvedFirstName) {
      updateData.firstName = resolvedFirstName;
    }
    if (resolvedLastName) {
      updateData.lastName = resolvedLastName;
      updateData.nom = resolvedLastName; // pour cohérence d'affichage existante
    }

    // Avatar (data URL)
    if (typeof avatar === 'string') {
      const trimmed = avatar.trim();

      if (trimmed.length === 0) {
        updateData.avatar = null;
      } else {
        if (!trimmed.startsWith('data:image/')) {
          return res.status(400).json({
            error: "L'avatar doit être une data URL d'image",
          });
        }
        if (trimmed.length > 5 * 1024 * 1024) {
          return res.status(400).json({
            error: "L'avatar est trop volumineux (limite ~5 Mo)",
          });
        }
        updateData.avatar = trimmed;
      }
    }

    const result = await userService.updateUserInfo(userId, updateData);

    if (result.success) {
      return res.status(200).json({
        message: 'Profil mis à jour avec succès',
        user: result.data,
      });
    } else {
      return res.status(400).json({
        error: result.error,
        details: result.details,
      });
    }
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Format d'ID utilisateur invalide",
      });
    }

    const result = await userService.deleteUserAccount(userId);

    if (result.success) {
      return res.status(200).json({
        message: result.message,
      });
    } else {
      return res.status(404).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * GET /api/users
 */
const listUsers = async (req, res) => {
  try {
    const result = await userService.listAllUsers();

    if (result.success) {
      return res.status(200).json({
        users: result.data,
        count: result.data.length,
      });
    } else {
      return res.status(500).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('listUsers error:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
    });
  }
};

module.exports = {
  register,
  getProfile,
  updateUser,
  deleteUser,
  listUsers,
};