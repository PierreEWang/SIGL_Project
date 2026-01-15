const soutenanceRepository = require('./soutenance.repository');

// Pour intégration future avec notifications
const notifyAboutSoutenance = async (soutenance, message) => {
    console.log(`📧 Notification soutenance: ${message}`);
    // TODO: Notifier l'apprenti et les membres du jury
};

const planifierSoutenance = async (apprentiId, dateHeure, salle, professeurIds) => {
    try {
        // Vérifier que l'apprenti n'a pas déjà une soutenance
        const existingSoutenance = await soutenanceRepository.findSoutenanceByApprenti(apprentiId);
        if (existingSoutenance) {
            return { success: false, error: 'L\'apprenti a déjà une soutenance planifiée' };
        }

        // Créer le jury (3-5 professeurs requis)
        if (professeurIds.length < 3 || professeurIds.length > 5) {
            return { success: false, error: 'Un jury doit contenir entre 3 et 5 professeurs' };
        }
        const jury = await soutenanceRepository.createJury(professeurIds);

        // Créer la soutenance
        const soutenance = await soutenanceRepository.createSoutenance({
            apprenti: apprentiId,
            jury: jury._id,
            dateHeure: new Date(dateHeure),
            salle,
            etat: 'PLANIFIEE'
        });

        const populatedSoutenance = await soutenanceRepository.findSoutenanceById(soutenance._id);
        await notifyAboutSoutenance(populatedSoutenance, 'Nouvelle soutenance planifiée');

        return { success: true, data: populatedSoutenance };
    } catch (error) {
        console.error('Erreur planification soutenance:', error);
        return { success: false, error: error.message };
    }
};

const validerSoutenance = async (soutenanceId) => {
    try {
        const soutenance = await soutenanceRepository.updateSoutenanceEtat(soutenanceId, 'VALIDEE');
        if (!soutenance) {
            return { success: false, error: 'Soutenance non trouvée' };
        }
        const populated = await soutenanceRepository.findSoutenanceById(soutenanceId);
        await notifyAboutSoutenance(populated, 'Soutenance validée');
        return { success: true, data: populated };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const getSoutenanceApprenti = async (apprentiId) => {
    try {
        const soutenance = await soutenanceRepository.findSoutenanceByApprenti(apprentiId);
        return { success: true, data: soutenance };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const getAllSoutenances = async () => {
    try {
        const soutenances = await soutenanceRepository.findAllSoutenances();
        return { success: true, data: soutenances };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Pour intégration future avec le calendrier
const getSoutenancesForCalendar = async (year, month) => {
    try {
        const soutenances = await soutenanceRepository.findAllSoutenances();
        const filtered = soutenances.filter(s => {
            const date = new Date(s.dateHeure);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
        return filtered.map(s => ({
            id: `soutenance-${s._id}`,
            title: `Soutenance - ${s.apprenti?.nom || 'Apprenti'}`,
            date: s.dateHeure.toISOString().split('T')[0],
            time: s.dateHeure.toTimeString().slice(0, 5),
            category: 'rendez-vous',
            location: s.salle || 'Salle à définir',
            description: `Jury: ${s.jury?.professeurs?.map(p => p.nom).join(', ') || 'Non défini'}`
        }));
    } catch (error) {
        return [];
    }
};

module.exports = {
    planifierSoutenance,
    validerSoutenance,
    getSoutenanceApprenti,
    getAllSoutenances,
    getSoutenancesForCalendar
};