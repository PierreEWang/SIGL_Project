import api from './api';

const journalService = {
  async getMyJournaux() {
    const response = await api.get('/journaux');
    return response.data?.data || [];
  },

  async createJournal(journalPayload) {
    const response = await api.post('/journaux', journalPayload);
    return response.data?.data;
  },
};

export default journalService;