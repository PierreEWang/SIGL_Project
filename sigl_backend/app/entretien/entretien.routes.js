const express = require('express');
const entretienController = require('./entretien.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/entretiens
 * Crée une nouvelle demande d'entretien
 */
router.post('/', entretienController.creerEntretien.bind(entretienController));

/**
 * GET /api/entretiens/mes-entretiens
 * Récupère tous les entretiens de l'utilisateur
 */
router.get('/mes-entretiens', entretienController.getMesEntretiens.bind(entretienController));

/**
 * GET /api/entretiens/calendrier
 * Récupère les entretiens pour affichage calendrier
 */
router.get('/calendrier', entretienController.getEntretiensCalendar.bind(entretienController));

/**
 * GET /api/entretiens/:entretienId
 * Récupère un entretien spécifique
 */
router.get('/:entretienId', entretienController.getEntretien.bind(entretienController));

/**
 * PUT /api/entretiens/:entretienId/confirmer
 * Confirme une demande d'entretien
 */
router.put('/:entretienId/confirmer', entretienController.confirmerEntretien.bind(entretienController));

/**
 * PUT /api/entretiens/:entretienId/annuler
 * Annule un entretien
 */
router.put('/:entretienId/annuler', entretienController.annulerEntretien.bind(entretienController));

/**
 * PUT /api/entretiens/:entretienId
 * Met à jour un entretien avec historisation
 */
router.put('/:entretienId', entretienController.mettreAJourEntretien.bind(entretienController));

module.exports = router;
