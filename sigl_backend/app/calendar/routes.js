const express = require('express');
const router = express.Router();
const calendarController = require('./controller');

/**
 * Routes pour l'API Calendrier
 * Aucune authentification requise selon les spécifications
 */

// GET /api/calendar/events - Récupérer tous les événements
// Supporte le filtrage par catégorie via query parameter: ?category=réunion
router.get('/events', calendarController.getAllEvents);

// GET /api/calendar/events/:id - Récupérer un événement spécifique par ID
router.get('/events/:id', calendarController.getEventById);

// GET /api/calendar/categories - Récupérer toutes les catégories disponibles
router.get('/categories', calendarController.getCategories);

// GET /api/calendar/events/month/:year/:month - Récupérer les événements d'un mois spécifique
router.get('/events/month/:year/:month', calendarController.getEventsByMonth);

module.exports = router;