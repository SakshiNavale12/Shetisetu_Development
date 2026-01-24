const mongoose = require('mongoose');
const faker = require('faker');
const { Farmer } = require('../../src/models');

const farmerProfileOne = {
    _id: mongoose.Types.ObjectId(),
    personalDetails: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        fatherName: faker.name.findName(),
        gender: 'male',
        dateOfBirth: new Date('1985-05-15'),
    },
    location: {
        division: 'Pune',
        district: 'Pune',
        taluka: 'Haveli',
        village: 'Wagholi',
    },
    bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
    },
    landParcels: [
        {
            surveyNumber: '123/A',
            gutNumber: '45',
            area: 2.5,
            areaUnit: 'hectare',
            ownershipType: 'owned',
        },
    ],
};

const farmerProfileTwo = {
    _id: mongoose.Types.ObjectId(),
    personalDetails: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        fatherName: faker.name.findName(),
        gender: 'female',
        dateOfBirth: new Date('1990-08-20'),
    },
    location: {
        division: 'Nashik',
        district: 'Nashik',
        taluka: 'Sinnar',
        village: 'Sinnar',
    },
    bankDetails: {
        accountNumber: '9876543210',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
    },
    landParcels: [
        {
            surveyNumber: '456/B',
            gutNumber: '78',
            area: 1.5,
            areaUnit: 'hectare',
            ownershipType: 'leased',
        },
    ],
};

const insertFarmers = async (farmers, users) => {
    const farmersWithUsers = farmers.map((farmer, index) => ({
        ...farmer,
        user: users[index]._id,
    }));
    await Farmer.insertMany(farmersWithUsers);
};

module.exports = {
    farmerProfileOne,
    farmerProfileTwo,
    insertFarmers,
};
