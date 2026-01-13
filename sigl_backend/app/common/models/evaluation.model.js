const mongoose = require('mongoose');

/**
 * Modèle d'évaluation
 * Une évaluation est créée par un tuteur (TP) pour un étudiant (APPRENTI)
 */
const evaluationSchema = new mongoose.Schema(
  {
    // Référence au tuteur qui a créé l'évaluation
    tuteurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      index: true,
    },
    
    // Référence à l'étudiant évalué
    etudiantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      index: true,
    },
    
    // Note sur 20
    note: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
    },
    
    // Commentaire du tuteur
    commentaire: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Compétences validées
    competences: [
      {
        id: { type: Number, required: true },
        nom: { type: String, required: true },
        validee: { type: Boolean, required: true },
      },
    ],
    
    // Statut de lecture par l'étudiant
    luParEtudiant: {
      type: Boolean,
      default: false,
    },
    
    // Date de lecture
    dateLecture: {
      type: Date,
      default: null,
    },
    
    // Période d'évaluation (optionnel)
    periode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'evaluations',
  }
);

// Index composé pour retrouver rapidement les évaluations d'un étudiant
evaluationSchema.index({ etudiantId: 1, createdAt: -1 });

// Index composé pour retrouver rapidement les évaluations d'un tuteur
evaluationSchema.index({ tuteurId: 1, createdAt: -1 });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
