console.log("✅ journal service loaded");
const journalRepository = require('./repository');
const calendarService = require('../calendar/service');
const CalendarEvent = require('../calendar/calendar.model');

const mapJournalEntryToDto = async (entry) => {
  let parsedContent = {};
  try {
    parsedContent = JSON.parse(entry.contenu || '{}');
  } catch (e) {
    parsedContent = { periodes: [], status: 'EN_COURS' };
  }

  const dto = {
    id: entry._id ? entry._id.toString() : null,
    _id: entry._id,
    apprenti: entry.apprenti,
    date: entry.date,
    contenu: entry.contenu,
    periodes: parsedContent.periodes || [],
    status: parsedContent.status || 'EN_COURS',
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    calendarEventId: entry.calendarEventId ?? null,
    history: entry.history || [],
  };

  if (entry.calendarEventId) {
    try {
      const ev = await CalendarEvent.findById(entry.calendarEventId).lean();
      if (ev) {
        dto.calendarEvent = {
          _id: ev._id,
          title: ev.title,
          date: ev.date,
          time: ev.time,
          location: ev.location,
          notes: ev.description || ev.notes || null,
          participantsRaw: ev.participantsRaw || null,
        };
      }
    } catch (e) {
      // ignore errors fetching linked event
      console.error('Failed to fetch linked calendar event for journal', e);
    }
  }

  return dto;
};

const createJournalForUser = async (userId, journalPayload) => {
  // ✅ si jamais le front envoie une string (bug), on refuse proprement
  if (typeof journalPayload === 'string') {
    try {
      journalPayload = JSON.parse(journalPayload);
    } catch {
      const err = new Error('Invalid journal payload (string)');
      err.status = 400;
      throw err;
    }
  }

  const {
    periodes = [],
    status = 'EN_COURS',
    createdAt,
    calendarEventId,
    calendarEvent,
    calendar,
  } = journalPayload || {};

  const date = createdAt ? new Date(createdAt) : new Date();
  const contenu = JSON.stringify({ periodes, status });

  const data = {
    apprenti: userId,
    date,
    contenu,
  };

  // ✅ Création optionnelle d'un événement calendrier (si demandé par le front)
  const calOpt =
    (calendarEvent && calendarEvent.enable) ? calendarEvent :
    (calendar && calendar.enabled) ? calendar :
    null;

  // 1) On crée d'abord le journal
  const entry = await journalRepository.createJournal(data);
  let finalEntry = entry;

  // 2) Si un calendarEventId est fourni explicitement, on le conserve
  if (calendarEventId !== undefined && calendarEventId !== null && calendarEventId !== '') {
    finalEntry = await journalRepository.updateCalendarEventId(entry._id, calendarEventId);
  }

  // 3) Sinon, si option activée côté front, on crée l'événement et on lie au journal
  if (!calendarEventId && calOpt) {
    const toIsoDate = (d) => {
      if (!d) return null;

      // accepte 'YYYY-MM-DD' ou Date
      if (typeof d === 'string') {
        // si format DD/MM/YYYY, on tente de le convertir
        const m = d.match(/^\d{2}\/\d{2}\/\d{4}$/);
        if (m) {
          const [dd, mm, yyyy] = d.split('/');
          return `${yyyy}-${mm}-${dd}`;
        }
        return d.slice(0, 10);
      }

      return new Date(d).toISOString().slice(0, 10);
    };

    // date par défaut = dateDebut de la 1ère période, sinon createdAt/now
    const fallbackDate =
      toIsoDate(periodes?.[0]?.dateDebut) ||
      toIsoDate(createdAt) ||
      toIsoDate(new Date());

    const eventPayload = {
      title: calOpt.title || 'Journal de formation',
      description: calOpt.notes || calOpt.description || '',
      date: toIsoDate(calOpt.date) || fallbackDate,
      time: calOpt.time || null,
      location: calOpt.location || null,
      category: calOpt.category || 'formation',
      journalId: entry._id,
    };

    const createdEvent = await calendarService.createEvent(userId, eventPayload);

    if (createdEvent?.success && createdEvent?.data?._id) {
      finalEntry = await journalRepository.updateCalendarEventId(entry._id, createdEvent.data._id);
    }
  }

  return mapJournalEntryToDto(finalEntry);
};

const getJournauxForUser = async (userId) => {
  const entries = await journalRepository.findByApprenti(userId);
  const validEntries = entries.filter(e => e._id);
  const results = await Promise.all(validEntries.map((e) => mapJournalEntryToDto(e)));
  return results;
};

const getJournalForUser = async (userId, id) => {
  const entry = await journalRepository.findOneByIdAndApprenti(id, userId);
  if (!entry) {
    const err = new Error('Journal not found');
    err.status = 404;
    throw err;
  }
  return await mapJournalEntryToDto(entry);
};

const updateJournalForUser = async (userId, id, updatePayload) => {
  // Récupérer le journal existant
  const existingEntry = await journalRepository.findOneByIdAndApprenti(id, userId);
  if (!existingEntry) {
    const err = new Error('Journal not found');
    err.status = 404;
    throw err;
  }

  // Préparer les données de mise à jour
  const updateData = {};

  if (updatePayload.contenu !== undefined) {
    // Sauvegarder l'ancien contenu dans l'historique
    const historyEntry = {
      timestamp: new Date(),
      contenu: existingEntry.contenu,
      modifiedBy: userId,
    };

    updateData.$push = { history: historyEntry };
    updateData.contenu = updatePayload.contenu;
  }

  if (updatePayload.date !== undefined) {
    updateData.date = new Date(updatePayload.date);
  }

  if (updatePayload.calendarEventId !== undefined) {
    updateData.calendarEventId = updatePayload.calendarEventId;
  }

  // Mettre à jour
  const updatedEntry = await journalRepository.updateJournal(id, updateData);
  return mapJournalEntryToDto(updatedEntry);
};

const deleteJournalForUser = async (userId, id) => {
  const entry = await journalRepository.findOneByIdAndApprenti(id, userId);
  if (!entry) {
    const err = new Error('Journal not found');
    err.status = 404;
    throw err;
  }

  await journalRepository.deleteJournal(id);
};

module.exports = {
  createJournalForUser,
  getJournauxForUser,
  getJournalForUser,
  updateJournalForUser,
  deleteJournalForUser,
};