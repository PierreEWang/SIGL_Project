const Evaluation = require('../common/models/evaluation.model');
const Utilisateur = require('../common/models/user.model');

/**
 * Créer une nouvelle évaluation
 */
const createEvaluation = async (evaluationData) => {
  try {
    const evaluation = new Evaluation(evaluationData);
    await evaluation.save();
    
    // Populate pour retourner les infos complètes
    await evaluation.populate('tuteurId', 'nom email firstName lastName');
    await evaluation.populate('etudiantId', 'nom email firstName lastName');
    
    return evaluation;
  } catch (error) {
    console.error('Repository createEvaluation error:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les évaluations créées par un tuteur
 */
const getEvaluationsByTuteur = async (tuteurId) => {
  try {
    const evaluations = await Evaluation.find({ tuteurId })
      .populate('etudiantId', 'nom email firstName lastName')
      .sort({ createdAt: -1 });
    
    return evaluations;
  } catch (error) {
    console.error('Repository getEvaluationsByTuteur error:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les évaluations reçues par un étudiant
 */
const getEvaluationsByEtudiant = async (etudiantId) => {
  try {
    const evaluations = await Evaluation.find({ etudiantId })
      .populate('tuteurId', 'nom email firstName lastName')
      .sort({ createdAt: -1 });
    
    return evaluations;
  } catch (error) {
    console.error('Repository getEvaluationsByEtudiant error:', error);
    throw error;
  }
};

/**
 * Récupérer une évaluation par ID
 */
const getEvaluationById = async (evaluationId) => {
  try {
    const evaluation = await Evaluation.findById(evaluationId)
      .populate('tuteurId', 'nom email firstName lastName')
      .populate('etudiantId', 'nom email firstName lastName');
    
    return evaluation;
  } catch (error) {
    console.error('Repository getEvaluationById error:', error);
    throw error;
  }
};

/**
 * Marquer une évaluation comme lue par l'étudiant
 */
const markAsRead = async (evaluationId) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(
      evaluationId,
      {
        luParEtudiant: true,
        dateLecture: new Date(),
      },
      { new: true }
    ).populate('tuteurId', 'nom email firstName lastName');
    
    return evaluation;
  } catch (error) {
    console.error('Repository markAsRead error:', error);
    throw error;
  }
};

/**
 * Compter les évaluations non lues d'un étudiant
 */
const countUnreadEvaluations = async (etudiantId) => {
  try {
    const count = await Evaluation.countDocuments({
      etudiantId,
      luParEtudiant: false,
    });
    
    return count;
  } catch (error) {
    console.error('Repository countUnreadEvaluations error:', error);
    throw error;
  }
};

/**
 * Récupérer la liste des étudiants (APPRENTI) pour attribution
 */
const getStudentsList = async () => {
  try {
    const students = await Utilisateur.find({ role: 'APPRENTI' })
      .select('nom email firstName lastName')
      .sort({ lastName: 1, firstName: 1 });
    
    return students;
  } catch (error) {
    console.error('Repository getStudentsList error:', error);
    throw error;
  }
};

/**
 * Mettre à jour une évaluation
 */
const updateEvaluation = async (evaluationId, updateData) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(
      evaluationId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('tuteurId', 'nom email firstName lastName')
      .populate('etudiantId', 'nom email firstName lastName');
    
    return evaluation;
  } catch (error) {
    console.error('Repository updateEvaluation error:', error);
    throw error;
  }
};

/**
 * Supprimer une évaluation
 */
const deleteEvaluation = async (evaluationId) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(evaluationId);
    return evaluation;
  } catch (error) {
    console.error('Repository deleteEvaluation error:', error);
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
