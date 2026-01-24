import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

function LossReportDetail() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    const fetchReport = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/loss-reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setReport(data);
            } else {
                setMessage({ type: 'error', text: 'Failed to load loss report' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: 'default',
            submitted: 'warning',
            under_review: 'primary',
            site_visit_scheduled: 'primary',
            verified: 'success',
            approved: 'success',
            rejected: 'error',
            compensation_processed: 'success',
        };
        return colors[status] || 'default';
    };

    const getCompensationStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            approved: 'success',
            disbursed: 'success',
            rejected: 'error',
        };
        return colors[status] || 'default';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-4xl animate-pulse">🌧️</div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
                <Link to="/loss-report">
                    <Button variant="error">Back to Loss Reports</Button>
                </Link>
            </div>
        );
    }

    const lossTypeInfo = lossTypes.find(t => t.value === report.lossType);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-4xl">{lossTypeInfo?.icon || '🌧️'}</span>
                        Loss Report Details
                    </h1>
                    <p className="text-gray-600">Complete information about your loss report</p>
                </div>
                <Link to="/loss-report">
                    <Button variant="default">← Back to Reports</Button>
                </Link>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Status & Timeline */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Current Status</p>
                        <Badge variant={getStatusColor(report.status)} className="text-lg px-4 py-2">
                            {report.status?.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                    </div>
                    {report.compensationStatus && (
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Compensation Status</p>
                            <Badge variant={getCompensationStatusColor(report.compensationStatus)} className="text-lg px-4 py-2">
                                {report.compensationStatus.toUpperCase()}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Date Reported</p>
                        <p className="font-semibold">{new Date(report.dateReported || report.createdAt).toLocaleDateString()}</p>
                    </div>
                    {report.verifiedAt && (
                        <div>
                            <p className="text-gray-600">Verified On</p>
                            <p className="font-semibold">{new Date(report.verifiedAt).toLocaleDateString()}</p>
                        </div>
                    )}
                    {report.compensationDate && (
                        <div>
                            <p className="text-gray-600">Compensation Date</p>
                            <p className="font-semibold">{new Date(report.compensationDate).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Loss Details */}
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
                    <span>{lossTypeInfo?.icon || '⚠️'}</span>
                    Loss Information / नुकसान माहिती
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Type of Loss</p>
                        <p className="font-medium text-lg">
                            {lossTypeInfo?.label || report.lossType} ({lossTypeInfo?.labelMr})
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Loss Date</p>
                        <p className="font-medium text-lg">{new Date(report.lossDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Crop Name</p>
                        <p className="font-medium text-lg">{report.cropName}</p>
                    </div>
                    {report.cropType && (
                        <div>
                            <p className="text-sm text-gray-600">Crop Type</p>
                            <p className="font-medium text-lg capitalize">{report.cropType}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Land & Damage Details */}
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">
                    🗺️ Land & Damage Assessment / जमीन आणि नुकसान मूल्यांकन
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Survey Number</p>
                            <p className="font-semibold text-lg">{report.landParcel?.surveyNumber}</p>
                        </div>
                        {report.landParcel?.gutNumber && (
                            <div>
                                <p className="text-sm text-gray-600">Gut Number</p>
                                <p className="font-semibold">{report.landParcel.gutNumber}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600">Total Land Area</p>
                            <p className="font-semibold">
                                {report.landParcel?.area} {report.landParcel?.unit}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Affected Area</p>
                            <p className="font-semibold text-lg text-red-700">
                                {report.affectedArea} {report.affectedAreaUnit}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Damage Percentage</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600"
                                        style={{ width: `${report.damagePercentage}%` }}
                                    ></div>
                                </div>
                                <span className="font-bold text-xl text-red-600">{report.damagePercentage}%</span>
                            </div>
                        </div>
                        {report.estimatedLoss && (
                            <div>
                                <p className="text-sm text-gray-600">Estimated Loss</p>
                                <p className="font-bold text-xl text-red-700">
                                    ₹{report.estimatedLoss.toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {report.description && (
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600 mb-2">Description / वर्णन</p>
                        <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{report.description}</p>
                    </div>
                )}

                {report.fieldLocation && report.fieldLocation.latitude && (
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600 mb-2">Field Location / शेताचे स्थान</p>
                        <p className="text-gray-800 flex items-center gap-2">
                            <span className="text-xl">📍</span>
                            <span className="font-mono">
                                {report.fieldLocation.latitude.toFixed(6)}, {report.fieldLocation.longitude.toFixed(6)}
                            </span>
                            <a
                                href={`https://www.google.com/maps?q=${report.fieldLocation.latitude},${report.fieldLocation.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                            >
                                View on Map
                            </a>
                        </p>
                    </div>
                )}
            </Card>

            {/* Compensation Details */}
            {(report.approvedAmount || report.compensationStatus) && (
                <Card className="bg-green-50 border-green-200">
                    <h2 className="text-xl font-bold mb-4 border-b border-green-300 pb-2 text-green-900">
                        💰 Compensation Details / नुकसान भरपाई तपशील
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {report.approvedAmount && (
                            <div>
                                <p className="text-sm text-green-700">Approved Amount</p>
                                <p className="font-bold text-2xl text-green-800">
                                    ₹{report.approvedAmount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                        {report.compensationStatus && (
                            <div>
                                <p className="text-sm text-green-700">Payment Status</p>
                                <Badge variant={getCompensationStatusColor(report.compensationStatus)} className="mt-1">
                                    {report.compensationStatus.toUpperCase()}
                                </Badge>
                            </div>
                        )}
                        {report.compensationDate && (
                            <div>
                                <p className="text-sm text-green-700">Compensation Date</p>
                                <p className="font-semibold text-green-800">
                                    {new Date(report.compensationDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Site Visit Information */}
            {(report.siteVisitDate || report.siteVisitNotes) && (
                <Card className="bg-blue-50 border-blue-200">
                    <h2 className="text-xl font-bold mb-4 border-b border-blue-300 pb-2 text-blue-900">
                        🚜 Site Visit Information / स्थळ भेट माहिती
                    </h2>
                    {report.siteVisitDate && (
                        <div className="mb-4">
                            <p className="text-sm text-blue-700">Scheduled Date</p>
                            <p className="font-semibold text-blue-900 text-lg">
                                {new Date(report.siteVisitDate).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                    {report.siteVisitNotes && (
                        <div>
                            <p className="text-sm text-blue-700 mb-2">Visit Notes</p>
                            <p className="text-blue-900 bg-white p-4 rounded-lg">{report.siteVisitNotes}</p>
                        </div>
                    )}
                </Card>
            )}

            {/* Verification Details */}
            {(report.verificationRemarks || report.verifiedAt) && (
                <Card className="bg-purple-50 border-purple-200">
                    <h2 className="text-xl font-bold mb-4 border-b border-purple-300 pb-2 text-purple-900">
                        ✓ Verification Details / पडताळणी तपशील
                    </h2>
                    {report.verifiedAt && (
                        <div className="mb-4">
                            <p className="text-sm text-purple-700">Verified On</p>
                            <p className="font-semibold text-purple-900">
                                {new Date(report.verifiedAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                    {report.verificationRemarks && (
                        <div>
                            <p className="text-sm text-purple-700 mb-2">Officer Remarks</p>
                            <p className="text-purple-900 bg-white p-4 rounded-lg">{report.verificationRemarks}</p>
                        </div>
                    )}
                </Card>
            )}

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        📸 Evidence Photos ({report.photos.length}) / पुरावा फोटो
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {report.photos.map((photo, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src={`${BASE_URL}${photo.url}`}
                                    alt={photo.caption || 'Loss evidence'}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-3">
                                    <p className="text-sm font-semibold text-gray-800 capitalize">{photo.type}</p>
                                    {photo.caption && (
                                        <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                                    )}
                                    {photo.geoLocation && photo.geoLocation.latitude && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                            <span>📍</span>
                                            <span>
                                                {photo.geoLocation.latitude.toFixed(4)}, {photo.geoLocation.longitude.toFixed(4)}
                                            </span>
                                        </p>
                                    )}
                                    {photo.capturedAt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(photo.capturedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Linked Crop Survey */}
            {report.cropSurvey && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <h2 className="text-xl font-bold mb-2 text-yellow-900">🌾 Linked Crop Survey</h2>
                    <p className="text-sm text-yellow-800">
                        This loss report is linked to a crop survey record.
                    </p>
                    <Link to={`/crop-survey/${report.cropSurvey}`}>
                        <Button variant="warning" size="sm" className="mt-3">
                            View Crop Survey
                        </Button>
                    </Link>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                {report.status === 'draft' && (
                    <Link to={`/loss-report/edit/${report.id}`} className="flex-1">
                        <Button variant="primary" fullWidth>
                            ✏️ Edit Report
                        </Button>
                    </Link>
                )}
                <Link to="/loss-report" className="flex-1">
                    <Button variant="default" fullWidth>
                        ← Back to All Reports
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default LossReportDetail;
