const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

/**
 * Upload crop survey photos
 * @param {File[]} files - Array of image files
 * @param {Object} gpsData - GPS coordinates {latitude, longitude, accuracy}
 * @param {Array} metadata - Array of metadata {type, caption} for each file
 * @returns {Promise<Object>} Response with photos array
 */
export const uploadCropSurveyPhotos = async (files, gpsData, metadata) => {
  const formData = new FormData();

  // Add files
  files.forEach((file) => {
    formData.append('photos', file);
  });

  // Add GPS data if available
  if (gpsData && gpsData.latitude && gpsData.longitude) {
    formData.append('gpsData', JSON.stringify(gpsData));
  }

  // Add metadata for each photo
  metadata.forEach((meta, index) => {
    if (meta.type) {
      formData.append(`type_${index}`, meta.type);
    }
    if (meta.caption) {
      formData.append(`caption_${index}`, meta.caption);
    }
  });

  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_URL}/upload/crop-surveys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
};

/**
 * Upload verification documents
 * @param {File} file - Document file
 * @param {string} documentType - Type of document (aadhaar, 7-12, lease, passbook)
 * @returns {Promise<Object>} Response with document URL
 */
export const uploadDocument = async (file, documentType) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_URL}/upload/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
};

/**
 * Add photos to existing crop survey
 * @param {string} surveyId - Survey ID
 * @param {Array} photos - Array of photo objects {url, type, caption, geoLocation}
 * @returns {Promise<Object>} Updated survey
 */
export const addPhotosToCropSurvey = async (surveyId, photos) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_URL}/crop-surveys/${surveyId}/photos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ photos }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add photos');
  }

  return response.json();
};

/**
 * Upload loss report photos
 * @param {File[]} files - Array of image files
 * @param {string} reportId - Loss report ID (optional)
 * @param {Object} gpsData - GPS coordinates
 * @param {Array} metadata - Metadata for each file
 * @returns {Promise<Object>} Response with photos array
 */
export const uploadLossReportPhotos = async (files, reportId, gpsData, metadata) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('photos', file);
  });

  if (reportId) {
    formData.append('reportId', reportId);
  }

  if (gpsData && gpsData.latitude && gpsData.longitude) {
    formData.append('gpsData', JSON.stringify(gpsData));
  }

  metadata.forEach((meta, index) => {
    if (meta.type) {
      formData.append(`type_${index}`, meta.type);
    }
    if (meta.caption) {
      formData.append(`caption_${index}`, meta.caption);
    }
  });

  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_URL}/upload/loss-reports`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
};
