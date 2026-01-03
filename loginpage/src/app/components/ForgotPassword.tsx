import { useState } from 'react';
import { generateOTP, storeOTP, sendOTPToBackend } from '../utils/otpService';

interface ForgotPasswordProps {
  onOTPSent: (email: string) => void;
  onBackToSignIn: () => void;
}

export function ForgotPassword({ onOTPSent, onBackToSignIn }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Check if email exists in users
    const usersData = localStorage.getItem('users');
    if (!usersData) {
      setError('No registered users found.');
      setLoading(false);
      return;
    }

    const users = JSON.parse(usersData);
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      setError('No account found with this email address.');
      setLoading(false);
      return;
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp, 'password-reset');

    // Try to send OTP via backend if configured
    const backendResult = await sendOTPToBackend(email);
    
    // Check if backend failed
    if (!backendResult.success) {
      console.warn('Backend OTP sending failed:', backendResult.message);
      // Still proceed with client-side OTP (stored in localStorage)
      // In dev mode, OTP is logged to console
      setError(`Email sending failed: ${backendResult.message}. Check console for OTP in development mode.`);
      setLoading(false);
      return;
    }
    
    // Backend succeeded
    setSuccess(true);
    setLoading(false);
    
    // Show success message and proceed to OTP verification
    setTimeout(() => {
      onOTPSent(email);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">DayFlow</h1>
          <p className="mt-2 text-neutral-600">Reset your password</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          {!success ? (
            <>
              <p className="text-neutral-600 mb-6 text-center">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="forgot-email" className="block text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="forgot-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4">
                Verification code sent! Please check your email.
              </div>
              <p className="text-neutral-600 text-sm">
                Redirecting to verification...
              </p>
            </div>
          )}

          {/* Back to Sign In Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onBackToSignIn}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

