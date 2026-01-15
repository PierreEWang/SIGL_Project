const mongoose = require('mongoose');

// Schéma pour les entretiens
const entretienSchema = new mongoose.Schema({
  objet: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  creneau: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creneau',
    required: true
  },
  
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  }],

  // Suivi des confirmations par participant
  confirmations: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    },
    confirme: {
      type: Boolean,
      default: false
    },
    dateConfirmation: {
      type: Date
    }
  }],
  
  statut: {
    type: String,
    enum: ['DEMANDE', 'CONFIRME', 'ANNULE', 'TERMINE'],
    default: 'DEMANDE'
  },
  
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  description: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: true,
  collection: 'entretiens'
});

// Validation: au moins 2 participants
entretienSchema.pre('save', function(next) {
  if (this.participants && this.participants.length < 2) {
    throw new Error('Au moins 2 participants sont required');
  }
  next();
});

// Index pour les requêtes fréquentes
entretienSchema.index({ statut: 1 });
entretienSchema.index({ creePar: 1 });
entretienSchema.index({ creneau: 1 });
entretienSchema.index({ participants: 1 });

module.exports = mongoose.model('Entretien', entretienSchema);