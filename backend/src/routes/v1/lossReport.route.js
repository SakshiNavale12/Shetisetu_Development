const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const lossReportValidation = require('../../validations/lossReport.validation');
const lossReportController = require('../../controllers/lossReport.controller');

const router = express.Router();

// Farmer routes
router
    .route('/')
    .post(auth('submitLossReport'), validate(lossReportValidation.createLossReport), lossReportController.createLossReport)
    .get(auth('verifyCases'), validate(lossReportValidation.queryReports), lossReportController.queryReports);

router
    .route('/me')
    .get(auth('viewOwnProfile'), validate(lossReportValidation.getMyReports), lossReportController.getMyReports);

router
    .route('/:reportId')
    .get(auth('viewOwnProfile'), validate(lossReportValidation.getReport), lossReportController.getReport)
    .patch(auth('submitLossReport'), validate(lossReportValidation.updateLossReport), lossReportController.updateReport)
    .delete(auth('submitLossReport'), validate(lossReportValidation.deleteReport), lossReportController.deleteReport);

// Officer routes
// router
//     .route('/all')
//     .get(auth('verifyCases'), validate(lossReportValidation.queryReports), lossReportController.queryReports);

router
    .route('/stats')
    .get(auth('viewAnalytics'), lossReportController.getStats);

router
    .route('/:reportId/status')
    .patch(auth('verifyCases'), validate(lossReportValidation.updateReportStatus), lossReportController.updateReportStatus);

// Officer: manually (re-)run AI calamity verification for a report
router
    .route('/:reportId/verify-calamity')
    .post(auth('verifyCases'), validate(lossReportValidation.getReport), lossReportController.runCalamityVerification);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: LossReports
 *   description: Crop Loss Reporting and Damage Assessment
 */

/**
 * @swagger
 * /loss-reports:
 *   post:
 *     summary: Submit a new loss report
 *     description: Farmers can submit crop loss reports with geo-tagged photos.
 *     tags: [LossReports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - landParcel
 *               - cropName
 *               - lossType
 *               - lossDate
 *               - affectedArea
 *               - damagePercentage
 *             properties:
 *               landParcel:
 *                 type: object
 *               lossType:
 *                 type: string
 *                 enum: [drought, flood, hailstorm, pest, disease, unseasonal_rain, frost, fire, other]
 *               damagePercentage:
 *                 type: number
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /loss-reports/me:
 *   get:
 *     summary: Get my loss reports
 *     description: Farmers can view their submitted loss reports.
 *     tags: [LossReports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
