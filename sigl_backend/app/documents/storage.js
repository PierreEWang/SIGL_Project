// sigl_backend/app/documents/storage.js
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'documents');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  }
}

module.exports = {
  UPLOAD_ROOT,
  ensureUploadDir,
};