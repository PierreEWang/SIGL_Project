// sigl_frontend/src/services/documentService.js
import api from './Api';

const documentsService = {
  // Zones
  async listZones() {
    const res = await api.get('/documents/zones');
    return res.data?.zones ?? res.data ?? [];
  },

  async createZone(payload) {
    const res = await api.post('/documents/zones', payload);
    return res.data?.zone ?? res.data;
  },

  // NOTE: the backend returns a payload (eg. { zone, lastSubmission }) for GET /zones/:id
  // keep full response data so callers can access both `zone` and `lastSubmission`.
  async getZone(id) {
    const res = await api.get(`/documents/zones/${id}`);
    return res.data;
  },

  // Accept either (zoneId, { values, files }) or (zoneId, values, files)
  async submitToZone(zoneId, valuesOrObj, files) {
    let values = {};
    let fList = [];

    if (valuesOrObj && typeof valuesOrObj === 'object' && !Array.isArray(valuesOrObj) && (valuesOrObj.values !== undefined || valuesOrObj.files !== undefined)) {
      values = valuesOrObj.values || {};
      fList = valuesOrObj.files || [];
    } else {
      values = valuesOrObj || {};
      fList = files || [];
    }

    const form = new FormData();
    form.append('values', JSON.stringify(values || {}));
    (fList || []).forEach((f) => form.append('files', f));

    const res = await api.post(`/documents/zones/${zoneId}/submit`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data?.submission ?? res.data;
  },

  async downloadFile(storageName) {
    // Téléchargement protégé (Authorization) -> blob
    const res = await api.get(`/documents/files/${storageName}`, { responseType: 'blob' });
    return res.data;
  },

  // Helper pour obtenir une URL publique si besoin
  getDownloadUrl(storageName) {
    return `${api.defaults.baseURL}/documents/files/${storageName}`;
  },

  // Alias attendu par le frontend (ex: DocumentZoneDetailPage)
  fileDownloadUrl(storageName) {
    return this.getDownloadUrl(storageName);
  },
};

export default documentsService;