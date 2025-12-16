const journalRepository = require('./repository');

/**
 * Transforme le payload du front en document MongoDB
 */
const createJournalForUser = async (userId, journalPayload) => {
  const {
    periodes = [],
    status = 'EN_COURS',
    createdAt,
  } = journalPayload || {};

  const date = createdAt ? new Date(createdAt) : new Date();

  const contenu = JSON.stringify({
    periodes,
    status,
  });

  const entry = await journalRepository.createJournal({
    apprenti: userId,
    date,
    contenu,
  });

  return mapJournalEntryToDto(entry);
};

/**
 * Récupère tous les journaux de l'utilisateur
 */
const getJournauxForUser = async (userId) => {
  const docs = await journalRepository.findByApprenti(userId);
  return docs.map(mapJournalEntryToDto);
};

/**
 * Mapping MongoDB -> objet que le front comprend
 */
const mapJournalEntryToDto = (doc) => {
  let parsed = {};
  try {
    parsed = JSON.parse(doc.contenu || '{}');
  } catch (e) {
    parsed = {};
  }

  return {
    id: doc._id.toString(),
    userId: doc.apprenti.toString(),
    createdAt: doc.date,
    updatedAt: doc.updatedAt,
    periodes: parsed.periodes || [],
    status: parsed.status || 'EN_COURS',
  };
};

module.exports = {
  createJournalForUser,
  getJournauxForUser,
};