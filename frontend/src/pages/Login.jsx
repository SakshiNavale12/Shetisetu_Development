import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const validationSchema = Yup.object({
  identifier: Yup.string()
    .required('Email or mobile number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

function Login() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const initialValues = {
    identifier: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setApiError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      const role = data.user.role;
      if (role === 'farmer') {
        navigate('/dashboard');
      } else if (role === 'officer') {
        navigate('/officer/dashboard');
      } else if (role === 'authority') {
        navigate('/authority/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            🌾 ShetiSetu
          </h1>
          <p className="text-lg text-gray-600">शेतीसेतू</p>
          <p className="text-sm text-gray-500 mt-2">
            Digital Bridge for Agricultural Governance
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Login to Your Account
          </h2>

          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-6">
                <Input
                  label="Email or Mobile / ईमेल किंवा मोबाईल"
                  name="identifier"
                  type="text"
                  placeholder="Enter email or mobile number"
                  value={values.identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.identifier}
                  touched={touched.identifier}
                  required
                />

                <Input
                  label="Password / पासवर्ड"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  required
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-green-600 hover:text-green-700 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Login / लॉगिन'}
                </Button>
              </Form>
            )}
          </Formik>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          Built with ❤️ for Maharashtra's farmers
        </p>
      </div>
    </div>
  );
}

export default Login;
