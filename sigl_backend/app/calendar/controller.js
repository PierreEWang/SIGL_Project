const events = require('./data');
const calendarService = require('./service');

// ============================================
// FONCTIONS PUBLIQUES (événements hardcodés)
// ============================================

/**
 * Récupère tous les événements hardcodés
 */
const getAllEvents = (req, res) => {
  try {
    console.log('Récupération de tous les événements - IP:', req.ip);
    
    const { category } = req.query;
    let filteredEvents = events;

    if (category) {
      filteredEvents = events.filter(
        (event) => event.category.toLowerCase() === category.toLowerCase()
      );
      console.log(`Filtrage par catégorie ${category} - ${filteredEvents.length} événements trouvés`);
    }

    // Tri par date
    filteredEvents.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    res.status(200).json({
      success: true,
      message: 'Événements récupérés avec succès',
      count: filteredEvents.length,
      data: filteredEvents,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer les événements',
    });
  }
};

/**
 * Récupère un événement hardcodé par son ID
 */
const getEventById = (req, res) => {
  try {
    const { id } = req.params;
    const event = events.find((e) => e.id === parseInt(id));

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé',
        message: `Aucun événement trouvé avec l'ID ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: 'Impossible de récupérer l\'événement',
    });
  }
};

/**
 * Récupère toutes les catégories disponibles
 */
const getCategories = (req, res) => {
  try {
    const categories = ['réunion', 'rendez-vous', 'culturel', 'formation', 'entretien', 'soutenance'];

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * Récupère les événements hardcodés d'un mois spécifique
 */
const getEventsByMonth = (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Validation
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres invalides',
        message: 'Année et mois doivent être des nombres valides',
      });
    }

    // Filtrer les événements par année et mois
    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === yearNum &&
        eventDate.getMonth() + 1 === monthNum
      );
    });

    // Tri par date
    filteredEvents.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA - dateB;
    });

    res.status(200).json({
      success: true,
      count: filteredEvents.length,
      data: filteredEvents,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements du mois:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
};

// ============================================
// FONCTIONS UTILISATEUR (événements MongoDB)
// ============================================

/**
 * Crée un événement pour l'utilisateur connecté
 */
const createUserEvent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await calendarService.createEvent(userId, req.body);

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Événement créé avec succès',
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
        details: result.details,
      });
    }
  } catch (error) {
    console.error('createUserEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * Récupère les événements de l'utilisateur connecté
 */
const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await calendarService.getUserEvents(userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('getUserEvents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * Met à jour un événement de l'utilisateur
 */
const updateUserEvent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const result = await calendarService.updateEvent(id, userId, req.body);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Événement mis à jour avec succès',
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('updateUserEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
};

/**
 * Supprime un événement de l'utilisateur
 */
const deleteUserEvent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const result = await calendarService.deleteEvent(id, userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('deleteUserEvent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Événements publics (hardcodés)
  getAllEvents,
  getEventById,
  getCategories,
  getEventsByMonth,
  
  // Événements utilisateur (MongoDB)
  createUserEvent,
  getUserEvents,
  updateUserEvent,
  deleteUserEvent,
};