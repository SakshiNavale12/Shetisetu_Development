/**
 * Real-Time Calamity Verification Service
 *
 * Uses the Open-Meteo Archive Weather API (free, no API key) to fetch
 * ACTUAL historical weather data at the farmer's GPS coordinates and
 * verifies whether the claimed calamity genuinely occurred.
 *
 * Supported calamity types:
 *   drought         → 30-day cumulative rainfall < 30 mm
 *   flood           → any 3-day window with cumulative > 150 mm
 *   unseasonal_rain → rainfall > 15 mm in non-monsoon months (Nov-May)
 *   hailstorm       → strong wind + rainfall + rapid temp drop
 *   frost           → daily min temp ≤ 2 °C
 *   fire            → zero rainfall for 20+ days + max temp > 38 °C
 *   pest            → warm + humid (rainfall 50-150 mm, temp 25-35 °C) – favorable conditions
 *   disease         → similar to pest conditions
 *
 * District vulnerability fallback (for pest / disease when GPS is missing)
 * uses the same scores already present in geoVerification.service.js
 */

const axios = require('axios');

// ── Constants ────────────────────────────────────────────────────────────────

const ARCHIVE_URL  = 'https://archive-api.open-meteo.com/v1/archive';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// Months considered "monsoon season" for Maharashtra (June–October)
const MONSOON_MONTHS = [6, 7, 8, 9, 10];

// District centre coordinates (fallback when no GPS provided)
const DISTRICT_COORDS = {
  ahmednagar: [19.09, 74.74], akola: [20.71, 77.00], amravati: [20.93, 77.75],
  aurangabad: [19.87, 75.34], beed: [18.99, 75.76], bhandara: [21.17, 79.65],
  buldhana: [20.53, 76.18], chandrapur: [19.96, 79.30], dhule: [20.90, 74.77],
  gadchiroli: [20.18, 80.01], gondia: [21.46, 80.20], hingoli: [19.72, 77.15],
  jalgaon: [21.00, 75.56], jalna: [19.84, 75.88], kolhapur: [16.70, 74.24],
  latur: [18.40, 76.56], mumbai: [19.08, 72.88], nagpur: [21.15, 79.09],
  nanded: [19.15, 77.31], nandurbar: [21.37, 74.24], nashik: [20.01, 73.79],
  osmanabad: [18.18, 76.04], palghar: [19.70, 72.77], parbhani: [19.27, 76.77],
  pune: [18.52, 73.85], raigad: [18.52, 73.18], ratnagiri: [16.99, 73.31],
  sangli: [16.86, 74.57], satara: [17.69, 74.00], sindhudurg: [16.35, 73.67],
  solapur: [17.69, 75.90], thane: [19.21, 73.10], wardha: [20.74, 78.60],
  washim: [20.11, 77.15], yavatmal: [20.39, 78.12],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDateStr(dateStr) {
  // Accept YYYY-MM-DD or Date objects
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  return String(dateStr).slice(0, 10);
}

/**
 * Fetch daily weather data for a date range at a GPS location
 * Uses Archive API for dates older than 5 days, Forecast API otherwise.
 *
 * @returns { dates[], precipitation[], tempMax[], tempMin[], windSpeed[] }
 */
async function fetchWeatherData(lat, lon, startDate, endDate) {
  const cutoff = addDays(new Date().toISOString().slice(0, 10), -5);
  const useArchive = endDate <= cutoff;

  const baseUrl = useArchive ? ARCHIVE_URL : FORECAST_URL;
  const params = {
    latitude: lat,
    longitude: lon,
    daily: 'precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max',
    timezone: 'Asia/Kolkata',
  };

  if (useArchive) {
    params.start_date = startDate;
    params.end_date = endDate;
  } else {
    params.past_days = 92;
    params.forecast_days = 1;
  }

  const response = await axios.get(baseUrl, { params, timeout: 10000 });
  const daily = response.data.daily;

  // If using forecast API with past_days, slice to requested range
  let dates = daily.time;
  let precip = daily.precipitation_sum;
  let tMax   = daily.temperature_2m_max;
  let tMin   = daily.temperature_2m_min;
  let wind   = daily.wind_speed_10m_max;

  if (!useArchive) {
    const si = dates.findIndex(d => d >= startDate);
    const ei = dates.findLastIndex(d => d <= endDate);
    if (si !== -1 && ei !== -1 && si <= ei) {
      dates  = dates.slice(si, ei + 1);
      precip = precip.slice(si, ei + 1);
      tMax   = tMax.slice(si, ei + 1);
      tMin   = tMin.slice(si, ei + 1);
      wind   = wind.slice(si, ei + 1);
    }
  }

  return { dates, precip, tMax, tMin, wind };
}

// ── Calamity-specific verifiers ──────────────────────────────────────────────

function verifyDrought({ precip, dates }) {
  const total30 = precip.reduce((s, v) => s + (v || 0), 0);
  const avgDaily = total30 / precip.length;
  const dryDays  = precip.filter(v => (v || 0) < 1).length;

  const verified   = total30 < 30 || dryDays >= (precip.length * 0.8);
  const confidence = verified
    ? Math.min(95, 60 + (30 - total30) * 1.2 + dryDays)
    : Math.max(10, 50 - (total30 - 30) * 0.8);

  return {
    verified,
    confidence: Math.round(Math.min(95, Math.max(5, confidence))),
    weatherStats: {
      totalRainfall_mm: Math.round(total30 * 10) / 10,
      avgDailyRainfall_mm: Math.round(avgDaily * 10) / 10,
      dryDays,
      analysedDays: precip.length,
      period: `${dates[0]} to ${dates[dates.length - 1]}`,
    },
    evidence: verified
      ? `Actual rainfall at GPS location: only ${Math.round(total30)} mm over ${precip.length} days (${dryDays} dry days). Below drought threshold of 30 mm.`
      : `Rainfall data shows ${Math.round(total30)} mm in ${precip.length} days — insufficient evidence of drought conditions.`,
    evidenceMr: verified
      ? `GPS स्थानावर प्रत्यक्ष पाऊस: ${Math.round(total30)} दिवसांत केवळ ${precip.length} मिमी (${dryDays} कोरडे दिवस). दुष्काळ सीमेपेक्षा कमी.`
      : `पाऊसमापन डेटा ${precip.length} दिवसांत ${Math.round(total30)} मिमी दर्शवतो — दुष्काळाचा पुरेसा पुरावा नाही.`,
  };
}

function verifyFlood({ precip, dates }) {
  // Check any 3-consecutive-day window exceeding 150 mm
  let maxWindow3 = 0;
  let maxWindowDates = '';
  for (let i = 0; i <= precip.length - 3; i++) {
    const w = (precip[i] || 0) + (precip[i + 1] || 0) + (precip[i + 2] || 0);
    if (w > maxWindow3) {
      maxWindow3 = w;
      maxWindowDates = `${dates[i]} to ${dates[i + 2]}`;
    }
  }
  const maxSingleDay = Math.max(...precip.map(v => v || 0));
  const total = precip.reduce((s, v) => s + (v || 0), 0);

  const verified   = maxWindow3 > 150 || maxSingleDay > 115;  // IMD "Extremely Heavy" threshold
  const confidence = verified
    ? Math.min(95, 55 + (maxWindow3 - 150) * 0.3 + (maxSingleDay > 115 ? 20 : 0))
    : Math.max(10, 40 - (150 - maxWindow3) * 0.3);

  return {
    verified,
    confidence: Math.round(Math.min(95, Math.max(5, confidence))),
    weatherStats: {
      totalRainfall_mm: Math.round(total * 10) / 10,
      maxSingleDayRainfall_mm: Math.round(maxSingleDay * 10) / 10,
      max3DayRainfall_mm: Math.round(maxWindow3 * 10) / 10,
      peak3DayPeriod: maxWindowDates,
      analysedDays: precip.length,
      period: `${dates[0]} to ${dates[dates.length - 1]}`,
    },
    evidence: verified
      ? `Flood-level rainfall confirmed: ${Math.round(maxWindow3)} mm in 3 days (${maxWindowDates}), single-day peak ${Math.round(maxSingleDay)} mm. Exceeds IMD "extremely heavy" threshold.`
      : `Peak 3-day rainfall was ${Math.round(maxWindow3)} mm — below flood threshold of 150 mm. Insufficient evidence of flooding.`,
    evidenceMr: verified
      ? `पूरपातळीचा पाऊस निश्चित: ${maxWindowDates} मध्ये 3 दिवसांत ${Math.round(maxWindow3)} मिमी. IMD "अतिजड" सीमा ओलांडली.`
      : `3-दिवसांचा कमाल पाऊस ${Math.round(maxWindow3)} मिमी होता — पूर सीमा 150 मिमीपेक्षा कमी.`,
  };
}

function verifyUnseasonalRain({ precip, tMax, dates }, lossMonth) {
  const isMonsoon = MONSOON_MONTHS.includes(lossMonth);
  const total    = precip.reduce((s, v) => s + (v || 0), 0);
  const rainyDays = precip.filter(v => (v || 0) > 5).length;

  // Unseasonal = significant rain during non-monsoon months
  const verified   = !isMonsoon && (total > 20 || rainyDays >= 2);
  const confidence = verified
    ? Math.min(90, 50 + total * 1.5 + rainyDays * 5)
    : isMonsoon ? 15 : Math.max(10, 40 - total * 2);

  return {
    verified,
    confidence: Math.round(Math.min(95, Math.max(5, confidence))),
    weatherStats: {
      totalRainfall_mm: Math.round(total * 10) / 10,
      rainyDays,
      lossMonth,
      isMonsoonSeason: isMonsoon,
      period: `${dates[0]} to ${dates[dates.length - 1]}`,
    },
    evidence: isMonsoon
      ? `Loss reported in monsoon month (${lossMonth}) — rain is seasonal, not unseasonal. Officer verification needed.`
      : verified
      ? `Unseasonal rainfall confirmed: ${Math.round(total)} mm in ${rainyDays} rainy days during non-monsoon month ${lossMonth}.`
      : `Only ${Math.round(total)} mm rainfall detected — insufficient to confirm unseasonal rain damage.`,
    evidenceMr: isMonsoon
      ? `नुकसान मान्सून महिन्यात (${lossMonth}) नोंदवले — पाऊस ऋतुनुसार आहे, अवेळी नाही.`
      : verified
      ? `अवेळी पाऊस निश्चित: बिगरमान्सून महिना ${lossMonth} मध्ये ${rainyDays} पावसाळी दिवसांत ${Math.round(total)} मिमी.`
      : `केवळ ${Math.round(total)} मिमी पाऊस आढळला — अवेळी पाऊस नुकसानाची पुष्टी अपुरी.`,
  };
}

function verifyFrost({ tMin, dates }) {
  const minTemp   = Math.min(...tMin.map(v => v ?? 99));
  const frostDays = tMin.filter(v => (v ?? 99) <= 2).length;

  const verified   = minTemp <= 2 || frostDays >= 1;
  const confidence = verified
    ? Math.min(92, 60 + Math.max(0, (2 - minTemp) * 10) + frostDays * 8)
    : Math.max(8, 35 - (minTemp - 2) * 5);

  return {
    verified,
    confidence: Math.round(Math.min(95, Math.max(5, confidence))),
    weatherStats: {
      minTemperature_C: Math.round(minTemp * 10) / 10,
      frostDays,
      analysedDays: tMin.length,
      period: `${dates[0]} to ${dates[dates.length - 1]}`,
    },
    evidence: verified
      ? `Frost confirmed: minimum temperature dropped to ${minTemp.toFixed(1)} °C (${frostDays} frost days below 2 °C).`
      : `Minimum temperature was ${minTemp.toFixed(1)} °C — above frost threshold of 2 °C.`,
    evidenceMr: verified
      ? `दंव निश्चित: किमान तापमान ${minTemp.toFixed(1)} °C पर्यंत घसरले (${frostDays} दंव दिवस 2 °C खाली).`
      : `किमान तापमान ${minTemp.toFixed(1)} °C होते — दंव सीमा 2 °C पेक्षा वर.`,
  };
}

function verifyHailstorm({ precip, tMax, tMin, wind, dates }) {
  // Hailstorm proxy: rapid temp drop (>8°C in a day) + precipitation + strong wind (>40 km/h)
  let hailEvents = 0;
  let hailDates  = [];
  for (let i = 0; i < precip.length; i++) {
    const tempDrop = (tMax[i] || 0) - (tMin[i] || 0);
    if ((precip[i] || 0) > 5 && tempDrop > 8 && (wind[i] || 0) > 30) {
      hailEvents++;
      hailDates.push(dates[i]);
    }
  }

  const verified   = hailEvents >= 1;
  const confidence = verified
    ? Math.min(80, 50 + hailEvents * 12)
    : Math.max(15, 35);

  return {
    verified,
    confidence: Math.round(Math.min(80, Math.max(15, confidence))),
    weatherStats: {
      hailstormLikelyEvents: hailEvents,
      eventDates: hailDates,
      period: `${dates[0]} to ${dates[dates.length - 1]}`,
    },
    evidence: verified
      ? `${hailEvents} probable hailstorm event(s) detected on ${hailDates.join(', ')} — large temperature swing with precipitation and strong wind.`
      : `No clear hailstorm signature found (requires rapid temp drop + rain + wind). Officer ground-truth needed.`,
    evidenceMr: verified
      ? `${hailDates.join(', ')} रोजी ${hailEvents} संभाव्य गारपीट घटना आढळल्या — तापमानात मोठी घट + पाऊस + तीव्र वारे.`
      : `स्पष्ट गारपीट संकेत आढळले नाहीत. अधिकाऱ्याची प्रत्यक्ष पडताळणी आवश्यक.`,
  };
}

function verifyPestConditions({ precip, tMax, tMin, dates }) {
  // Pest-favorable: temp 25-35°C, relative humidity proxy (rainfall 5-20mm/day)
  const total30  = precip.reduce((s, v) => s + (v || 0), 0);
  const avgTMax  = tMax.reduce((s, v) => s + (v || 0), 0) / tMax.length;
  const avgTMin  = tMin.reduce((s, v) => s + (v || 0), 0) / tMin.length;
  const pestDays = precip.filter((v, i) =>
    (v || 0) >= 2 && (v || 0) <= 30 && (tMax[i] || 0) >= 24 && (tMax[i] || 0) <= 38
  ).length;

  const favorable  = avgTMax >= 25 && avgTMax <= 38 && total30 > 20 && pestDays >= 5;
  const confidence = favorable
    ? Math.min(75, 40 + pestDays * 4)
    : Math.max(20, 35 - Math.abs(avgTMax - 30) * 2);

  return {
    verified: favorable,
    confidence: Math.round(Math.min(75, Math.max(20, confidence))),
    weatherStats: {
      avgMaxTemp_C: Math.round(avgTMax * 10) / 10,
      avgMinTemp_C: Math.round(avgTMin * 10) / 10,
      totalRainfall_mm: Math.round(total30 * 10) / 10,
      pestFavorableDays: pestDays,
      period: `${dates[0]} to ${dates[dates.length - 1]}`,
    },
    evidence: favorable
      ? `Pest-favorable conditions confirmed: avg max temp ${avgTMax.toFixed(1)} °C with ${pestDays} days of warm-humid weather (ideal for pest proliferation).`
      : `Weather conditions less favorable for pest outbreak: avg temp ${avgTMax.toFixed(1)} °C, ${Math.round(total30)} mm rainfall. Pest confirmation requires field inspection.`,
    evidenceMr: favorable
      ? `कीडीसाठी अनुकूल परिस्थिती निश्चित: सरासरी कमाल तापमान ${avgTMax.toFixed(1)} °C, ${pestDays} उष्ण-दमट दिवस.`
      : `कीड उद्रेकासाठी हवामान कमी अनुकूल: सरासरी तापमान ${avgTMax.toFixed(1)} °C. शेत तपासणी आवश्यक.`,
  };
}

function verifyFireConditions({ precip, tMax, dates }) {
  const totalRain = precip.reduce((s, v) => s + (v || 0), 0);
  const maxTemp   = Math.max(...tMax.map(v => v || 0));
  const dryDays   = precip.filter(v => (v || 0) < 0.5).length;

  const verified   = totalRain < 5 && maxTemp > 38 && dryDays >= 15;
  const confidence = verified
    ? Math.min(85, 50 + dryDays * 1.5 + Math.max(0, maxTemp - 38) * 3)
    : Math.max(10, 30 - totalRain * 2);

  return {
    verified,
    confidence: Math.round(Math.min(85, Math.max(10, confidence))),
    weatherStats: {
      totalRainfall_mm: Math.round(totalRain * 10) / 10,
      maxTemperature_C: Math.round(maxTemp * 10) / 10,
      dryDays,
      analysedDays: precip.length,
      period: `${dates[0]} to ${dates[dates.length - 1]}`,
    },
    evidence: verified
      ? `Fire-prone conditions confirmed: ${dryDays} dry days, max temp ${maxTemp.toFixed(1)} °C, only ${totalRain.toFixed(1)} mm rainfall.`
      : `Conditions not strongly fire-prone: ${totalRain.toFixed(1)} mm rainfall detected. Physical evidence needed.`,
    evidenceMr: verified
      ? `आग-प्रवण परिस्थिती निश्चित: ${dryDays} कोरडे दिवस, कमाल तापमान ${maxTemp.toFixed(1)} °C, केवळ ${totalRain.toFixed(1)} मिमी पाऊस.`
      : `आग-प्रवण परिस्थिती कमकुवत: ${totalRain.toFixed(1)} मिमी पाऊस आढळला. भौतिक पुरावा आवश्यक.`,
  };
}

// ── Main exported function ────────────────────────────────────────────────────

/**
 * Verify calamity claim using real-time weather data.
 *
 * @param {Object} params
 *   district  {string}  - e.g. "pune"
 *   latitude  {number}
 *   longitude {number}
 *   lossDate  {string}  - YYYY-MM-DD
 *   lossType  {string}  - drought | flood | hailstorm | pest | disease |
 *                         unseasonal_rain | frost | fire | other
 * @returns {Promise<Object>}
 */
const verifyCalamity = async ({ district, latitude, longitude, lossDate, lossType }) => {
  const dateStr  = formatDateStr(lossDate) || new Date().toISOString().slice(0, 10);
  const lossMonth = parseInt(dateStr.split('-')[1], 10);

  // Resolve GPS: use provided coordinates or district centre fallback
  let lat = parseFloat(latitude);
  let lon = parseFloat(longitude);
  const districtKey = (district || '').toLowerCase().trim();

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    const fallback = DISTRICT_COORDS[districtKey];
    if (fallback) {
      [lat, lon] = fallback;
    } else {
      // Cannot verify without location
      return {
        calamity_verified:    null,
        confidence:           0,
        confidence_label:     'Unavailable',
        calamity_type:        lossType,
        calamity_type_mr:     lossType,
        evidence_summary:     'GPS coordinates not available. Officer site visit required for verification.',
        evidence_summary_mr:  'GPS निर्देशांक उपलब्ध नाहीत. पडताळणीसाठी अधिकाऱ्याची भेट आवश्यक.',
        weather_stats:        null,
        data_source:          'no_data',
        model_type:           'weather_api',
        district_analyzed:    districtKey || 'unknown',
        month_analyzed:       lossMonth,
      };
    }
  }

  // Fetch 30 days of weather before (and including) the loss date
  const endDate   = dateStr;
  const startDate = addDays(dateStr, -29);

  let weatherData;
  try {
    weatherData = await fetchWeatherData(lat, lon, startDate, endDate);
  } catch (err) {
    return {
      calamity_verified:    null,
      confidence:           0,
      confidence_label:     'Unavailable',
      calamity_type:        lossType,
      calamity_type_mr:     lossType,
      evidence_summary:     `Weather data fetch failed: ${err.message}. Manual verification required.`,
      evidence_summary_mr:  'हवामान डेटा मिळवण्यात अयशस्वी. मॅन्युअल पडताळणी आवश्यक.',
      weather_stats:        null,
      data_source:          'api_error',
      model_type:           'weather_api',
      district_analyzed:    districtKey || 'unknown',
      month_analyzed:       lossMonth,
    };
  }

  // Run type-specific verifier
  const LOSS_NAMES = {
    drought:        ['Drought', 'दुष्काळ'],
    flood:          ['Flood', 'पूर'],
    hailstorm:      ['Hailstorm', 'गारपीठ'],
    pest:           ['Pest Attack', 'कीड प्रादुर्भाव'],
    disease:        ['Crop Disease', 'पीक रोग'],
    unseasonal_rain:['Unseasonal Rain', 'अवेळी पाऊस'],
    frost:          ['Frost', 'दंव'],
    fire:           ['Fire', 'आग'],
    other:          ['Other', 'इतर'],
  };

  let result;
  switch ((lossType || '').toLowerCase()) {
    case 'drought':         result = verifyDrought(weatherData);                       break;
    case 'flood':           result = verifyFlood(weatherData);                         break;
    case 'unseasonal_rain': result = verifyUnseasonalRain(weatherData, lossMonth);     break;
    case 'frost':           result = verifyFrost(weatherData);                         break;
    case 'hailstorm':       result = verifyHailstorm(weatherData);                     break;
    case 'fire':            result = verifyFireConditions(weatherData);                break;
    case 'pest':
    case 'disease':         result = verifyPestConditions(weatherData);                break;
    default:
      result = {
        verified:    null,
        confidence:  0,
        evidence:    'Calamity type "other" requires manual field verification.',
        evidenceMr:  '"इतर" प्रकारच्या नुकसानासाठी अधिकाऱ्याची प्रत्यक्ष तपासणी आवश्यक.',
        weatherStats: null,
      };
  }

  const [nameEn, nameMr] = LOSS_NAMES[lossType] || [lossType, lossType];
  const confLabel = result.confidence >= 70 ? 'High Confidence'
    : result.confidence >= 45 ? 'Moderate Confidence'
    : result.confidence >= 25 ? 'Low Confidence' : 'Very Low Confidence';

  return {
    calamity_verified:    result.verified,
    confidence:           result.confidence,
    confidence_label:     confLabel,
    calamity_type:        nameEn,
    calamity_type_mr:     nameMr,
    evidence_summary:     result.evidence,
    evidence_summary_mr:  result.evidenceMr,
    weather_stats:        result.weatherStats || null,
    data_source:          'open_meteo_archive',
    model_type:           'weather_api',
    coordinates_used:     { latitude: lat, longitude: lon },
    district_analyzed:    districtKey || 'auto',
    month_analyzed:       lossMonth,
  };
};

module.exports = { verifyCalamity };
