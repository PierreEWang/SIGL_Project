// sigl_backend/app/documents/controller.js
const path = require('path');
const fs = require('fs');

const service = require('./service');
const { listTemplates } = require('./templates');
const { UPLOAD_ROOT } = require('./storage');

const getTemplates = async (req, res, next) => {
  try {
    return res.json({ templates: listTemplates() });
  } catch (e) {
    return next(e);
  }
};

const listZones = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const zones = await service.listMyZones(userId);
    return res.json({ zones });
  } catch (e) {
    return next(e);
  }
};

const createZone = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { title, description, templateId, fields, allowAttachments } = req.body;

    const zone = await service.createZoneForUser(userId, {
      title,
      description,
      templateId,
      fields,
      allowAttachments,
    });

    return res.status(201).json({ zone });
  } catch (e) {
    return next(e);
  }
};

const getZone = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const data = await service.getZoneForUser(userId, req.params.id);
    if (!data) return res.status(404).json({ message: 'Zone introuvable' });
    return res.json(data);
  } catch (e) {
    return next(e);
  }
};

const submit = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const zoneId = req.params.id;

    // values envoyé en JSON string dans FormData
    const valuesRaw = req.body?.values || '{}';
    let values = {};
    try {
      values = JSON.parse(valuesRaw);
    } catch {
      values = {};
    }

    const filesMeta = (req.files || []).map((f) => ({
      originalName: f.originalname,
      storageName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
    }));

    const submission = await service.submitToZone(userId, zoneId, values, filesMeta);
    if (!submission) return res.status(404).json({ message: 'Zone introuvable' });

    return res.status(201).json({ submission });
  } catch (e) {
    return next(e);
  }
};

const download = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const storageName = req.params.storageName;

    const owned = await service.findFileOwnedByUser(userId, storageName);
    if (!owned) return res.status(404).json({ message: 'Fichier introuvable' });

    const filePath = path.join(UPLOAD_ROOT, storageName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Fichier introuvable (disque)' });

    return res.download(filePath);
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  getTemplates,
  listZones,
  createZone,
  getZone,
  submit,
  download,
};