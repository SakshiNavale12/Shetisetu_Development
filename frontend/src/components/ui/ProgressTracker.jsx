/**
 * ProgressTracker Component
 * Shows step-by-step progress of application
 * Used in: Farmer application tracking
 */

function ProgressTracker({ currentStep, steps }) {
  const defaultSteps = [
    { id: 1, label: 'Submitted', labelMr: 'सबमिट केले', icon: '📝' },
    { id: 2, label: 'Document Verification', labelMr: 'कागदपत्र तपासणी', icon: '📄' },
    { id: 3, label: 'Field Visit', labelMr: 'शेत पाहणी', icon: '🚜' },
    { id: 4, label: 'Approval', labelMr: 'मंजुरी', icon: '✅' },
    { id: 5, label: 'Payment', labelMr: 'पेमेंट', icon: '💰' },
  ];

  const progressSteps = steps || defaultSteps;

  return (
    <div className="w-full py-6">
      {/* Mobile View - Vertical */}
      <div className="md:hidden space-y-4">
        {progressSteps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isCompleted
                    ? 'bg-primary-500 text-white'
                    : isCurrent
                    ? 'bg-accent-500 text-white ring-4 ring-accent-100'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isCurrent ? 'text-accent-700' : isCompleted ? 'text-primary-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-sm text-gray-500">{step.labelMr}</p>
              </div>

              {/* Connector Line */}
              {index < progressSteps.length - 1 && (
                <div
                  className={`absolute left-5 mt-10 w-0.5 h-8 ${
                    step.id < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                  style={{ marginLeft: '20px' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop View - Horizontal */}
      <div className="hidden md:flex items-center justify-between">
        {progressSteps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    isCompleted
                      ? 'bg-primary-500 text-white'
                      : isCurrent
                      ? 'bg-accent-500 text-white ring-4 ring-accent-100'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>

                {/* Label */}
                <p
                  className={`mt-2 text-sm font-medium text-center ${
                    isCurrent ? 'text-accent-700' : isCompleted ? 'text-primary-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 text-center">{step.labelMr}</p>
              </div>

              {/* Connector Line */}
              {index < progressSteps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step.id < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressTracker;
