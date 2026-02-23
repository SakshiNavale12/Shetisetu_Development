const { Farmer, CropSurvey, LossReport } = require('../models');

/**
 * Cross-validate OCR scan data against farmer's profile fields
 * @param {Object} farmer - Farmer document
 * @returns {Array<Object>} list of validation findings
 */
const crossValidateDocuments = (farmer) => {
  const findings = [];
  const scans = farmer.documentScans || {};

  // Aadhaar cross-validation
  if (scans.aadhaar && scans.aadhaar.scanStatus === 'completed') {
    const aadhaarFields = scans.aadhaar.parsedFields || {};
    if (aadhaarFields.name && farmer.fullName) {
      const normalizedScan = aadhaarFields.name.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedProfile = farmer.fullName.toLowerCase().replace(/\s+/g, ' ').trim();
      if (normalizedScan && normalizedProfile && !normalizedProfile.includes(normalizedScan.split(' ')[0])) {
        findings.push({
          type: 'warning',
          field: 'Name (Aadhaar vs Profile)',
          message: `Name in Aadhaar ("${aadhaarFields.name}") may not match profile name ("${farmer.fullName}")`,
        });
      } else if (normalizedScan) {
        findings.push({
          type: 'ok',
          field: 'Name (Aadhaar)',
          message: `Name matches between Aadhaar and profile: "${farmer.fullName}"`,
        });
      }
    }
    if (aadhaarFields.gender && farmer.gender) {
      if (aadhaarFields.gender !== farmer.gender) {
        findings.push({
          type: 'warning',
          field: 'Gender (Aadhaar vs Profile)',
          message: `Gender mismatch: Aadhaar shows "${aadhaarFields.gender}", profile shows "${farmer.gender}"`,
        });
      } else {
        findings.push({ type: 'ok', field: 'Gender (Aadhaar)', message: 'Gender matches Aadhaar' });
      }
    }
  }

  // 7/12 land record cross-validation
  if (scans['7-12'] && scans['7-12'].scanStatus === 'completed') {
    const landFields = scans['7-12'].parsedFields || {};
    if (landFields.district && farmer.district) {
      const normalizedScan = landFields.district.toLowerCase().trim();
      const normalizedProfile = farmer.district.toLowerCase().trim();
      if (normalizedScan && normalizedProfile && normalizedScan !== normalizedProfile) {
        findings.push({
          type: 'warning',
          field: 'District (7/12 vs Profile)',
          message: `District in land record ("${landFields.district}") differs from profile ("${farmer.district}")`,
        });
      } else if (normalizedScan) {
        findings.push({ type: 'ok', field: 'District (7/12)', message: `District verified: ${farmer.district}` });
      }
    }

    // Check if 7/12 survey number matches land parcels
    if (landFields.surveyNumber && farmer.landParcels && farmer.landParcels.length > 0) {
      const matchedParcel = farmer.landParcels.find(
        (p) => p.surveyNumber && p.surveyNumber.includes(landFields.surveyNumber)
      );
      if (matchedParcel) {
        findings.push({
          type: 'ok',
          field: 'Survey Number (7/12)',
          message: `Survey number ${landFields.surveyNumber} found in farmer's land parcels`,
        });
      } else {
        findings.push({
          type: 'warning',
          field: 'Survey Number (7/12 vs Land Parcels)',
          message: `Survey number "${landFields.surveyNumber}" from 7/12 not found in registered land parcels`,
        });
      }
    }
  }

  // Passbook cross-validation
  if (scans.passbook && scans.passbook.scanStatus === 'completed') {
    const passbookFields = scans.passbook.parsedFields || {};
    if (passbookFields.ifscCode && farmer.ifscCode) {
      if (passbookFields.ifscCode !== farmer.ifscCode) {
        findings.push({
          type: 'warning',
          field: 'IFSC Code (Passbook vs Profile)',
          message: `IFSC in passbook ("${passbookFields.ifscCode}") differs from profile ("${farmer.ifscCode}")`,
        });
      } else {
        findings.push({ type: 'ok', field: 'IFSC Code (Passbook)', message: `IFSC code verified: ${farmer.ifscCode}` });
      }
    }
    if (passbookFields.accountHolderName && farmer.accountHolderName) {
      const normalizedScan = passbookFields.accountHolderName.toLowerCase().trim();
      const normalizedProfile = farmer.accountHolderName.toLowerCase().trim();
      if (normalizedScan && !normalizedProfile.includes(normalizedScan.split(' ')[0])) {
        findings.push({
          type: 'warning',
          field: 'Account Holder Name (Passbook vs Profile)',
          message: `Name on passbook ("${passbookFields.accountHolderName}") may differ from profile ("${farmer.accountHolderName}")`,
        });
      } else if (normalizedScan) {
        findings.push({ type: 'ok', field: 'Account Holder Name (Passbook)', message: 'Account holder name verified' });
      }
    }
  }

  return findings;
};

/**
 * Determine document completeness and verification status
 * @param {Object} farmer - Farmer document
 * @returns {Object} document status summary
 */
const getDocumentStatus = (farmer) => {
  const docs = farmer.documents || {};
  const scans = farmer.documentScans || {};

  const required = ['aadhaar', '7-12', 'passbook'];
  const optional = ['pan', '8-A', 'lease'];

  const uploaded = [];
  const missing = [];
  const scanSummary = {};

  [...required, ...optional].forEach((type) => {
    if (docs[type] && docs[type].url) {
      uploaded.push(type);
      const scan = scans[type];
      scanSummary[type] = scan
        ? { status: scan.scanStatus, confidence: scan.confidence || 0, scannedAt: scan.scannedAt }
        : { status: 'not_scanned' };
    } else if (required.includes(type)) {
      missing.push(type);
    }
  });

  const completenessScore = Math.round((uploaded.filter((t) => required.includes(t)).length / required.length) * 100);

  return {
    uploaded,
    missingRequired: missing,
    completenessScore,
    scanSummary,
    isComplete: missing.length === 0,
  };
};

/**
 * Summarize crop surveys for a farmer
 * @param {Array} surveys - Array of CropSurvey documents
 * @returns {Object} crop survey summary
 */
const summarizeCropSurveys = (surveys) => {
  if (!surveys || surveys.length === 0) {
    return { total: 0, byStatus: {}, crops: [], totalArea: 0, seasons: [] };
  }

  const byStatus = {};
  const cropSet = new Set();
  const seasonSet = new Set();
  let totalArea = 0;

  surveys.forEach((s) => {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    cropSet.add(s.cropName);
    seasonSet.add(s.season);
    totalArea += s.cultivatedArea || 0;
  });

  const latest = surveys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return {
    total: surveys.length,
    byStatus,
    crops: Array.from(cropSet),
    seasons: Array.from(seasonSet),
    totalCultivatedArea: Math.round(totalArea * 100) / 100,
    latestSurveys: latest.map((s) => ({
      id: s._id,
      cropName: s.cropName,
      season: s.season,
      year: s.year,
      area: s.cultivatedArea,
      unit: s.cultivatedAreaUnit,
      status: s.status,
      sowingDate: s.sowingDate,
    })),
  };
};

/**
 * Summarize loss reports for a farmer
 * @param {Array} reports - Array of LossReport documents
 * @returns {Object} loss report summary
 */
const summarizeLossReports = (reports) => {
  if (!reports || reports.length === 0) {
    return { total: 0, byStatus: {}, byLossType: {}, totalEstimatedLoss: 0, totalApprovedAmount: 0 };
  }

  const byStatus = {};
  const byLossType = {};
  let totalEstimatedLoss = 0;
  let totalApprovedAmount = 0;

  reports.forEach((r) => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    byLossType[r.lossType] = (byLossType[r.lossType] || 0) + 1;
    totalEstimatedLoss += r.estimatedLoss || 0;
    totalApprovedAmount += r.approvedAmount || 0;
  });

  const recent = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return {
    total: reports.length,
    byStatus,
    byLossType,
    totalEstimatedLoss: Math.round(totalEstimatedLoss),
    totalApprovedAmount: Math.round(totalApprovedAmount),
    pendingCount: (byStatus.submitted || 0) + (byStatus.under_review || 0),
    recentReports: recent.map((r) => ({
      id: r._id,
      cropName: r.cropName,
      lossType: r.lossType,
      lossDate: r.lossDate,
      affectedArea: r.affectedArea,
      damagePercentage: r.damagePercentage,
      estimatedLoss: r.estimatedLoss,
      approvedAmount: r.approvedAmount,
      status: r.status,
    })),
  };
};

/**
 * Calculate an overall risk/reliability score for the farmer
 * @param {Object} farmer - Farmer document
 * @param {Object} docStatus - Document status summary
 * @param {Array} crossValidationFindings - Validation findings
 * @param {Object} cropSummary - Crop survey summary
 * @param {Object} lossSummary - Loss report summary
 * @returns {Object} score and rating
 */
const calculateReliabilityScore = (farmer, docStatus, crossValidationFindings, cropSummary, lossSummary) => {
  let score = 0;
  const reasons = [];

  // Profile completeness (max 20 pts)
  if (farmer.isProfileComplete) {
    score += 20;
    reasons.push('+20: Profile is complete');
  } else {
    score += 10;
    reasons.push('+10: Profile partially complete');
  }

  // Document completeness (max 20 pts)
  score += Math.round((docStatus.completenessScore / 100) * 20);
  reasons.push(`+${Math.round((docStatus.completenessScore / 100) * 20)}: Documents ${docStatus.completenessScore}% complete`);

  // Document scan results (max 20 pts)
  const okFindings = crossValidationFindings.filter((f) => f.type === 'ok').length;
  const warnFindings = crossValidationFindings.filter((f) => f.type === 'warning').length;
  const scanScore = Math.max(0, (okFindings * 4) - (warnFindings * 3));
  const cappedScanScore = Math.min(20, scanScore);
  score += cappedScanScore;
  reasons.push(`+${cappedScanScore}: Document cross-validation (${okFindings} OK, ${warnFindings} warnings)`);

  // Crop survey history (max 20 pts)
  if (cropSummary.total > 0) {
    const verifiedRatio = (cropSummary.byStatus.verified || 0) / cropSummary.total;
    const cropScore = Math.min(20, Math.round(verifiedRatio * 20) + (cropSummary.total >= 2 ? 5 : 0));
    score += cropScore;
    reasons.push(`+${cropScore}: ${cropSummary.total} crop survey(s) on record`);
  }

  // eKYC status (max 20 pts)
  if (farmer.ekycStatus === 'verified') {
    score += 20;
    reasons.push('+20: eKYC verified');
  } else if (farmer.ekycStatus === 'submitted') {
    score += 10;
    reasons.push('+10: eKYC submitted, pending verification');
  } else if (farmer.ekycStatus === 'rejected') {
    score += 0;
    reasons.push('+0: eKYC rejected');
  }

  const clampedScore = Math.min(100, Math.max(0, score));
  let rating;
  if (clampedScore >= 80) rating = 'High';
  else if (clampedScore >= 60) rating = 'Medium';
  else if (clampedScore >= 40) rating = 'Low';
  else rating = 'Very Low';

  return { score: clampedScore, rating, reasons };
};

/**
 * Generate officer recommendations based on findings
 * @param {Object} farmer - Farmer document
 * @param {Object} docStatus - Document status summary
 * @param {Array} crossValidationFindings - Validation findings
 * @param {Object} lossSummary - Loss report summary
 * @returns {Array<string>} list of recommendations
 */
const generateRecommendations = (farmer, docStatus, crossValidationFindings, lossSummary) => {
  const recommendations = [];

  if (docStatus.missingRequired.length > 0) {
    recommendations.push(
      `Request farmer to upload missing required documents: ${docStatus.missingRequired.join(', ')}`
    );
  }

  const warnings = crossValidationFindings.filter((f) => f.type === 'warning');
  if (warnings.length > 0) {
    recommendations.push('Verify document discrepancies before approving eKYC:');
    warnings.forEach((w) => recommendations.push(`  - ${w.message}`));
  }

  if (farmer.ekycStatus === 'submitted' && docStatus.isComplete && warnings.length === 0) {
    recommendations.push('All documents appear consistent — eKYC approval recommended');
  }

  if (lossSummary.pendingCount > 0) {
    recommendations.push(`${lossSummary.pendingCount} loss report(s) pending review for this farmer`);
  }

  if (!farmer.bankName || !farmer.ifscCode) {
    recommendations.push('Bank details incomplete — compensation cannot be processed until bank info is provided');
  }

  if (recommendations.length === 0) {
    recommendations.push('No immediate action required — profile appears complete and consistent');
  }

  return recommendations;
};

/**
 * Generate a comprehensive AI summary report for an officer
 * @param {string} farmerId - Farmer ID
 * @returns {Promise<Object>} structured report
 */
const generateFarmerReport = async (farmerId) => {
  // Fetch all data in parallel
  const [farmer, cropSurveys, lossReports] = await Promise.all([
    Farmer.findById(farmerId).populate('user', 'name email mobile').populate('ekycVerifiedBy', 'name'),
    CropSurvey.find({ farmer: farmerId }).sort({ createdAt: -1 }).limit(20),
    LossReport.find({ farmer: farmerId }).sort({ createdAt: -1 }).limit(20),
  ]);

  if (!farmer) {
    return null;
  }

  const docStatus = getDocumentStatus(farmer);
  const crossValidationFindings = crossValidateDocuments(farmer);
  const cropSummary = summarizeCropSurveys(cropSurveys);
  const lossSummary = summarizeLossReports(lossReports);
  const reliability = calculateReliabilityScore(farmer, docStatus, crossValidationFindings, cropSummary, lossSummary);
  const recommendations = generateRecommendations(farmer, docStatus, crossValidationFindings, lossSummary);

  // Build the final report
  return {
    generatedAt: new Date(),
    farmerId: farmer._id,
    farmerName: farmer.fullName,

    // Section 1: Farmer Overview
    farmerOverview: {
      fullName: farmer.fullName,
      fatherName: farmer.fatherName,
      gender: farmer.gender,
      dateOfBirth: farmer.dateOfBirth,
      contact: farmer.user?.mobile,
      email: farmer.user?.email,
      location: {
        division: farmer.division,
        district: farmer.district,
        taluka: farmer.taluka,
        village: farmer.village,
      },
      totalLandArea: farmer.getTotalLandArea ? Math.round(farmer.getTotalLandArea() * 100) / 100 : null,
      landParcelsCount: farmer.landParcels?.length || 0,
      profileComplete: farmer.isProfileComplete,
      ekycStatus: farmer.ekycStatus,
      ekycVerifiedBy: farmer.ekycVerifiedBy?.name || null,
      ekycVerifiedAt: farmer.ekycVerifiedAt,
    },

    // Section 2: Document Status
    documentStatus: docStatus,

    // Section 3: OCR Scan Results
    documentScanResults: Object.entries(farmer.documentScans || {}).map(([type, scan]) => ({
      documentType: type,
      scanStatus: scan.scanStatus,
      confidence: scan.confidence,
      scannedAt: scan.scannedAt,
      parsedFields: scan.parsedFields || {},
    })),

    // Section 4: Cross-Validation Findings
    crossValidationFindings,

    // Section 5: Crop Survey Summary
    cropSurveySummary: cropSummary,

    // Section 6: Loss Report Summary
    lossReportSummary: lossSummary,

    // Section 7: Reliability Score
    reliabilityScore: reliability,

    // Section 8: Officer Recommendations
    recommendations,
  };
};

module.exports = {
  generateFarmerReport,
};
