const mongoose = require('mongoose');

const creneauSchema = new mongoose.Schema({
    debut: {
        type: Date,
        required: true
    },
    fin: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v > this.debut;
            },
            message: 'La fin doit être après le début'
        }
    }
}, {
    timestamps: true,
    collection: 'creneaux'
});

creneauSchema.index({ debut: 1, fin: 1 });

module.exports = mongoose.model('Creneau', creneauSchema);