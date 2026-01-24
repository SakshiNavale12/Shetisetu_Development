import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FileUpload from '../components/ui/FileUpload';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { uploadCropSurveyPhotos, addPhotosToCropSurvey } from '../services/uploadService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

function CropSurveyDetail() {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // State for selected files before upload
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedGpsData, setSelectedGpsData] = useState(null);
    const [selectedMetadata, setSelectedMetadata] = useState([]);
    const [uploadKey, setUploadKey] = useState(0); // Key to reset FileUpload component

    useEffect(() => {
        fetchSurvey();
    }, [surveyId]);

    const fetchSurvey = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/crop-surveys/${surveyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setSurvey(data);
            } else {
                setMessage({ type: 'error', text: 'Failed to load survey' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Handle file selection (not upload yet)
    const handleFileSelection = (files, gpsData, metadata) => {
        setSelectedFiles(files);
        setSelectedGpsData(gpsData);
        setSelectedMetadata(metadata);
    };

    // Handle actual upload when button is clicked
    const handleUploadPhotos = async () => {
        if (selectedFiles.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one photo' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });
        try {
            // Step 1: Upload files to storage
            const uploadResult = await uploadCropSurveyPhotos(selectedFiles, selectedGpsData, selectedMetadata);

            // Step 2: Link photos to this survey
            const updatedSurvey = await addPhotosToCropSurvey(surveyId, uploadResult.photos);
            setSurvey(updatedSurvey);

            setMessage({ type: 'success', text: `✓ ${uploadResult.photos.length} photo(s) added successfully with GPS coordinates!` });

            // Clear selection and reset FileUpload component
            setSelectedFiles([]);
            setSelectedGpsData(null);
            setSelectedMetadata([]);
            setUploadKey(prev => prev + 1); // Force FileUpload to reset
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-4xl animate-pulse">🌾</div>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Survey Not Found</h2>
                <Link to="/crop-survey">
                    <Button variant="success">Back to Surveys</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">📸 Add Geo-Tagged Photos</h1>
                    <p className="text-gray-600">Upload crop images with GPS location</p>
                </div>
                <Link to="/crop-survey">
                    <Button variant="default">← Back to Surveys</Button>
                </Link>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Survey Info */}
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Survey Details / सर्वेक्षण तपशील</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Crop Name</p>
                        <p className="font-medium text-lg">{survey.cropName} {survey.cropNameLocal && `(${survey.cropNameLocal})`}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Season & Year</p>
                        <p className="font-medium">{survey.season} - {survey.year}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Survey Number</p>
                        <p className="font-medium">{survey.landParcel?.surveyNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Cultivated Area</p>
                        <p className="font-medium">{survey.cultivatedArea} {survey.cultivatedAreaUnit}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Crop Type</p>
                        <p className="font-medium">{survey.cropType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge variant={
                            survey.status === 'verified' ? 'success' :
                                survey.status === 'rejected' ? 'error' :
                                    survey.status === 'submitted' ? 'warning' : 'default'
                        }>
                            {survey.status}
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Existing Photos */}
            {survey.photos && survey.photos.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        Existing Photos ({survey.photos.length}) / विद्यमान फोटो
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {survey.photos.map((photo, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                <img
                                    src={`${BASE_URL}${photo.url}`}
                                    alt={photo.caption || 'Crop photo'}
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

            {/* Add More Photos */}
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">
                    📸 Add New Photos / नवीन फोटो जोडा
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Select geo-tagged photos, add captions, then click Upload. Make sure GPS is enabled on your device.
                </p>
                <FileUpload
                    key={uploadKey}
                    label="Select crop photos with GPS location / जीपीएस स्थानासह पीक फोटो निवडा"
                    accept="image/*"
                    multiple
                    captureGPS
                    maxFiles={50}
                    photoTypes={['crop', 'field', 'sowing', 'growth']}
                    enableMetadata
                    onChange={handleFileSelection}
                />

                {selectedFiles.length > 0 && !uploading && (
                    <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="text-sm text-green-800">
                            ✓ {selectedFiles.length} photo(s) selected. Add captions and types above, then click Upload.
                        </p>
                        <Button variant="success" onClick={handleUploadPhotos}>
                            📤 Upload Photos
                        </Button>
                    </div>
                )}

                {uploading && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 animate-pulse flex items-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
                            Uploading and processing images...
                        </p>
                    </div>
                )}
            </Card>

            {/* Info Box */}
            <Card className="bg-green-50 border-green-200">
                <h3 className="font-bold text-green-900 mb-2">💡 Tips for Best Results</h3>
                <ul className="text-sm text-green-800 space-y-1">
                    <li>• Enable GPS/Location services on your device</li>
                    <li>• Take photos in good lighting conditions</li>
                    <li>• Capture different crop growth stages (sowing, growth, flowering)</li>
                    <li>• Add captions to describe each photo</li>
                    <li>• Maximum 50 photos per survey, 5MB per image</li>
                </ul>
            </Card>
        </div>
    );
}

export default CropSurveyDetail;
