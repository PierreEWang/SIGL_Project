// sigl_backend/app/auth/auth.routes.js

const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { authenticate } = require('../middleware/authenticate');

// ---------------------------------------------------------------------------
// AUTH DE BASE + MFA (login)
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/login
 * Étape 1 : login (peut retourner mfaRequired = true)
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * POST /api/auth/mfa/verify
 * Étape 2 : vérification du code MFA
 */
router.post('/mfa/verify', (req, res) => authController.verifyMfaCode(req, res));

// ---------------------------------------------------------------------------
// SESSION (logout, refresh)
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/logout
 * Nécessite un access token
 */
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

/**
 * POST /api/auth/refresh
 * Utilise le refresh token dans l’Authorization header
 */
router.post('/refresh', (req, res) => authController.refreshAccessToken(req, res));

// ---------------------------------------------------------------------------
// MOT DE PASSE
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/change-password
 */
router.post('/change-password', authenticate, (req, res) =>
  authController.changePassword(req, res)
);

/**
 * POST /api/auth/request-reset
 */
router.post('/request-reset', (req, res) =>
  authController.requestPasswordReset(req, res)
);

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', (req, res) =>
  authController.resetPassword(req, res)
);

// ---------------------------------------------------------------------------
// PARAMÈTRES MFA POUR LA PAGE PROFIL (optionnel mais prévu dans ton code)
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/mfa/status
 * Retourne le statut MFA + méthode préférée de l’utilisateur connecté
 */
router.get('/mfa/status', authenticate, (req, res) =>
  authController.getMfaStatus(req, res)
);

/**
 * PUT /api/auth/mfa/settings
 * Met à jour la méthode MFA préférée (email / sms / etc.)
 */
router.put('/mfa/settings', authenticate, (req, res) =>
  authController.updateMfaSettings(req, res)
);

module.exports = router;