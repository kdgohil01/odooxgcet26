import { useState } from 'react';
import { User } from '../App';

interface SignInProps {
  onSignInSuccess: (user: User) => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export function SignIn({ onSignInSuccess, onSwitchToSignUp, onForgotPassword }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Get users from localStorage
    const usersData = localStorage.getItem('users');
    if (!usersData) {
      setError('No registered users found. Please sign up first.');
      setLoading(false);
      return;
    }

    const users: User[] = JSON.parse(usersData);
    const user = users.find(u => u.email === email);

    if (!user) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    if (user.password !== password) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    if (!user.verified) {
      setError('Please verify your email before signing in.');
      setLoading(false);
      return;
    }

    // Successful login
    setTimeout(() => {
      onSignInSuccess(user);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">DayFlow</h1>
          <p className="mt-2 text-neutral-600">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-neutral-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
