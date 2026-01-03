import { useState } from 'react';
import { User } from '../App';

interface ResetPasswordProps {
  email: string;
  onPasswordReset: () => void;
  onBack: () => void;
}

export function ResetPassword({ email, onPasswordReset, onBack }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      return 'Password must contain at least one special character (!@#$%^&*).';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Update user password in localStorage
    const usersData = localStorage.getItem('users');
    if (!usersData) {
      setError('User not found.');
      setLoading(false);
      return;
    }

    const users: User[] = JSON.parse(usersData);
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      setError('User not found.');
      setLoading(false);
      return;
    }

    // Update password
    users[userIndex].password = password;
    localStorage.setItem('users', JSON.stringify(users));

    // Success
    setTimeout(() => {
      setLoading(false);
      onPasswordReset();
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">DayFlow</h1>
          <p className="mt-2 text-neutral-600">Create new password</p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          <p className="text-neutral-600 mb-6 text-center">
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label htmlFor="new-password" className="block text-neutral-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Min 8 chars, include uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-new-password" className="block text-neutral-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

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

