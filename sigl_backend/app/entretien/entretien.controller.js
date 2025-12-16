const entretienService = require('./entretien.service');

const demanderEntretien = async (req, res) => {
    try {
        const { objet, debut, fin, participantIds } = req.body;

        if (!objet || !debut || !fin || !participantIds || participantIds.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Données manquantes: objet, debut, fin et au moins 2 participants requis'
            });
        }

        const result = await entretienService.demanderEntretien(objet, debut, fin, participantIds);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

const confirmerEntretien = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await entretienService.confirmerEntretien(id);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

const annulerEntretien = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await entretienService.annulerEntretien(id);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

const getMesEntretiens = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await entretienService.getEntretiensUtilisateur(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

module.exports = {
    demanderEntretien,
    confirmerEntretien,
    annulerEntretien,
    getMesEntretiens
};