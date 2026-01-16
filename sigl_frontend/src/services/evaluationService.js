import api from './Api';

const evaluationService = {
  /**
   * Créer une nouvelle évaluation
   */
  createEvaluation: async (evaluationData) => {
    try {
      const response = await api.post('/evaluations', evaluationData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Impossible de créer l\'évaluation',
      };
    }
  },

  /**
   * Récupérer les évaluations d'un apprenti
   */
  getApprenticeEvaluations: async (apprenticeId) => {
    try {
      const response = await api.get(`/evaluations/apprentice/${apprenticeId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error);
      return {
        success: false,
        message: 'Impossible de charger les évaluations',
        data: [],
      };
    }
  },

  /**
   * Récupérer une évaluation par ID
   */
  getEvaluation: async (evaluationId) => {
    try {
      const response = await api.get(`/evaluations/${evaluationId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'évaluation:', error);
      return {
        success: false,
        message: 'Impossible de charger l\'évaluation',
      };
    }
  },

  /**
   * Mettre à jour une évaluation
   */
  updateEvaluation: async (evaluationId, updateData) => {
    try {
      const response = await api.put(`/evaluations/${evaluationId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Impossible de mettre à jour l\'évaluation',
      };
    }
  },

  /**
   * Supprimer une évaluation
   */
  deleteEvaluation: async (evaluationId) => {
    try {
      const response = await api.delete(`/evaluations/${evaluationId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'évaluation:', error);
      return {
        success: false,
        message: 'Impossible de supprimer l\'évaluation',
      };
    }
  },

  /**
   * Récupérer les évaluations du tuteur
   */
  getTuteurEvaluations: async () => {
    try {
      const response = await api.get('/evaluations/tutor/mes-evaluations');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error);
      return {
        success: false,
        message: 'Impossible de charger les évaluations',
        data: [],
      };
    }
  },

  /**
   * Obtenir les statistiques d'un apprenti
   */
  getApprenticeStats: async (apprenticeId) => {
    try {
      const response = await api.get(`/evaluations/apprentice/${apprenticeId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      return {
        success: false,
        message: 'Impossible de charger les statistiques',
      };
    }
  },
};

export default evaluationService;
