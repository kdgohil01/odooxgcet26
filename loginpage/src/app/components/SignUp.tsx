import { useState } from 'react';
import { User, UserRole } from '../App';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUp({ onSignUpSuccess, onSwitchToSignIn }: SignUpProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    // Validate employee ID
    if (employeeId.trim().length < 3) {
      setError('Employee ID must be at least 3 characters long.');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

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

    // Get existing users
    const usersData = localStorage.getItem('users');
    const users: User[] = usersData ? JSON.parse(usersData) : [];

    // Check if email or employee ID already exists
    if (users.some(u => u.email === email)) {
      setError('Email is already registered.');
      setLoading(false);
      return;
    }

    if (users.some(u => u.employeeId === employeeId)) {
      setError('Employee ID is already registered.');
      setLoading(false);
      return;
    }

    // Create new user
    const newUser: User = {
      employeeId,
      email,
      password,
      role,
      verified: true, // Auto-verify for demo purposes
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    setTimeout(() => {
      setSuccess('Account created successfully! You can now sign in.');
      setLoading(false);
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        onSignUpSuccess();
      }, 2000);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">DayFlow</h1>
          <p className="mt-2 text-neutral-600">Create your account</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {/* Employee ID Input */}
            <div>
              <label htmlFor="employeeId" className="block text-neutral-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="signup-email" className="block text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-neutral-700 mb-2">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              >
                <option value="Employee">Employee</option>
                <option value="HR">Admin / HR Officer</option>
              </select>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="signup-password" className="block text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Min 8 chars, include uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-neutral-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToSignIn}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
