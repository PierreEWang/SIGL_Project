const mongoose = require('mongoose');

const soutenanceSchema = new mongoose.Schema({
    apprenti: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    jury: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jury',
        required: true
    },
    salle: {
        type: String,
        default: null
    },
    dateHeure: {
        type: Date,
        required: true
    },
    etat: {
        type: String,
        enum: ['PLANIFIEE', 'VALIDEE', 'TERMINEE', 'ANNULEE'],
        default: 'PLANIFIEE'
    }
}, {
    timestamps: true,
    collection: 'soutenances'
});

soutenanceSchema.index({ apprenti: 1 });
soutenanceSchema.index({ dateHeure: 1 });

module.exports = mongoose.model('Soutenance', soutenanceSchema);