const mongoose = require('mongoose');

const entretienSchema = new mongoose.Schema({
    objet: {
        type: String,
        required: true,
        minlength: 2
    },
    creneau: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Creneau',
        required: true
    },
    participants: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Utilisateur'
        }],
        validate: {
            validator: function(v) {
                return v.length >= 2;
            },
            message: 'Un entretien doit avoir au moins 2 participants'
        },
        required: true
    },
    statut: {
        type: String,
        enum: ['DEMANDE', 'CONFIRME', 'ANNULE', 'TERMINE'],
        default: 'DEMANDE'
    }
}, {
    timestamps: true,
    collection: 'entretiens'
});

entretienSchema.index({ creneau: 1 });

module.exports = mongoose.model('Entretien', entretienSchema);