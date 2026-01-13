const express = require('express');
const router = express.Router();
const evaluationController = require('./controller');
const { authenticate } = require('../middleware/authenticate');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * POST /api/evaluations
 * Créer une nouvelle évaluation (tuteur uniquement)
 */
router.post('/', evaluationController.createEvaluation);

/**
 * GET /api/evaluations/tuteur
 * Récupérer toutes les évaluations créées par le tuteur connecté
 */
router.get('/tuteur', evaluationController.getMyEvaluations);

/**
 * GET /api/evaluations/etudiant
 * Récupérer toutes les évaluations reçues par l'étudiant connecté
 */
router.get('/etudiant', evaluationController.getMyReceivedEvaluations);

/**
 * GET /api/evaluations/unread-count
 * Compter les évaluations non lues (étudiant uniquement)
 */
router.get('/unread-count', evaluationController.getUnreadCount);

/**
 * GET /api/evaluations/students
 * Récupérer la liste des étudiants (tuteur uniquement)
 */
router.get('/students', evaluationController.getStudents);

/**
 * GET /api/evaluations/:id
 * Récupérer une évaluation par ID
 */
router.get('/:id', evaluationController.getEvaluationById);

/**
 * PATCH /api/evaluations/:id/read
 * Marquer une évaluation comme lue (étudiant uniquement)
 */
router.patch('/:id/read', evaluationController.markAsRead);

/**
 * PUT /api/evaluations/:id
 * Mettre à jour une évaluation (tuteur uniquement)
 */
router.put('/:id', evaluationController.updateEvaluation);

/**
 * DELETE /api/evaluations/:id
 * Supprimer une évaluation (tuteur uniquement)
 */
router.delete('/:id', evaluationController.deleteEvaluation);

module.exports = router;
