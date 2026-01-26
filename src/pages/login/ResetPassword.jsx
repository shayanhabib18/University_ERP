import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  console.log("🔷 ResetPassword component loaded");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isFacultyReset, setIsFacultyReset] = useState(false);
  const [isHODReset, setIsHODReset] = useState(false);
  const [tokenSource, setTokenSource] = useState(null); // 'hash' or 'query'

  // Extract token from URL hash (Supabase recovery link format) or search params
  useEffect(() => {
    console.log("🔷 useEffect extractToken running, searchParams:", Array.from(searchParams.entries()));
    const extractToken = () => {
      try {
        // Check if this is a faculty reset (type=faculty in query params)
        const resetType = searchParams.get('type');
        const queryToken = searchParams.get('token');
        
        console.log("🔍 Token extraction:", { resetType, queryToken, hasToken: !!queryToken, urlHashData: location.hash });

        // HOD reset takes priority (manual HOD assignment)
        if (resetType === 'hod') {
          if (!queryToken) {
            console.error("❌ HOD reset but no token found");
            setError('Invalid password reset link. No token found.');
            setValidating(false);
            return;
          }
          console.log("✅ HOD reset detected with token");
          setToken(queryToken);
          setIsHODReset(true);
          setIsFacultyReset(false);
          setTokenSource('query');
          setValidating(false);
          return;
        }

        // Faculty reset takes priority
        if (resetType === 'faculty') {
          // For faculty, check both query params and hash
          let tokenToUse = queryToken;
          
          // If no query token, try to extract from hash (Supabase format)
          if (!tokenToUse) {
            const hash = location.hash.slice(1); // Remove '#'
            const params = new URLSearchParams(hash);
            tokenToUse = params.get('access_token') || params.get('token_hash') || params.get('token');
          }
          
          if (!tokenToUse) {
            console.error("❌ Faculty reset but no token found in query or hash");
            setError('Invalid password reset link. No token found.');
            setValidating(false);
            return;
          }
          console.log("✅ Faculty reset detected with token");
          setToken(tokenToUse);
          setIsFacultyReset(true);
          setIsHODReset(false);
          setTokenSource(queryToken ? 'query' : 'hash');
          setValidating(false);
          return;
        }

        // For students - try Supabase format (hash fragment)
        const hash = location.hash.slice(1); // Remove '#'
        const params = new URLSearchParams(hash);
        const extractedToken = params.get('access_token') || params.get('token_hash') || params.get('token');
        
        if (extractedToken) {
          console.log("✅ Student reset detected (Supabase format)");
          setToken(extractedToken);
          setIsFacultyReset(false);
          setTokenSource('hash');
          setValidating(false);
        } else if (queryToken) {
          // Fallback: check URL search params for student reset
          console.log("✅ Manual reset detected (query token)");
          setToken(queryToken);
          setIsFacultyReset(true); // treat manual (faculty/HOD) as faculty portal
          setIsHODReset(false);
          setTokenSource('query');
          setValidating(false);
        } else {
          console.error("❌ No token found");
          setError('Invalid password reset link. No token found.');
          setValidating(false);
        }
      } catch (err) {
        console.error('Token extraction error:', err);
        setError('Failed to extract reset token from URL.');
        setValidating(false);
      }
    };

    extractToken();
  }, [searchParams]);

  // Handle redirect after password reset
  useEffect(() => {
    if (success) {
      console.log("🎯 SUCCESS detected, will redirect in 2 seconds");
      console.log("📊 Current state:", { success, isHODReset, isFacultyReset });
      
      const redirectTimeout = setTimeout(() => {
        let redirectPath = '/login/student';
        if (isHODReset) {
          redirectPath = '/login/chairman';
        } else if (isFacultyReset) {
          redirectPath = '/login/faculty';
        }
        console.log("🔄 NOW REDIRECTING:", { isHODReset, isFacultyReset, redirectPath });
        navigate(redirectPath);
      }, 2000);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [success, isHODReset, isFacultyReset, navigate]);

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
      let endpoint = 'http://localhost:5000/auth/reset-password';
      let payload;

      console.log("📤 Submitting password reset", { isFacultyReset, tokenSource });

      // Hash-based token (Supabase recovery JWT)
      if (tokenSource === 'hash') {
        payload = { accessToken: token, password };
        console.log("📤 Using JWT (hash) payload for /auth/reset-password");
      } else {
        // Query token → manual flow (faculty/HOD invite)
        payload = { token, password };
        console.log("📤 Using manual token payload for /auth/reset-password");
      }

      const response = await axios.post(endpoint, payload);
      console.log("✅ API Response:", response.data);

      console.log("✅ Setting success=true, isFacultyReset:", isFacultyReset);
      setSuccess(true);
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
          <div className="space-y-3">
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Request New Reset Link
            </button>
            <button
              onClick={() => {
                window.location.href = '/login/student';
              }}
              className="w-full bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    let portalType = 'Student';
    if (isHODReset) {
      portalType = 'HOD (Chairman)';
    } else if (isFacultyReset) {
      portalType = 'Faculty';
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-600">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Password Reset Successful</h2>
          <p className="text-gray-600 mb-2">Your password has been updated.</p>
          <p className="text-gray-600 mb-4">Redirecting to {portalType} Portal...</p>
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
            onClick={() => {
              window.location.href = '/login/student';
            }}
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
