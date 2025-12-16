const soutenanceService = require('./soutenance.service');

const planifierSoutenance = async (req, res) => {
    try {
        const { apprentiId, dateHeure, salle, professeurIds } = req.body;

        if (!apprentiId || !dateHeure || !professeurIds) {
            return res.status(400).json({
                success: false,
                error: 'Données manquantes: apprentiId, dateHeure et professeurIds requis'
            });
        }

        const result = await soutenanceService.planifierSoutenance(
            apprentiId, dateHeure, salle, professeurIds
        );

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

const validerSoutenance = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await soutenanceService.validerSoutenance(id);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

const getMaSoutenance = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await soutenanceService.getSoutenanceApprenti(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

const getAllSoutenances = async (req, res) => {
    try {
        const result = await soutenanceService.getAllSoutenances();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

module.exports = {
    planifierSoutenance,
    validerSoutenance,
    getMaSoutenance,
    getAllSoutenances
};