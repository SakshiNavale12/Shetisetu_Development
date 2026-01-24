import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-xl text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Go Back Home</Button>
      </Link>
    </div>
  );
}

export default NotFound;
