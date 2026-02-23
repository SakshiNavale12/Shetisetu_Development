import { useState, useRef, useCallback } from 'react';
import Button from './Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

/**
 * GeoTaggedPhotoUpload
 * Captures the device's GPS location at upload time and attaches it to
 * every photo.  Calls the /v1/upload/loss-reports endpoint and returns
 * the processed photo objects (with geoVerification) via onPhotosUploaded.
 *
 * Props:
 *  - onPhotosUploaded(photos)  – called with the array of uploaded photo objects
 *  - reportId (optional)       – used as the sub-path on the server
 *  - maxPhotos (default 10)
 *  - disabled
 */
function GeoTaggedPhotoUpload({ onPhotosUploaded, reportId = 'temp', maxPhotos = 10, disabled = false }) {
    const fileInputRef = useRef(null);

    const [photos, setPhotos] = useState([]);          // { file, preview, status, result, error }
    const [location, setLocation] = useState(null);    // { latitude, longitude, accuracy }
    const [locationError, setLocationError] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // ── GPS Capture ──────────────────────────────────────────────────────
    const captureLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser / या ब्राउझरमध्ये GPS समर्थित नाही');
            return;
        }
        setGettingLocation(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: Math.round(pos.coords.accuracy),
                });
                setGettingLocation(false);
            },
            (err) => {
                const messages = {
                    1: 'Location permission denied. Please allow location access / स्थान परवानगी नाकारली',
                    2: 'Location unavailable. Please try again / स्थान उपलब्ध नाही',
                    3: 'Location request timed out / वेळ संपली',
                };
                setLocationError(messages[err.code] || 'Could not get location');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, []);

    // ── File Selection ────────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;

        const remaining = maxPhotos - photos.length;
        const toAdd = selected.slice(0, remaining);

        const newPhotos = toAdd.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            status: 'pending',   // pending | uploading | done | error
            result: null,
            error: '',
        }));
        setPhotos((prev) => [...prev, ...newPhotos]);
        setUploadDone(false);
        setUploadError('');
        // Reset input so the same file can be re-selected if removed
        e.target.value = '';
    };

    const removePhoto = (index) => {
        setPhotos((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    // ── Upload ────────────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (photos.length === 0) return;
        if (!location) {
            setUploadError('Please capture your GPS location first / प्रथम GPS स्थान मिळवा');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();

            photos.forEach((p, i) => {
                formData.append('photos', p.file);
                formData.append(`type_${i}`, 'damage');
            });
            formData.append('reportId', reportId);
            formData.append('gpsData', JSON.stringify(location));

            const response = await fetch(`${API_URL}/upload/loss-reports`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed');

            const uploadedPhotos = data.photos || [];

            // Mark each local photo as done and attach the server result
            setPhotos((prev) =>
                prev.map((p, i) => ({
                    ...p,
                    status: 'done',
                    result: uploadedPhotos[i] || null,
                }))
            );

            setUploadDone(true);
            if (onPhotosUploaded) onPhotosUploaded(uploadedPhotos);
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────
    const geoStatusColor = (status) => {
        const map = {
            verified: 'text-green-700 bg-green-50 border-green-300',
            warning: 'text-yellow-700 bg-yellow-50 border-yellow-300',
            unverified: 'text-gray-600 bg-gray-50 border-gray-300',
            no_reference: 'text-blue-700 bg-blue-50 border-blue-300',
        };
        return map[status] || map.unverified;
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Step 1 – GPS */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-2">
                    📍 Step 1: Capture Your Location / स्थान मिळवा
                </h3>

                {location ? (
                    <div className="flex items-start justify-between">
                        <div className="text-sm text-green-700 bg-green-50 border border-green-300 rounded p-2 flex-1 mr-2">
                            <p className="font-semibold">✓ Location captured / स्थान मिळाले</p>
                            <p>Lat: {location.latitude.toFixed(6)}°  Lon: {location.longitude.toFixed(6)}°</p>
                            <p className="text-xs text-green-600">Accuracy: ±{location.accuracy} m</p>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={captureLocation}
                            disabled={gettingLocation || disabled}
                        >
                            🔄 Refresh
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Button
                            variant="primary"
                            onClick={captureLocation}
                            disabled={gettingLocation || disabled}
                        >
                            {gettingLocation ? '⏳ Getting location...' : '📍 Get My GPS Location'}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                            Allow location permission when prompted / परवानगी द्या
                        </p>
                    </div>
                )}

                {locationError && (
                    <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                        ⚠️ {locationError}
                    </p>
                )}
            </div>

            {/* Step 2 – Select Photos */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-2">
                    📷 Step 2: Select Damage Photos / नुकसानाचे फोटो निवडा
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                    Upload photos of the damaged crop/field. Maximum {maxPhotos} photos.
                    / जास्तीत जास्त {maxPhotos} फोटो अपलोड करा
                </p>

                {photos.length < maxPhotos && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={disabled || uploadDone}
                        />
                        <Button
                            variant="default"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || uploadDone}
                        >
                            📁 Choose Photos
                        </Button>
                    </>
                )}

                {/* Photo Grid */}
                {photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {photos.map((p, i) => (
                            <div key={i} className="relative group">
                                <img
                                    src={p.preview}
                                    alt={`Photo ${i + 1}`}
                                    className="w-full h-24 object-cover rounded border"
                                />
                                {/* Status overlay */}
                                {p.status === 'done' && (
                                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">✓</div>
                                )}
                                {/* Remove button (only before upload) */}
                                {!uploadDone && (
                                    <button
                                        onClick={() => removePhoto(i)}
                                        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        type="button"
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                )}
                                {/* Geo-verification badge after upload */}
                                {p.status === 'done' && p.result?.geoVerification && (
                                    <div className={`mt-1 text-xs border rounded px-1 py-0.5 ${geoStatusColor(p.result.geoVerification.status)}`}>
                                        {p.result.geoVerification.status === 'verified' && '✓ Location OK'}
                                        {p.result.geoVerification.status === 'warning' && '⚠ Location mismatch'}
                                        {p.result.geoVerification.status === 'no_reference' && 'ℹ No reference'}
                                        {p.result.geoVerification.status === 'unverified' && 'GPS not found'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Step 3 – Upload */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-2">
                    ⬆️ Step 3: Upload Photos / फोटो अपलोड करा
                </h3>

                {uploadDone ? (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-300 rounded p-3">
                        <p className="font-semibold">✓ {photos.length} photo(s) uploaded successfully!</p>
                        <p className="text-xs mt-1">Location was tagged to all photos / सर्व फोटोंना GPS टॅग केले</p>

                        {/* Geo-verification summary */}
                        {photos.some(p => p.result?.geoVerification) && (
                            <div className="mt-2 space-y-1">
                                {photos.map((p, i) =>
                                    p.result?.geoVerification ? (
                                        <div key={i} className={`text-xs border rounded px-2 py-1 ${geoStatusColor(p.result.geoVerification.status)}`}>
                                            <strong>Photo {i + 1}:</strong> {p.result.geoVerification.message}
                                            {p.result.geoVerification.distanceKm != null && (
                                                <span> ({p.result.geoVerification.distanceKm} km from registered location)</span>
                                            )}
                                        </div>
                                    ) : null
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <Button
                            variant="success"
                            onClick={handleUpload}
                            disabled={
                                disabled ||
                                uploading ||
                                photos.length === 0 ||
                                !location
                            }
                        >
                            {uploading
                                ? `⏳ Uploading ${photos.length} photo(s)...`
                                : `⬆️ Upload ${photos.length} Photo(s) with GPS Tag`}
                        </Button>

                        {!location && photos.length > 0 && (
                            <p className="text-xs text-amber-600 mt-1">⚠️ Capture GPS location first before uploading</p>
                        )}
                    </div>
                )}

                {uploadError && (
                    <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                        ❌ {uploadError}
                    </p>
                )}
            </div>
        </div>
    );
}

export default GeoTaggedPhotoUpload;
