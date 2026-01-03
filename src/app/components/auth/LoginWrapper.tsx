import { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface LoginWrapperProps {
  onLoginSuccess: () => void;
}

export function LoginWrapper({ onLoginSuccess }: LoginWrapperProps) {
  const [currentView, setCurrentView] = useState<'signin' | 'signup'>('signin');

  const handleSignUpSuccess = () => {
    // After successful registration, user is automatically logged in
    // So we can directly redirect to dashboard
    onLoginSuccess();
  };

  const handleForgotPassword = () => {
    // For demo purposes, just show an alert
    alert('Password reset functionality would be implemented here. For demo, please contact admin.');
  };

  return (
    <div className="size-full min-h-screen bg-neutral-50">
      {currentView === 'signin' && (
        <SignIn 
          onSignInSuccess={onLoginSuccess}
          onSwitchToSignUp={() => setCurrentView('signup')}
          onForgotPassword={handleForgotPassword}
        />
      )}
      {currentView === 'signup' && (
        <SignUp 
          onSignUpSuccess={handleSignUpSuccess}
          onSwitchToSignIn={() => setCurrentView('signin')}
        />
      )}
    </div>
  );
}
