const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, officer, insertUsers } = require('../fixtures/user.fixture');
const { farmerProfileOne, insertFarmers } = require('../fixtures/farmer.fixture');
const { userOneAccessToken, officerAccessToken } = require('../fixtures/token.fixture');
const { Farmer } = require('../../src/models');

setupTestDB();

describe('Farmer routes', () => {
    describe('GET /v1/farmers/me', () => {
        test('should return 200 and farmer profile if user has a profile', async () => {
            await insertUsers([userOne]);
            await insertFarmers([farmerProfileOne], [userOne]);

            const res = await request(app)
                .get('/v1/farmers/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.OK);

            expect(res.body).toHaveProperty('personalDetails');
            expect(res.body.personalDetails.firstName).toBe(farmerProfileOne.personalDetails.firstName);
            expect(res.body.location.district).toBe(farmerProfileOne.location.district);
        });

        test('should return 404 if farmer profile does not exist', async () => {
            await insertUsers([userOne]);

            await request(app)
                .get('/v1/farmers/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.NOT_FOUND);
        });

        test('should return 401 if not authenticated', async () => {
            await request(app)
                .get('/v1/farmers/me')
                .expect(httpStatus.UNAUTHORIZED);
        });
    });

    describe('POST /v1/farmers/me', () => {
        test('should return 201 and create farmer profile', async () => {
            await insertUsers([userOne]);

            const newProfile = {
                personalDetails: {
                    firstName: 'Ramesh',
                    lastName: 'Patil',
                    fatherName: 'Suresh Patil',
                    gender: 'male',
                    dateOfBirth: '1985-05-15',
                },
                location: {
                    division: 'Pune',
                    district: 'Pune',
                    taluka: 'Haveli',
                    village: 'Wagholi',
                },
            };

            const res = await request(app)
                .post('/v1/farmers/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProfile)
                .expect(httpStatus.CREATED);

            expect(res.body.personalDetails.firstName).toBe(newProfile.personalDetails.firstName);
            expect(res.body.location.village).toBe(newProfile.location.village);

            const dbFarmer = await Farmer.findById(res.body.id);
            expect(dbFarmer).toBeDefined();
        });

        test('should return 400 if profile already exists', async () => {
            await insertUsers([userOne]);
            await insertFarmers([farmerProfileOne], [userOne]);

            const newProfile = {
                personalDetails: {
                    firstName: 'Another',
                    lastName: 'Farmer',
                },
            };

            await request(app)
                .post('/v1/farmers/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProfile)
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('PATCH /v1/farmers/me', () => {
        test('should return 200 and update farmer profile', async () => {
            await insertUsers([userOne]);
            await insertFarmers([farmerProfileOne], [userOne]);

            const updateBody = {
                'personalDetails.firstName': 'UpdatedName',
                'location.village': 'UpdatedVillage',
            };

            const res = await request(app)
                .patch('/v1/farmers/me')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.OK);

            expect(res.body.personalDetails.firstName).toBe('UpdatedName');
            expect(res.body.location.village).toBe('UpdatedVillage');
        });
    });

    describe('POST /v1/farmers/me/land-parcels', () => {
        test('should return 201 and add land parcel', async () => {
            await insertUsers([userOne]);
            await insertFarmers([farmerProfileOne], [userOne]);

            const newParcel = {
                surveyNumber: '789/C',
                gutNumber: '99',
                area: 3.0,
                areaUnit: 'hectare',
                ownershipType: 'owned',
            };

            const res = await request(app)
                .post('/v1/farmers/me/land-parcels')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newParcel)
                .expect(httpStatus.CREATED);

            expect(res.body.landParcels).toHaveLength(2);
            expect(res.body.landParcels[1].surveyNumber).toBe(newParcel.surveyNumber);
        });
    });

    describe('DELETE /v1/farmers/me/land-parcels/:parcelIndex', () => {
        test('should return 200 and remove land parcel', async () => {
            await insertUsers([userOne]);
            await insertFarmers([farmerProfileOne], [userOne]);

            const res = await request(app)
                .delete('/v1/farmers/me/land-parcels/0')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.OK);

            expect(res.body.landParcels).toHaveLength(0);
        });

        test('should return 400 for invalid parcel index', async () => {
            await insertUsers([userOne]);
            await insertFarmers([farmerProfileOne], [userOne]);

            await request(app)
                .delete('/v1/farmers/me/land-parcels/99')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.BAD_REQUEST);
        });
    });
});
