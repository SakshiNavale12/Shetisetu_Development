function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const baseStyles = 'font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500 disabled:bg-gray-300',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 disabled:bg-green-300',
    error: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:bg-red-300',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 disabled:bg-yellow-300',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:opacity-50',
  };

  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-50' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
