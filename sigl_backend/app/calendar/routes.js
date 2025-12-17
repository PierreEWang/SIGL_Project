const express = require('express');
const router = express.Router();
const calendarController = require('./controller');
const { authenticate } = require('../middleware/authenticate');

// Routes publiques (événements hardcodés)
router.get('/events', calendarController.getAllEvents);
router.get('/events/:id', calendarController.getEventById);
router.get('/categories', calendarController.getCategories);
router.get('/events/month/:year/:month', calendarController.getEventsByMonth);

// Routes protégées (événements utilisateur)
router.post('/my-events', authenticate, calendarController.createUserEvent);
router.get('/my-events', authenticate, calendarController.getUserEvents);
router.put('/my-events/:id', authenticate, calendarController.updateUserEvent);
router.delete('/my-events/:id', authenticate, calendarController.deleteUserEvent);

module.exports = router;