/**
 * DocumentChecklist Component
 * Shows KYC and document verification status
 * Used in: Officer verification workflow, Farmer document upload
 */

function DocumentChecklist({ documents, onDocumentClick }) {
  const defaultDocuments = [
    {
      id: 'aadhaar',
      name: 'Aadhaar Card',
      nameMr: 'आधार कार्ड',
      required: true,
      status: 'pending',
      icon: '🆔',
    },
    {
      id: '7_12',
      name: '7/12 Land Extract',
      nameMr: '7/12 उतारा',
      required: true,
      status: 'pending',
      icon: '📄',
    },
    {
      id: 'bank',
      name: 'Bank Passbook',
      nameMr: 'बँक पासबुक',
      required: true,
      status: 'pending',
      icon: '🏦',
    },
    {
      id: 'lease',
      name: 'Lease Agreement (if tenant)',
      nameMr: 'भाडेपट्टी करार',
      required: false,
      status: 'not_required',
      icon: '📝',
    },
  ];

  const docs = documents || defaultDocuments;

  const statusConfig = {
    pending: {
      label: 'Pending',
      labelMr: 'प्रलंबित',
      color: 'bg-yellow-50 border-yellow-300 text-yellow-800',
      icon: '⏳',
    },
    uploaded: {
      label: 'Uploaded',
      labelMr: 'अपलोड केले',
      color: 'bg-blue-50 border-blue-300 text-blue-800',
      icon: '📤',
    },
    verified: {
      label: 'Verified',
      labelMr: 'सत्यापित',
      color: 'bg-green-50 border-green-300 text-green-800',
      icon: '✅',
    },
    rejected: {
      label: 'Rejected',
      labelMr: 'नाकारले',
      color: 'bg-red-50 border-red-300 text-red-800',
      icon: '❌',
    },
    not_required: {
      label: 'Not Required',
      labelMr: 'आवश्यक नाही',
      color: 'bg-gray-50 border-gray-300 text-gray-600',
      icon: '➖',
    },
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 mb-3">Document Checklist</h3>
      {docs.map((doc) => {
        const status = statusConfig[doc.status] || statusConfig.pending;
        return (
          <div
            key={doc.id}
            onClick={() => onDocumentClick?.(doc)}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${
              status.color
            } ${onDocumentClick ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{doc.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  {doc.required && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{doc.nameMr}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">{status.icon}</span>
              <div className="text-right">
                <p className="text-sm font-medium">{status.label}</p>
                <p className="text-xs text-gray-500">{status.labelMr}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Documents:</span>
          <span className="font-bold text-gray-900">{docs.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600">Verified:</span>
          <span className="font-bold text-green-600">
            {docs.filter((d) => d.status === 'verified').length}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600">Pending:</span>
          <span className="font-bold text-yellow-600">
            {docs.filter((d) => d.status === 'pending' || d.status === 'uploaded').length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DocumentChecklist;
