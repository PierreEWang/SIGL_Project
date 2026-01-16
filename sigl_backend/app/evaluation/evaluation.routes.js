const express = require('express');
const evaluationController = require('./evaluation.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/evaluations
 * Crée une nouvelle évaluation pour un apprenti
 */
router.post('/', evaluationController.createEvaluation.bind(evaluationController));

/**
 * POST /api/evaluations/entretien/:entretienId
 * Crée une nouvelle évaluation pour un entretien
 */
router.post('/entretien/:entretienId', evaluationController.creerEvaluation.bind(evaluationController));

/**
 * GET /api/evaluations/entretien/:entretienId/statistiques
 * Récupère les statistiques d'évaluation pour un entretien
 */
router.get('/entretien/:entretienId/statistiques', evaluationController.obtenirStatistiques.bind(evaluationController));

/**
 * GET /api/evaluations/entretien/:entretienId/resume
 * Récupère le résumé des évaluations d'un entretien
 */
router.get('/entretien/:entretienId/resume', evaluationController.obtenirResumeEvaluations.bind(evaluationController));

/**
 * GET /api/evaluations/mes-evaluations
 * Récupère les évaluations créées par l'utilisateur connecté
 */
router.get('/mes-evaluations', evaluationController.obtenirMesEvaluations.bind(evaluationController));

/**
 * GET /api/evaluations/:evaluationId
 * Récupère une évaluation spécifique
 */
router.get('/:evaluationId', evaluationController.obtenirEvaluation.bind(evaluationController));

/**
 * PUT /api/evaluations/:evaluationId
 * Met à jour une évaluation en brouillon
 */
router.put('/:evaluationId', evaluationController.mettreAJourEvaluation.bind(evaluationController));

/**
 * POST /api/evaluations/:evaluationId/soumettre
 * Soumet une évaluation (passe de BROUILLON à SOUMISE)
 */
router.post('/:evaluationId/soumettre', evaluationController.soumettreEvaluation.bind(evaluationController));

/**
 * POST /api/evaluations/:evaluationId/approuver
 * Approuve une évaluation (administrateur)
 */
router.post('/:evaluationId/approuver', authorize(['admin', 'manager']), evaluationController.approuverEvaluation.bind(evaluationController));

/**
 * POST /api/evaluations/:evaluationId/rejeter
 * Rejette une évaluation (administrateur)
 */
router.post('/:evaluationId/rejeter', authorize(['admin', 'manager']), evaluationController.rejeterEvaluation.bind(evaluationController));

/**
 * DELETE /api/evaluations/:evaluationId
 * Supprime une évaluation en brouillon
 */
router.delete('/:evaluationId', evaluationController.supprimerEvaluation.bind(evaluationController));

module.exports = router;
