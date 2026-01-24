/**
 * StatusBadge Component
 * Shows application/case status with appropriate colors
 * Used in: Farmer portal, Officer dashboard
 */

function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    submitted: {
      label: 'Submitted',
      color: 'bg-accent-100 text-accent-800 border-accent-300',
      icon: '📤',
    },
    under_verification: {
      label: 'Under Verification',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '🔍',
    },
    field_visit_scheduled: {
      label: 'Field Visit Scheduled',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '📅',
    },
    approved: {
      label: 'Approved',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '✅',
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '❌',
    },
    compensation_paid: {
      label: 'Compensation Paid',
      color: 'bg-primary-100 text-primary-800 border-primary-300',
      icon: '💰',
    },
    pending: {
      label: 'Pending',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: '⏳',
    },
    correction_required: {
      label: 'Correction Required',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: '✏️',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
