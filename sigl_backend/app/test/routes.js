const express = require('express');
const router = express.Router();
const testController = require('./controller');

// GET /api/test
router.get('/', testController.getTest);

// POST /api/test
router.post('/', testController.postTest);

module.exports = router;