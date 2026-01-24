import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const cropTypes = [
    { value: 'cereals', label: 'Cereals / धान्य', examples: 'Rice, Wheat, Jowar, Bajra' },
    { value: 'pulses', label: 'Pulses / कडधान्य', examples: 'Tur, Moong, Urad, Gram' },
    { value: 'oilseeds', label: 'Oilseeds / तेलबिया', examples: 'Soybean, Groundnut, Sunflower' },
    { value: 'vegetables', label: 'Vegetables / भाज्या', examples: 'Onion, Tomato, Potato' },
    { value: 'fruits', label: 'Fruits / फळे', examples: 'Grapes, Pomegranate, Banana' },
    { value: 'sugarcane', label: 'Sugarcane / ऊस', examples: '' },
    { value: 'cotton', label: 'Cotton / कापूस', examples: '' },
    { value: 'other', label: 'Other / इतर', examples: '' },
];

const irrigationTypes = [
    { value: 'rainfed', label: 'Rainfed / पावसावर' },
    { value: 'canal', label: 'Canal / कालवा' },
    { value: 'well', label: 'Well / विहीर' },
    { value: 'borewell', label: 'Borewell / बोअरवेल' },
    { value: 'drip', label: 'Drip / ठिबक' },
    { value: 'sprinkler', label: 'Sprinkler / तुषार' },
    { value: 'mixed', label: 'Mixed / मिश्र' },
];

const seasons = [
    { value: 'kharif', label: 'Kharif / खरीप', months: 'Jun-Oct' },
    { value: 'rabi', label: 'Rabi / रब्बी', months: 'Nov-Mar' },
    { value: 'summer', label: 'Summer / उन्हाळी', months: 'Mar-Jun' },
    { value: 'perennial', label: 'Perennial / बारमाही', months: 'Year-round' },
];

const validationSchema = Yup.object({
    surveyNumber: Yup.string().required('Survey number is required'),
    area: Yup.number().required('Area is required').positive('Must be positive'),
    season: Yup.string().required('Season is required'),
    cropName: Yup.string().required('Crop name is required'),
    cropType: Yup.string().required('Crop type is required'),
    cultivatedArea: Yup.number().required('Cultivated area is required').positive(),
    sowingDate: Yup.date().required('Sowing date is required'),
    irrigationType: Yup.string().required('Irrigation type is required'),
});

function CropSurvey() {
    const navigate = useNavigate();
    const location = useLocation();
    const isNewSurveyPage = location.pathname === '/crop-survey/new';

    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mySurveys, setMySurveys] = useState([]);

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

            // Fetch my surveys
            const surveysRes = await fetch(`${API_URL}/crop-surveys/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (surveysRes.ok) {
                const surveysData = await surveysRes.json();
                setMySurveys(surveysData.results || []);
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
            const response = await fetch(`${API_URL}/crop-surveys`, {
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
                    season: values.season,
                    year: new Date().getFullYear(),
                    cropName: values.cropName,
                    cropNameLocal: values.cropNameLocal,
                    cropType: values.cropType,
                    variety: values.variety,
                    seedType: values.seedType,
                    cultivatedArea: Number(values.cultivatedArea),
                    cultivatedAreaUnit: values.cultivatedAreaUnit,
                    sowingDate: values.sowingDate,
                    expectedHarvestDate: values.expectedHarvestDate,
                    irrigationType: values.irrigationType,
                    remarks: values.remarks,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setMessage({ type: 'success', text: 'Crop survey submitted successfully! / पीक सर्वेक्षण यशस्वीरित्या सबमिट केले!' });
            resetForm();
            fetchData(); // Refresh surveys list
            navigate('/crop-survey'); // Navigate back to list
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-4xl animate-pulse">🌾</div>
            </div>
        );
    }

    if (!farmer) {
        return (
            <Card className="max-w-lg mx-auto text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Required</h2>
                <p className="text-gray-600 mb-4">Please complete your farmer profile before submitting crop surveys.</p>
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
        season: '',
        cropName: '',
        cropNameLocal: '',
        cropType: '',
        variety: '',
        seedType: '',
        cultivatedArea: '',
        cultivatedAreaUnit: 'hectare',
        sowingDate: '',
        expectedHarvestDate: '',
        irrigationType: '',
        remarks: '',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        📋 {isNewSurveyPage ? 'Create New Survey' : 'My Crop Surveys'}
                    </h1>
                    <p className="text-gray-600">
                        {isNewSurveyPage ? 'Fill in crop details / पीक तपशील भरा' : 'Digital Crop Survey / डिजिटल पीक सर्वेक्षण'}
                    </p>
                </div>
                {!isNewSurveyPage && (
                    <Link to="/crop-survey/new">
                        <Button variant="success">
                            ➕ Create New Survey
                        </Button>
                    </Link>
                )}
                {isNewSurveyPage && (
                    <Link to="/crop-survey">
                        <Button variant="default">
                            ← Back to Surveys
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

            {/* Survey List - Only show when NOT on /new page */}
            {!isNewSurveyPage && (
                <>
                    {mySurveys.length > 0 ? (
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">All Surveys ({mySurveys.length})</h2>
                            <p className="text-sm text-gray-600 mb-4">📸 Click "Add Photos" to upload geo-tagged crop images to track growth</p>
                            <div className="space-y-3">
                                {mySurveys.map((survey) => (
                                    <div key={survey.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{survey.cropName} - {survey.season} {survey.year}</p>
                                            <p className="text-sm text-gray-500">Survey No: {survey.landParcel?.surveyNumber}</p>
                                            {survey.photos && survey.photos.length > 0 && (
                                                <p className="text-xs text-green-600 mt-1">📸 {survey.photos.length} photos uploaded</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={
                                                survey.status === 'verified' ? 'success' :
                                                    survey.status === 'rejected' ? 'error' :
                                                        survey.status === 'submitted' ? 'warning' : 'default'
                                            }>
                                                {survey.status}
                                            </Badge>
                                            <Link to={`/crop-survey/${survey.id}`}>
                                                <Button size="sm" variant="success">
                                                    📸 Add Photos
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card className="text-center py-12">
                            <div className="text-5xl mb-4">🌾</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Surveys Yet</h2>
                            <p className="text-gray-600 mb-6">Create your first crop survey to get started</p>
                            <Link to="/crop-survey/new">
                                <Button variant="success">
                                    ➕ Create First Survey
                                </Button>
                            </Link>
                        </Card>
                    )}
                </>
            )}

            {/* Survey Form - Only show when on /new page */}
            {isNewSurveyPage && (
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form className="space-y-6">
                        {/* Land Parcel Selection */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                🗺️ Land Parcel / जमीन तपशील
                            </h2>
                            {farmer.landParcels?.length > 0 ? (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Land Parcel / जमीन निवडा
                                    </label>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                    label="Gut Number"
                                    name="gutNumber"
                                    value={values.gutNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        label="Area"
                                        name="area"
                                        type="number"
                                        value={values.area}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.area}
                                        touched={touched.area}
                                        required
                                        className="flex-1"
                                    />
                                    <div className="w-24">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <select
                                            name="areaUnit"
                                            value={values.areaUnit}
                                            onChange={handleChange}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="hectare">Ha</option>
                                            <option value="acre">Acre</option>
                                            <option value="guntha">Guntha</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Season & Crop */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                🌾 Crop Details / पीक माहिती
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Season / हंगाम <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {seasons.map((s) => (
                                            <label
                                                key={s.value}
                                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${values.season === s.value
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-green-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="season"
                                                    value={s.value}
                                                    checked={values.season === s.value}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">{s.label}</p>
                                                    <p className="text-xs text-gray-500">{s.months}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.season && touched.season && (
                                        <p className="text-red-500 text-sm mt-1">{errors.season}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Crop Type / पीक प्रकार <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="cropType"
                                        value={values.cropType}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500"
                                    >
                                        <option value="">Select / निवडा</option>
                                        {cropTypes.map((ct) => (
                                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                                        ))}
                                    </select>
                                    {errors.cropType && touched.cropType && (
                                        <p className="text-red-500 text-sm mt-1">{errors.cropType}</p>
                                    )}
                                </div>

                                <Input
                                    label="Crop Name / पीक नाव"
                                    name="cropName"
                                    value={values.cropName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.cropName}
                                    touched={touched.cropName}
                                    placeholder="e.g., Soybean, Rice, Cotton"
                                    required
                                />

                                <Input
                                    label="Local Name / स्थानिक नाव"
                                    name="cropNameLocal"
                                    value={values.cropNameLocal}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="मराठी नाव"
                                />

                                <Input
                                    label="Variety / वाण"
                                    name="variety"
                                    value={values.variety}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., JS-335, Phule Vasundhara"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Seed Type / बियाणे प्रकार
                                    </label>
                                    <select
                                        name="seedType"
                                        value={values.seedType}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select / निवडा</option>
                                        <option value="certified">Certified / प्रमाणित</option>
                                        <option value="truthful">Truthful / साक्षांकित</option>
                                        <option value="farm_saved">Farm Saved / घरचे</option>
                                        <option value="hybrid">Hybrid / हायब्रिड</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Cultivation Details */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                🚜 Cultivation Details / लागवड तपशील
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex gap-2">
                                    <Input
                                        label="Cultivated Area"
                                        name="cultivatedArea"
                                        type="number"
                                        value={values.cultivatedArea}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.cultivatedArea}
                                        touched={touched.cultivatedArea}
                                        required
                                        className="flex-1"
                                    />
                                    <div className="w-24">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <select
                                            name="cultivatedAreaUnit"
                                            value={values.cultivatedAreaUnit}
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
                                        Irrigation Type / सिंचन प्रकार <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="irrigationType"
                                        value={values.irrigationType}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select / निवडा</option>
                                        {irrigationTypes.map((it) => (
                                            <option key={it.value} value={it.value}>{it.label}</option>
                                        ))}
                                    </select>
                                    {errors.irrigationType && touched.irrigationType && (
                                        <p className="text-red-500 text-sm mt-1">{errors.irrigationType}</p>
                                    )}
                                </div>

                                <Input
                                    label="Sowing Date / पेरणी तारीख"
                                    name="sowingDate"
                                    type="date"
                                    value={values.sowingDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.sowingDate}
                                    touched={touched.sowingDate}
                                    required
                                />

                                <Input
                                    label="Expected Harvest Date"
                                    name="expectedHarvestDate"
                                    type="date"
                                    value={values.expectedHarvestDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Remarks / टिप्पणी
                                </label>
                                <textarea
                                    name="remarks"
                                    value={values.remarks}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500"
                                    rows={3}
                                    placeholder="Any additional information..."
                                />
                            </div>
                        </Card>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="success"
                            size="lg"
                            fullWidth
                            disabled={submitting || isSubmitting}
                        >
                            {submitting ? 'Submitting...' : '📋 Submit Crop Survey / पीक सर्वेक्षण सबमिट करा'}
                        </Button>
                    </Form>
                )}
            </Formik>
            )}
        </div>
    );
}

export default CropSurvey;
