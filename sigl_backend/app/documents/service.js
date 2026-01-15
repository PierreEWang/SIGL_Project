const DocumentZone = require('./documentZone.model');
const DocumentSubmission = require('./documentSubmission.model');
const { getTemplateById } = require('./templates');

function validateValues(fields, values) {
  for (const f of fields) {
    if (f.required) {
      const v = values?.[f.key];
      if (v === undefined || v === null || String(v).trim() === '') {
        return `Champ requis manquant : ${f.label}`;
      }
    }
  }
  return null;
}

function cleanFields(fields) {
  if (!Array.isArray(fields)) return [];

  return fields
    .filter((f) => f && String(f.label || '').trim().length > 0)
    .map((f) => {
      const label = String(f.label || '').trim();
      const key = String(f.key || '').trim();

      if (!key) {
        // clé obligatoire côté modèle
        const derived = label
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        return {
          key: derived || `field_${Math.random().toString(16).slice(2)}`,
          label,
          type: f.type || 'text',
          required: !!f.required,
          options: Array.isArray(f.options) ? f.options.map(String) : [],
        };
      }

      return {
        key,
        label,
        type: f.type || 'text',
        required: !!f.required,
        options: Array.isArray(f.options) ? f.options.map(String) : [],
      };
    });
}

async function createZoneForUser(userId, { title, description = '', templateId, fields, allowAttachments }) {
  if (!title || String(title).trim().length < 2) {
    const err = new Error('Titre invalide');
    err.status = 400;
    throw err;
  }

  const trimmedTitle = String(title).trim();
  const trimmedDesc = String(description || '').trim();

  // ✅ Mode template si templateId fourni
  if (templateId) {
    const tpl = getTemplateById(templateId);
    if (!tpl) {
      const err = new Error('Template invalide');
      err.status = 400;
      throw err;
    }

    const zone = await DocumentZone.create({
      apprenti: userId,
      title: trimmedTitle,
      description: trimmedDesc,
      templateId: tpl.id,
      fieldsSnapshot: tpl.fields || [],
      allowAttachments: allowAttachments !== undefined ? !!allowAttachments : true,
    });

    return zone;
  }

  // ✅ Mode custom (ton front actuel)
  const cleaned = cleanFields(fields);
  if (cleaned.length === 0) {
    const err = new Error('Tu dois définir au moins un champ (ou fournir un templateId).');
    err.status = 400;
    throw err;
  }

  const zone = await DocumentZone.create({
    apprenti: userId,
    title: trimmedTitle,
    description: trimmedDesc,
    templateId: 'CUSTOM',
    fieldsSnapshot: cleaned,
    allowAttachments: allowAttachments !== undefined ? !!allowAttachments : true,
  });

  return zone;
}

async function listMyZones(userId) {
  return DocumentZone.find({ apprenti: userId }).sort({ createdAt: -1 }).lean();
}

async function getZoneForUser(userId, zoneId) {
  const zone = await DocumentZone.findOne({ _id: zoneId, apprenti: userId }).lean();
  if (!zone) return null;

  const lastSubmission = await DocumentSubmission.findOne({ zone: zoneId, apprenti: userId })
    .sort({ createdAt: -1 })
    .lean();

  return { zone, lastSubmission };
}

async function submitToZone(userId, zoneId, values, filesMeta) {
  const zone = await DocumentZone.findOne({ _id: zoneId, apprenti: userId }).lean();
  if (!zone) return null;

  const validationMsg = validateValues(zone.fieldsSnapshot || [], values || {});
  if (validationMsg) {
    const err = new Error(validationMsg);
    err.status = 400;
    throw err;
  }

  if (!zone.allowAttachments && filesMeta && filesMeta.length > 0) {
    const err = new Error('Cette zone n’autorise pas les pièces jointes.');
    err.status = 400;
    throw err;
  }

  const submission = await DocumentSubmission.create({
    zone: zoneId,
    apprenti: userId,
    values: values || {},
    files: filesMeta || [],
  });

  return submission;
}

async function findFileOwnedByUser(userId, storageName) {
  return DocumentSubmission.findOne({
    apprenti: userId,
    'files.storageName': storageName,
  }).lean();
}

module.exports = {
  createZoneForUser,
  listMyZones,
  getZoneForUser,
  submitToZone,
  findFileOwnedByUser,
};