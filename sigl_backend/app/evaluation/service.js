const evaluationRepository = require('./repository');

/**
 * Créer une nouvelle évaluation
 */
const createEvaluation = async (tuteurId, evaluationData) => {
  try {
    // Validation
    if (!evaluationData.etudiantId) {
      throw new Error('L\'ID de l\'étudiant est requis');
    }
    
    if (evaluationData.note === undefined || evaluationData.note === null) {
      throw new Error('La note est requise');
    }
    
    if (evaluationData.note < 0 || evaluationData.note > 20) {
      throw new Error('La note doit être comprise entre 0 et 20');
    }
    
    if (!evaluationData.commentaire || !evaluationData.commentaire.trim()) {
      throw new Error('Le commentaire est requis');
    }
    
    if (!Array.isArray(evaluationData.competences)) {
      throw new Error('Les compétences doivent être un tableau');
    }
    
    const newEvaluation = {
      tuteurId,
      etudiantId: evaluationData.etudiantId,
      note: evaluationData.note,
      commentaire: evaluationData.commentaire.trim(),
      competences: evaluationData.competences,
      periode: evaluationData.periode || null,
      luParEtudiant: false,
    };
    
    const evaluation = await evaluationRepository.createEvaluation(newEvaluation);
    return evaluation;
  } catch (error) {
    console.error('Service createEvaluation error:', error);
    throw error;
  }
};

/**
 * Récupérer les évaluations créées par un tuteur
 */
const getEvaluationsByTuteur = async (tuteurId) => {
  try {
    const evaluations = await evaluationRepository.getEvaluationsByTuteur(tuteurId);
    return evaluations;
  } catch (error) {
    console.error('Service getEvaluationsByTuteur error:', error);
    throw error;
  }
};

/**
 * Récupérer les évaluations reçues par un étudiant
 */
const getEvaluationsByEtudiant = async (etudiantId) => {
  try {
    const evaluations = await evaluationRepository.getEvaluationsByEtudiant(etudiantId);
    return evaluations;
  } catch (error) {
    console.error('Service getEvaluationsByEtudiant error:', error);
    throw error;
  }
};

/**
 * Récupérer une évaluation par ID
 */
const getEvaluationById = async (evaluationId) => {
  try {
    const evaluation = await evaluationRepository.getEvaluationById(evaluationId);
    
    if (!evaluation) {
      throw new Error('Évaluation introuvable');
    }
    
    return evaluation;
  } catch (error) {
    console.error('Service getEvaluationById error:', error);
    throw error;
  }
};

/**
 * Marquer une évaluation comme lue
 */
const markAsRead = async (evaluationId, userId) => {
  try {
    const evaluation = await evaluationRepository.getEvaluationById(evaluationId);
    
    if (!evaluation) {
      throw new Error('Évaluation introuvable');
    }
    
    // Vérifier que c'est bien l'étudiant concerné qui marque comme lu
    if (evaluation.etudiantId.toString() !== userId.toString()) {
      throw new Error('Vous n\'êtes pas autorisé à marquer cette évaluation comme lue');
    }
    
    const updatedEvaluation = await evaluationRepository.markAsRead(evaluationId);
    return updatedEvaluation;
  } catch (error) {
    console.error('Service markAsRead error:', error);
    throw error;
  }
};

/**
 * Compter les évaluations non lues d'un étudiant
 */
const countUnreadEvaluations = async (etudiantId) => {
  try {
    const count = await evaluationRepository.countUnreadEvaluations(etudiantId);
    return count;
  } catch (error) {
    console.error('Service countUnreadEvaluations error:', error);
    throw error;
  }
};

/**
 * Récupérer la liste des étudiants
 */
const getStudentsList = async () => {
  try {
    const students = await evaluationRepository.getStudentsList();
    return students;
  } catch (error) {
    console.error('Service getStudentsList error:', error);
    throw error;
  }
};

/**
 * Mettre à jour une évaluation
 */
const updateEvaluation = async (evaluationId, tuteurId, updateData) => {
  try {
    const evaluation = await evaluationRepository.getEvaluationById(evaluationId);
    
    if (!evaluation) {
      throw new Error('Évaluation introuvable');
    }
    
    // Vérifier que c'est bien le tuteur qui a créé l'évaluation
    if (evaluation.tuteurId.toString() !== tuteurId.toString()) {
      throw new Error('Vous n\'êtes pas autorisé à modifier cette évaluation');
    }
    
    const updatedEvaluation = await evaluationRepository.updateEvaluation(
      evaluationId,
      updateData
    );
    
    return updatedEvaluation;
  } catch (error) {
    console.error('Service updateEvaluation error:', error);
    throw error;
  }
};

/**
 * Supprimer une évaluation
 */
const deleteEvaluation = async (evaluationId, tuteurId) => {
  try {
    const evaluation = await evaluationRepository.getEvaluationById(evaluationId);
    
    if (!evaluation) {
      throw new Error('Évaluation introuvable');
    }
    
    // Vérifier que c'est bien le tuteur qui a créé l'évaluation
    if (evaluation.tuteurId.toString() !== tuteurId.toString()) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer cette évaluation');
    }
    
    await evaluationRepository.deleteEvaluation(evaluationId);
    return { message: 'Évaluation supprimée avec succès' };
  } catch (error) {
    console.error('Service deleteEvaluation error:', error);
    throw error;
  }
};

module.exports = {
  createEvaluation,
  getEvaluationsByTuteur,
  getEvaluationsByEtudiant,
  getEvaluationById,
  markAsRead,
  countUnreadEvaluations,
  getStudentsList,
  updateEvaluation,
  deleteEvaluation,
};
