const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  time: {
    type: String, // Format: HH:MM
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    enum: ['réunion', 'rendez-vous', 'culturel', 'formation'],
    default: 'formation',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
  },
  journalId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  entretienId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entretien',
    default: null,
  },
}, {
  timestamps: true,
  collection: 'calendarevents',
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);