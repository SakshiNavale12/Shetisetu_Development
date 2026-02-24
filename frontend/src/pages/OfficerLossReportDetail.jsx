import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const lossTypes = [
    { value: 'drought', label: 'Drought', labelMr: 'दुष्काळ', icon: '☀️' },
    { value: 'flood', label: 'Flood', labelMr: 'पूर', icon: '🌊' },
    { value: 'hailstorm', label: 'Hailstorm', labelMr: 'गारपीठ', icon: '🌨️' },
    { value: 'pest', label: 'Pest Attack', labelMr: 'कीड', icon: '🐛' },
    { value: 'disease', label: 'Disease', labelMr: 'रोग', icon: '🦠' },
    { value: 'unseasonal_rain', label: 'Unseasonal Rain', labelMr: 'अवेळी पाऊस', icon: '🌧️' },
    { value: 'frost', label: 'Frost', labelMr: 'दंव', icon: '❄️' },
    { value: 'fire', label: 'Fire', labelMr: 'आग', icon: '🔥' },
    { value: 'other', label: 'Other', labelMr: 'इतर', icon: '⚠️' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const geoVerifColor = (status) => {
    const map = {
        verified: 'bg-green-100 text-green-800 border-green-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        no_reference: 'bg-blue-100 text-blue-800 border-blue-300',
        unverified: 'bg-gray-100 text-gray-600 border-gray-300',
    };
    return map[status] || map.unverified;
};

const geoVerifIcon = (status) => {
    const map = { verified: '✓', warning: '⚠', no_reference: 'ℹ', unverified: '?' };
    return map[status] || '?';
};

const statusColor = (status) => {
    const map = {
        draft: 'default', submitted: 'warning', under_review: 'primary',
        site_visit_scheduled: 'primary', verified: 'success', approved: 'success',
        rejected: 'error', compensation_processed: 'success',
    };
    return map[status] || 'default';
};

const mapsUrl = (lat, lon) =>
    `https://www.google.com/maps?q=${lat},${lon}`;

const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

// ── Photo Card ────────────────────────────────────────────────────────────────

function GeoPhotoCard({ photo, index, fieldLocation }) {
    const [lightbox, setLightbox] = useState(false);
    const geo = photo.geoLocation;
    const hasGeo = geo && geo.latitude != null;

    // Compute distance between photo GPS and the report's fieldLocation
    let distanceNote = null;
    if (hasGeo && fieldLocation?.latitude) {
        const km = haversineKm(
            fieldLocation.latitude, fieldLocation.longitude,
            geo.latitude, geo.longitude
        );
        distanceNote = `${km} km from field location`;
    }

    return (
        <>
            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setLightbox(false)}
                >
                    <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`${BASE_URL}${photo.url}`}
                            alt={`Evidence ${index + 1}`}
                            className="w-full rounded-lg shadow-2xl"
                        />
                        <div className="mt-3 bg-white rounded-lg p-4 space-y-2 text-sm">
                            {hasGeo && (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📍</span>
                                    <div>
                                        <p className="font-mono font-semibold">
                                            {geo.latitude.toFixed(6)}°, {geo.longitude.toFixed(6)}°
                                        </p>
                                        {geo.accuracy != null && (
                                            <p className="text-xs text-gray-500">Accuracy: ±{geo.accuracy} m</p>
                                        )}
                                    </div>
                                    <a
                                        href={mapsUrl(geo.latitude, geo.longitude)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto text-blue-600 hover:underline text-xs font-medium"
                                    >
                                        Open in Maps ↗
                                    </a>
                                </div>
                            )}
                            {distanceNote && (
                                <p className="text-xs text-gray-500">📏 {distanceNote}</p>
                            )}
                            {photo.capturedAt && (
                                <p className="text-xs text-gray-500">
                                    📅 {new Date(photo.capturedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setLightbox(false)}
                            className="mt-3 w-full py-2 bg-white text-gray-700 rounded-lg font-medium"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div
                    className="relative cursor-pointer"
                    onClick={() => setLightbox(true)}
                    title="Click to enlarge"
                >
                    <img
                        src={`${BASE_URL}${photo.url}`}
                        alt={`Evidence photo ${index + 1}`}
                        className="w-full h-44 object-cover"
                    />
                    {/* Geo-verification overlay badge */}
                    {hasGeo && (
                        <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded border ${geoVerifColor('verified')}`}>
                            {geoVerifIcon('verified')} GPS Tagged
                        </div>
                    )}
                    {!hasGeo && (
                        <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded border ${geoVerifColor('unverified')}`}>
                            ? No GPS
                        </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                        🔍 Click to zoom
                    </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-gray-500 capitalize">
                            {photo.type || 'damage'}
                        </span>
                        <span className="text-xs text-gray-400">Photo {index + 1}</span>
                    </div>

                    {photo.caption && (
                        <p className="text-xs text-gray-600 italic">"{photo.caption}"</p>
                    )}

                    {/* GPS coordinates */}
                    {hasGeo ? (
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                            <div className="flex items-start justify-between gap-1">
                                <div>
                                    <p className="font-semibold text-green-800">📍 GPS Location</p>
                                    <p className="font-mono text-green-700">
                                        {geo.latitude.toFixed(5)}°, {geo.longitude.toFixed(5)}°
                                    </p>
                                    {geo.accuracy != null && (
                                        <p className="text-green-600">±{Math.round(geo.accuracy)} m accuracy</p>
                                    )}
                                    {distanceNote && (
                                        <p className="text-gray-500 mt-0.5">📏 {distanceNote}</p>
                                    )}
                                </div>
                                <a
                                    href={mapsUrl(geo.latitude, geo.longitude)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium shrink-0"
                                    title="Open in Google Maps"
                                >
                                    Maps ↗
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-500">
                            ℹ No GPS data in this photo
                        </div>
                    )}

                    {photo.capturedAt && (
                        <p className="text-xs text-gray-400">
                            📅 {new Date(photo.capturedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function OfficerLossReportDetail() {
    const { reportId } = useParams();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Officer action form
    const [action, setAction] = useState('');      // 'under_review' | 'site_visit_scheduled' | 'verified' | 'rejected'
    const [remarks, setRemarks] = useState('');
    const [siteVisitDate, setSiteVisitDate] = useState('');
    const [approvedAmount, setApprovedAmount] = useState('');
    const [runningVerification, setRunningVerification] = useState(false);

    const getAuthHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
    });

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/loss-reports/${reportId}`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) setReport(await res.json());
            else setMessage({ type: 'error', text: 'Failed to load report' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!action) return;
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const body = { status: action, remarks };
            if (action === 'site_visit_scheduled' && siteVisitDate) body.siteVisitDate = siteVisitDate;
            if (['verified', 'approved'].includes(action) && approvedAmount)
                body.approvedAmount = Number(approvedAmount);

            const res = await fetch(`${API_URL}/loss-reports/${reportId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const updated = await res.json();
                setReport(updated);
                setMessage({ type: 'success', text: `Status updated to "${action.replace(/_/g, ' ')}" successfully` });
                setAction('');
                setRemarks('');
                setSiteVisitDate('');
                setApprovedAmount('');
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.message || 'Update failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRunCalamityVerification = async () => {
        setRunningVerification(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${API_URL}/loss-reports/${reportId}/verify-calamity`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const updated = await res.json();
                setReport(updated);
                setMessage({ type: 'success', text: 'AI calamity verification completed.' });
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.message || 'Verification failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setRunningVerification(false);
        }
    };

    // ── Geo summary stats for photos ──────────────────────────────────────
    const photoStats = (() => {
        if (!report?.photos?.length) return null;
        const withGeo = report.photos.filter(p => p.geoLocation?.latitude != null).length;
        return { total: report.photos.length, withGeo, withoutGeo: report.photos.length - withGeo };
    })();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
                <Link to="/officer/dashboard"><Button variant="default">← Back to Dashboard</Button></Link>
            </div>
        );
    }

    const lossTypeInfo = lossTypes.find(t => t.value === report.lossType);

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-3xl">{lossTypeInfo?.icon || '🌧️'}</span>
                        Loss Report — Officer View
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Farmer: <strong>{report.farmer?.fullName || 'N/A'}</strong> &nbsp;|&nbsp;
                        Survey: <strong>{report.landParcel?.surveyNumber}</strong>
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link to="/officer/dashboard">
                        <Button variant="default" size="sm">← Dashboard</Button>
                    </Link>
                    {report.farmer?.id && (
                        <Link to={`/officer/farmer/${report.farmer.id}`}>
                            <Button variant="primary" size="sm">👤 View Farmer</Button>
                        </Link>
                    )}
                    <Link to={`/officer/panchanama/new?lossReport=${report.id}`}>
                        <Button variant="success" size="sm">📋 Start Inspection</Button>
                    </Link>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Status Bar */}
            <Card className={`${report.status === 'rejected' ? 'bg-red-50 border-red-200' : report.status === 'approved' || report.status === 'verified' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <Badge variant={statusColor(report.status)} className="text-base px-3 py-1 mt-1">
                            {report.status?.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        {report.verifiedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                                Verified: {new Date(report.verifiedAt).toLocaleDateString()} by {report.verifiedBy?.name || 'Officer'}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xl font-bold text-red-700">{report.damagePercentage}%</p>
                            <p className="text-xs text-gray-500">Damage</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-700">{report.affectedArea} {report.affectedAreaUnit}</p>
                            <p className="text-xs text-gray-500">Affected Area</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-red-800">₹{(report.estimatedLoss || 0).toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-500">Est. Loss</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── AI CALAMITY VERIFICATION PANEL ── */}
            {(() => {
                const cv = report.calamityVerification;
                const verifiableTypes = ['drought', 'flood', 'hailstorm', 'pest', 'unseasonal_rain', 'frost', 'fire'];
                const isVerifiable = verifiableTypes.includes(report.lossType);

                if (!isVerifiable) return null;

                const bgClass = !cv
                    ? 'bg-gray-50 border-gray-200'
                    : cv.verified === true
                    ? 'bg-green-50 border-green-300'
                    : cv.verified === false
                    ? 'bg-red-50 border-red-300'
                    : 'bg-yellow-50 border-yellow-200';

                const icon = !cv
                    ? '🤖'
                    : cv.verified === true
                    ? '✅'
                    : cv.verified === false
                    ? '❌'
                    : '⏳';

                return (
                    <Card className={bgClass}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">{icon}</span>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        AI Calamity Verification / AI आपत्ती पडताळणी
                                    </h2>
                                    {!cv ? (
                                        <p className="text-sm text-gray-500 mt-1">
                                            No AI verification has been run yet for this report.
                                            Click "Run Verification" to check if the claimed {report.lossType.replace('_', ' ')} is
                                            historically consistent with this location and date.
                                        </p>
                                    ) : (
                                        <div className="mt-2 space-y-2">
                                            {/* Verdict */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                                                    cv.verified === true
                                                        ? 'bg-green-100 text-green-800 border-green-400'
                                                        : 'bg-red-100 text-red-800 border-red-400'
                                                }`}>
                                                    {cv.verified === true ? '✓ Calamity Confirmed' : '✗ Calamity Not Confirmed'}
                                                </span>
                                                <span className="text-xs bg-white border border-gray-300 px-2 py-1 rounded-full text-gray-600">
                                                    {cv.calamityType} / {cv.calamityTypeMr}
                                                </span>
                                            </div>

                                            {/* Confidence bar */}
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                    <span>AI Confidence</span>
                                                    <span className="font-semibold">{cv.confidence}% — {cv.confidenceLabel}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${
                                                            cv.confidence >= 70 ? 'bg-green-500' :
                                                            cv.confidence >= 45 ? 'bg-yellow-500' : 'bg-red-400'
                                                        }`}
                                                        style={{ width: `${cv.confidence}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Evidence summary */}
                                            <div className="bg-white bg-opacity-70 rounded p-3 text-sm border border-gray-200">
                                                <p className="font-semibold text-gray-700 mb-1">📋 Evidence / पुरावा</p>
                                                <p className="text-gray-700">{cv.evidenceSummary}</p>
                                                {cv.evidenceSummaryMr && (
                                                    <p className="text-gray-500 text-xs mt-1 italic">{cv.evidenceSummaryMr}</p>
                                                )}
                                            </div>

                                            {/* Actual weather data table */}
                                            {cv.weatherStats && (
                                                <div className="bg-white bg-opacity-80 rounded p-3 border border-gray-200">
                                                    <p className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wide">
                                                        📡 Actual Weather Data — Open-Meteo Archive API
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                        {Object.entries(cv.weatherStats)
                                                            .filter(([k]) => k !== 'period' && k !== 'eventDates')
                                                            .map(([key, val]) => (
                                                                <div key={key} className="flex justify-between border-b border-gray-100 py-0.5">
                                                                    <span className="text-gray-500 capitalize">
                                                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                                                    </span>
                                                                    <span className="font-semibold text-gray-700 ml-2">{String(val)}</span>
                                                                </div>
                                                            ))}
                                                        {cv.weatherStats.period && (
                                                            <div className="col-span-2 text-gray-400 pt-1 text-xs">
                                                                📅 Analysis period: {cv.weatherStats.period}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Meta */}
                                            <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                                                <span>Source: <strong>{cv.dataSource === 'open_meteo_archive' ? '🌦 Open-Meteo Archive API' : cv.dataSource || cv.modelType}</strong></span>
                                                {cv.verifiedAt && (
                                                    <span>Run at: <strong>{new Date(cv.verifiedAt).toLocaleString()}</strong></span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Re-run button */}
                            <button
                                onClick={handleRunCalamityVerification}
                                disabled={runningVerification}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {runningVerification ? (
                                    <>
                                        <span className="animate-spin">⏳</span> Running...
                                    </>
                                ) : (
                                    <>🤖 {cv ? 'Re-run' : 'Run'} Verification</>
                                )}
                            </button>
                        </div>
                    </Card>
                );
            })()}

            {/* Loss & Land Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-lg font-bold mb-3 border-b pb-2">
                        {lossTypeInfo?.icon} Loss Details / नुकसान तपशील
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Loss Type</span>
                            <span className="font-semibold">{lossTypeInfo?.label} ({lossTypeInfo?.labelMr})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Loss Date</span>
                            <span className="font-semibold">{new Date(report.lossDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Crop</span>
                            <span className="font-semibold">{report.cropName} {report.cropType ? `(${report.cropType})` : ''}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Reported On</span>
                            <span className="font-semibold">{new Date(report.dateReported || report.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {report.description && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                            <p className="font-medium text-gray-500 mb-1">Description</p>
                            {report.description}
                        </div>
                    )}
                </Card>

                <Card>
                    <h2 className="text-lg font-bold mb-3 border-b pb-2">
                        🗺️ Land & Location / जमीन स्थान
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Survey Number</span>
                            <span className="font-semibold font-mono">{report.landParcel?.surveyNumber}</span>
                        </div>
                        {report.landParcel?.gutNumber && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Gut Number</span>
                                <span className="font-semibold">{report.landParcel.gutNumber}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Land Area</span>
                            <span className="font-semibold">{report.landParcel?.area} {report.landParcel?.unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Affected Area</span>
                            <span className="font-semibold text-red-700">{report.affectedArea} {report.affectedAreaUnit}</span>
                        </div>
                    </div>

                    {/* Field GPS */}
                    {report.fieldLocation?.latitude && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                            <p className="font-semibold text-blue-800 mb-1">📍 Field GPS Location</p>
                            <p className="font-mono text-blue-700">
                                {report.fieldLocation.latitude.toFixed(6)}°, {report.fieldLocation.longitude.toFixed(6)}°
                            </p>
                            <a
                                href={mapsUrl(report.fieldLocation.latitude, report.fieldLocation.longitude)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs font-medium mt-1 block"
                            >
                                📌 View field location on Google Maps ↗
                            </a>
                        </div>
                    )}
                </Card>
            </div>

            {/* ── GEO-TAGGED EVIDENCE PHOTOS ── */}
            <Card>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold">
                        📸 Geo-Tagged Evidence Photos / जीओ-टॅग पुरावा फोटो
                    </h2>
                    {photoStats && (
                        <div className="flex gap-2">
                            <span className="text-xs bg-green-100 text-green-800 border border-green-300 px-2 py-1 rounded-full font-semibold">
                                📍 {photoStats.withGeo} GPS tagged
                            </span>
                            {photoStats.withoutGeo > 0 && (
                                <span className="text-xs bg-gray-100 text-gray-600 border border-gray-300 px-2 py-1 rounded-full">
                                    {photoStats.withoutGeo} untagged
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {!report.photos || report.photos.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <div className="text-5xl mb-3">📷</div>
                        <p className="font-medium">No evidence photos uploaded</p>
                        <p className="text-sm mt-1">The farmer has not attached any photos to this report</p>
                    </div>
                ) : (
                    <>
                        {/* Geo-verification summary bar */}
                        {photoStats && (
                            <div className={`mb-4 p-3 rounded-lg border text-sm flex items-start gap-3 ${
                                photoStats.withoutGeo === 0
                                    ? 'bg-green-50 border-green-300 text-green-800'
                                    : photoStats.withGeo === 0
                                    ? 'bg-gray-50 border-gray-300 text-gray-700'
                                    : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                            }`}>
                                <span className="text-xl mt-0.5">
                                    {photoStats.withoutGeo === 0 ? '✅' : photoStats.withGeo === 0 ? 'ℹ️' : '⚠️'}
                                </span>
                                <div>
                                    <p className="font-semibold">
                                        {photoStats.withoutGeo === 0
                                            ? 'All photos have GPS location data'
                                            : photoStats.withGeo === 0
                                            ? 'No GPS location data found in photos'
                                            : `${photoStats.withGeo} of ${photoStats.total} photos have GPS data`}
                                    </p>
                                    <p className="text-xs mt-0.5">
                                        Click any photo to enlarge and view full GPS coordinates. Use the Maps link to verify the location.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Photo grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {report.photos.map((photo, i) => (
                                <GeoPhotoCard
                                    key={i}
                                    photo={photo}
                                    index={i}
                                    fieldLocation={report.fieldLocation}
                                />
                            ))}
                        </div>

                        {/* Multi-photo Map link (all GPS points) */}
                        {photoStats?.withGeo > 0 && report.fieldLocation?.latitude && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                <p className="font-semibold text-blue-800 mb-2">🗺️ Compare all photo locations vs. reported field</p>
                                <a
                                    href={mapsUrl(report.fieldLocation.latitude, report.fieldLocation.longitude)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700"
                                >
                                    📌 Open Reported Field on Google Maps ↗
                                </a>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* ── OFFICER ACTION PANEL ── */}
            {!['approved', 'compensation_processed'].includes(report.status) && (
                <Card className="bg-blue-50 border-blue-200">
                    <h2 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">
                        📋 Officer Action / अधिकारी कारवाई
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Update Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 bg-white"
                            >
                                <option value="">Select action...</option>
                                <option value="under_review">🔍 Mark as Under Review</option>
                                <option value="site_visit_scheduled">📅 Schedule Site Visit</option>
                                <option value="verified">✓ Verify Report</option>
                                <option value="approved">💰 Approve Compensation</option>
                                <option value="rejected">✗ Reject Report</option>
                            </select>
                        </div>

                        {action === 'site_visit_scheduled' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Site Visit Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={siteVisitDate}
                                    onChange={(e) => setSiteVisitDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {['verified', 'approved'].includes(action) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recommended Compensation (₹)
                                </label>
                                <input
                                    type="number"
                                    value={approvedAmount}
                                    onChange={(e) => setApprovedAmount(e.target.value)}
                                    min={0}
                                    placeholder="e.g., 25000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks / टिप्पणी {action === 'rejected' && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                            placeholder={
                                action === 'rejected'
                                    ? 'Provide reason for rejection...'
                                    : action === 'verified' || action === 'approved'
                                    ? 'Add verification notes (optional)...'
                                    : 'Add remarks (optional)...'
                            }
                        />
                    </div>

                    <div className="mt-4 flex gap-3">
                        <Button
                            variant={action === 'rejected' ? 'error' : action === 'verified' || action === 'approved' ? 'success' : 'primary'}
                            onClick={handleStatusUpdate}
                            disabled={
                                submitting ||
                                !action ||
                                (action === 'rejected' && !remarks.trim()) ||
                                (action === 'site_visit_scheduled' && !siteVisitDate)
                            }
                        >
                            {submitting ? '⏳ Updating...' : '✓ Submit Action'}
                        </Button>
                        <Link to={`/officer/panchanama/new?lossReport=${report.id}`}>
                            <Button variant="default">📋 Create Panchanama</Button>
                        </Link>
                    </div>
                </Card>
            )}

            {/* Existing verification remarks */}
            {report.verificationRemarks && (
                <Card className="bg-purple-50 border-purple-200">
                    <h2 className="text-lg font-bold text-purple-900 mb-2">✓ Verification Remarks</h2>
                    <p className="text-purple-800 bg-white p-3 rounded">{report.verificationRemarks}</p>
                </Card>
            )}
        </div>
    );
}

export default OfficerLossReportDetail;
