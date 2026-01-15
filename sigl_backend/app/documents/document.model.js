const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },          // ex: "companyName"
    label: { type: String, required: true },        // ex: "Nom entreprise"
    type: { type: String, enum: ['text','textarea','date','number'], default: 'text' },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },         // chemin local (uploads/..)
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    values: { type: Object, default: {} },          // { fieldKey: value }
    files: { type: [fileSchema], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const documentZoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    fields: { type: [fieldSchema], default: [] },
    submissions: { type: [submissionSchema], default: [] },
  },
  { timestamps: true, collection: 'documents' }
);

module.exports = mongoose.model('DocumentZone', documentZoneSchema);