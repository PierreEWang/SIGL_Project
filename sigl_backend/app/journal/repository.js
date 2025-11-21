const JournalEntry = require('./journalEntry.model');

const createJournal = async (data) => {
  const entry = new JournalEntry(data);
  return entry.save();
};

const findByApprenti = async (apprentiId) => {
  return JournalEntry.find({ apprenti: apprentiId }).sort({ date: -1 });
};

const findOneByIdAndApprenti = async (id, apprentiId) => {
  return JournalEntry.findOne({ _id: id, apprenti: apprentiId });
};

module.exports = {
  createJournal,
  findByApprenti,
  findOneByIdAndApprenti,
};