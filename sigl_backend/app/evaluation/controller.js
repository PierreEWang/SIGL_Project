const evaluationService = require('./service');

/**
 * Créer une nouvelle évaluation
 * POST /api/evaluations
 */
const createEvaluation = async (req, res) => {
  try {
    const tuteurId = req.user.id;
    const evaluationData = req.body;
    
    // Vérifier que l'utilisateur est bien un tuteur
    if (req.user.role !== 'TP') {
      return res.status(403).json({
        error: 'Seuls les tuteurs pédagogiques peuvent créer des évaluations',
      });
    }
    
    const evaluation = await evaluationService.createEvaluation(tuteurId, evaluationData);
    
    res.status(201).json({
      message: 'Évaluation créée avec succès',
      evaluation,
    });
  } catch (error) {
    console.error('Controller createEvaluation error:', error);
    res.status(400).json({
      error: error.message || 'Erreur lors de la création de l\'évaluation',
    });
  }
};

/**
 * Récupérer les évaluations créées par le tuteur connecté
 * GET /api/evaluations/tuteur
 */
const getMyEvaluations = async (req, res) => {
  try {
    const tuteurId = req.user.id;
    
    if (req.user.role !== 'TP') {
      return res.status(403).json({
        error: 'Seuls les tuteurs pédagogiques peuvent accéder à cette ressource',
      });
    }
    
    const evaluations = await evaluationService.getEvaluationsByTuteur(tuteurId);
    
    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Controller getMyEvaluations error:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la récupération des évaluations',
    });
  }
};

/**
 * Récupérer les évaluations reçues par l'étudiant connecté
 * GET /api/evaluations/etudiant
 */
const getMyReceivedEvaluations = async (req, res) => {
  try {
    const etudiantId = req.user.id;
    
    if (req.user.role !== 'APPRENTI') {
      return res.status(403).json({
        error: 'Seuls les étudiants peuvent accéder à cette ressource',
      });
    }
    
    const evaluations = await evaluationService.getEvaluationsByEtudiant(etudiantId);
    
    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Controller getMyReceivedEvaluations error:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la récupération des évaluations',
    });
  }
};

/**
 * Récupérer une évaluation par ID
 * GET /api/evaluations/:id
 */
const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const evaluation = await evaluationService.getEvaluationById(id);
    
    // Vérifier les autorisations
    const isTuteur = userRole === 'TP' && evaluation.tuteurId._id.toString() === userId;
    const isEtudiant = userRole === 'APPRENTI' && evaluation.etudiantId._id.toString() === userId;
    
    if (!isTuteur && !isEtudiant) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à accéder à cette évaluation',
      });
    }
    
    res.status(200).json(evaluation);
  } catch (error) {
    console.error('Controller getEvaluationById error:', error);
    res.status(404).json({
      error: error.message || 'Évaluation introuvable',
    });
  }
};

/**
 * Marquer une évaluation comme lue (étudiant uniquement)
 * PATCH /api/evaluations/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (req.user.role !== 'APPRENTI') {
      return res.status(403).json({
        error: 'Seuls les étudiants peuvent marquer une évaluation comme lue',
      });
    }
    
    const evaluation = await evaluationService.markAsRead(id, userId);
    
    res.status(200).json({
      message: 'Évaluation marquée comme lue',
      evaluation,
    });
  } catch (error) {
    console.error('Controller markAsRead error:', error);
    res.status(400).json({
      error: error.message || 'Erreur lors de la mise à jour de l\'évaluation',
    });
  }
};

/**
 * Compter les évaluations non lues (étudiant uniquement)
 * GET /api/evaluations/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const etudiantId = req.user.id;
    
    if (req.user.role !== 'APPRENTI') {
      return res.status(403).json({
        error: 'Seuls les étudiants peuvent accéder à cette ressource',
      });
    }
    
    const count = await evaluationService.countUnreadEvaluations(etudiantId);
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Controller getUnreadCount error:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors du comptage des évaluations non lues',
    });
  }
};

/**
 * Récupérer la liste des étudiants (tuteur uniquement)
 * GET /api/evaluations/students
 */
const getStudents = async (req, res) => {
  try {
    if (req.user.role !== 'TP') {
      return res.status(403).json({
        error: 'Seuls les tuteurs pédagogiques peuvent accéder à cette ressource',
      });
    }
    
    const students = await evaluationService.getStudentsList();
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Controller getStudents error:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la récupération des étudiants',
    });
  }
};

/**
 * Mettre à jour une évaluation (tuteur uniquement)
 * PUT /api/evaluations/:id
 */
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const tuteurId = req.user.id;
    const updateData = req.body;
    
    if (req.user.role !== 'TP') {
      return res.status(403).json({
        error: 'Seuls les tuteurs pédagogiques peuvent modifier une évaluation',
      });
    }
    
    const evaluation = await evaluationService.updateEvaluation(id, tuteurId, updateData);
    
    res.status(200).json({
      message: 'Évaluation mise à jour avec succès',
      evaluation,
    });
  } catch (error) {
    console.error('Controller updateEvaluation error:', error);
    res.status(400).json({
      error: error.message || 'Erreur lors de la mise à jour de l\'évaluation',
    });
  }
};

/**
 * Supprimer une évaluation (tuteur uniquement)
 * DELETE /api/evaluations/:id
 */
const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const tuteurId = req.user.id;
    
    if (req.user.role !== 'TP') {
      return res.status(403).json({
        error: 'Seuls les tuteurs pédagogiques peuvent supprimer une évaluation',
      });
    }
    
    const result = await evaluationService.deleteEvaluation(id, tuteurId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Controller deleteEvaluation error:', error);
    res.status(400).json({
      error: error.message || 'Erreur lors de la suppression de l\'évaluation',
    });
  }
};

module.exports = {
  createEvaluation,
  getMyEvaluations,
  getMyReceivedEvaluations,
  getEvaluationById,
  markAsRead,
  getUnreadCount,
  getStudents,
  updateEvaluation,
  deleteEvaluation,
};
