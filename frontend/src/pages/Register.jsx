import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const roles = [
    { id: 'farmer', label: '👨‍🌾 Farmer', labelMr: 'शेतकरी', color: 'green' },
    { id: 'officer', label: '👮 Officer', labelMr: 'अधिकारी', color: 'blue' },
    { id: 'authority', label: '👔 Authority', labelMr: 'प्राधिकरण', color: 'amber' },
];

const languages = [
    { id: 'mr', label: 'मराठी', labelEn: 'Marathi' },
    { id: 'hi', label: 'हिंदी', labelEn: 'Hindi' },
    { id: 'en', label: 'English', labelEn: 'English' },
];

const validationSchema = Yup.object({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
    mobile: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6-9')
        .required('Mobile number is required'),
    email: Yup.string().email('Invalid email address'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
        .matches(/\d/, 'Password must contain at least one number')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

function Register() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('farmer');
    const [selectedLanguage, setSelectedLanguage] = useState('mr');
    const [apiError, setApiError] = useState('');

    const initialValues = {
        name: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setApiError('');
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    mobile: values.mobile,
                    email: values.email || undefined,
                    password: values.password,
                    role: selectedRole,
                    language: selectedLanguage,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store tokens
            localStorage.setItem('accessToken', data.tokens.access.token);
            localStorage.setItem('refreshToken', data.tokens.refresh.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to profile setup for farmers, dashboard for others
            if (selectedRole === 'farmer') {
                navigate('/profile');
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
            <div className="w-full max-w-lg">
                {/* Logo and Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-600 mb-2">
                        🌾 ShetiSetu
                    </h1>
                    <p className="text-lg text-gray-600">शेतीसेतू</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Create Your Account
                    </p>
                </div>

                {/* Registration Card */}
                <Card className="shadow-xl">
                    {/* Language Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Language / भाषा निवडा
                        </label>
                        <div className="flex gap-2 justify-center">
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    type="button"
                                    onClick={() => setSelectedLanguage(lang.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLanguage === lang.id
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            I am a / मी आहे
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`px-3 py-3 rounded-lg text-sm font-medium transition-all border-2 ${selectedRole === role.id
                                            ? `bg-${role.color}-100 border-${role.color}-500 text-${role.color}-800 shadow-md`
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-lg mb-1">{role.label.split(' ')[0]}</div>
                                    <div className="text-xs">{role.labelMr}</div>
                                </button>
                            ))}
                        </div>
                    </div>

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
                            <Form className="space-y-4">
                                <Input
                                    label="Full Name / पूर्ण नाव"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.name}
                                    touched={touched.name}
                                    required
                                />

                                <Input
                                    label="Mobile Number / मोबाईल नंबर"
                                    name="mobile"
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    value={values.mobile}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.mobile}
                                    touched={touched.mobile}
                                    required
                                />

                                <Input
                                    label="Email (Optional) / ईमेल (ऐच्छिक)"
                                    name="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.email}
                                    touched={touched.email}
                                />

                                <Input
                                    label="Password / पासवर्ड"
                                    name="password"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.password}
                                    touched={touched.password}
                                    required
                                />

                                <Input
                                    label="Confirm Password / पासवर्ड पुष्टी करा"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.confirmPassword}
                                    touched={touched.confirmPassword}
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="success"
                                    size="lg"
                                    fullWidth
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Register / नोंदणी करा'}
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                                Login here
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

export default Register;
