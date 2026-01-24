const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cropSurveyValidation = require('../../validations/cropSurvey.validation');
const cropSurveyController = require('../../controllers/cropSurvey.controller');

const router = express.Router();

// Farmer routes
router
    .route('/')
    .post(auth('submitCropSurvey'), validate(cropSurveyValidation.createCropSurvey), cropSurveyController.createCropSurvey);

router
    .route('/me')
    .get(auth('viewOwnProfile'), validate(cropSurveyValidation.getMySurveys), cropSurveyController.getMySurveys);

router
    .route('/:surveyId')
    .get(auth('viewOwnProfile'), validate(cropSurveyValidation.getSurvey), cropSurveyController.getSurvey)
    .patch(auth('submitCropSurvey'), validate(cropSurveyValidation.updateCropSurvey), cropSurveyController.updateSurvey)
    .delete(auth('submitCropSurvey'), validate(cropSurveyValidation.deleteSurvey), cropSurveyController.deleteSurvey);

router
    .route('/:surveyId/photos')
    .post(auth('submitCropSurvey'), validate(cropSurveyValidation.addPhotos), cropSurveyController.addPhotosToSurvey);

// Officer routes
router
    .route('/all')
    .get(auth('verifyCases'), validate(cropSurveyValidation.querySurveys), cropSurveyController.querySurveys);

router
    .route('/:surveyId/verify')
    .post(auth('verifyCases'), validate(cropSurveyValidation.verifySurvey), cropSurveyController.verifySurvey);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: CropSurveys
 *   description: E-Pik Pahani - Digital Crop Survey
 */

/**
 * @swagger
 * /crop-surveys:
 *   post:
 *     summary: Submit a new crop survey
 *     description: Farmers can submit crop surveys for their land parcels.
 *     tags: [CropSurveys]
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
 *               - season
 *               - cropName
 *               - cropType
 *               - cultivatedArea
 *               - sowingDate
 *               - irrigationType
 *             properties:
 *               landParcel:
 *                 type: object
 *                 properties:
 *                   surveyNumber:
 *                     type: string
 *                   area:
 *                     type: number
 *               season:
 *                 type: string
 *                 enum: [kharif, rabi, perennial, summer]
 *               cropName:
 *                 type: string
 *               cropType:
 *                 type: string
 *               sowingDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /crop-surveys/me:
 *   get:
 *     summary: Get my crop surveys
 *     description: Farmers can view their submitted crop surveys.
 *     tags: [CropSurveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
