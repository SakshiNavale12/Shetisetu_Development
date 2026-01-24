/**
 * StatCard Component
 * Displays key statistics and metrics
 * Used in: Dashboards for all user roles
 */

function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = 'primary',
  subtitle,
  onClick,
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    accent: 'bg-accent-50 text-accent-600 border-accent-200',
    success: 'bg-green-50 text-green-600 border-green-200',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    error: 'bg-red-50 text-red-600 border-red-200',
    secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  };

  const trendClasses = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-soft p-6 border-l-4 ${
        colorClasses[color]
      } ${onClick ? 'cursor-pointer hover:shadow-medium transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        {icon && (
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}
          >
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${trendClasses[trend]}`}
          >
            {trendIcons[trend]} {trendValue}
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
