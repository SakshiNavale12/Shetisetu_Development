const fs = require('fs').promises;
const path = require('path');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { upload: uploadConfig } = require('../config/config');
const { imageProcessorPool } = require('./workerPool');

/**
 * Process and save image file using worker thread
 */
const processAndSaveImage = async (file, uploadType, subPath = '') => {
  if (!file || !file.buffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid file data');
  }

  // Submit job to worker pool
  const job = {
    buffer: file.buffer,
    originalName: file.originalname,
    uploadType,
    subPath,
    uploadBaseDir: uploadConfig.uploadBaseDir,
    maxWidth: uploadConfig.maxImageWidth,
    maxHeight: uploadConfig.maxImageHeight,
    quality: uploadConfig.imageQuality,
  };

  try {
    const result = await imageProcessorPool.runJob(job);
    return {
      ...result,
      size: file.size,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Image processing failed: ${error.message}`);
  }
};

/**
 * Save document directly without image processing (for PDFs and documents)
 */
const saveDocument = async (file, uploadType, subPath = '') => {
  if (!file || !file.buffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid file data');
  }

  try {
    const { v4: uuidv4 } = require('uuid');
    const fileId = uuidv4();
    const timestamp = Date.now();
    const extension = path.extname(file.originalname) || '.pdf';
    const filename = `${timestamp}-${fileId}${extension}`;

    // Create directory path
    const dirPath = path.join(uploadConfig.uploadBaseDir, uploadType, subPath);
    await fs.mkdir(dirPath, { recursive: true });

    const filepath = path.join(dirPath, filename);

    // Save file directly
    await fs.writeFile(filepath, file.buffer);

    // Generate URL path
    const urlPath = `/uploads/${uploadType}/${subPath}/${filename}`.replace(/\/+/g, '/');

    return {
      url: urlPath,
      filename,
      filepath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Document upload failed: ${error.message}`);
  }
};

/**
 * Upload single file
 */
const uploadFile = async (file, uploadType, options = {}) => {
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file provided');
  }

  const { subPath = '' } = options;

  // For documents (PDFs or images), save directly without processing
  // For other upload types, process images through Sharp
  if (uploadType === 'documents') {
    // If it's a PDF, save directly
    if (file.mimetype === 'application/pdf') {
      return saveDocument(file, uploadType, subPath);
    }
    // If it's an image document, still process it to reduce size
    return processAndSaveImage(file, uploadType, subPath);
  }

  return processAndSaveImage(file, uploadType, subPath);
};

/**
 * Upload multiple files in parallel
 */
const uploadFiles = async (files, uploadType, options = {}) => {
  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files provided');
  }

  if (files.length > uploadConfig.maxFilesPerUpload) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Too many files. Maximum ${uploadConfig.maxFilesPerUpload} files allowed`
    );
  }

  const uploadPromises = files.map((file) => uploadFile(file, uploadType, options));
  return Promise.all(uploadPromises);
};

/**
 * Delete file from filesystem
 */
const deleteFile = async (urlPath) => {
  try {
    // Convert URL path to filesystem path
    const relativePath = urlPath.replace(/^\/uploads\//, '');
    const fullPath = path.join(uploadConfig.uploadBaseDir, relativePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    // File doesn't exist or already deleted
    return false;
  }
};

module.exports = {
  uploadFile,
  uploadFiles,
  deleteFile,
};
