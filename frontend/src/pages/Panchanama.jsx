import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:3000/v1';

function Panchanama() {
    const { id: routeId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const lossReportId = searchParams.get('lossReport');
    // Prioritize route param (editing), then query param, then nothing
    const panchanamaId = routeId || searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lossReport, setLossReport] = useState(null);
    const [step, setStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        siteVisit: {
            scheduledDate: new Date().toISOString().split('T')[0],
            actualDate: '',
            startTime: '',
            endTime: '',
            gpsCoordinates: { latitude: null, longitude: null },
        },
        landDetails: {
            surveyNumber: '',
            gutNumber: '',
            area: '',
            areaUnit: 'hectare',
        },
        cropDetails: {
            cropType: '',
            variety: '',
            sowingDate: '',
            expectedYield: '',
            actualCondition: '',
        },
        damageAssessment: {
            causeOfDamage: '',
            damagePercentage: '',
            affectedArea: '',
            severityLevel: '',
            detailedObservation: '',
        },
        officerRemarks: '',
        recommendation: '',
        recommendedAmount: '',
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const [pendingReports, setPendingReports] = useState([]);

    useEffect(() => {
        if (panchanamaId) {
            setIsEditing(true);
            fetchPanchanama(panchanamaId);
        } else if (lossReportId) {
            fetchLossReport(lossReportId);
        } else {
            fetchPendingReports();
        }
    }, [lossReportId, panchanamaId]);

    const fetchPendingReports = async () => {
        try {
            const res = await fetch(`${API_URL}/loss-reports?status=submitted`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setPendingReports(data.results || []);
            }
        } catch (error) {
            console.error('Error fetching pending reports:', error);
        }
    };

    const fetchLossReport = async (id) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/loss-reports/${id}`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setLossReport(data);

                // For new panchanamas, pre-fill from loss report
                if (!isEditing && !formData.landDetails.surveyNumber) {
                    setFormData(prev => ({
                        ...prev,
                        landDetails: {
                            ...prev.landDetails,
                            surveyNumber: data.landParcel?.surveyNumber || '',
                            area: data.affectedArea || '',
                        },
                        damageAssessment: {
                            ...prev.damageAssessment,
                            causeOfDamage: data.lossType || '',
                            affectedArea: data.affectedArea || '',
                            severityLevel: data.severity || '',
                        },
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching loss report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPanchanama = async (id) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/panchanamas/${id}`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();

                // Fetch associated loss report details
                if (data.lossReport) {
                    // data.lossReport might be an object (populated) or ID
                    const lrId = typeof data.lossReport === 'object' ? data.lossReport.id : data.lossReport;
                    fetchLossReport(lrId);
                }

                // Populate form
                setFormData({
                    siteVisit: {
                        scheduledDate: data.siteVisit?.scheduledDate ? new Date(data.siteVisit.scheduledDate).toISOString().split('T')[0] : '',
                        actualDate: data.siteVisit?.actualDate || '',
                        startTime: data.siteVisit?.startTime || '',
                        endTime: data.siteVisit?.endTime || '',
                        gpsCoordinates: data.siteVisit?.gpsCoordinates || { latitude: null, longitude: null },
                    },
                    landDetails: { ...data.landDetails },
                    cropDetails: { ...data.cropDetails },
                    damageAssessment: { ...data.damageAssessment },
                    officerRemarks: data.officerRemarks || '',
                    recommendation: data.recommendation || '',
                    recommendedAmount: data.recommendedAmount || '',
                });
            } else {
                alert('Failed to load existing panchanama');
            }
        } catch (error) {
            console.error('Error fetching panchanama:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportSelection = (e) => {
        const id = e.target.value;
        if (id) {
            // Update URL without reloading
            const newUrl = window.location.pathname + `?lossReport=${id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            fetchLossReport(id);
        }
    };

    const captureGPS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        siteVisit: {
                            ...prev.siteVisit,
                            gpsCoordinates: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            },
                        },
                    }));
                },
                (error) => {
                    console.error('GPS Error:', error);
                    alert('Unable to capture GPS location');
                }
            );
        }
    };

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            const reportId = lossReportId || lossReport?.id;
            // If editing, we might not need reportId in payload if backend doesn't require it, 
            // but for safety we keep it. For new, it's required.
            if (!isEditing && !reportId) {
                alert('Please select a Loss Report first.');
                return;
            }

            const damagePct = parseFloat(formData.damageAssessment.damagePercentage) || 0;
            if (damagePct > 100) {
                alert('Damage percentage cannot exceed 100%');
                return;
            }

            const payload = {
                lossReport: reportId, // might be ignored on update
                ...formData,
                landDetails: {
                    ...formData.landDetails,
                    area: parseFloat(formData.landDetails.area) || 0,
                },
                damageAssessment: {
                    ...formData.damageAssessment,
                    damagePercentage: damagePct,
                    affectedArea: parseFloat(formData.damageAssessment.affectedArea) || 0,
                },
                recommendedAmount: formData.recommendedAmount ? parseFloat(formData.recommendedAmount) : 0,
            };

            let targetId = panchanamaId;
            let success = false;

            if (isEditing) {
                // UPDATE existing
                const res = await fetch(`${API_URL}/panchanamas/${panchanamaId}`, {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    success = true;
                } else {
                    const error = await res.json();
                    alert(error.message || 'Failed to update panchanama');
                    return;
                }
            } else {
                // CREATE new
                const res = await fetch(`${API_URL}/panchanamas`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    const data = await res.json();
                    targetId = data.id;
                    success = true;
                } else {
                    const error = await res.json();
                    alert(error.message || 'Failed to create panchanama');
                    return;
                }
            }

            if (success && targetId) {
                // Automatically submit for review
                const submitRes = await fetch(`${API_URL}/panchanamas/${targetId}/submit`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });

                if (submitRes.ok) {
                    alert('Panchanama submitted successfully!');
                    navigate('/officer/dashboard');
                } else {
                    alert('Saved but failed to submit. Please try from dashboard.');
                    navigate('/officer/dashboard');
                }
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save panchanama');
        } finally {
            setSaving(false);
        }
    };

    const damageOptions = [
        { value: 'drought', label: 'Drought / दुष्काळ' },
        { value: 'flood', label: 'Flood / पूर' },
        { value: 'pest', label: 'Pest Attack / कीड' },
        { value: 'disease', label: 'Disease / रोग' },
        { value: 'hailstorm', label: 'Hailstorm / गारपीट' },
        { value: 'unseasonal_rain', label: 'Unseasonal Rain / अवकाळी पाऊस' },
        { value: 'fire', label: 'Fire / आग' },
        { value: 'other', label: 'Other / इतर' },
    ];

    const severityOptions = [
        { value: 'mild', label: 'Mild (0-25%) / सौम्य' },
        { value: 'moderate', label: 'Moderate (25-50%) / मध्यम' },
        { value: 'severe', label: 'Severe (50-75%) / तीव्र' },
        { value: 'total', label: 'Total (75-100%) / संपूर्ण' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span>📋</span> Digital e-Panchanama
                </h1>
                <p className="text-gray-600 mt-1">पंचनामा फॉर्म - Field Inspection Report</p>

                {!lossReport ? (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Loss Report / नुकसान अहवाल निवडा *
                        </label>
                        <select
                            onChange={handleReportSelection}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            defaultValue=""
                        >
                            <option value="" disabled>-- Select a pending report --</option>
                            {pendingReports.map(report => (
                                <option key={report.id} value={report.id}>
                                    {report.farmer?.personalDetails?.firstName} {report.farmer?.personalDetails?.lastName} - {report.lossType?.replace('_', ' ')} ({new Date(report.dateReported).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                        {pendingReports.length === 0 && (
                            <p className="text-sm text-red-500 mt-2">No pending loss reports found.</p>
                        )}
                    </div>
                ) : (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Selected Report:</strong> {lossReport.lossType?.replace('_', ' ')} -
                            {lossReport.affectedArea} ha -
                            Reported by {lossReport.farmer?.personalDetails?.firstName} {lossReport.farmer?.personalDetails?.lastName} on {new Date(lossReport.dateReported).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {s}
                        </div>
                        {s < 4 && (
                            <div className={`w-16 h-1 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Site Visit Details */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            🗓️ Site Visit Details / भेट तपशील
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visit Date / भेट तारीख *
                                </label>
                                <input
                                    type="date"
                                    value={formData.siteVisit.scheduledDate}
                                    onChange={(e) => handleInputChange('siteVisit', 'scheduledDate', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time / सुरुवात
                                </label>
                                <input
                                    type="time"
                                    value={formData.siteVisit.startTime}
                                    onChange={(e) => handleInputChange('siteVisit', 'startTime', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GPS Location / स्थान
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.siteVisit.gpsCoordinates.latitude ?
                                            `${formData.siteVisit.gpsCoordinates.latitude}, ${formData.siteVisit.gpsCoordinates.longitude}` :
                                            ''}
                                        placeholder="Click to capture GPS coordinates"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        onClick={captureGPS}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        📍 Capture
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Damage Assessment */}
                {step === 2 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            ⚠️ Damage Assessment / नुकसान मूल्यांकन
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cause of Damage / नुकसानाचे कारण *
                                </label>
                                <select
                                    value={formData.damageAssessment.causeOfDamage}
                                    onChange={(e) => handleInputChange('damageAssessment', 'causeOfDamage', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Select cause...</option>
                                    {damageOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Severity Level / तीव्रता *
                                </label>
                                <select
                                    value={formData.damageAssessment.severityLevel}
                                    onChange={(e) => handleInputChange('damageAssessment', 'severityLevel', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Select severity...</option>
                                    {severityOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Damage Percentage / नुकसान टक्केवारी *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.damageAssessment.damagePercentage}
                                    onChange={(e) => handleInputChange('damageAssessment', 'damagePercentage', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="0-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Affected Area (ha) / प्रभावित क्षेत्र
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.damageAssessment.affectedArea}
                                    onChange={(e) => handleInputChange('damageAssessment', 'affectedArea', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Detailed Observation / तपशीलवार निरीक्षण
                                </label>
                                <textarea
                                    value={formData.damageAssessment.detailedObservation}
                                    onChange={(e) => handleInputChange('damageAssessment', 'detailedObservation', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Describe the damage observed..."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Recommendation */}
                {step === 3 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            ✅ Recommendation / शिफारस
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Officer Recommendation / अधिकारी शिफारस *
                                </label>
                                <select
                                    value={formData.recommendation}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Select recommendation...</option>
                                    <option value="approve">Approve / मंजूर करा</option>
                                    <option value="partial_approve">Partial Approve / अंशतः मंजूर</option>
                                    <option value="reject">Reject / नाकारा</option>
                                    <option value="further_investigation">Further Investigation / अधिक तपास</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recommended Amount (₹) / शिफारस केलेली रक्कम
                                </label>
                                <input
                                    type="number"
                                    value={formData.recommendedAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recommendedAmount: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter amount..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Officer Remarks / अधिकारी टिप्पणी
                                </label>
                                <textarea
                                    value={formData.officerRemarks}
                                    onChange={(e) => setFormData(prev => ({ ...prev, officerRemarks: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Additional remarks..."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(4)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Review & Submit →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Review & Submit */}
                {step === 4 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            📝 Review & Submit / पुनरावलोकन आणि सबमिट
                        </h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-700 mb-2">Site Visit</h3>
                                <p className="text-sm text-gray-600">
                                    Date: {formData.siteVisit.scheduledDate} |
                                    Time: {formData.siteVisit.startTime || 'Not set'}
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-700 mb-2">Damage Assessment</h3>
                                <p className="text-sm text-gray-600">
                                    Cause: {formData.damageAssessment.causeOfDamage} |
                                    Severity: {formData.damageAssessment.severityLevel} |
                                    Damage: {formData.damageAssessment.damagePercentage}%
                                </p>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h3 className="font-medium text-green-700 mb-2">Recommendation</h3>
                                <p className="text-sm text-green-600">
                                    {formData.recommendation?.replace('_', ' ').toUpperCase()} -
                                    ₹{formData.recommendedAmount || '0'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                            >
                                {saving ? 'Submitting...' : '✅ Submit Panchanama'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

export default Panchanama;
