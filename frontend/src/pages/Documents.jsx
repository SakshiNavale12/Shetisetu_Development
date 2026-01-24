import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { uploadDocument } from '../services/uploadService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const documentTypes = [
    {
        value: 'aadhaar',
        label: 'Aadhaar Card',
        labelMr: 'आधार कार्ड',
        icon: '🪪',
        description: 'Upload front and back side of your Aadhaar card',
        required: true
    },
    {
        value: 'pan',
        label: 'PAN Card',
        labelMr: 'पॅन कार्ड',
        icon: '💳',
        description: 'Upload your PAN card for tax purposes',
        required: false
    },
    {
        value: '7-12',
        label: '7/12 Land Record',
        labelMr: '७/१२ उतारा',
        icon: '📄',
        description: 'Upload 7/12 land extract document',
        required: true
    },
    {
        value: '8-A',
        label: '8-A Land Record',
        labelMr: '८-अ उतारा',
        icon: '📋',
        description: 'Upload 8-A land extract document',
        required: false
    },
    {
        value: 'passbook',
        label: 'Bank Passbook',
        labelMr: 'बँक पासबुक',
        icon: '🏦',
        description: 'Upload first page of bank passbook with account details',
        required: true
    },
    {
        value: 'lease',
        label: 'Lease Agreement',
        labelMr: 'भाडे करारनामा',
        icon: '📝',
        description: 'Upload lease agreement if farming on leased land',
        required: false
    },
];

function Documents() {
    const navigate = useNavigate();
    const fileInputRefs = useRef({});
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingType, setUploadingType] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [uploadedDocs, setUploadedDocs] = useState({});
    const [submitting, setSubmitting] = useState(false);

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

                // Parse documents if they exist
                if (farmerData.documents) {
                    setUploadedDocs(farmerData.documents);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, documentType) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 10MB' });
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Only JPG, PNG, and PDF files are allowed' });
            return;
        }

        setUploadingType(documentType);
        setMessage({ type: '', text: '' });

        try {
            const result = await uploadDocument(file, documentType);

            // Update local state
            setUploadedDocs(prev => ({
                ...prev,
                [documentType]: result
            }));

            setMessage({
                type: 'success',
                text: `✓ ${documentTypes.find(d => d.value === documentType)?.label} uploaded successfully!`
            });

            // Clear file input
            e.target.value = '';
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUploadingType(null);
        }
    };

    const handleViewDocument = (doc) => {
        if (doc && doc.url) {
            window.open(`${BASE_URL}${doc.url}`, '_blank');
        }
    };

    const handleSubmitEkyc = async () => {
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/farmers/me/ekyc/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const updatedFarmer = await response.json();
                setFarmer(updatedFarmer);
                setMessage({
                    type: 'success',
                    text: '✓ Documents submitted for verification! An officer will review them soon.'
                });
            } else {
                const error = await response.json();
                setMessage({
                    type: 'error',
                    text: error.message || 'Failed to submit documents for verification'
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const getEkycStatusColor = (status) => {
        const colors = {
            pending: 'default',
            submitted: 'warning',
            verified: 'success',
            rejected: 'error',
        };
        return colors[status] || 'default';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-4xl animate-pulse">📄</div>
            </div>
        );
    }

    if (!farmer) {
        return (
            <Card className="max-w-lg mx-auto text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Required</h2>
                <p className="text-gray-600 mb-4">Please complete your farmer profile before uploading documents.</p>
                <Link to="/profile">
                    <Button variant="success">Complete Profile</Button>
                </Link>
            </Card>
        );
    }

    const requiredDocsCount = documentTypes.filter(d => d.required).length;
    const uploadedRequiredDocsCount = documentTypes.filter(d => d.required && uploadedDocs[d.value]).length;
    const completionPercentage = Math.round((uploadedRequiredDocsCount / requiredDocsCount) * 100);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">📄 eKYC Documents / दस्तऐवज</h1>
                <p className="text-gray-600">Upload verification documents for your farmer profile</p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* eKYC Status Card */}
            {farmer.ekycStatus && (
                <Card className={`${
                    farmer.ekycStatus === 'verified' ? 'bg-green-50 border-green-200' :
                    farmer.ekycStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                    farmer.ekycStatus === 'submitted' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">eKYC Status</h2>
                            <p className="text-sm text-gray-600 mt-1">Current verification status of your documents</p>
                        </div>
                        <Badge variant={getEkycStatusColor(farmer.ekycStatus)} className="text-lg px-4 py-2">
                            {farmer.ekycStatus?.toUpperCase()}
                        </Badge>
                    </div>

                    {farmer.ekycStatus === 'pending' && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-700 mb-3">
                                📄 Upload all required documents below, then click "Submit for Verification" to send them to an officer for review.
                            </p>
                        </div>
                    )}

                    {farmer.ekycStatus === 'submitted' && (
                        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <p className="text-sm text-yellow-800 flex items-center gap-2">
                                <span>⏳</span>
                                Your documents are under review by an officer. You'll be notified once the verification is complete.
                            </p>
                        </div>
                    )}

                    {farmer.ekycStatus === 'rejected' && (
                        <div className="mt-3">
                            <div className="p-3 bg-red-100 border border-red-300 rounded-lg mb-3">
                                <p className="text-sm text-red-800 font-semibold mb-2">❌ eKYC Rejected</p>
                                {farmer.ekycRemarks && (
                                    <p className="text-sm text-red-700">
                                        <strong>Reason:</strong> {farmer.ekycRemarks}
                                    </p>
                                )}
                            </div>
                            <p className="text-sm text-gray-700">
                                Please update your documents based on the officer's feedback and resubmit for verification.
                            </p>
                        </div>
                    )}

                    {farmer.ekycStatus === 'verified' && (
                        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                                <span>✅</span>
                                Your eKYC has been verified! You can now submit loss reports and create panchanama requests.
                            </p>
                            {farmer.ekycVerifiedAt && (
                                <p className="text-xs text-green-700 mt-1">
                                    Verified on {new Date(farmer.ekycVerifiedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}
                </Card>
            )}

            {/* Completion Status */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Upload Progress</h2>
                        <p className="text-sm text-gray-600">
                            {uploadedRequiredDocsCount} of {requiredDocsCount} required documents uploaded
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">{completionPercentage}%</div>
                        <p className="text-xs text-gray-500">Complete</p>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
                {completionPercentage === 100 && ['pending', 'rejected'].includes(farmer.ekycStatus) && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                                <span>✓</span>
                                All required documents uploaded! Ready to submit for verification.
                            </p>
                            <Button
                                variant="success"
                                onClick={handleSubmitEkyc}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Submitting...
                                    </span>
                                ) : (
                                    '📤 Submit for Verification'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Document Upload Cards */}
            <div className="space-y-4">
                {documentTypes.map((docType) => {
                    const isUploaded = uploadedDocs[docType.value];
                    const isUploading = uploadingType === docType.value;

                    return (
                        <Card key={docType.value}>
                            <div className="flex items-start gap-4">
                                <div className="text-5xl">{docType.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {docType.label} / {docType.labelMr}
                                        </h3>
                                        {docType.required && (
                                            <Badge variant="error" size="sm">Required</Badge>
                                        )}
                                        {isUploaded && (
                                            <Badge variant="success" size="sm">✓ Uploaded</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">{docType.description}</p>

                                    <input
                                        ref={(el) => (fileInputRefs.current[docType.value] = el)}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileUpload(e, docType.value)}
                                        className="hidden"
                                        disabled={isUploading}
                                    />

                                    {isUploaded ? (
                                        <div className="flex items-center gap-3">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => handleViewDocument(isUploaded)}
                                            >
                                                👁️ View Document
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                disabled={isUploading}
                                                onClick={() => fileInputRefs.current[docType.value]?.click()}
                                            >
                                                🔄 Re-upload
                                            </Button>
                                            <p className="text-xs text-gray-500">
                                                Uploaded: {new Date(isUploaded.uploadedAt || Date.now()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="success"
                                            disabled={isUploading}
                                            onClick={() => fileInputRefs.current[docType.value]?.click()}
                                        >
                                            {isUploading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    Uploading...
                                                </span>
                                            ) : (
                                                `📤 Upload ${docType.label}`
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">💡 Tips for Best Results</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure documents are clear and readable</li>
                    <li>• File size should be less than 10MB</li>
                    <li>• Accepted formats: JPG, PNG, PDF</li>
                    <li>• For Aadhaar: Upload both front and back sides</li>
                    <li>• For Bank Passbook: Upload first page with account details</li>
                </ul>
            </Card>
        </div>
    );
}

export default Documents;
