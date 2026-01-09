import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  // Extract token from URL hash (Supabase recovery link format)
  useEffect(() => {
    const extractToken = () => {
      try {
        // Supabase sends token in hash fragment: #access_token=xxx&type=recovery&expires_in=3600
        const hash = location.hash.slice(1); // Remove '#'
        const params = new URLSearchParams(hash);
        const extractedToken = params.get('access_token') || params.get('token');
        
        if (extractedToken) {
          setToken(extractedToken);
          setValidating(false);
        } else {
          // Fallback: check URL search params
          const searchParams = new URLSearchParams(location.search);
          const paramToken = searchParams.get('token');
          if (paramToken) {
            setToken(paramToken);
            setValidating(false);
          } else {
            setError('Invalid password reset link. No token found.');
            setValidating(false);
          }
        }
      } catch (err) {
        console.error('Token extraction error:', err);
        setError('Failed to extract reset token from URL.');
        setValidating(false);
      }
    };

    extractToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('No reset token available.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/auth/reset-password',
        {
          accessToken: token,
          password,
        }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/login/student');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">{error || 'The password reset link is invalid or expired.'}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-600">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Password Reset Successful</h2>
          <p className="text-gray-600 mb-4">Your password has been updated. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          <button
            type="button"
            onClick={() => navigate('/login/student')}
            className="text-blue-600 hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
