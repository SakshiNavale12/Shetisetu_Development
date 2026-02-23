const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { uploadService, farmerService } = require('../services');
const ApiError = require('../utils/ApiError');
const documentScannerService = require('../services/documentScanner.service');
const geoVerificationService = require('../services/geoVerification.service');
const { uploadBaseDir } = require('../config/upload');

/**
 * Upload files for crop survey
 */
const uploadCropSurveyPhotos = catchAsync(async (req, res) => {
  const farmer = await farmerService.getFarmerByUserId(req.user.id);
  if (!farmer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Farmer profile required to upload photos');
  }

  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files provided');
  }

  const year = new Date().getFullYear();

  // Upload files using worker pool
  const uploadedFiles = await uploadService.uploadFiles(files, 'crop-surveys', {
    subPath: `${farmer._id}/${year}`,
  });

  // Parse GPS data if provided
  const gpsData = req.body.gpsData ? JSON.parse(req.body.gpsData) : null;

  // Build photo objects with metadata
  const photos = uploadedFiles.map((file, index) => ({
    url: file.url,
    type: req.body[`type_${index}`] || 'crop',
    caption: req.body[`caption_${index}`] || '',
    geoLocation: gpsData || file.exifGps || null,
    capturedAt: new Date(),
  }));

  res.status(httpStatus.OK).send({ photos });
});

/**
 * Upload files for loss report
 */
const uploadLossReportPhotos = catchAsync(async (req, res) => {
  const farmer = await farmerService.getFarmerByUserId(req.user.id);
  if (!farmer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Farmer profile required to upload photos');
  }

  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files provided');
  }

  const reportId = req.body.reportId || 'temp';

  const uploadedFiles = await uploadService.uploadFiles(files, 'loss-reports', {
    subPath: `${farmer._id}/${reportId}`,
  });

  const gpsData = req.body.gpsData ? JSON.parse(req.body.gpsData) : null;

  // Build photo objects with geoLocation (prefer supplied GPS over EXIF)
  const photos = uploadedFiles.map((file, index) => {
    const geoLocation = gpsData || file.exifGps || null;
    return {
      url: file.url,
      type: req.body[`type_${index}`] || 'damage',
      caption: req.body[`caption_${index}`] || '',
      geoLocation,
      capturedAt: new Date(),
    };
  });

  // Geo-verification: validate each photo's location against the farmer's district
  const farmerLocation = {
    district: farmer.district,
    taluka: farmer.taluka,
    village: farmer.village,
  };

  const photosWithVerification = photos.map((photo) => {
    const verification = geoVerificationService.verifyPhotoLocation(
      photo.geoLocation,
      farmerLocation
    );
    return { ...photo, geoVerification: verification };
  });

  const verificationSummary = geoVerificationService.buildVerificationSummary(
    photosWithVerification.map((p) => p.geoVerification)
  );

  res.status(httpStatus.OK).send({ photos: photosWithVerification, geoVerificationSummary: verificationSummary });
});

/**
 * Upload verification documents
 */
const uploadDocuments = catchAsync(async (req, res) => {
  const farmer = await farmerService.getFarmerByUserId(req.user.id);
  if (!farmer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Farmer profile required to upload documents');
  }

  const file = req.file;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file provided');
  }

  const documentType = req.body.documentType; // 'aadhaar', 'pan', '7-12', '8-A', 'lease', 'passbook'

  if (!documentType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Document type required');
  }

  const uploadedFile = await uploadService.uploadFile(file, 'documents', {
    subPath: `${farmer._id}/${documentType}`,
  });

  // Update farmer's documents field
  if (!farmer.documents) {
    farmer.documents = {};
  }
  farmer.documents[documentType] = {
    url: uploadedFile.url,
    filename: uploadedFile.filename,
    uploadedAt: new Date(),
  };

  // Mark scan as pending before saving
  if (!farmer.documentScans) {
    farmer.documentScans = {};
  }
  farmer.documentScans[documentType] = {
    scanStatus: 'pending',
    scannedAt: null,
  };

  await farmer.save();

  // Trigger background OCR scan (non-blocking)
  const scannableTypes = ['aadhaar', 'pan', '7-12', 'passbook'];
  if (scannableTypes.includes(documentType)) {
    documentScannerService.triggerBackgroundScan(
      farmer,
      documentType,
      uploadedFile.url,
      uploadedFile.mimeType || file.mimetype,
      uploadBaseDir
    );
  }

  res.status(httpStatus.OK).send({
    url: uploadedFile.url,
    documentType,
    filename: uploadedFile.filename,
    uploadedAt: new Date(),
    scanStatus: 'pending',
  });
});

module.exports = {
  uploadCropSurveyPhotos,
  uploadLossReportPhotos,
  uploadDocuments,
};
