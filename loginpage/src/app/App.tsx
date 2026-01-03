import { useState, useEffect } from 'react';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { Dashboard } from './components/Dashboard';
import { ForgotPassword } from './components/ForgotPassword';
import { OTPVerification } from './components/OTPVerification';
import { ResetPassword } from './components/ResetPassword';
import { generateOTP, storeOTP } from './utils/otpService';

export type UserRole = 'Employee' | 'HR';

export interface User {
  employeeId: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
}

type ViewType = 'signin' | 'signup' | 'dashboard' | 'forgot-password' | 'otp-verification' | 'reset-password';

export default function App() {
  const [view, setView] = useState<ViewType>('signin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('');

  useEffect(() => {
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
      setView('dashboard');
    }
  }, []);

  const handleSignUpSuccess = () => {
    setView('signin');
  };

  const handleSignInSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setView('signin');
  };

  const handleForgotPassword = () => {
    setView('forgot-password');
  };

  const handleOTPSent = (email: string) => {
    setForgotPasswordEmail(email);
    setView('otp-verification');
  };

  const handleOTPVerified = () => {
    setView('reset-password');
  };

  const handleResendOTP = () => {
    if (forgotPasswordEmail) {
      const otp = generateOTP();
      storeOTP(forgotPasswordEmail, otp, 'password-reset');
    }
  };

  const handlePasswordReset = () => {
    setForgotPasswordEmail('');
    setView('signin');
  };

  return (
    <div className="size-full min-h-screen bg-neutral-50">
      {view === 'signin' && (
        <SignIn 
          onSignInSuccess={handleSignInSuccess}
          onSwitchToSignUp={() => setView('signup')}
          onForgotPassword={handleForgotPassword}
        />
      )}
      {view === 'signup' && (
        <SignUp 
          onSignUpSuccess={handleSignUpSuccess}
          onSwitchToSignIn={() => setView('signin')}
        />
      )}
      {view === 'forgot-password' && (
        <ForgotPassword
          onOTPSent={handleOTPSent}
          onBackToSignIn={() => setView('signin')}
        />
      )}
      {view === 'otp-verification' && forgotPasswordEmail && (
        <OTPVerification
          email={forgotPasswordEmail}
          onOTPVerified={handleOTPVerified}
          onBack={() => setView('forgot-password')}
          onResendOTP={handleResendOTP}
        />
      )}
      {view === 'reset-password' && forgotPasswordEmail && (
        <ResetPassword
          email={forgotPasswordEmail}
          onPasswordReset={handlePasswordReset}
          onBack={() => setView('otp-verification')}
        />
      )}
      {view === 'dashboard' && currentUser && (
        <Dashboard 
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
