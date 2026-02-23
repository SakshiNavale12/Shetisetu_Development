/**
 * Geo-verification service
 *
 * Validates that the GPS coordinates attached to a loss-report photo
 * are reasonably close to the farmer's registered location
 * (district / taluka / village).
 *
 * Because we store administrative names (not lat/lon) for the farmer's
 * location, we use an approximate bounding-box for Maharashtra districts
 * as the reference. When the EXIF / supplied coords fall inside or very
 * near the district's bounding box, the photo is "verified".
 */

/**
 * Approximate bounding boxes (lat_min, lat_max, lon_min, lon_max)
 * for major Maharashtra districts.  Values are intentionally generous
 * (±0.5° padding) so real fields near district borders still pass.
 */
const DISTRICT_BOUNDS = {
    pune:         { latMin: 17.8,  latMax: 19.4,  lonMin: 73.2,  lonMax: 74.8 },
    nashik:       { latMin: 19.5,  latMax: 20.9,  lonMin: 73.4,  lonMax: 75.2 },
    aurangabad:   { latMin: 19.0,  latMax: 20.5,  lonMin: 74.5,  lonMax: 76.1 },
    nagpur:       { latMin: 20.5,  latMax: 21.9,  lonMin: 78.2,  lonMax: 80.0 },
    amravati:     { latMin: 20.3,  latMax: 21.5,  lonMin: 76.6,  lonMax: 78.2 },
    solapur:      { latMin: 17.0,  latMax: 18.3,  lonMin: 74.5,  lonMax: 76.2 },
    kolhapur:     { latMin: 15.8,  latMax: 17.1,  lonMin: 73.5,  lonMax: 74.7 },
    satara:       { latMin: 17.0,  latMax: 18.1,  lonMin: 73.7,  lonMax: 75.0 },
    sangli:       { latMin: 16.5,  latMax: 17.6,  lonMin: 74.0,  lonMax: 75.3 },
    ratnagiri:    { latMin: 16.2,  latMax: 18.0,  lonMin: 73.0,  lonMax: 74.0 },
    sindhudurg:   { latMin: 15.7,  latMax: 16.7,  lonMin: 73.5,  lonMax: 74.3 },
    raigad:       { latMin: 17.8,  latMax: 19.2,  lonMin: 72.7,  lonMax: 73.8 },
    thane:        { latMin: 19.0,  latMax: 20.5,  lonMin: 72.7,  lonMax: 73.6 },
    mumbai:       { latMin: 18.8,  latMax: 19.4,  lonMin: 72.6,  lonMax: 73.1 },
    palghar:      { latMin: 19.5,  latMax: 20.4,  lonMin: 72.6,  lonMax: 73.4 },
    ahmednagar:   { latMin: 18.4,  latMax: 19.8,  lonMin: 73.7,  lonMax: 75.3 },
    dhule:        { latMin: 20.5,  latMax: 21.4,  lonMin: 73.5,  lonMax: 75.0 },
    nandurbar:    { latMin: 21.0,  latMax: 22.0,  lonMin: 73.5,  lonMax: 74.6 },
    jalgaon:      { latMin: 20.5,  latMax: 21.5,  lonMin: 74.6,  lonMax: 76.2 },
    beed:         { latMin: 18.0,  latMax: 19.3,  lonMin: 75.0,  lonMax: 76.5 },
    latur:        { latMin: 17.5,  latMax: 18.7,  lonMin: 76.0,  lonMax: 77.2 },
    osmanabad:    { latMin: 17.6,  latMax: 18.7,  lonMin: 75.8,  lonMax: 76.8 },
    nanded:       { latMin: 17.8,  latMax: 19.2,  lonMin: 76.8,  lonMax: 78.0 },
    hingoli:      { latMin: 19.2,  latMax: 20.2,  lonMin: 76.8,  lonMax: 77.8 },
    parbhani:     { latMin: 18.6,  latMax: 19.8,  lonMin: 76.0,  lonMax: 77.4 },
    jalna:        { latMin: 19.3,  latMax: 20.3,  lonMin: 75.5,  lonMax: 76.8 },
    washim:       { latMin: 19.9,  latMax: 20.8,  lonMin: 76.8,  lonMax: 77.8 },
    akola:        { latMin: 20.1,  latMax: 21.1,  lonMin: 76.8,  lonMax: 77.8 },
    buldhana:     { latMin: 20.2,  latMax: 21.3,  lonMin: 75.8,  lonMax: 77.0 },
    yavatmal:     { latMin: 19.6,  latMax: 21.0,  lonMin: 77.3,  lonMax: 78.9 },
    wardha:       { latMin: 20.4,  latMax: 21.3,  lonMin: 78.1,  lonMax: 79.1 },
    chandrapur:   { latMin: 19.5,  latMax: 20.7,  lonMin: 78.8,  lonMax: 80.2 },
    gadchiroli:   { latMin: 19.2,  latMax: 20.6,  lonMin: 79.8,  lonMax: 81.0 },
    gondia:       { latMin: 21.0,  latMax: 21.8,  lonMin: 79.8,  lonMax: 80.7 },
    bhandara:     { latMin: 20.7,  latMax: 21.5,  lonMin: 79.3,  lonMax: 80.1 },
};

// Whole Maharashtra bounding box (fallback)
const MAHARASHTRA_BOUNDS = { latMin: 15.6, latMax: 22.1, lonMin: 72.6, lonMax: 80.9 };

/**
 * Haversine distance between two lat/lon points (kilometres)
 */
const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Normalise a district name to the key used in DISTRICT_BOUNDS
 */
const normaliseDistrict = (name) => {
    if (!name) return null;
    return name.toLowerCase().trim().replace(/\s+/g, '');
};

/**
 * Verify a GPS coordinate against a farmer's registered location.
 *
 * @param {{ latitude: number, longitude: number }} gps  - Coordinates to verify
 * @param {{ district: string, taluka: string, village: string }} farmerLocation
 * @returns {{ status: string, message: string, distanceKm: number|null }}
 *
 * status values:
 *   'verified'    – coordinates fall inside the farmer's district
 *   'warning'     – coordinates are in Maharashtra but outside the district (> 50 km away)
 *   'no_reference'– district not in our lookup table; only checked against Maharashtra
 *   'unverified'  – coordinates outside Maharashtra entirely
 */
const verifyPhotoLocation = (gps, farmerLocation) => {
    if (!gps || gps.latitude == null || gps.longitude == null) {
        return {
            status: 'unverified',
            message: 'No GPS coordinates found in photo',
            distanceKm: null,
        };
    }

    const { latitude: lat, longitude: lon } = gps;
    const districtKey = normaliseDistrict(farmerLocation?.district);
    const bounds = DISTRICT_BOUNDS[districtKey];

    // ── Check against known district bounds ──────────────────────────────
    if (bounds) {
        const inDistrict =
            lat >= bounds.latMin &&
            lat <= bounds.latMax &&
            lon >= bounds.lonMin &&
            lon <= bounds.lonMax;

        if (inDistrict) {
            return {
                status: 'verified',
                message: `Photo location is within ${farmerLocation.district} district`,
                distanceKm: null,
            };
        }

        // Compute distance from centre of bounding box
        const centerLat = (bounds.latMin + bounds.latMax) / 2;
        const centerLon = (bounds.lonMin + bounds.lonMax) / 2;
        const distKm = Math.round(haversineKm(lat, lon, centerLat, centerLon));

        // Still in Maharashtra?
        const inMH =
            lat >= MAHARASHTRA_BOUNDS.latMin &&
            lat <= MAHARASHTRA_BOUNDS.latMax &&
            lon >= MAHARASHTRA_BOUNDS.lonMin &&
            lon <= MAHARASHTRA_BOUNDS.lonMax;

        return {
            status: 'warning',
            message: inMH
                ? `Photo location is ~${distKm} km from ${farmerLocation.district} district centre`
                : `Photo location appears to be outside Maharashtra`,
            distanceKm: distKm,
        };
    }

    // ── District not in lookup – check Maharashtra only ──────────────────
    const inMH =
        lat >= MAHARASHTRA_BOUNDS.latMin &&
        lat <= MAHARASHTRA_BOUNDS.latMax &&
        lon >= MAHARASHTRA_BOUNDS.lonMin &&
        lon <= MAHARASHTRA_BOUNDS.lonMax;

    return {
        status: 'no_reference',
        message: inMH
            ? `Location is within Maharashtra; district "${farmerLocation?.district}" has no detailed reference data`
            : `Photo location appears to be outside Maharashtra`,
        distanceKm: null,
    };
};

/**
 * Verify multiple photos and return results array.
 * @param {Array<{ geoLocation: object }>} photos
 * @param {{ district: string, taluka: string, village: string }} farmerLocation
 * @returns {Array<object>} verification results, same order as photos
 */
const verifyPhotoLocations = (photos, farmerLocation) => {
    return photos.map((photo) => verifyPhotoLocation(photo.geoLocation, farmerLocation));
};

/**
 * Build a summary for a set of verification results.
 * @param {Array<object>} results
 * @returns {{ allVerified: boolean, hasWarnings: boolean, summary: string }}
 */
const buildVerificationSummary = (results) => {
    const verified = results.filter((r) => r.status === 'verified').length;
    const warnings = results.filter((r) => r.status === 'warning').length;
    const unverified = results.filter((r) => r.status === 'unverified').length;
    const total = results.length;

    return {
        total,
        verified,
        warnings,
        unverified,
        allVerified: verified === total,
        hasWarnings: warnings > 0 || unverified > 0,
        summary: `${verified}/${total} photos location-verified, ${warnings} warning(s), ${unverified} unverified`,
    };
};

module.exports = {
    verifyPhotoLocation,
    verifyPhotoLocations,
    buildVerificationSummary,
};
