const entretienRepository = require('./entretien.repository');

// Pour intégration future avec notifications
const notifyParticipants = async (entretien, message) => {
    // TODO: Implémenter quand le système de notifications sera prêt
    // Créer une notification pour chaque participant
    console.log(`📧 Notification à envoyer: ${message}`);
    console.log(`   Participants: ${entretien.participants.map(p => p.email || p).join(', ')}`);
};

const demanderEntretien = async (objet, debut, fin, participantIds) => {
    try {
        // Créer le créneau
        const creneau = await entretienRepository.createCreneau(new Date(debut), new Date(fin));

        // Créer l'entretien
        const entretien = await entretienRepository.createEntretien({
            objet,
            creneau: creneau._id,
            participants: participantIds,
            statut: 'DEMANDE'
        });

        const populatedEntretien = await entretienRepository.findEntretienById(entretien._id);

        // Notifier les participants (préparation pour système de notifications)
        await notifyParticipants(populatedEntretien, `Nouvelle demande d'entretien: ${objet}`);

        return { success: true, data: populatedEntretien };
    } catch (error) {
        console.error('Erreur création entretien:', error);
        return { success: false, error: error.message };
    }
};

const confirmerEntretien = async (entretienId) => {
    try {
        const entretien = await entretienRepository.updateEntretienStatut(entretienId, 'CONFIRME');
        if (!entretien) {
            return { success: false, error: 'Entretien non trouvé' };
        }
        await notifyParticipants(entretien, `Entretien confirmé: ${entretien.objet}`);
        return { success: true, data: entretien };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const annulerEntretien = async (entretienId) => {
    try {
        const entretien = await entretienRepository.updateEntretienStatut(entretienId, 'ANNULE');
        if (!entretien) {
            return { success: false, error: 'Entretien non trouvé' };
        }
        await notifyParticipants(entretien, `Entretien annulé: ${entretien.objet}`);
        return { success: true, data: entretien };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const getEntretiensUtilisateur = async (userId) => {
    try {
        const entretiens = await entretienRepository.findEntretiensByParticipant(userId);
        return { success: true, data: entretiens };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Pour intégration future avec le calendrier
const getEntretiensForCalendar = async (userId, year, month) => {
    try {
        const entretiens = await entretienRepository.findEntretiensByParticipant(userId);
        // Filtrer par mois/année pour affichage calendrier
        const filtered = entretiens.filter(e => {
            const date = new Date(e.creneau.debut);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
        // Transformer en format calendrier
        return filtered.map(e => ({
            id: `entretien-${e._id}`,
            title: e.objet,
            date: e.creneau.debut.toISOString().split('T')[0],
            time: e.creneau.debut.toTimeString().slice(0, 5),
            category: 'rendez-vous',
            location: 'À définir',
            description: `Participants: ${e.participants.map(p => p.nom).join(', ')}`
        }));
    } catch (error) {
        return [];
    }
};

module.exports = {
    demanderEntretien,
    confirmerEntretien,
    annulerEntretien,
    getEntretiensUtilisateur,
    getEntretiensForCalendar
};