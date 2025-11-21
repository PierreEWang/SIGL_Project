const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { authenticatedUsers } = require('../middleware/authorize');
const journalController = require('./controller');

const router = express.Router();

// Toutes les routes sont protégées : il faut être connecté
router.use(authenticate, authenticatedUsers());

router.post('/', journalController.createJournal);
router.get('/', journalController.getMyJournaux);

module.exports = router;