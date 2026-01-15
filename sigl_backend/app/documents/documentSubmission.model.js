// sigl_backend/app/documents/documentSubmission.model.js
const mongoose = require('mongoose');

const SubmissionFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageName: { type: String, required: true }, // nom du fichier sur disque
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const DocumentSubmissionSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentZone', required: true, index: true },
    apprenti: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    values: { type: Object, default: {} }, // { key: value }
    files: { type: [SubmissionFileSchema], default: [] },
  },
  { timestamps: true, collection: 'document_submissions' }
);

module.exports = mongoose.model('DocumentSubmission', DocumentSubmissionSchema);