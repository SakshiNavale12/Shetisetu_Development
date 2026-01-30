const Joi = require('joi');

const predictYield = {
  body: Joi.object().keys({
    district: Joi.string().required(),
    taluka: Joi.string(),
    cropName: Joi.string().required(),
    cropType: Joi.string().valid('cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'sugarcane', 'cotton', 'other'),
    season: Joi.string().valid('kharif', 'rabi', 'summer', 'perennial').required(),
    cultivatedArea: Joi.number().positive().required(),
    unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
    irrigationType: Joi.string()
      .valid('rainfed', 'canal', 'well', 'borewell', 'drip', 'sprinkler', 'mixed')
      .required(),
    sowingDate: Joi.date().required(),
    historicalYieldAvg: Joi.number(),
    rainfallDeviation: Joi.number(),
  }),
};

const assessRisk = {
  body: Joi.object().keys({
    district: Joi.string().required(),
    taluka: Joi.string(),
    cropName: Joi.string().required(),
    cropType: Joi.string(),
    season: Joi.string().valid('kharif', 'rabi', 'summer', 'perennial').required(),
    cultivatedArea: Joi.number().positive().required(),
    unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
    irrigationType: Joi.string()
      .valid('rainfed', 'canal', 'well', 'borewell', 'drip', 'sprinkler', 'mixed')
      .required(),
    historicalLossRate: Joi.number().min(0).max(1),
    pestHistoryScore: Joi.number().min(0).max(1),
  }),
};

const predictLoss = {
  body: Joi.object().keys({
    district: Joi.string().required(),
    cropName: Joi.string().required(),
    lossType: Joi.string().valid(
      'drought',
      'flood',
      'hailstorm',
      'pest',
      'disease',
      'unseasonal_rain',
      'frost',
      'fire',
      'other'
    ),
    growthStage: Joi.string().valid('germination', 'vegetative', 'flowering', 'maturity'),
    affectedArea: Joi.number().positive().required(),
    unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
    currentMonthRainfall: Joi.number(),
    temperatureDeviation: Joi.number(),
    daysSinceSowing: Joi.number().integer().min(0),
  }),
};

module.exports = {
  predictYield,
  assessRisk,
  predictLoss,
};
