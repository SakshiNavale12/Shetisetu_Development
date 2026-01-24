import { useState } from 'react';

/**
 * FileUpload Component
 * Handles image/document uploads with preview
 * Supports geo-tagging and timestamp capture
 * Used in: Crop survey, Loss reporting, Officer verification
 */

function FileUpload({
  label,
  accept = 'image/*',
  multiple = false,
  required = false,
  onChange,
  captureGPS = false,
  maxFiles = 5,
  photoTypes = ['crop', 'field', 'sowing', 'growth'], // For crop survey
  enableMetadata = true, // Enable type and caption fields
}) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [gpsData, setGpsData] = useState(null);
  const [photoMetadata, setPhotoMetadata] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Generate previews
    const newPreviews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024).toFixed(2) + ' KB',
      timestamp: new Date().toISOString(),
    }));

    // Initialize metadata for new files
    const newMetadata = selectedFiles.map(() => ({
      type: photoTypes[0],
      caption: '',
    }));

    const updatedFiles = [...files, ...selectedFiles];
    const updatedPreviews = [...previews, ...newPreviews];
    const updatedMetadata = [...photoMetadata, ...newMetadata];

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    setPhotoMetadata(updatedMetadata);

    // Capture GPS if enabled
    if (captureGPS && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gps = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setGpsData(gps);
          onChange?.(updatedFiles, gps, updatedMetadata);
        },
        (error) => {
          console.error('GPS Error:', error);
          onChange?.(updatedFiles, null, updatedMetadata);
        }
      );
    } else {
      onChange?.(updatedFiles, null, updatedMetadata);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newMetadata = photoMetadata.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    setPhotoMetadata(newMetadata);
    onChange?.(newFiles, gpsData, newMetadata);
  };

  const updateMetadata = (index, field, value) => {
    const updated = [...photoMetadata];
    updated[index] = { ...updated[index], [field]: value };
    setPhotoMetadata(updated);
    onChange?.(files, gpsData, updated);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Button */}
      <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="text-center">
          <svg
            className="w-10 h-10 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Click to upload {multiple ? 'files' : 'file'}
          </p>
          <p className="text-xs text-gray-500">
            {files.length}/{maxFiles} files uploaded
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />
      </label>

      {/* GPS Info */}
      {captureGPS && gpsData && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded">
          <span>📍</span>
          <span>
            GPS: {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}
          </span>
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <img
                src={preview.url}
                alt={preview.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3 space-y-2">
                <p className="text-xs text-gray-600 truncate">{preview.name}</p>
                <p className="text-xs text-gray-400">{preview.size}</p>

                {/* Metadata Fields */}
                {enableMetadata && (
                  <div className="space-y-2 mt-2">
                    {/* Type Selector */}
                    <select
                      value={photoMetadata[index]?.type || photoTypes[0]}
                      onChange={(e) => updateMetadata(index, 'type', e.target.value)}
                      className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      {photoTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>

                    {/* Caption Input */}
                    <input
                      type="text"
                      placeholder="Caption (optional)"
                      value={photoMetadata[index]?.caption || ''}
                      onChange={(e) => updateMetadata(index, 'caption', e.target.value)}
                      maxLength="200"
                      className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
