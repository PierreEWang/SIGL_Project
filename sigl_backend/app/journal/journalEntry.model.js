const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema(
  {
    // Référence vers l'utilisateur apprenti
    apprenti: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Date de la note (on utilisera la date de création)
    date: {
      type: Date,
      required: true,
    },

    // Contenu JSON stringifié (structure complète des périodes / missions)
    contenu: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
    collection: 'journal_entries', // colle à ta metadata existante
  }
);

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);