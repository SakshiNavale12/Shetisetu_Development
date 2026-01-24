const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { farmerService } = require('../services');
const pick = require('../utils/pick');

const createFarmer = catchAsync(async (req, res) => {
    const farmer = await farmerService.createFarmer(req.user.id, req.body);
    res.status(httpStatus.CREATED).send(farmer);
});

const getMyProfile = catchAsync(async (req, res) => {
    const farmer = await farmerService.getFarmerByUserId(req.user.id);
    if (!farmer) {
        res.status(httpStatus.NOT_FOUND).send({ message: 'Farmer profile not found. Please create your profile.' });
        return;
    }
    res.send(farmer);
});

const updateMyProfile = catchAsync(async (req, res) => {
    const farmer = await farmerService.updateFarmerByUserId(req.user.id, req.body);
    res.send(farmer);
});

const getFarmer = catchAsync(async (req, res) => {
    const farmer = await farmerService.getFarmerById(req.params.farmerId);
    if (!farmer) {
        res.status(httpStatus.NOT_FOUND).send({ message: 'Farmer not found' });
        return;
    }
    res.send(farmer);
});

const queryFarmers = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['district', 'taluka', 'village', 'documentsVerified']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await farmerService.queryFarmers(filter, options);
    res.send(result);
});

const addLandParcel = catchAsync(async (req, res) => {
    const farmer = await farmerService.addLandParcel(req.user.id, req.body);
    res.status(httpStatus.CREATED).send(farmer);
});

const updateLandParcel = catchAsync(async (req, res) => {
    const farmer = await farmerService.updateLandParcel(req.user.id, req.params.parcelId, req.body);
    res.send(farmer);
});

const deleteLandParcel = catchAsync(async (req, res) => {
    const farmer = await farmerService.deleteLandParcel(req.user.id, req.params.parcelId);
    res.send(farmer);
});

const updateEkycStatus = catchAsync(async (req, res) => {
    const { status, remarks } = req.body;
    const farmer = await farmerService.updateEkycStatus(req.params.farmerId, req.user.id, status, remarks);
    res.send(farmer);
});

const getFarmerWithDocuments = catchAsync(async (req, res) => {
    const farmer = await farmerService.getFarmerWithDocuments(req.params.farmerId);
    if (!farmer) {
        res.status(httpStatus.NOT_FOUND).send({ message: 'Farmer not found' });
        return;
    }
    res.send(farmer);
});

const submitEkyc = catchAsync(async (req, res) => {
    const farmer = await farmerService.submitEkycForVerification(req.user.id);
    res.send(farmer);
});

const getPendingEkyc = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['district', 'taluka', 'village']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await farmerService.getPendingEkycFarmers(filter, options);
    res.send(result);
});

module.exports = {
    createFarmer,
    getMyProfile,
    updateMyProfile,
    getFarmer,
    queryFarmers,
    addLandParcel,
    updateLandParcel,
    deleteLandParcel,
    updateEkycStatus,
    getFarmerWithDocuments,
    submitEkyc,
    getPendingEkyc,
};
