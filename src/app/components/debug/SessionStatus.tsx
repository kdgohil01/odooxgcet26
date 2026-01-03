import { useAuth } from '../../context/AuthContext';
import { SessionManager } from '../../utils/sessionManager';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function SessionStatus() {
  const { currentUser, isAuthenticated, sessionData } = useAuth();
  
  // Only show in development mode (check if running on localhost)
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (!isDevelopment) {
    return null;
  }

  const sessionInfo = SessionManager.getSessionInfo();

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <h3 className="text-sm font-semibold text-blue-900 mb-2">Session Status (Debug)</h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-blue-700">Authenticated:</span>
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? 'Yes' : 'No'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">User:</span>
          <span className="text-blue-900 font-mono">
            {currentUser?.email || 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Role:</span>
          <span className="text-blue-900 font-mono">
            {currentUser?.role || 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Session ID:</span>
          <span className="text-blue-900 font-mono text-xs">
            {sessionInfo.sessionId || 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Login Time:</span>
          <span className="text-blue-900 font-mono text-xs">
            {sessionInfo.loginTime ? new Date(sessionInfo.loginTime).toLocaleString() : 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Last Activity:</span>
          <span className="text-blue-900 font-mono text-xs">
            {sessionInfo.lastActivity ? new Date(sessionInfo.lastActivity).toLocaleString() : 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Time Remaining:</span>
          <span className="text-blue-900 font-mono text-xs">
            {sessionInfo.timeRemaining !== null 
              ? `${Math.round(sessionInfo.timeRemaining / 1000 / 60)} minutes`
              : 'None'
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Storage Keys:</span>
          <div className="text-blue-900 font-mono text-xs">
            {Object.keys(localStorage).filter(key => key.startsWith('dayflow')).join(', ') || 'None'}
          </div>
        </div>
      </div>
    </Card>
  );
}
