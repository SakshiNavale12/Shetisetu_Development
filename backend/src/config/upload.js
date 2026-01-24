const path = require('path');
const fs = require('fs');

const UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads');

/**
 * Ensure upload directories exist
 */
const ensureUploadDirs = () => {
  const dirs = ['crop-surveys', 'loss-reports', 'documents', 'panchanama', 'temp'];

  dirs.forEach((dir) => {
    const dirPath = path.join(UPLOAD_BASE_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

module.exports = {
  uploadBaseDir: UPLOAD_BASE_DIR,
  maxFileSize: 5 * 1024 * 1024, // 5MB for images
  maxDocumentSize: 10 * 1024 * 1024, // 10MB for documents
  maxFilesPerUpload: 50, // Maximum 50 images per crop survey
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  allowedDocumentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  imageQuality: 85,
  maxImageWidth: 1920,
  maxImageHeight: 1920,
  workerPoolSize: 4, // Number of worker threads for image processing
  ensureUploadDirs,
};
