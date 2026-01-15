// sigl_backend/app/journal/repository.js
const JournalEntry = require('./journalEntry.model');

const assertPlainObject = (value, name) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const err = new Error(`${name} must be an object`);
    err.status = 400;
    throw err;
  }
};

const createJournal = async (data) => {
  // ✅ Empêche le crash si data est string / null / array
  assertPlainObject(data, 'Journal payload');

  return JournalEntry.create(data);
};

const findByApprenti = async (apprentiId) => {
  return JournalEntry.find({ apprenti: apprentiId }).sort({ date: -1 }).lean();
};

const findOneByIdAndApprenti = async (id, apprentiId) => {
  return JournalEntry.findOne({ _id: id, apprenti: apprentiId }).lean();
};

// optionnel si tu l'utilises plus tard
const updateCalendarEventId = async (id, calendarEventId) => {
  return JournalEntry.findByIdAndUpdate(
    id,
    { calendarEventId: calendarEventId ?? null },
    { new: true }
  );
};

const updateJournal = async (id, updateData) => {
  return JournalEntry.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteJournal = async (id) => {
  return JournalEntry.findByIdAndDelete(id);
};

module.exports = {
  createJournal,
  findByApprenti,
  findOneByIdAndApprenti,
  updateCalendarEventId,
  updateJournal,
  deleteJournal,
};