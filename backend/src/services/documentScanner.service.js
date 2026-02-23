const fs = require('fs').promises;
const path = require('path');
const { createWorker } = require('tesseract.js');
const logger = require('../config/logger');

/**
 * Extract text from image file using Tesseract OCR
 * @param {string} filePath - Absolute path to the image file
 * @returns {Promise<{text: string, confidence: number}>}
 */
const extractTextFromImage = async (filePath) => {
  const worker = await createWorker('eng+hin');
  try {
    const { data } = await worker.recognize(filePath);
    return {
      text: data.text || '',
      confidence: data.confidence || 0,
    };
  } finally {
    await worker.terminate();
  }
};

/**
 * Extract text from PDF file using pdf-parse
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{text: string, confidence: number}>}
 */
const extractTextFromPDF = async (filePath) => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const pdfParse = require('pdf-parse');
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return {
    text: data.text || '',
    confidence: 90, // PDF text extraction is high confidence
  };
};

/**
 * Parse Aadhaar card fields from extracted text
 * @param {string} text - OCR extracted text
 * @returns {Object} parsed fields
 */
const parseAadhaarFields = (text) => {
  const parsed = {};
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Aadhaar number: 12 digits, often formatted as XXXX XXXX XXXX
  const aadhaarMatch = normalized.match(/\b(\d{4}\s?\d{4}\s?\d{4})\b/);
  if (aadhaarMatch) {
    parsed.aadhaarNumber = aadhaarMatch[1].replace(/\s/g, '');
  }

  // Date of birth: DD/MM/YYYY or DD-MM-YYYY or Year of Birth: YYYY
  const dobMatch = normalized.match(/(?:DOB|Date of Birth|Year of Birth)[:\s]+(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4})/i);
  if (dobMatch) {
    parsed.dateOfBirth = dobMatch[1];
  }

  // Gender
  const genderMatch = normalized.match(/\b(MALE|FEMALE|Male|Female)\b/);
  if (genderMatch) {
    parsed.gender = genderMatch[1].toLowerCase();
  }

  // Name: typically appears after "Name" or before DOB in Aadhaar
  const nameMatch = normalized.match(/(?:^|\n)([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\s*\n/m);
  if (nameMatch) {
    parsed.name = nameMatch[1].trim();
  }

  return parsed;
};

/**
 * Parse PAN card fields from extracted text
 * @param {string} text - OCR extracted text
 * @returns {Object} parsed fields
 */
const parsePANFields = (text) => {
  const parsed = {};
  const normalized = text.replace(/\s+/g, ' ').trim();

  // PAN number: 10 alphanumeric characters (5 letters + 4 digits + 1 letter)
  const panMatch = normalized.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
  if (panMatch) {
    parsed.panNumber = panMatch[1];
  }

  // Date of birth on PAN: DD/MM/YYYY
  const dobMatch = normalized.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (dobMatch) {
    parsed.dateOfBirth = dobMatch[1];
  }

  // Name line (typically in caps on PAN card)
  const nameLines = normalized.match(/([A-Z]{2,}(?:\s[A-Z]{2,}){1,3})/g);
  if (nameLines && nameLines.length > 0) {
    // Filter out common PAN card header text
    const filtered = nameLines.filter(
      (n) => !['INCOME TAX', 'GOVT OF INDIA', 'PERMANENT ACCOUNT', 'INDIA'].includes(n.trim())
    );
    if (filtered.length > 0) {
      parsed.name = filtered[0].trim();
    }
    if (filtered.length > 1) {
      parsed.fatherName = filtered[1].trim();
    }
  }

  return parsed;
};

/**
 * Parse 7/12 land record fields from extracted text
 * @param {string} text - OCR extracted text
 * @returns {Object} parsed fields
 */
const parse712Fields = (text) => {
  const parsed = {};
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Survey Number / Gat Number
  const surveyMatch = normalized.match(/(?:Survey No|Gat No|Survey Number|सर्वे नं)[.:\s]+([0-9\/]+)/i);
  if (surveyMatch) {
    parsed.surveyNumber = surveyMatch[1].trim();
  }

  // District
  const districtMatch = normalized.match(/(?:District|जिल्हा)[:\s]+([A-Za-z\u0900-\u097F]+)/i);
  if (districtMatch) {
    parsed.district = districtMatch[1].trim();
  }

  // Taluka
  const talukaMatch = normalized.match(/(?:Taluka|तालुका)[:\s]+([A-Za-z\u0900-\u097F]+)/i);
  if (talukaMatch) {
    parsed.taluka = talukaMatch[1].trim();
  }

  // Village
  const villageMatch = normalized.match(/(?:Village|गाव)[:\s]+([A-Za-z\u0900-\u097F]+)/i);
  if (villageMatch) {
    parsed.village = villageMatch[1].trim();
  }

  // Area in hectares
  const areaMatch = normalized.match(/(?:Area|क्षेत्रफळ)[:\s]+([0-9.]+\s*(?:Hectare|Ha|हेक्टर)?)/i);
  if (areaMatch) {
    parsed.area = areaMatch[1].trim();
  }

  // Owner name
  const ownerMatch = normalized.match(/(?:Owner|मालक|खातेदार)[:\s]+([A-Za-z\u0900-\u097F\s]+?)(?:\n|$)/i);
  if (ownerMatch) {
    parsed.ownerName = ownerMatch[1].trim();
  }

  // Crop details
  const cropMatch = normalized.match(/(?:Crop|पीक|खरीप|रब्बी)[:\s]+([A-Za-z\u0900-\u097F\s,]+?)(?:\n|$)/i);
  if (cropMatch) {
    parsed.cropDetails = cropMatch[1].trim();
  }

  return parsed;
};

/**
 * Parse bank passbook fields from extracted text
 * @param {string} text - OCR extracted text
 * @returns {Object} parsed fields
 */
const parsePassbookFields = (text) => {
  const parsed = {};
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Account number
  const accountMatch = normalized.match(/(?:Account No|A\/C No|Acc No)[.:\s]+(\d[\d\s]{8,18}\d)/i);
  if (accountMatch) {
    parsed.accountNumber = accountMatch[1].replace(/\s/g, '');
  }

  // IFSC Code
  const ifscMatch = normalized.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/);
  if (ifscMatch) {
    parsed.ifscCode = ifscMatch[1];
  }

  // Bank name
  const bankNames = ['State Bank', 'SBI', 'Bank of Maharashtra', 'Canara', 'Punjab National', 'HDFC', 'ICICI', 'Axis', 'Union Bank', 'Central Bank'];
  for (const bank of bankNames) {
    if (normalized.toLowerCase().includes(bank.toLowerCase())) {
      parsed.bankName = bank;
      break;
    }
  }

  // Account holder name
  const nameMatch = normalized.match(/(?:Name|Account Holder)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})/i);
  if (nameMatch) {
    parsed.accountHolderName = nameMatch[1].trim();
  }

  return parsed;
};

/**
 * Get the document's file path from its URL
 * @param {string} url - Document URL path
 * @param {string} uploadBaseDir - Base upload directory
 * @returns {string} absolute file path
 */
const getFilePath = (url, uploadBaseDir) => {
  const relativePath = url.replace(/^\/uploads\//, '');
  return path.join(uploadBaseDir, relativePath);
};

/**
 * Scan a document and extract data
 * @param {string} url - Document URL
 * @param {string} documentType - Type of document (aadhaar, pan, 7-12, passbook)
 * @param {string} mimeType - MIME type of the file
 * @param {string} uploadBaseDir - Base upload directory
 * @returns {Promise<Object>} scan result
 */
const scanDocument = async (url, documentType, mimeType, uploadBaseDir) => {
  const filePath = getFilePath(url, uploadBaseDir);

  let extracted;
  try {
    if (mimeType === 'application/pdf') {
      extracted = await extractTextFromPDF(filePath);
    } else {
      extracted = await extractTextFromImage(filePath);
    }
  } catch (err) {
    logger.warn(`Document scan failed for ${documentType}: ${err.message}`);
    return {
      extractedText: '',
      parsedFields: {},
      confidence: 0,
      scannedAt: new Date(),
      scanStatus: 'failed',
    };
  }

  let parsedFields = {};
  switch (documentType) {
    case 'aadhaar':
      parsedFields = parseAadhaarFields(extracted.text);
      break;
    case 'pan':
      parsedFields = parsePANFields(extracted.text);
      break;
    case '7-12':
      parsedFields = parse712Fields(extracted.text);
      break;
    case 'passbook':
      parsedFields = parsePassbookFields(extracted.text);
      break;
    default:
      break;
  }

  return {
    extractedText: extracted.text.substring(0, 2000), // Limit stored text
    parsedFields,
    confidence: Math.round(extracted.confidence),
    scannedAt: new Date(),
    scanStatus: 'completed',
  };
};

/**
 * Trigger background document scan and update farmer record
 * @param {Object} farmer - Mongoose Farmer document
 * @param {string} documentType - Type of document
 * @param {string} url - Document URL
 * @param {string} mimeType - File MIME type
 * @param {string} uploadBaseDir - Base upload directory
 */
const triggerBackgroundScan = (farmer, documentType, url, mimeType, uploadBaseDir) => {
  // Fire-and-forget: scan runs in background, does not block the upload response
  setImmediate(async () => {
    try {
      logger.info(`Starting document scan for farmer ${farmer._id}, type: ${documentType}`);
      const scanResult = await scanDocument(url, documentType, mimeType, uploadBaseDir);

      if (!farmer.documentScans) {
        farmer.documentScans = {};
      }
      farmer.documentScans[documentType] = scanResult;
      await farmer.save();
      logger.info(`Document scan completed for farmer ${farmer._id}, type: ${documentType}, confidence: ${scanResult.confidence}%`);
    } catch (err) {
      logger.error(`Background scan error for farmer ${farmer._id}, type: ${documentType}: ${err.message}`);
    }
  });
};

module.exports = {
  scanDocument,
  triggerBackgroundScan,
  parseAadhaarFields,
  parsePANFields,
  parse712Fields,
  parsePassbookFields,
};
