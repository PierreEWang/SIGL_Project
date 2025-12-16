const Soutenance = require('./soutenance.model');
const Jury = require('./jury.model');

const createJury = async (professeurIds) => {
    const jury = new Jury({ professeurs: professeurIds });
    return await jury.save();
};

const createSoutenance = async (soutenanceData) => {
    const soutenance = new Soutenance(soutenanceData);
    return await soutenance.save();
};

const findSoutenanceById = async (id) => {
    return await Soutenance.findById(id)
        .populate('apprenti', 'nom email')
        .populate({
            path: 'jury',
            populate: { path: 'professeurs', select: 'nom email' }
        });
};

const findSoutenanceByApprenti = async (apprentiId) => {
    return await Soutenance.findOne({ apprenti: apprentiId })
        .populate('apprenti', 'nom email')
        .populate({
            path: 'jury',
            populate: { path: 'professeurs', select: 'nom email' }
        });
};

const findAllSoutenances = async (filters = {}) => {
    return await Soutenance.find(filters)
        .populate('apprenti', 'nom email')
        .populate({
            path: 'jury',
            populate: { path: 'professeurs', select: 'nom email' }
        })
        .sort({ dateHeure: 1 });
};

const updateSoutenanceEtat = async (id, etat) => {
    return await Soutenance.findByIdAndUpdate(
        id,
        { etat },
        { new: true }
    );
};

module.exports = {
    createJury,
    createSoutenance,
    findSoutenanceById,
    findSoutenanceByApprenti,
    findAllSoutenances,
    updateSoutenanceEtat
};