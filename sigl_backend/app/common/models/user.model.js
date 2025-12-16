// sigl_backend/app/common/models/user.model.js
const mongoose = require('mongoose');

const VALID_ROLES = ['APPRENTI', 'MA', 'TP', 'CA', 'RC', 'PROF', 'ADMIN'];

const utilisateurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide"],
    },

    // Nouveau : prénom / nom de famille décomposés
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },

    // Avatar (data URL ou URL)
    avatar: {
      type: String,
      default: null,
    },

    // MFA
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaMethod: {
      type: String,
      enum: ['sms', 'email', null],
      default: null,
    },
    mfaCode: {
      type: String,
      default: null,
    },
    mfaCodeExpiresAt: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      sparse: true,
    },

    // Email vérifié
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Rôle métier
    role: {
      type: String,
      required: true,
      enum: VALID_ROLES,
      default: 'APPRENTI',
    },

    // Champs spécifiques / legacy
    idApprenti: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
    numero: {
      type: String,
      sparse: true,
    },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
    entreprise: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
    fonction: {
      type: String,
      sparse: true,
    },
    specialite: {
      type: String,
      sparse: true,
    },
    service: {
      type: String,
      sparse: true,
    },
    departement: {
      type: String,
      sparse: true,
    },
    grade: {
      type: String,
      sparse: true,
    },
    habilitations: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: 'utilisateurs',
  }
);

utilisateurSchema.index({ role: 1 });

// Retirer les champs sensibles / inutiles côté front
utilisateurSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.mfaCode;
  delete obj.mfaCodeExpiresAt;
  return obj;
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);