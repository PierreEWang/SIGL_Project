const Entretien = require('./entretien.model');
const Creneau = require('../creneau/creneau.model');

const createCreneau = async (debut, fin) => {
    const creneau = new Creneau({ debut, fin });
    return await creneau.save();
};

const createEntretien = async (entretienData) => {
    const entretien = new Entretien(entretienData);
    return await entretien.save();
};

const findEntretienById = async (id) => {
    return await Entretien.findById(id)
        .populate('creneau')
        .populate('participants', 'nom email role');
};

const findEntretiensByParticipant = async (userId) => {
    return await Entretien.find({ participants: userId })
        .populate('creneau')
        .populate('participants', 'nom email role')
        .sort({ 'creneau.debut': 1 });
};

const updateEntretienStatut = async (id, statut) => {
    return await Entretien.findByIdAndUpdate(
        id,
        { statut },
        { new: true }
    ).populate('creneau').populate('participants', 'nom email role');
};

const deleteEntretien = async (id) => {
    return await Entretien.findByIdAndDelete(id);
};

module.exports = {
    createCreneau,
    createEntretien,
    findEntretienById,
    findEntretiensByParticipant,
    updateEntretienStatut,
    deleteEntretien
};