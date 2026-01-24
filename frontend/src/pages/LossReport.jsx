import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

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

const validationSchema = Yup.object({
    surveyNumber: Yup.string().required('Survey number is required'),
    area: Yup.number().required('Area is required').positive(),
    cropName: Yup.string().required('Crop name is required'),
    lossType: Yup.string().required('Loss type is required'),
    lossDate: Yup.date().required('Loss date is required'),
    affectedArea: Yup.number().required('Affected area is required').positive(),
    damagePercentage: Yup.number().required('Damage percentage is required').min(0).max(100),
});

function LossReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const isNewReportPage = location.pathname === '/loss-report/new';

    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [myReports, setMyReports] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch farmer profile
            const farmerRes = await fetch(`${API_URL}/farmers/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (farmerRes.ok) {
                const farmerData = await farmerRes.json();
                setFarmer(farmerData);
            }

            // Fetch my loss reports
            const reportsRes = await fetch(`${API_URL}/loss-reports/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (reportsRes.ok) {
                const reportsData = await reportsRes.json();
                setMyReports(reportsData.results || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { resetForm }) => {
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/loss-reports`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    landParcel: {
                        surveyNumber: values.surveyNumber,
                        gutNumber: values.gutNumber,
                        area: Number(values.area),
                        unit: values.areaUnit,
                    },
                    cropName: values.cropName,
                    cropType: values.cropType,
                    lossType: values.lossType,
                    lossDate: values.lossDate,
                    affectedArea: Number(values.affectedArea),
                    affectedAreaUnit: values.affectedAreaUnit,
                    damagePercentage: Number(values.damagePercentage),
                    estimatedLoss: values.estimatedLoss ? Number(values.estimatedLoss) : undefined,
                    description: values.description,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setMessage({ type: 'success', text: 'Loss report submitted successfully! / नुकसान अहवाल यशस्वीरित्या सबमिट केला!' });
            resetForm();
            fetchData();
            navigate('/loss-report'); // Navigate back to list
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-4xl animate-pulse">🌧️</div>
            </div>
        );
    }

    if (!farmer) {
        return (
            <Card className="max-w-lg mx-auto text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Required</h2>
                <p className="text-gray-600 mb-4">Please complete your farmer profile before reporting crop loss.</p>
                <Link to="/profile">
                    <Button variant="success">Complete Profile</Button>
                </Link>
            </Card>
        );
    }

    const initialValues = {
        surveyNumber: farmer.landParcels?.[0]?.surveyNumber || '',
        gutNumber: farmer.landParcels?.[0]?.gutNumber || '',
        area: farmer.landParcels?.[0]?.area || '',
        areaUnit: farmer.landParcels?.[0]?.unit || 'hectare',
        cropName: '',
        cropType: '',
        lossType: '',
        lossDate: '',
        affectedArea: '',
        affectedAreaUnit: 'hectare',
        damagePercentage: '',
        estimatedLoss: '',
        description: '',
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        🌧️ {isNewReportPage ? 'Create Loss Report' : 'My Loss Reports'}
                    </h1>
                    <p className="text-gray-600">
                        {isNewReportPage ? 'Fill in loss details / नुकसान तपशील भरा' : 'Report damage to your crops for compensation'}
                    </p>
                </div>
                {!isNewReportPage && (
                    <Link to="/loss-report/new">
                        <Button variant="success">
                            ➕ Create New Report
                        </Button>
                    </Link>
                )}
                {isNewReportPage && (
                    <Link to="/loss-report">
                        <Button variant="default">
                            ← Back to Reports
                        </Button>
                    </Link>
                )}
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Reports List - Only show when NOT on /new page */}
            {!isNewReportPage && (
                <>
                    {myReports.length > 0 ? (
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">All Reports ({myReports.length})</h2>
                            <div className="space-y-4">
                                {myReports.map((report) => (
                            <div key={report.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">
                                            {lossTypes.find(t => t.value === report.lossType)?.icon || '⚠️'}
                                        </span>
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{report.cropName}</p>
                                            <p className="text-sm text-gray-600">
                                                {lossTypes.find(t => t.value === report.lossType)?.label || report.lossType}
                                                {report.cropType && ` • ${report.cropType.charAt(0).toUpperCase() + report.cropType.slice(1)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={getStatusColor(report.status)}>
                                        {report.status?.replace(/_/g, ' ')}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Damage</p>
                                        <p className="font-semibold text-red-600">{report.damagePercentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Affected Area</p>
                                        <p className="font-semibold">{report.affectedArea} {report.affectedAreaUnit}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Loss Date</p>
                                        <p className="font-semibold">{new Date(report.lossDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Survey No.</p>
                                        <p className="font-semibold">{report.landParcel?.surveyNumber}</p>
                                    </div>
                                </div>

                                {report.estimatedLoss && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500">Estimated Loss</p>
                                        <p className="font-bold text-red-700">₹{report.estimatedLoss.toLocaleString('en-IN')}</p>
                                    </div>
                                )}

                                {report.approvedAmount && (
                                    <div className="mb-3 bg-green-50 p-2 rounded">
                                        <p className="text-xs text-green-700">Approved Compensation</p>
                                        <p className="font-bold text-green-800">₹{report.approvedAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                )}

                                {report.siteVisitDate && (
                                    <div className="mb-3 bg-blue-50 p-2 rounded">
                                        <p className="text-xs text-blue-700">Site Visit Scheduled</p>
                                        <p className="font-semibold text-blue-800">{new Date(report.siteVisitDate).toLocaleDateString()}</p>
                                    </div>
                                )}

                                {report.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                                )}

                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                    <Link to={`/loss-report/${report.id}`} className="flex-1">
                                        <Button variant="primary" size="sm" fullWidth>
                                            👁️ View Details
                                        </Button>
                                    </Link>
                                    {report.status === 'draft' && (
                                        <Link to={`/loss-report/edit/${report.id}`} className="flex-1">
                                            <Button variant="default" size="sm" fullWidth>
                                                ✏️ Edit
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                    ) : (
                        <Card className="text-center py-12">
                            <div className="text-5xl mb-4">🌧️</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Loss Reports Yet</h2>
                            <p className="text-gray-600 mb-6">Create your first loss report to get started</p>
                            <Link to="/loss-report/new">
                                <Button variant="success">
                                    ➕ Create First Report
                                </Button>
                            </Link>
                        </Card>
                    )}
                </>
            )}

            {/* Report Form - Only show when on /new page */}
            {isNewReportPage && (
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form className="space-y-6">
                        {/* Land Parcel */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                🗺️ Affected Land / प्रभावित जमीन
                            </h2>
                            {farmer.landParcels?.length > 0 ? (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Land Parcel</label>
                                    <select
                                        name="surveyNumber"
                                        value={values.surveyNumber}
                                        onChange={(e) => {
                                            const parcel = farmer.landParcels.find(p => p.surveyNumber === e.target.value);
                                            handleChange(e);
                                            if (parcel) {
                                                handleChange({ target: { name: 'gutNumber', value: parcel.gutNumber || '' } });
                                                handleChange({ target: { name: 'area', value: parcel.area } });
                                                handleChange({ target: { name: 'areaUnit', value: parcel.unit } });
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500"
                                    >
                                        <option value="">Select / निवडा</option>
                                        {farmer.landParcels.map((parcel, idx) => (
                                            <option key={idx} value={parcel.surveyNumber}>
                                                Survey No: {parcel.surveyNumber} ({parcel.area} {parcel.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p className="text-amber-600 mb-4">
                                    ⚠️ No land parcels found. <Link to="/profile" className="underline">Add land parcels first</Link>
                                </p>
                            )}
                            <div className="grid md:grid-cols-3 gap-4">
                                <Input
                                    label="Survey Number"
                                    name="surveyNumber"
                                    value={values.surveyNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.surveyNumber}
                                    touched={touched.surveyNumber}
                                    required
                                />
                                <Input
                                    label="Crop Name / पीक नाव"
                                    name="cropName"
                                    value={values.cropName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.cropName}
                                    touched={touched.cropName}
                                    placeholder="e.g., Soybean"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                                    <select
                                        name="cropType"
                                        value={values.cropType}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select</option>
                                        <option value="cereals">Cereals</option>
                                        <option value="pulses">Pulses</option>
                                        <option value="oilseeds">Oilseeds</option>
                                        <option value="vegetables">Vegetables</option>
                                        <option value="fruits">Fruits</option>
                                        <option value="sugarcane">Sugarcane</option>
                                        <option value="cotton">Cotton</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Loss Type Selection */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                ⚠️ Type of Loss / नुकसानाचा प्रकार
                            </h2>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {lossTypes.map((lt) => (
                                    <label
                                        key={lt.value}
                                        className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${values.lossType === lt.value
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-red-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="lossType"
                                            value={lt.value}
                                            checked={values.lossType === lt.value}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-2xl mb-1">{lt.icon}</span>
                                        <span className="text-xs font-medium text-center">{lt.label}</span>
                                        <span className="text-xs text-gray-500">{lt.labelMr}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.lossType && touched.lossType && (
                                <p className="text-red-500 text-sm mt-2">{errors.lossType}</p>
                            )}
                        </Card>

                        {/* Damage Details */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                📊 Damage Assessment / नुकसान मूल्यांकन
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Loss Date / नुकसान तारीख"
                                    name="lossDate"
                                    type="date"
                                    value={values.lossDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.lossDate}
                                    touched={touched.lossDate}
                                    required
                                />

                                <div className="flex gap-2">
                                    <Input
                                        label="Affected Area"
                                        name="affectedArea"
                                        type="number"
                                        value={values.affectedArea}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.affectedArea}
                                        touched={touched.affectedArea}
                                        required
                                        className="flex-1"
                                    />
                                    <div className="w-24">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <select
                                            name="affectedAreaUnit"
                                            value={values.affectedAreaUnit}
                                            onChange={handleChange}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="hectare">Ha</option>
                                            <option value="acre">Acre</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Damage Percentage / नुकसान टक्केवारी <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            name="damagePercentage"
                                            min="0"
                                            max="100"
                                            value={values.damagePercentage || 0}
                                            onChange={handleChange}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                                        />
                                        <span className="w-16 text-center font-bold text-red-600">
                                            {values.damagePercentage || 0}%
                                        </span>
                                    </div>
                                    {errors.damagePercentage && touched.damagePercentage && (
                                        <p className="text-red-500 text-sm mt-1">{errors.damagePercentage}</p>
                                    )}
                                </div>

                                <Input
                                    label="Estimated Loss (₹)"
                                    name="estimatedLoss"
                                    type="number"
                                    value={values.estimatedLoss}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., 50000"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description / वर्णन
                                </label>
                                <textarea
                                    name="description"
                                    value={values.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500"
                                    rows={3}
                                    placeholder="Describe the damage in detail..."
                                />
                            </div>
                        </Card>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="error"
                            size="lg"
                            fullWidth
                            disabled={submitting || isSubmitting}
                        >
                            {submitting ? 'Submitting...' : '🌧️ Submit Loss Report / नुकसान अहवाल सबमिट करा'}
                        </Button>
                    </Form>
                )}
            </Formik>
            )}
        </div>
    );
}

export default LossReport;
