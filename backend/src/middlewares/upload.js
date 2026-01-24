const multer = require('multer');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { upload: uploadConfig } = require('../config/config');

// Initialize upload directories
uploadConfig.ensureUploadDirs();

// Memory storage for processing before saving
const storage = multer.memoryStorage();

/**
 * File filter for validation
 */
const fileFilter = (req, file, cb) => {
  // Check file type based on upload context
  const isDocument = req.path.includes('documents');
  const allowedTypes = isDocument ? uploadConfig.allowedDocumentTypes : uploadConfig.allowedMimeTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(httpStatus.BAD_REQUEST, `Invalid file type. Allowed: ${allowedTypes.join(', ')}`),
      false
    );
  }
};

// Create multer upload instance for images
const upload = multer({
  storage,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
  fileFilter,
});

// Create multer upload instance for documents with larger size limit
const uploadDoc = multer({
  storage,
  limits: {
    fileSize: uploadConfig.maxDocumentSize,
  },
  fileFilter,
});

/**
 * Middleware for single file upload
 */
const uploadSingle = (fieldName = 'file') => {
  // Use larger limit for document field
  const uploader = (fieldName === 'document') ? uploadDoc : upload;
  return uploader.single(fieldName);
};

/**
 * Middleware for multiple files upload
 */
const uploadMultiple = (fieldName = 'files', maxCount = uploadConfig.maxFilesPerUpload) =>
  upload.array(fieldName, maxCount);

module.exports = {
  uploadSingle,
  uploadMultiple,
};
