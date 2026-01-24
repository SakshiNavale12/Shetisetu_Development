/**
 * SeverityIndicator Component
 * Displays crop loss severity level
 * Used in: Crop loss reporting, Officer review
 */

function SeverityIndicator({ severity, showLabel = true, size = 'md' }) {
  const severityConfig = {
    low: {
      label: 'Low Damage',
      labelMr: 'कमी नुकसान',
      color: 'bg-severity-low border-yellow-400',
      textColor: 'text-yellow-800',
      icon: '🟡',
      percentage: '0-33%',
    },
    medium: {
      label: 'Medium Damage',
      labelMr: 'मध्यम नुकसान',
      color: 'bg-severity-medium border-orange-400',
      textColor: 'text-orange-800',
      icon: '🟠',
      percentage: '34-66%',
    },
    high: {
      label: 'High Damage',
      labelMr: 'जास्त नुकसान',
      color: 'bg-severity-high border-red-400',
      textColor: 'text-red-800',
      icon: '🔴',
      percentage: '67-100%',
    },
  };

  const config = severityConfig[severity] || severityConfig.low;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border-2 ${config.color} ${sizeClasses[size]}`}
    >
      <span className="text-lg">{config.icon}</span>
      {showLabel && (
        <div className="flex flex-col">
          <span className={`font-semibold ${config.textColor}`}>
            {config.label}
          </span>
          <span className={`text-xs ${config.textColor}`}>
            {config.percentage}
          </span>
        </div>
      )}
    </div>
  );
}

export default SeverityIndicator;
