const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const panchanamaValidation = require('../../validations/panchanama.validation');
const panchanamaController = require('../../controllers/panchanama.controller');

const router = express.Router();

// Officer routes
router
    .route('/')
    .post(auth('conductPanchanama'), validate(panchanamaValidation.createPanchanama), panchanamaController.createPanchanama)
    .get(auth('conductPanchanama'), validate(panchanamaValidation.getPanchanamas), panchanamaController.getPanchanamas);

router.route('/stats').get(auth('conductPanchanama'), panchanamaController.getOfficerStats);

router
    .route('/all')
    .get(auth('viewAllCases'), validate(panchanamaValidation.getPanchanamas), panchanamaController.getAllPanchanamas);

router
    .route('/:panchanamaId')
    .get(auth('conductPanchanama'), panchanamaController.getPanchanama)
    .patch(auth('conductPanchanama'), validate(panchanamaValidation.updatePanchanama), panchanamaController.updatePanchanama);

router
    .route('/:panchanamaId/submit')
    .post(auth('conductPanchanama'), validate(panchanamaValidation.submitPanchanama), panchanamaController.submitPanchanama);

router
    .route('/:panchanamaId/review')
    .post(auth('reviewPanchanama'), validate(panchanamaValidation.reviewPanchanama), panchanamaController.reviewPanchanama);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Panchanama
 *   description: Digital field inspection (e-Panchanama) management
 */

/**
 * @swagger
 * /panchanamas:
 *   post:
 *     summary: Create a panchanama
 *     description: Officer creates a new panchanama for a loss report
 *     tags: [Panchanama]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lossReport
 *               - siteVisit
 *             properties:
 *               lossReport:
 *                 type: string
 *               siteVisit:
 *                 type: object
 *                 properties:
 *                   scheduledDate:
 *                     type: string
 *                     format: date
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden - not an officer
 *   get:
 *     summary: Get officer's panchanamas
 *     description: Get list of panchanamas created by the logged-in officer
 *     tags: [Panchanama]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         description: Unauthorized
 */

/**
 * @swagger
 * /panchanamas/stats:
 *   get:
 *     summary: Get officer dashboard stats
 *     description: Get statistics for the officer's panchanamas
 *     tags: [Panchanama]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         description: Unauthorized
 */

/**
 * @swagger
 * /panchanamas/{panchanamaId}/submit:
 *   post:
 *     summary: Submit panchanama for review
 *     description: Officer submits completed panchanama for authority review
 *     tags: [Panchanama]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: panchanamaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Not found
 */

/**
 * @swagger
 * /panchanamas/{panchanamaId}/review:
 *   post:
 *     summary: Review panchanama
 *     description: Authority reviews and approves/rejects panchanama
 *     tags: [Panchanama]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: panchanamaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *               - remarks
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [approved, rejected]
 *               remarks:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden - not an authority
 */
