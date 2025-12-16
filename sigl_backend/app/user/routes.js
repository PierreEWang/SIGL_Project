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

/**
 * Routes Utilisateur avec authentification et autorisation
 */

// POST /api/users/register - Enregistrer un nouvel utilisateur (public)
router.post('/register', userController.register);

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

module.exports = router;