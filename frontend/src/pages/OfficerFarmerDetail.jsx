import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import FarmerAIReport from '../components/officer/FarmerAIReport';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

function OfficerFarmerDetail() {
    const { farmerId } = useParams();
    const navigate = useNavigate();
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showEkycModal, setShowEkycModal] = useState(false);
    const [ekycAction, setEkycAction] = useState(null);
    const [ekycRemarks, setEkycRemarks] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    useEffect(() => {
        fetchFarmerDetails();
    }, [farmerId]);

    const fetchFarmerDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/farmers/${farmerId}/documents`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setFarmer(data);
            } else {
                setMessage({ type: 'error', text: 'Failed to load farmer details' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleEkycUpdate = async () => {
        if (!ekycAction) return;

        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch(`${API_URL}/farmers/${farmerId}/ekyc`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    status: ekycAction,
                    remarks: ekycRemarks,
                }),
            });

            if (response.ok) {
                const updatedFarmer = await response.json();
                setFarmer(updatedFarmer);
                setMessage({
                    type: 'success',
                    text: `eKYC ${ekycAction === 'verified' ? 'approved' : 'rejected'} successfully!`
                });
                setShowEkycModal(false);
                setEkycRemarks('');
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || 'Failed to update eKYC status' });
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

    const openEkycModal = (action) => {
        setEkycAction(action);
        setShowEkycModal(true);
        setEkycRemarks('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!farmer) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Farmer Not Found</h2>
                <Link to="/officer/dashboard">
                    <Button variant="success">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const documentTypes = [
        { key: 'aadhaar', label: 'Aadhaar Card', icon: '🆔' },
        { key: 'pan', label: 'PAN Card', icon: '💳' },
        { key: '7-12', label: '7/12 Extract', icon: '📋' },
        { key: '8-A', label: '8-A Extract', icon: '📄' },
        { key: 'passbook', label: 'Bank Passbook', icon: '🏦' },
        { key: 'lease', label: 'Lease Document', icon: '📑' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        👨‍🌾 Farmer Details & eKYC Verification
                    </h1>
                    <p className="text-gray-600">Review farmer profile and verify documents</p>
                </div>
                <Link to="/officer/dashboard">
                    <Button variant="default">← Back to Dashboard</Button>
                </Link>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* eKYC Status Card */}
            <Card className={`${farmer.ekycStatus === 'verified' ? 'bg-green-50 border-green-200' : farmer.ekycStatus === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">eKYC Status</p>
                        <Badge variant={getEkycStatusColor(farmer.ekycStatus)} className="text-lg px-4 py-2">
                            {farmer.ekycStatus?.toUpperCase()}
                        </Badge>
                        {farmer.ekycVerifiedAt && (
                            <p className="text-sm text-gray-600 mt-2">
                                Verified on {new Date(farmer.ekycVerifiedAt).toLocaleDateString()} by {farmer.ekycVerifiedBy?.name || 'Officer'}
                            </p>
                        )}
                        {farmer.ekycRemarks && (
                            <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded">
                                <strong>Remarks:</strong> {farmer.ekycRemarks}
                            </p>
                        )}
                    </div>
                    {farmer.ekycStatus !== 'verified' && (
                        <div className="flex gap-2">
                            <Button
                                variant="success"
                                onClick={() => openEkycModal('verified')}
                                disabled={submitting}
                            >
                                ✓ Approve eKYC
                            </Button>
                            <Button
                                variant="error"
                                onClick={() => openEkycModal('rejected')}
                                disabled={submitting}
                            >
                                ✗ Reject eKYC
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Personal Details */}
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">
                    👤 Personal Information / वैयक्तिक माहिती
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold text-lg">{farmer.fullName}</p>
                    </div>
                    {farmer.fatherName && (
                        <div>
                            <p className="text-sm text-gray-600">Father's Name</p>
                            <p className="font-semibold">{farmer.fatherName}</p>
                        </div>
                    )}
                    {farmer.dateOfBirth && (
                        <div>
                            <p className="text-sm text-gray-600">Date of Birth</p>
                            <p className="font-semibold">{new Date(farmer.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                    )}
                    {farmer.gender && (
                        <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-semibold capitalize">{farmer.gender}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-semibold">{farmer.user?.mobile || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{farmer.user?.email || 'N/A'}</p>
                    </div>
                </div>
            </Card>

            {/* Location Details */}
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">
                    📍 Location / स्थान
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {farmer.division && (
                        <div>
                            <p className="text-sm text-gray-600">Division</p>
                            <p className="font-semibold">{farmer.division}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-600">District</p>
                        <p className="font-semibold">{farmer.district}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Taluka</p>
                        <p className="font-semibold">{farmer.taluka}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Village</p>
                        <p className="font-semibold">{farmer.village}</p>
                    </div>
                </div>
            </Card>

            {/* Land Parcels */}
            {farmer.landParcels && farmer.landParcels.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        🗺️ Land Parcels / जमीन तपशील
                    </h2>
                    <div className="space-y-3">
                        {farmer.landParcels.map((parcel, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600">Survey Number</p>
                                        <p className="font-semibold">{parcel.surveyNumber}</p>
                                    </div>
                                    {parcel.gutNumber && (
                                        <div>
                                            <p className="text-xs text-gray-600">Gut Number</p>
                                            <p className="font-semibold">{parcel.gutNumber}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-600">Area</p>
                                        <p className="font-semibold">{parcel.area} {parcel.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Ownership</p>
                                        <p className="font-semibold capitalize">{parcel.ownershipType || 'owned'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Bank Details */}
            {farmer.bankName && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        🏦 Bank Details / बँक तपशील
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Bank Name</p>
                            <p className="font-semibold">{farmer.bankName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Account Holder Name</p>
                            <p className="font-semibold">{farmer.accountHolderName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">IFSC Code</p>
                            <p className="font-semibold font-mono">{farmer.ifscCode}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Account Number</p>
                            <p className="font-semibold font-mono">****{farmer.accountNumber?.slice(-4) || 'N/A'}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Documents */}
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">
                    📄 Uploaded Documents / अपलोड केलेले दस्तऐवज
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentTypes.map((docType) => {
                        const doc = farmer.documents?.[docType.key];
                        return (
                            <div
                                key={docType.key}
                                className={`border rounded-lg p-4 ${doc?.url ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{docType.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{docType.label}</p>
                                        {doc?.uploadedAt && (
                                            <p className="text-xs text-gray-500">
                                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {doc?.url ? (
                                    <a
                                        href={`${BASE_URL}${doc.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full"
                                    >
                                        <Button variant="primary" size="sm" fullWidth>
                                            👁️ View Document
                                        </Button>
                                    </a>
                                ) : (
                                    <p className="text-xs text-gray-500 text-center py-2">Not uploaded</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* AI Report Section */}
            <Card>
                <h2 className="text-xl font-bold mb-2 border-b pb-2">
                    🤖 AI Summary Report / एआय सारांश अहवाल
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                    Auto-generated report with document scan results, cross-validation checks, and officer recommendations.
                </p>
                <FarmerAIReport farmerId={farmerId} />
            </Card>

            {/* eKYC Approval Modal */}
            {showEkycModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {ekycAction === 'verified' ? '✓ Approve eKYC' : '✗ Reject eKYC'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {ekycAction === 'verified'
                                ? 'Are you sure you want to approve this farmer\'s eKYC? This will allow them to create panchanama requests.'
                                : 'Please provide a reason for rejecting this farmer\'s eKYC.'
                            }
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarks {ekycAction === 'rejected' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={ekycRemarks}
                                onChange={(e) => setEkycRemarks(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500"
                                rows={3}
                                placeholder={ekycAction === 'verified' ? 'Optional remarks...' : 'Please specify the reason for rejection...'}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={ekycAction === 'verified' ? 'success' : 'error'}
                                onClick={handleEkycUpdate}
                                disabled={submitting || (ekycAction === 'rejected' && !ekycRemarks.trim())}
                                fullWidth
                            >
                                {submitting ? 'Processing...' : `Confirm ${ekycAction === 'verified' ? 'Approval' : 'Rejection'}`}
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => setShowEkycModal(false)}
                                disabled={submitting}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OfficerFarmerDetail;
