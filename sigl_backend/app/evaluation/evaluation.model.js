const mongoose = require('mongoose');

// Schéma d'évaluation d'un entretien
const evaluationSchema = new mongoose.Schema({
  entretien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entretien',
    required: true,
    unique: true
  },
  evaluateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  dateEvaluation: {
    type: Date,
    default: Date.now
  },
  // Critères d'évaluation
  diagnostiquer: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
    description: "Capacité à diagnostiquer (0-5)"
  },
  produire: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
    description: "Capacité à produire (0-5)"
  },
  valider: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
    description: "Capacité à valider (0-5)"
  },
  adapter: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
    description: "Capacité à s'adapter (0-5)"
  },
  communiquer: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
    description: "Capacité à communiquer (0-5)"
  },
  // Score global calculé
  scoreGlobal: {
    type: Number,
    min: 0,
    max: 5,
    description: "Moyenne des critères"
  },
  // Commentaires et observations
  pointsForts: {
    type: String,
    maxlength: 1000,
    description: "Points positifs observés"
  },
  axesAmelioration: {
    type: String,
    maxlength: 1000,
    description: "Axes à améliorer"
  },
  commentairesGeneral: {
    type: String,
    maxlength: 2000,
    description: "Commentaires généraux"
  },
  // Recommandation
  recommandation: {
    type: String,
    enum: ['VALIDER', 'REDISCUTER', 'REJETER'],
    required: true,
    description: "Recommandation suite à l'évaluation"
  },
  // Suivi
  etat: {
    type: String,
    enum: ['BROUILLON', 'SOUMISE', 'APPROUVEE', 'REJETEE'],
    default: 'BROUILLON',
    description: "État de l'évaluation"
  },
  dateValidation: {
    type: Date,
    description: "Date de validation/approbation"
  },
  validePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    description: "Utilisateur qui a approuvé l'évaluation"
  }
}, {
  timestamps: true,
  collection: 'evaluations'
});

// Middleware pour calculer le score global avant sauvegarde
evaluationSchema.pre('save', function(next) {
  if (this.diagnostiquer !== undefined && this.produire !== undefined && 
      this.valider !== undefined && this.adapter !== undefined && 
      this.communiquer !== undefined) {
    this.scoreGlobal = (
      this.diagnostiquer + 
      this.produire + 
      this.valider + 
      this.adapter + 
      this.communiquer
    ) / 5;
  }
  next();
});

// Index pour les requêtes fréquentes
evaluationSchema.index({ entretien: 1 });
evaluationSchema.index({ evaluateur: 1 });
evaluationSchema.index({ etat: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
