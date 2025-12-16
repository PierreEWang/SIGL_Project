// sigl_frontend/src/services/journalService.js
import api from './api';

const journalService = {
  // Récupérer tous les journaux de l'apprenti connecté
  async getMyJournaux() {
    const response = await api.get('/journaux');
    // Le backend renvoie { success, data: [...] }
    return response.data?.data || [];
  },

  // Récupérer un journal par son id
  async getJournalById(id) {
    const response = await api.get(`/journaux/${id}`);
    return response.data?.data || null;
  },

  // Créer un journal pour l'apprenti connecté
  async createJournal(journalPayload) {
    const response = await api.post('/journaux', journalPayload);
    return response.data?.data;
  },
};

export default journalService;