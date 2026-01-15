const mongoose = require('mongoose');

// Schéma pour les créneaux horaires
const creneauSchema = new mongoose.Schema({
  debut: {
    type: Date,
    required: true
  },
  fin: {
    type: Date,
    required: true
  },
  disponibilite: {
    type: String,
    enum: ['LIBRE', 'OCCUPÉ', 'RESERVE'],
    default: 'LIBRE'
  }
}, {
  timestamps: true,
  collection: 'creneaux'
});

// Validation: fin > debut
creneauSchema.pre('save', function(next) {
  if (this.fin <= this.debut) {
    throw new Error('La date de fin doit être après la date de début');
  }
  next();
});

module.exports = mongoose.model('Creneau', creneauSchema);
