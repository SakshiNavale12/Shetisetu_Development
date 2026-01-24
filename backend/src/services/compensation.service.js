/**
 * Compensation Service
 * Calculates compensation based on crop type, damage percentage, and applicable schemes
 */

// Scheme configurations (simplified for demo)
const schemes = {
    PMFBY: {
        name: 'Pradhan Mantri Fasal Bima Yojana',
        maxCoveragePerHectare: 50000,
        minDamageThreshold: 33, // Minimum damage % to qualify
        coverageRates: {
            food_crops: 1.5, // % of sum insured
            oilseeds: 2.0,
            commercial: 5.0,
        },
    },
    SDRF: {
        name: 'State Disaster Response Fund',
        ratesPerHectare: {
            rain_fed: 8500,
            irrigated: 17000,
            perennial: 22500,
        },
        maxArea: 2, // hectares
    },
    STATE: {
        name: 'State Compensation Scheme',
        ratesPerHectare: {
            mild: 5000,
            moderate: 10000,
            severe: 15000,
            total: 20000,
        },
    },
};

// Crop categories
const cropCategories = {
    rice: 'food_crops',
    wheat: 'food_crops',
    jowar: 'food_crops',
    bajra: 'food_crops',
    maize: 'food_crops',
    tur: 'food_crops',
    soybean: 'oilseeds',
    groundnut: 'oilseeds',
    sunflower: 'oilseeds',
    cotton: 'commercial',
    sugarcane: 'commercial',
    grapes: 'perennial',
    pomegranate: 'perennial',
    banana: 'perennial',
};

/**
 * Calculate compensation for a loss report
 * @param {Object} params - Calculation parameters
 * @param {string} params.cropType - Type of crop
 * @param {number} params.affectedArea - Affected area in hectares
 * @param {number} params.damagePercentage - Damage percentage (0-100)
 * @param {string} params.severityLevel - mild, moderate, severe, total
 * @param {string} params.irrigationType - rain_fed or irrigated
 * @param {Array} params.schemes - Array of applicable schemes ['PMFBY', 'SDRF', 'STATE']
 * @returns {Object} Compensation breakdown
 */
const calculateCompensation = (params) => {
    const {
        cropType,
        affectedArea,
        damagePercentage,
        severityLevel,
        irrigationType = 'rain_fed',
        applicableSchemes = ['STATE'],
    } = params;

    const breakdown = [];
    let totalCompensation = 0;

    const cropCategory = cropCategories[cropType?.toLowerCase()] || 'food_crops';

    // Calculate for each applicable scheme
    applicableSchemes.forEach((schemeName) => {
        const scheme = schemes[schemeName];
        if (!scheme) return;

        let amount = 0;
        let eligible = true;
        let reason = '';

        switch (schemeName) {
            case 'PMFBY':
                if (damagePercentage < scheme.minDamageThreshold) {
                    eligible = false;
                    reason = `Damage (${damagePercentage}%) below threshold (${scheme.minDamageThreshold}%)`;
                } else {
                    const rate = scheme.coverageRates[cropCategory] || 1.5;
                    amount = (scheme.maxCoveragePerHectare * rate / 100) * affectedArea * (damagePercentage / 100);
                }
                break;

            case 'SDRF':
                const sdfrRate = irrigationType === 'irrigated'
                    ? scheme.ratesPerHectare.irrigated
                    : scheme.ratesPerHectare.rain_fed;
                const eligibleArea = Math.min(affectedArea, scheme.maxArea);
                amount = sdfrRate * eligibleArea * (damagePercentage / 100);
                if (affectedArea > scheme.maxArea) {
                    reason = `Limited to ${scheme.maxArea} hectares`;
                }
                break;

            case 'STATE':
                const stateRate = scheme.ratesPerHectare[severityLevel] || scheme.ratesPerHectare.moderate;
                amount = stateRate * affectedArea;
                break;

            default:
                eligible = false;
                reason = 'Unknown scheme';
        }

        breakdown.push({
            scheme: schemeName,
            schemeName: scheme.name,
            eligible,
            amount: Math.round(amount),
            reason: reason || (eligible ? 'Eligible' : ''),
        });

        if (eligible) {
            totalCompensation += amount;
        }
    });

    return {
        cropType,
        cropCategory,
        affectedArea,
        damagePercentage,
        severityLevel,
        irrigationType,
        breakdown,
        totalCompensation: Math.round(totalCompensation),
        calculatedAt: new Date(),
    };
};

/**
 * Get applicable schemes based on loss type and area
 * @param {string} lossType - drought, flood, pest, etc.
 * @param {string} location - District or region
 * @returns {Array} List of applicable schemes
 */
const getApplicableSchemes = (lossType, location) => {
    // All areas are eligible for state scheme
    const applicableSchemes = ['STATE'];

    // Natural disasters qualify for SDRF
    const naturalDisasters = ['drought', 'flood', 'hailstorm', 'unseasonal_rain'];
    if (naturalDisasters.includes(lossType)) {
        applicableSchemes.push('SDRF');
    }

    // PMFBY for insured crops (simplified - assume all are insured)
    applicableSchemes.push('PMFBY');

    return applicableSchemes;
};

/**
 * Get scheme information
 * @param {string} schemeName
 * @returns {Object} Scheme details
 */
const getSchemeInfo = (schemeName) => {
    return schemes[schemeName] || null;
};

module.exports = {
    calculateCompensation,
    getApplicableSchemes,
    getSchemeInfo,
    schemes,
};
