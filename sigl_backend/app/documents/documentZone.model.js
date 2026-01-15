// sigl_backend/app/documents/documentZone.model.js
const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true }, // text | textarea | number | date | select
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] }, // pour select
  },
  { _id: false }
);

const documentZoneSchema = new mongoose.Schema(
  {
    apprenti: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true },
    description: { type: String, default: '' },

    // si tu veux templates plus tard
    templateId: { type: String, default: 'CUSTOM' },

    // snapshot des champs demandés
    fieldsSnapshot: { type: [fieldSchema], default: [] },

    // ✅ nouveau : autoriser / non les pièces jointes
    allowAttachments: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentZone', documentZoneSchema);