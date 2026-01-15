const mongoose = require('mongoose');

const jurySchema = new mongoose.Schema({
    professeurs: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Utilisateur'
        }],
        validate: {
            validator: function(v) {
                return v.length >= 3 && v.length <= 5;
            },
            message: 'Un jury doit contenir entre 3 et 5 professeurs'
        },
        required: true
    }
}, {
    timestamps: true,
    collection: 'jurys'
});

module.exports = mongoose.model('Jury', jurySchema);