import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const profileSchema = Yup.object({
    fullName: Yup.string().required('Full name is required').min(2),
    fatherName: Yup.string(),
    gender: Yup.string().oneOf(['male', 'female', 'other']),
    division: Yup.string(),
    district: Yup.string().required('District is required'),
    taluka: Yup.string().required('Taluka is required'),
    village: Yup.string().required('Village is required'),
    bankName: Yup.string(),
    accountNumber: Yup.string().matches(/^\d{9,18}$/, 'Invalid account number'),
    ifscCode: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
    accountHolderName: Yup.string(),
});

const landParcelSchema = Yup.object({
    surveyNumber: Yup.string().required('Survey number is required'),
    gutNumber: Yup.string(),
    area: Yup.number().required('Area is required').positive(),
    unit: Yup.string().oneOf(['hectare', 'are', 'guntha', 'acre']),
    ownershipType: Yup.string().oneOf(['owned', 'leased', 'shared']),
});

function FarmerProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showLandForm, setShowLandForm] = useState(false);
    const [newParcel, setNewParcel] = useState({
        surveyNumber: '',
        gutNumber: '',
        area: '',
        unit: 'hectare',
        ownershipType: 'owned',
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/farmers/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setFarmer(data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('accessToken');
            const url = farmer ? `${API_URL}/farmers/me` : `${API_URL}/farmers`;
            const method = farmer ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setFarmer(data);
            setMessage({ type: 'success', text: 'Profile saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
            setSubmitting(false);
        }
    };

    const handleAddLandParcel = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/farmers/me/land-parcels`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newParcel,
                    area: Number(newParcel.area),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setFarmer(data);
            setShowLandForm(false);
            setNewParcel({ surveyNumber: '', gutNumber: '', area: '', unit: 'hectare', ownershipType: 'owned' });
            setMessage({ type: 'success', text: 'Land parcel added!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleDeleteParcel = async (parcelId) => {
        if (!confirm('Are you sure you want to delete this land parcel?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/farmers/me/land-parcels/${parcelId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setFarmer(data);
            setMessage({ type: 'success', text: 'Land parcel deleted!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-4xl animate-pulse">🌾</div>
            </div>
        );
    }

    const initialValues = farmer ? {
        fullName: farmer.fullName || '',
        fatherName: farmer.fatherName || '',
        gender: farmer.gender || '',
        division: farmer.division || '',
        district: farmer.district || '',
        taluka: farmer.taluka || '',
        village: farmer.village || '',
        bankName: farmer.bankName || '',
        accountNumber: farmer.accountNumber || '',
        ifscCode: farmer.ifscCode || '',
        accountHolderName: farmer.accountHolderName || '',
    } : {
        fullName: user?.name || '',
        fatherName: '',
        gender: '',
        division: '',
        district: '',
        taluka: '',
        village: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">👤 My Profile / माझे प्रोफाइल</h1>
                    <p className="text-gray-600">Manage your farmer profile and land details</p>
                </div>
                {farmer?.isProfileComplete ? (
                    <Badge variant="success" className="text-lg px-4 py-2">✓ Complete</Badge>
                ) : (
                    <Badge variant="warning" className="text-lg px-4 py-2">⚠ Incomplete</Badge>
                )}
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Form */}
            <Formik
                initialValues={initialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form className="space-y-6">
                        {/* Personal Details */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                👤 Personal Details / वैयक्तिक माहिती
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name / पूर्ण नाव"
                                    name="fullName"
                                    value={values.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.fullName}
                                    touched={touched.fullName}
                                    required
                                />
                                <Input
                                    label="Father's Name / वडिलांचे नाव"
                                    name="fatherName"
                                    value={values.fatherName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Gender / लिंग
                                    </label>
                                    <select
                                        name="gender"
                                        value={values.gender}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select / निवडा</option>
                                        <option value="male">Male / पुरुष</option>
                                        <option value="female">Female / स्त्री</option>
                                        <option value="other">Other / इतर</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Location Details */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                📍 Location / स्थान
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Division / विभाग"
                                    name="division"
                                    value={values.division}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., Nashik"
                                />
                                <Input
                                    label="District / जिल्हा"
                                    name="district"
                                    value={values.district}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.district}
                                    touched={touched.district}
                                    placeholder="e.g., Nashik"
                                    required
                                />
                                <Input
                                    label="Taluka / तालुका"
                                    name="taluka"
                                    value={values.taluka}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.taluka}
                                    touched={touched.taluka}
                                    placeholder="e.g., Dindori"
                                    required
                                />
                                <Input
                                    label="Village / गाव"
                                    name="village"
                                    value={values.village}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.village}
                                    touched={touched.village}
                                    placeholder="e.g., Vani"
                                    required
                                />
                            </div>
                        </Card>

                        {/* Bank Details */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                🏦 Bank Details / बँक तपशील
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Required for receiving compensation payments
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Bank Name / बँकेचे नाव"
                                    name="bankName"
                                    value={values.bankName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., State Bank of India"
                                />
                                <Input
                                    label="Account Holder Name"
                                    name="accountHolderName"
                                    value={values.accountHolderName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <Input
                                    label="Account Number / खाते क्रमांक"
                                    name="accountNumber"
                                    value={values.accountNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.accountNumber}
                                    touched={touched.accountNumber}
                                    placeholder="9-18 digit account number"
                                />
                                <Input
                                    label="IFSC Code / IFSC कोड"
                                    name="ifscCode"
                                    value={values.ifscCode}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.ifscCode}
                                    touched={touched.ifscCode}
                                    placeholder="e.g., SBIN0001234"
                                    className="uppercase"
                                />
                            </div>
                        </Card>

                        {/* Save Button */}
                        <Button
                            type="submit"
                            variant="success"
                            size="lg"
                            fullWidth
                            disabled={isSubmitting || saving}
                        >
                            {saving ? 'Saving...' : 'Save Profile / प्रोफाइल जतन करा'}
                        </Button>
                    </Form>
                )}
            </Formik>

            {/* Land Parcels Section */}
            <Card>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">
                        🗺️ Land Parcels / जमिनीचे तुकडे (7/12)
                    </h2>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowLandForm(!showLandForm)}
                        disabled={!farmer}
                    >
                        {showLandForm ? 'Cancel' : '+ Add Land'}
                    </Button>
                </div>

                {!farmer && (
                    <p className="text-amber-600 text-sm mb-4">
                        ⚠️ Save your profile first before adding land parcels
                    </p>
                )}

                {/* Add Land Form */}
                {showLandForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h3 className="font-medium mb-3">Add New Land Parcel</h3>
                        <div className="grid md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="Survey Number *"
                                value={newParcel.surveyNumber}
                                onChange={(e) => setNewParcel({ ...newParcel, surveyNumber: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Gut Number"
                                value={newParcel.gutNumber}
                                onChange={(e) => setNewParcel({ ...newParcel, gutNumber: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="number"
                                placeholder="Area *"
                                value={newParcel.area}
                                onChange={(e) => setNewParcel({ ...newParcel, area: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <select
                                value={newParcel.unit}
                                onChange={(e) => setNewParcel({ ...newParcel, unit: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="hectare">Hectare</option>
                                <option value="acre">Acre</option>
                                <option value="guntha">Guntha</option>
                                <option value="are">Are</option>
                            </select>
                            <select
                                value={newParcel.ownershipType}
                                onChange={(e) => setNewParcel({ ...newParcel, ownershipType: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="owned">Owned / स्वतःची</option>
                                <option value="leased">Leased / भाडेतत्त्वावर</option>
                                <option value="shared">Shared / सामायिक</option>
                            </select>
                            <Button variant="success" onClick={handleAddLandParcel}>
                                Add Parcel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Land Parcels List */}
                {farmer?.landParcels && farmer.landParcels.length > 0 ? (
                    <div className="space-y-3">
                        {farmer.landParcels.map((parcel, index) => (
                            <div key={parcel._id || index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">🗺️</div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            Survey No: {parcel.surveyNumber}
                                            {parcel.gutNumber && ` / Gut: ${parcel.gutNumber}`}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {parcel.area} {parcel.unit}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={parcel.ownershipType === 'owned' ? 'success' : 'default'}>
                                        {parcel.ownershipType}
                                    </Badge>
                                    <button
                                        onClick={() => handleDeleteParcel(parcel._id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🗺️</div>
                        <p>No land parcels added yet</p>
                        <p className="text-sm">Add your 7/12 land records to submit crop surveys</p>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default FarmerProfile;
