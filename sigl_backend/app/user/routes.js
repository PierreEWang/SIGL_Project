// sigl_backend/app/user/routes.js
const express = require('express');
const router = express.Router();
const userController = require('./controller');
const { authenticate } = require('../middleware/authenticate');
const {
  authorizeSelfOrAdmin,
  adminOnly,
  staffOnly,
} = require('../middleware/authorize');
const Utilisateur = require('../common/models/user.model');  // ← Correction ici !

/**
 * Routes Utilisateur avec authentification et autorisation
 */

// POST /api/users/register - Enregistrer un nouvel utilisateur (public)
router.post('/register', userController.register);

// GET /api/users/available-contacts - Lister les contacts disponibles
router.get('/available-contacts', authenticate, async (req, res) => {
  try {
    const baseRoles = ['APPRENTI', 'TP', 'MA', 'PROF', 'CA', 'RC'];
    const roles = req.user?.role === 'APPRENTI'
      ? baseRoles.filter((role) => role !== 'APPRENTI')
      : baseRoles;

    const users = await Utilisateur.find(
      { role: { $in: roles } },
      'nom email role _id'
    );
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/tuteur/apprentices - Lister les apprentices assignés au tuteur
router.get(
  '/tuteur/apprentices',
  authenticate,
  userController.getTuteurApprentices
);

// GET /api/users - Lister tous les utilisateurs (admin/staff seulement)
router.get(
  '/',
  authenticate,
  staffOnly(),
  userController.listUsers
);

// GET /api/users/:id - Obtenir le profil utilisateur (utilisateur lui-même ou admin)
router.get(
  '/:id',
  authenticate,
  authorizeSelfOrAdmin('id'),
  userController.getProfile
);

// PUT /api/users/:id - Mettre à jour les informations utilisateur (utilisateur lui-même ou admin)
router.put(
  '/:id',
  authenticate,
  authorizeSelfOrAdmin('id'),
  userController.updateUser
);

// DELETE /api/users/:id - Supprimer le compte utilisateur (admin seulement)
router.delete(
  '/:id',
  authenticate,
  adminOnly(),
  userController.deleteUser
);

// POST /api/users/:id/approve - Valider un utilisateur (admin)
router.post(
  '/:id/approve',
  authenticate,
  adminOnly(),
  userController.approveUser
);

// POST /api/users/:id/reject - Rejeter un utilisateur (admin)
router.post(
  '/:id/reject',
  authenticate,
  adminOnly(),
  userController.rejectUser
);

module.exports = router;