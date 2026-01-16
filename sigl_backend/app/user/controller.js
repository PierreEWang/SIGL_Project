// sigl_backend/app/user/controller.js
const mongoose = require('mongoose');
const userService = require('./service');

const userRepository = require('./repository');
const authRepository = require('../auth/auth.repository');
const authService = require('../auth/auth.service');

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
    const {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      prenom,
      nom,
      telephone,
    } = req.body;

    // ------------------ validations (sans casser l'existant) ------------------
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Le nom d'utilisateur, l'email et le mot de passe sont obligatoires",
      });
    }

    // Username: 3-20, caractères autorisés (cohérent avec updateUser)
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error:
          "Nom d'utilisateur invalide (3-20 caractères, lettres/chiffres/._- uniquement)",
      });
    }

    // Email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({
        error: 'Format email invalide',
      });
    }

    // Password: ton front peut avoir “>= 6”, mais ton authService.hashPassword exige “>= 8”
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères',
      });
    }

    let dbRole = role || 'APPRENTI';
    if (!VALID_ROLES.includes(dbRole)) {
      return res.status(400).json({
        error: `Le rôle doit être l'un des suivants : ${VALID_ROLES.join(', ')}`,
      });
    }

    const status = dbRole === 'APPRENTI' ? 'ACTIF' : 'EN_ATTENTE';

    // Vérifie doublons (email / username) AVANT création
    const existingByEmail = await userRepository.findUserByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({
        error: "Un utilisateur existe déjà avec cet email",
      });
    }

    const existingByUsername = await userRepository.findUserByUsername(username);
    if (existingByUsername) {
      return res.status(409).json({
        error: "Un utilisateur existe déjà avec ce nom d'utilisateur",
      });
    }

    // ------------------ création user (sans password) ------------------
    const result = await userService.createUser({
      username,
      email,
      role: dbRole,
      status,
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

    // ------------------ création credentials (Auth) ------------------
    try {
      const hashedPassword = await authService.hashPassword(password);
      const userId = result.data?._id || result.data?.id; // selon ce que renvoie toSafeObject()
      await authRepository.createAuthRecord(userId, hashedPassword);
    } catch (authErr) {
      // Rollback best-effort: si user créé mais pas credentials, on supprime le user
      try {
        const userId = result.data?._id || result.data?.id;
        if (userId) {
          await userService.deleteUserAccount(userId);
        }
      } catch (rollbackErr) {
        console.error('register rollback error:', rollbackErr);
      }

      console.error('register auth creation error:', authErr);
      return res.status(500).json({
        error:
          "Utilisateur créé, mais échec de création des identifiants. Réessaie.",
      });
    }

    return res.status(201).json({
      message: 'Utilisateur enregistré avec succès',
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

    if (result.success) {
      return res.status(200).json({
        user: result.data,
      });
    } else {
      return res.status(404).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
    });
  }
};

const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Format d'ID utilisateur invalide",
      });
    }

    const existing = await userService.getUserProfile(userId);
    if (!existing.success) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (existing.data.status === 'ACTIF') {
      return res.status(400).json({ error: 'Utilisateur déjà actif' });
    }

    const result = await userService.approveUser(userId, req.user?.id || req.user?._id);

    if (!result.success) {
      return res.status(400).json({ error: result.error, details: result.details });
    }

    return res.status(200).json({
      message: 'Utilisateur validé',
      user: result.data,
    });
  } catch (error) {
    console.error('approveUser error:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const rejectUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Format d'ID utilisateur invalide",
      });
    }

    const existing = await userService.getUserProfile(userId);
    if (!existing.success) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (existing.data.status === 'REJETE') {
      return res.status(400).json({ error: 'Utilisateur déjà rejeté' });
    }

    const result = await userService.rejectUser(userId, reason);

    if (!result.success) {
      return res.status(400).json({ error: result.error, details: result.details });
    }

    return res.status(200).json({
      message: 'Utilisateur rejeté',
      user: result.data,
    });
  } catch (error) {
    console.error('rejectUser error:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Format d'ID utilisateur invalide",
      });
    }

    // Validation: username
    if (updateData.username) {
      const usernameRegex = /^[a-zA-Z0-9_.-]{3,20}$/;
      if (!usernameRegex.test(updateData.username)) {
        return res.status(400).json({
          error:
            "Nom d'utilisateur invalide (3-20 caractères, lettres/chiffres/._- uniquement)",
        });
      }
    }

    // Validation: email
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          error: 'Format email invalide',
        });
      }
    }

    // Validation: role
    if (updateData.role && !VALID_ROLES.includes(updateData.role)) {
      return res.status(400).json({
        error: `Le rôle doit être l'un des suivants : ${VALID_ROLES.join(', ')}`,
      });
    }

    const result = await userService.updateUserInfo(userId, updateData)

    if (result.success) {
      return res.status(200).json({
        message: result.message,
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
        success: true,
        data: result.data,
        count: result.data.length,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('listUsers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * GET /api/tuteur/apprentices
 * Retourne les apprentices assignés au tuteur (MA/TP/PROF) actuel
 */
const getTuteurApprentices = async (req, res) => {
  try {
    const tuteurId = req.user?.userId;
    const tuteurRole = req.user?.role;

    if (!tuteurId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié',
      });
    }

    // Vérifier que l'utilisateur est un tuteur
    if (!['MA', 'TP', 'PROF', 'CA', 'RC'].includes(tuteurRole)) {
      return res.status(403).json({
        success: false,
        error: 'Seuls les tuteurs peuvent accéder à cette ressource',
      });
    }

    // Récupérer les apprentices assignés au tuteur
    const apprentices = await userRepository.findApprenticesByTuteur(tuteurId);

    return res.status(200).json({
      success: true,
      data: apprentices,
    });
  } catch (error) {
    console.error('getTuteurApprentices error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des apprentices',
    });
  }
};

module.exports = {
  register,
  getProfile,
  updateUser,
  deleteUser,
  listUsers,
   approveUser,
   rejectUser,
   getTuteurApprentices,
};