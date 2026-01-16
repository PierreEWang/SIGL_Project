import api from './Api';

const entretienPlanificationService = {
  /**
   * Récupère tous les entretiens de l'utilisateur
   */
  async getMesEntretiens() {
    try {
      const response = await api.get('/entretiens/mes-entretiens');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur récupération entretiens:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un entretien
   */
  async getEntretienDetail(entretienId) {
    try {
      const response = await api.get(`/entretiens/${entretienId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur récupération détail entretien:', error);
      throw error;
    }
  },

  /**
   * Crée une demande d'entretien
   */
  async demanderEntretien(data) {
    try {
      const response = await api.post('/entretiens', data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur création entretien:', error);
      throw error;
    }
  },

  /**
   * Confirme un entretien
   */
  async confirmerEntretien(entretienId) {
    try {
      const response = await api.put(`/entretiens/${entretienId}/confirmer`, {});
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur confirmation entretien:', error);
      throw error;
    }
  },

  /**
   * Annule un entretien
   */
  async annulerEntretien(entretienId) {
    try {
      const response = await api.put(`/entretiens/${entretienId}/annuler`, {});
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur annulation entretien:', error);
      throw error;
    }
  },

  // ============ ÉVALUATION ============

  /**
   * Crée une évaluation pour un entretien
   */
  async creerEvaluation(entretienId, evaluationData) {
    try {
      const response = await api.post(`/evaluations/entretien/${entretienId}`, evaluationData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur création évaluation:', error);
      throw error;
    }
  },

  /**
   * Soumet une évaluation
   */
  async soumettreEvaluation(evaluationId) {
    try {
      const response = await api.post(`/evaluations/${evaluationId}/soumettre`, {});
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur soumission évaluation:', error);
      throw error;
    }
  },

  /**
   * Récupère une évaluation
   */
  async obtenirEvaluation(evaluationId) {
    try {
      const response = await api.get(`/evaluations/${evaluationId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur récupération évaluation:', error);
      throw error;
    }
  },

  /**
   * Récupère mes évaluations
   */
  async getMesEvaluations(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.etat) params.append('etat', options.etat);
      if (options.sort) params.append('sort', JSON.stringify(options.sort));

      const response = await api.get(`/evaluations/mes-evaluations?${params.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur récupération évaluations:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques d'un entretien
   */
  async obtenirStatistiques(entretienId) {
    try {
      const response = await api.get(`/evaluations/entretien/${entretienId}/statistiques`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw error;
    }
  },

  /**
   * Récupère le résumé des évaluations d'un entretien
   */
  async obtenirResumeEvaluations(entretienId) {
    try {
      const response = await api.get(`/evaluations/entretien/${entretienId}/resume`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur récupération résumé:', error);
      throw error;
    }
  },

  /**
   * Met à jour une évaluation
   */
  async mettreAJourEvaluation(evaluationId, updateData) {
    try {
      const response = await api.put(`/evaluations/${evaluationId}`, updateData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur mise à jour évaluation:', error);
      throw error;
    }
  },

  /**
   * Supprime une évaluation
   */
  async supprimerEvaluation(evaluationId) {
    try {
      const response = await api.delete(`/evaluations/${evaluationId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur suppression évaluation:', error);
      throw error;
    }
  },

  /**
   * Met à jour un entretien avec historisation
   */
  async mettreAJourEntretien(entretienId, updates, notes = '') {
    try {
      const response = await api.put(`/entretiens/${entretienId}`, {
        updates,
        notes
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur mise à jour entretien:', error);
      throw error;
    }
  }
};

export default entretienPlanificationService;
