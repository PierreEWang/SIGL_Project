// sigl_backend/app/documents/routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');

const controller = require('./controller');
const { ensureUploadDir, UPLOAD_ROOT } = require('./storage');

// ✅ Auth seulement (B: apprenti autorisé)
const { authenticate } = require('../middleware/authenticate'); // adapte si ton export diffère

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_ROOT),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

const router = express.Router();

router.get('/templates', authenticate, controller.getTemplates);

router.get('/zones', authenticate, controller.listZones);
router.post('/zones', authenticate, controller.createZone);

router.get('/zones/:id', authenticate, controller.getZone);
router.post('/zones/:id/submit', authenticate, upload.array('files', 10), controller.submit);

router.get('/files/:storageName', authenticate, controller.download);

module.exports = router;