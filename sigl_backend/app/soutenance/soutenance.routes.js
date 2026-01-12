const express = require('express');
const router = express.Router();
const soutenanceController = require('./soutenance.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorizeRoles } = require('../middleware/authorize');

// POST /api/soutenances - Planifier une soutenance (CA, RC, ADMIN)
router.post('/',
    authenticate,
    authorizeRoles('CA', 'RC', 'ADMIN'),
    soutenanceController.planifierSoutenance
);

// GET /api/soutenances - Obtenir toutes les soutenances (staff)
router.get('/',
    authenticate,
    authorizeRoles('CA', 'RC', 'PROF', 'ADMIN'),
    soutenanceController.getAllSoutenances
);

// GET /api/soutenances/ma-soutenance - Obtenir ma soutenance (apprenti)
router.get('/ma-soutenance', authenticate, soutenanceController.getMaSoutenance);

// PUT /api/soutenances/:id/valider - Valider une soutenance (RC, ADMIN)
router.put('/:id/valider',
    authenticate,
    authorizeRoles('RC', 'ADMIN'),
    soutenanceController.validerSoutenance
);

module.exports = router;