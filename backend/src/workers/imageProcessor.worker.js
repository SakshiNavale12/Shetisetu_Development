const { parentPort } = require('worker_threads');
const sharp = require('sharp');
const ExifParser = require('exif-parser');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Extract GPS data from image EXIF
 */
const extractGpsFromExif = async (buffer) => {
  try {
    const parser = ExifParser.create(buffer);
    const result = parser.parse();

    if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
      return {
        latitude: result.tags.GPSLatitude,
        longitude: result.tags.GPSLongitude,
        accuracy: null, // EXIF doesn't provide accuracy
      };
    }
  } catch (error) {
    // No EXIF data or parsing failed
    return null;
  }
  return null;
};

/**
 * Process image: resize, compress, save
 */
const processImage = async (job) => {
  const { buffer, originalName, uploadType, subPath, uploadBaseDir, maxWidth, maxHeight, quality } = job;

  try {
    const fileId = uuidv4();
    const timestamp = Date.now();
    const filename = `${timestamp}-${fileId}.jpg`;

    // Create directory path
    const dirPath = path.join(uploadBaseDir, uploadType, subPath);
    await fs.mkdir(dirPath, { recursive: true });

    const filepath = path.join(dirPath, filename);

    // Process image with sharp
    await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toFile(filepath);

    // Extract EXIF GPS data before processing strips it
    const exifGps = await extractGpsFromExif(buffer);

    // Generate URL path (relative)
    const urlPath = `/uploads/${uploadType}/${subPath}/${filename}`.replace(/\/+/g, '/');

    return {
      success: true,
      result: {
        url: urlPath,
        filename,
        filepath,
        originalName,
        mimeType: 'image/jpeg',
        exifGps,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Listen for messages from main thread
parentPort.on('message', async (job) => {
  const result = await processImage(job);
  parentPort.postMessage(result);
});
