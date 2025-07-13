// src/Components/Auth/signup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authcontext.jsx';
import { Loader2 } from 'lucide-react';
import Toast from '../common/toast.jsx';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const { register, adminRegister } = useAuth(); // Get both register functions
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminSignup, setIsAdminSignup] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setIsAdminSignup(queryParams.get('type') === 'admin');
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setToastMessage(null);

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setToastMessage({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setToastMessage({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    const credentialsToRegister = {
      email: formData.email,
      password: formData.password,
      // name: formData.name, // Uncomment if your User/Admin model has a 'name' field
    };

    setLoading(true);

    try {
      let result;
      if (isAdminSignup) {
        console.log("Attempting admin registration for email:", credentialsToRegister.email);
        result = await adminRegister(credentialsToRegister); // Call adminRegister
      } else {
        console.log("Attempting user registration for email:", credentialsToRegister.email);
        result = await register(credentialsToRegister); // Call regular register
      }

      if (result.success) {
        console.log("Registration successful:", result.user || result.admin);
        setToastMessage({ type: 'success', message: 'Signup successful, please sign in here.' });
        setLoading(false);
        setTimeout(() => {
          // Redirect to sign-in, specifically to admin tab if it was an admin signup
          navigate(isAdminSignup ? '/signin?tab=admin' : '/signin');
        }, 1500);
      } else {
        console.error("Registration failed:", result.error);
        setError(result.error);
        setToastMessage({ type: 'error', message: result.error });
        setLoading(false);
      }
    } catch (err) {
      console.error("Registration network/unexpected error:", err);
      setError(err.message || 'An unexpected error occurred during registration.');
      setToastMessage({ type: 'error', message: err.message || 'An unexpected error occurred.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isAdminSignup ? 'Create your Admin Account' : 'Create your User Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to={isAdminSignup ? '/signin?tab=admin' : '/signin'}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to an existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            {/* If your User model has a 'name' field, keep this input */}
            {/* <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div> */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  formData.name ? 'rounded-none' : 'rounded-t-md'
                }`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : null}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default SignUp;
