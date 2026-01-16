// sigl_backend/app/journal/journalEntry.model.js
const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema(
  {
    apprenti: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    // ✅ Compat: accepte Number (ancien), string/ObjectId (futur)
    // Évite de casser la création si un jour tu stockes un ObjectId.
    calendarEventId: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      index: true,
      default: null,
    },

    contenu: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 10000,
    },

    // Deadline de formation
    deadline: {
      type: Date,
      required: false,
      index: true,
    },

    // Historique des modifications
    history: [{
      timestamp: {
        type: Date,
        default: Date.now,
      },
      contenu: {
        type: String,
        required: true,
      },
      modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }],
  },
  {
    timestamps: true,
    collection: 'journal_entries',
  }
);

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);