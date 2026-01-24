function Card({ children, className = '', padding = 'md', hover = false }) {
  const baseStyles = 'bg-white rounded-lg shadow-md';

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';

  return (
    <div className={`${baseStyles} ${paddings[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
