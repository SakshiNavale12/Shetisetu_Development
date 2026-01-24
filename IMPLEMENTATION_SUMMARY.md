# Geo-Tagged Crop Image Upload - Implementation Summary

## ✅ Completed Backend Infrastructure

### 1. Dependencies Added
- Added to [package.json](backend/package.json):
  - `multer@^1.4.5-lts.1` - File upload middleware
  - `sharp@^0.33.0` - Image processing
  - `exif-parser@^0.1.12` - GPS extraction from EXIF
  - `uuid@^9.0.0` - Unique file naming

**Action Required:** Run `npm install` in the backend directory

### 2. Upload Configuration
- Created [backend/src/config/upload.js](backend/src/config/upload.js)
  - 5MB file size limit
  - Max 50 images per upload
  - Image quality: 85% JPEG
  - Worker pool size: 4 threads

### 3. Worker Thread Infrastructure
- Created [backend/src/workers/imageProcessor.worker.js](backend/src/workers/imageProcessor.worker.js)
  - Non-blocking Sharp image processing
  - EXIF GPS extraction
  - Image resize to max 1920px

- Created [backend/src/services/workerPool.js](backend/src/services/workerPool.js)
  - Worker pool manager
  - Job queue management
  - Automatic worker restart on failure

### 4. Upload Middleware & Services
- Created [backend/src/middlewares/upload.js](backend/src/middlewares/upload.js)
  - Multer configuration
  - Memory storage
  - File type validation

- Created [backend/src/services/upload.service.js](backend/src/services/upload.service.js)
  - Worker-based image processing
  - Parallel file uploads
  - File deletion utility

### 5. Upload API Endpoints
- Created [backend/src/controllers/upload.controller.js](backend/src/controllers/upload.controller.js)
- Created [backend/src/validations/upload.validation.js](backend/src/validations/upload.validation.js)
- Created [backend/src/routes/v1/upload.route.js](backend/src/routes/v1/upload.route.js)

**Endpoints:**
- `POST /v1/upload/crop-surveys` - Upload crop photos (max 50)
- `POST /v1/upload/loss-reports` - Upload loss report photos
- `POST /v1/upload/documents` - Upload verification documents

### 6. Crop Survey Photo Integration
- Updated [backend/src/services/cropSurvey.service.js](backend/src/services/cropSurvey.service.js)
  - Added `addPhotos()` method for periodic updates

- Updated [backend/src/controllers/cropSurvey.controller.js](backend/src/controllers/cropSurvey.controller.js)
  - Added `addPhotosToSurvey()` controller

- Updated [backend/src/validations/cropSurvey.validation.js](backend/src/validations/cropSurvey.validation.js)
  - Added `addPhotos` validation schema

- Updated [backend/src/routes/v1/cropSurvey.route.js](backend/src/routes/v1/cropSurvey.route.js)
  - Added `POST /v1/crop-surveys/:surveyId/photos` route

### 7. Static File Serving & Security
- Updated [backend/src/app.js](backend/src/app.js)
  - Added `/uploads` static file serving

- Updated [backend/src/middlewares/rateLimiter.js](backend/src/middlewares/rateLimiter.js)
  - Added upload rate limiting (50 uploads per 15 minutes)

## ✅ Completed Frontend Infrastructure

### 1. Upload Service
- Created [frontend/src/services/uploadService.js](frontend/src/services/uploadService.js)
  - `uploadCropSurveyPhotos()` - Upload with GPS and metadata
  - `uploadDocument()` - Document upload
  - `addPhotosToCropSurvey()` - Add photos to existing survey
  - `uploadLossReportPhotos()` - Loss report photos

### 2. Enhanced FileUpload Component
- Updated [frontend/src/components/ui/FileUpload.jsx](frontend/src/components/ui/FileUpload.jsx)
  - Added photo type selector (crop, field, sowing, growth)
  - Added caption input for each photo
  - GPS capture integration
  - Metadata state management

## 🔄 Final Integration Steps

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Integrate FileUpload into CropSurvey Form

Update [frontend/src/pages/CropSurvey.jsx](frontend/src/pages/CropSurvey.jsx):

```javascript
// Add imports at the top
import FileUpload from '../components/ui/FileUpload';
import { uploadCropSurveyPhotos } from '../services/uploadService';

// In the CropSurvey component, add state:
const [uploadedPhotos, setUploadedPhotos] = useState([]);
const [uploadingPhotos, setUploadingPhotos] = useState(false);

// Add photo upload handler before handleSubmit:
const handlePhotoUpload = async (files, gpsData, metadata) => {
  if (files.length === 0) return;

  setUploadingPhotos(true);
  try {
    const result = await uploadCropSurveyPhotos(files, gpsData, metadata);
    setUploadedPhotos(result.photos);
    setMessage({ type: 'success', text: 'Photos uploaded successfully!' });
  } catch (error) {
    setMessage({ type: 'error', text: error.message });
  } finally {
    setUploadingPhotos(false);
  }
};

// In handleSubmit, include photos in the survey data:
body: JSON.stringify({
  // ... existing fields ...
  photos: uploadedPhotos, // Add this line
}),

// In the JSX, add FileUpload before the submit button (after remarks field):
<Card>
  <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
    📸 Crop Photos / पीक फोटो
  </h2>
  <FileUpload
    label="Upload Crop Photos with GPS / जीपीएस सह पीक फोटो अपलोड करा"
    accept="image/*"
    multiple
    captureGPS
    maxFiles={50}
    photoTypes={['crop', 'field', 'sowing', 'growth']}
    enableMetadata
    onChange={handlePhotoUpload}
  />
  {uploadingPhotos && (
    <p className="text-sm text-gray-500 mt-2">⏳ Uploading photos...</p>
  )}
  {uploadedPhotos.length > 0 && (
    <p className="text-sm text-green-600 mt-2">
      ✓ {uploadedPhotos.length} photos uploaded successfully
    </p>
  )}
</Card>
```

### Step 3: Create CropSurveyDetail Page (Optional - For Periodic Updates)

Create [frontend/src/pages/CropSurveyDetail.jsx](frontend/src/pages/CropSurveyDetail.jsx):

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileUpload from '../components/ui/FileUpload';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { uploadCropSurveyPhotos, addPhotosToCropSurvey } from '../services/uploadService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

function CropSurveyDetail() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      }
    } catch (error) {
      console.error('Failed to fetch survey:', error);
    }
  };

  const handleAddPhotos = async (files, gpsData, metadata) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Upload files to storage
      const uploadResult = await uploadCropSurveyPhotos(files, gpsData, metadata);

      // Link to survey
      const updatedSurvey = await addPhotosToCropSurvey(surveyId, uploadResult.photos);
      setSurvey(updatedSurvey);

      setMessage({ type: 'success', text: 'Photos added successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  if (!survey) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Crop Survey Details</h1>

      {message.text && (
        <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Survey Info */}
      <Card>
        <h2 className="text-xl font-bold mb-2">{survey.cropName}</h2>
        <p>Season: {survey.season} | Year: {survey.year}</p>
        <p>Status: {survey.status}</p>
      </Card>

      {/* Existing Photos */}
      {survey.photos && survey.photos.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Existing Photos ({survey.photos.length})</h2>
          <div className="grid grid-cols-3 gap-4">
            {survey.photos.map((photo, index) => (
              <div key={index} className="border rounded p-2">
                <img
                  src={`${API_URL}${photo.url}`}
                  alt={photo.caption || 'Crop photo'}
                  className="w-full h-40 object-cover rounded"
                />
                <p className="text-sm font-semibold mt-2">{photo.type}</p>
                {photo.caption && <p className="text-xs text-gray-600">{photo.caption}</p>}
                {photo.geoLocation && (
                  <p className="text-xs text-green-600 mt-1">
                    📍 {photo.geoLocation.latitude.toFixed(4)}, {photo.geoLocation.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add More Photos */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Add More Photos</h2>
        <FileUpload
          label="Upload Additional Crop Photos"
          accept="image/*"
          multiple
          captureGPS
          maxFiles={10}
          photoTypes={['crop', 'field', 'sowing', 'growth']}
          enableMetadata
          onChange={handleAddPhotos}
        />
        {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
      </Card>

      <Button onClick={() => navigate('/crop-survey')}>Back to Surveys</Button>
    </div>
  );
}

export default CropSurveyDetail;
```

### Step 4: Update Router (if using CropSurveyDetail)

Add route to [frontend/src/App.jsx](frontend/src/App.jsx) or your router file:

```javascript
import CropSurveyDetail from './pages/CropSurveyDetail';

// In routes:
<Route path="/crop-survey/:surveyId" element={<CropSurveyDetail />} />
```

## 🧪 Testing

### 1. Backend Testing
```bash
cd backend
npm start
```

### 2. Frontend Testing
```bash
cd frontend
npm run dev
```

### 3. Manual Test Flow
1. Login as a farmer
2. Navigate to Crop Survey page
3. Fill out the survey form
4. Upload 3-5 crop photos (enable GPS)
5. Add type and caption to each photo
6. Submit the survey
7. Check that photos are saved in `/backend/uploads/crop-surveys/{farmerId}/{year}/`
8. Verify photos appear in database
9. Access photos via `http://localhost:3000/uploads/...`

### 4. Periodic Upload Test (if using CropSurveyDetail)
1. Navigate to survey detail page
2. Upload 2 more photos
3. Verify they append to existing photos

## 📁 File Storage Structure
```
backend/uploads/
├── crop-surveys/
│   └── {farmerId}/
│       └── {year}/
│           ├── 1705123456789-uuid.jpg
│           └── 1705234567890-uuid.jpg
├── loss-reports/
│   └── {farmerId}/
│       └── {reportId}/
├── documents/
│   └── {farmerId}/
│       ├── aadhaar/
│       ├── 7-12/
│       ├── lease/
│       └── passbook/
└── temp/
```

## 🔑 Key Features Implemented
✅ Non-blocking image processing with worker threads
✅ GPS geo-tagging (EXIF + client-provided)
✅ Up to 50 images per crop survey
✅ Image optimization (resize to 1920px, 85% JPEG quality)
✅ Photo metadata (type, caption)
✅ Periodic photo uploads to existing surveys
✅ Rate limiting (50 uploads per 15 minutes)
✅ Local filesystem storage
✅ Common reusable upload API

## 🚀 Future Enhancements
- Thumbnail generation for faster loading
- WebP format support
- Offline upload queue with IndexedDB
- Batch download as ZIP
- Cloud storage migration (S3/Cloudinary)

## 📝 Notes
- Remember to run `npm install` in backend directory
- Worker threads use Node.js built-in `worker_threads`
- Images are automatically optimized during upload
- GPS data from EXIF is extracted before optimization
- Client-provided GPS takes priority over EXIF GPS
- The API supports both single and batch uploads
