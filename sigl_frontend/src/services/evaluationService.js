import Api from './Api';

const evaluationService = {
  /**
   * Créer une nouvelle évaluation (tuteur uniquement)
   */
  createEvaluation: async (evaluationData) => {
    try {
      const response = await Api.post('/evaluations', evaluationData);
      return response.data;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer toutes les évaluations créées par le tuteur connecté
   */
  getMyEvaluations: async () => {
    try {
      const response = await Api.get('/evaluations/tuteur');
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor evaluations:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer toutes les évaluations reçues par l'étudiant connecté
   */
  getMyReceivedEvaluations: async () => {
    try {
      const response = await Api.get('/evaluations/etudiant');
      return response.data;
    } catch (error) {
      console.error('Error fetching student evaluations:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une évaluation par ID
   */
  getEvaluationById: async (evaluationId) => {
    try {
      const response = await Api.get(`/evaluations/${evaluationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Marquer une évaluation comme lue (étudiant uniquement)
   */
  markAsRead: async (evaluationId) => {
    try {
      const response = await Api.patch(`/evaluations/${evaluationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking evaluation as read:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Compter les évaluations non lues (étudiant uniquement)
   */
  getUnreadCount: async () => {
    try {
      const response = await Api.get('/evaluations/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer la liste des étudiants (tuteur uniquement)
   */
  getStudentsList: async () => {
    try {
      const response = await Api.get('/evaluations/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students list:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour une évaluation (tuteur uniquement)
   */
  updateEvaluation: async (evaluationId, updateData) => {
    try {
      const response = await Api.put(`/evaluations/${evaluationId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating evaluation:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer une évaluation (tuteur uniquement)
   */
  deleteEvaluation: async (evaluationId) => {
    try {
      const response = await Api.delete(`/evaluations/${evaluationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      throw error.response?.data || error;
    }
  },
};

export default evaluationService;
