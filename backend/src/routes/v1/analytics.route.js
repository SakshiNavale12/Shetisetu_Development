const express = require('express');
const auth = require('../../middlewares/auth');
const analyticsController = require('../../controllers/analytics.controller');

const router = express.Router();

// All analytics routes require 'viewAnalytics' permission
router.use(auth('viewAnalytics'));

router.get('/overview', analyticsController.getDashboardOverview);
router.get('/district-stats', analyticsController.getDistrictStats);
router.get('/compensation-trends', analyticsController.getCompensationTrends);
router.get('/officer-performance', analyticsController.getOfficerPerformance);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting for authorities
 */

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 */

/**
 * @swagger
 * /analytics/district-stats:
 *   get:
 *     summary: Get district-wise statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
