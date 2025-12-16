const express = require('express');
const router = express.Router();
const entretienController = require('./entretien.controller');
const { authenticate } = require('../middleware/authenticate');

// POST /api/entretiens - Demander un entretien
router.post('/', authenticate, entretienController.demanderEntretien);

// GET /api/entretiens/mes-entretiens - Obtenir mes entretiens
router.get('/mes-entretiens', authenticate, entretienController.getMesEntretiens);

// PUT /api/entretiens/:id/confirmer - Confirmer un entretien
router.put('/:id/confirmer', authenticate, entretienController.confirmerEntretien);

// PUT /api/entretiens/:id/annuler - Annuler un entretien
router.put('/:id/annuler', authenticate, entretienController.annulerEntretien);

module.exports = router;