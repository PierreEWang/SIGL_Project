import api from './Api';

const bookingService = {
    // === ENTRETIENS ===
    demanderEntretien: async (objet, debut, fin, participantIds) => {
        const response = await api.post('/entretiens', { objet, debut, fin, participantIds });
        return response.data;
    },
    getMesEntretiens: async () => {
        const response = await api.get('/entretiens/mes-entretiens');
        return response.data;
    },
    confirmerEntretien: async (entretienId) => {
        const response = await api.put(`/entretiens/${entretienId}/confirmer`);
        return response.data;
    },
    annulerEntretien: async (entretienId) => {
        const response = await api.put(`/entretiens/${entretienId}/annuler`);
        return response.data;
    },

    // === SOUTENANCES ===
    planifierSoutenance: async (apprentiId, dateHeure, salle, professeurIds) => {
        const response = await api.post('/soutenances', { apprentiId, dateHeure, salle, professeurIds });
        return response.data;
    },
    getMaSoutenance: async () => {
        const response = await api.get('/soutenances/ma-soutenance');
        return response.data;
    },
    getAllSoutenances: async () => {
        const response = await api.get('/soutenances');
        return response.data;
    },
    validerSoutenance: async (soutenanceId) => {
        const response = await api.put(`/soutenances/${soutenanceId}/valider`);
        return response.data;
    },

    // === UTILISATEURS (pour sélection participants) ===
    getAvailableContacts: async () => {
        const response = await api.get('/users/available-contacts');
        return response.data;
    }
};

export default bookingService;