import { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { verifyOTP, hasValidOTP } from '../utils/otpService';

interface OTPVerificationProps {
  email: string;
  onOTPVerified: () => void;
  onBack: () => void;
  onResendOTP: () => void;
}

export function OTPVerification({ email, onOTPVerified, onBack, onResendOTP }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Check if OTP is still valid
    if (!hasValidOTP(email)) {
      setError('OTP has expired. Please request a new one.');
    }
  }, [email]);

  useEffect(() => {
    // Resend cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = () => {
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    
    // Verify OTP (async)
    verifyOTP(email, otp).then((result) => {
      if (result.success) {
        setTimeout(() => {
          onOTPVerified();
        }, 500);
      } else {
        setError(result.message);
        setLoading(false);
      }
    });
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setResendCooldown(60); // 60 second cooldown
    onResendOTP();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">DayFlow</h1>
          <p className="mt-2 text-neutral-600">Verify your email</p>
        </div>

        {/* OTP Verification Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          <p className="text-neutral-600 mb-6 text-center">
            We've sent a 6-digit verification code to <span className="font-medium text-neutral-900">{email}</span>
          </p>

          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div className="flex flex-col items-center space-y-4">
              <label className="block text-neutral-700 mb-2 text-sm font-medium">
                Enter verification code
              </label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                onComplete={handleVerify}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-neutral-600 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

