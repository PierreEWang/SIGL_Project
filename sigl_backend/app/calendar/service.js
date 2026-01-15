const CalendarEvent = require('./calendar.model');

const createEvent = async (userId, eventData) => {
  try {
    const event = new CalendarEvent({
      ...eventData,
      userId,
    });
    await event.save();
    return { success: true, data: event };
  } catch (error) {
    console.error('Service createEvent error:', error);
    return { success: false, error: 'Échec de la création de l\'événement', details: error.message };
  }
};

const getUserEvents = async (userId) => {
  try {
    const events = await CalendarEvent.find({ userId }).sort({ date: 1, time: 1 });
    return { success: true, data: events };
  } catch (error) {
    console.error('Service getUserEvents error:', error);
    return { success: false, error: 'Échec de la récupération des événements' };
  }
};

const updateEvent = async (eventId, userId, updateData) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: eventId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!event) {
      return { success: false, error: 'Événement non trouvé' };
    }
    return { success: true, data: event };
  } catch (error) {
    console.error('Service updateEvent error:', error);
    return { success: false, error: 'Échec de la mise à jour de l\'événement' };
  }
};

const deleteEvent = async (eventId, userId) => {
  try {
    const result = await CalendarEvent.findOneAndDelete({ _id: eventId, userId });
    if (!result) {
      return { success: false, error: 'Événement non trouvé' };
    }
    return { success: true, message: 'Événement supprimé avec succès' };
  } catch (error) {
    console.error('Service deleteEvent error:', error);
    return { success: false, error: 'Échec de la suppression de l\'événement' };
  }
};

module.exports = {
  createEvent,
  getUserEvents,
  updateEvent,
  deleteEvent,
};