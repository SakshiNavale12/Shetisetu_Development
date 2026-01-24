const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const farmerValidation = require('../../validations/farmer.validation');
const farmerController = require('../../controllers/farmer.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('viewOwnProfile'), validate(farmerValidation.createFarmer), farmerController.createFarmer)
    .get(auth('manageFarmers'), validate(farmerValidation.queryFarmers), farmerController.queryFarmers);

router
    .route('/me')
    .get(auth('viewOwnProfile'), farmerController.getMyProfile)
    .patch(auth('viewOwnProfile'), validate(farmerValidation.updateFarmer), farmerController.updateMyProfile);

router
    .route('/me/ekyc/submit')
    .post(auth('viewOwnProfile'), farmerController.submitEkyc);

router
    .route('/pending-ekyc')
    .get(auth('manageFarmers'), validate(farmerValidation.queryFarmers), farmerController.getPendingEkyc);

router
    .route('/me/land-parcels')
    .post(auth('viewOwnProfile'), validate(farmerValidation.addLandParcel), farmerController.addLandParcel);

router
    .route('/me/land-parcels/:parcelId')
    .patch(auth('viewOwnProfile'), validate(farmerValidation.updateLandParcel), farmerController.updateLandParcel)
    .delete(auth('viewOwnProfile'), validate(farmerValidation.deleteLandParcel), farmerController.deleteLandParcel);

router
    .route('/:farmerId')
    .get(auth('manageFarmers'), validate(farmerValidation.getFarmer), farmerController.getFarmer);

router
    .route('/:farmerId/documents')
    .get(auth('manageFarmers'), validate(farmerValidation.getFarmer), farmerController.getFarmerWithDocuments);

router
    .route('/:farmerId/ekyc')
    .patch(auth('manageFarmers'), validate(farmerValidation.updateEkyc), farmerController.updateEkycStatus);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Farmers
 *   description: Farmer profile management
 */

/**
 * @swagger
 * /farmers:
 *   post:
 *     summary: Create a farmer profile
 *     description: Authenticated farmers can create their profile.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - district
 *               - taluka
 *               - village
 *             properties:
 *               fullName:
 *                 type: string
 *               fatherName:
 *                 type: string
 *               district:
 *                 type: string
 *               taluka:
 *                 type: string
 *               village:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *       "400":
 *         description: Profile already exists
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /farmers/me:
 *   get:
 *     summary: Get my farmer profile
 *     description: Authenticated farmers can fetch their own profile.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Profile not found
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   patch:
 *     summary: Update my farmer profile
 *     description: Authenticated farmers can update their own profile.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         description: Profile not found
 */

/**
 * @swagger
 * /farmers/me/land-parcels:
 *   post:
 *     summary: Add a land parcel
 *     description: Authenticated farmers can add land parcels to their profile.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - surveyNumber
 *               - area
 *             properties:
 *               surveyNumber:
 *                 type: string
 *               gutNumber:
 *                 type: string
 *               area:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [hectare, are, guntha, acre]
 *               ownershipType:
 *                 type: string
 *                 enum: [owned, leased, shared]
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
