const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const mlValidation = require('../../validations/ml.validation');
const mlController = require('../../controllers/ml.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ML
 *   description: Machine Learning predictions for agriculture
 */

/**
 * @swagger
 * /ml/health:
 *   get:
 *     summary: Check ML service health
 *     tags: [ML]
 *     responses:
 *       200:
 *         description: ML service health status
 */
router.get('/health', mlController.healthCheck);

/**
 * @swagger
 * /ml/predict/yield:
 *   post:
 *     summary: Predict crop yield
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - district
 *               - cropName
 *               - season
 *               - cultivatedArea
 *               - irrigationType
 *               - sowingDate
 *             properties:
 *               district:
 *                 type: string
 *                 example: pune
 *               cropName:
 *                 type: string
 *                 example: wheat
 *               season:
 *                 type: string
 *                 enum: [kharif, rabi, summer, perennial]
 *               cultivatedArea:
 *                 type: number
 *                 example: 2.5
 *               irrigationType:
 *                 type: string
 *                 enum: [rainfed, canal, well, borewell, drip, sprinkler, mixed]
 *               sowingDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Yield prediction result
 */
router.post(
  '/predict/yield',
  auth('submitCropSurvey'),
  validate(mlValidation.predictYield),
  mlController.predictYield
);

/**
 * @swagger
 * /ml/predict/risk:
 *   post:
 *     summary: Assess cultivation risk
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/predict/risk',
  auth('submitCropSurvey'),
  validate(mlValidation.assessRisk),
  mlController.assessRisk
);

/**
 * @swagger
 * /ml/predict/loss:
 *   post:
 *     summary: Predict loss probability
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/predict/loss',
  auth('submitLossReport'),
  validate(mlValidation.predictLoss),
  mlController.predictLoss
);

module.exports = router;
