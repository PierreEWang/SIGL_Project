// sigl_backend/app/documents/templates.js
// Templates FIXES (B). Tu remplaceras/complèteras plus tard avec tes vrais templates.

const TEMPLATES = [
  {
    id: 'S5_JOURNAL',
    name: 'Journal de formation - Semestre 5',
    description: 'Journal de formation S5 (champs fixes)',
    fields: [
      { key: 'periodeLabel', label: 'Intitulé de la période', type: 'text', required: true },
      { key: 'dateDebut', label: 'Date de début', type: 'date', required: true },
      { key: 'dateFin', label: 'Date de fin', type: 'date', required: true },
      { key: 'missions', label: 'Missions (résumé)', type: 'textarea', required: true },
      { key: 'competences', label: 'Compétences mobilisées', type: 'textarea', required: false },
      { key: 'bilan', label: 'Bilan', type: 'textarea', required: false },
    ],
    files: {
      requiredCount: 0,
      maxCount: 10,
      maxSizeMb: 25,
      allowedMime: ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
  },
  {
    id: 'GENERIC_DEPOT',
    name: 'Dépôt générique (CV / Rapport)',
    description: 'Zone simple : commentaire + fichiers',
    fields: [
      { key: 'commentaire', label: 'Commentaire', type: 'textarea', required: false },
    ],
    files: {
      requiredCount: 1,
      maxCount: 10,
      maxSizeMb: 25,
      allowedMime: ['application/pdf', 'image/png', 'image/jpeg', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
  },
];

function listTemplates() {
  return TEMPLATES.map(({ id, name, description, fields, files }) => ({
    id, name, description, fields, files,
  }));
}

function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

module.exports = {
  listTemplates,
  getTemplateById,
};