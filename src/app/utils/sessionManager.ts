import { SessionData } from '../context/AuthContext';

export class SessionManager {
  private static readonly SESSION_KEY = 'dayflow_session';
  private static readonly ACTIVITY_KEY = 'dayflow_activity';
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  // Check if user is currently logged in (synchronous check)
  static isLoggedIn(): boolean {
    try {
      const sessionData = this.getSessionData();
      return sessionData !== null;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Get current session data
  static getSessionData(): SessionData | null {
    try {
      const storedSession = localStorage.getItem(this.SESSION_KEY);
      if (!storedSession) {
        return null;
      }

      const sessionData: SessionData = JSON.parse(storedSession);
      
      if (!this.isSessionValid(sessionData)) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error getting session data:', error);
      this.clearSession();
      return null;
    }
  }

  // Check if session is still valid
  static isSessionValid(sessionData: SessionData): boolean {
    if (!sessionData || !sessionData.lastActivity) {
      return false;
    }

    const now = new Date().getTime();
    const lastActivity = new Date(sessionData.lastActivity).getTime();
    return (now - lastActivity) < this.SESSION_TIMEOUT;
  }

  // Update user activity
  static updateActivity(): void {
    try {
      const sessionData = this.getSessionData();
      if (sessionData) {
        sessionData.lastActivity = new Date().toISOString();
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        
        // Also update activity log
        const activityLog = JSON.parse(localStorage.getItem(this.ACTIVITY_KEY) || '[]');
        activityLog.push({
          timestamp: new Date().toISOString(),
          action: 'activity_update'
        });
        
        // Keep only last 100 activity entries
        if (activityLog.length > 100) {
          activityLog.splice(0, activityLog.length - 100);
        }
        
        localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(activityLog));
      }
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }

  // Clear session
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      console.log('Session cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Get session info for debugging
  static getSessionInfo(): {
    isLoggedIn: boolean;
    sessionId: string | null;
    loginTime: string | null;
    lastActivity: string | null;
    timeRemaining: number | null;
  } {
    const sessionData = this.getSessionData();
    
    if (!sessionData) {
      return {
        isLoggedIn: false,
        sessionId: null,
        loginTime: null,
        lastActivity: null,
        timeRemaining: null
      };
    }

    const now = new Date().getTime();
    const lastActivity = new Date(sessionData.lastActivity).getTime();
    const timeRemaining = Math.max(0, this.SESSION_TIMEOUT - (now - lastActivity));

    return {
      isLoggedIn: true,
      sessionId: sessionData.sessionId,
      loginTime: sessionData.loginTime,
      lastActivity: sessionData.lastActivity,
      timeRemaining
    };
  }

  // Extend session (useful for long-running sessions)
  static extendSession(): boolean {
    try {
      const sessionData = this.getSessionData();
      if (sessionData) {
        sessionData.lastActivity = new Date().toISOString();
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        console.log('Session extended');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }

  // Get activity history
  static getActivityHistory(): Array<{
    timestamp: string;
    action: string;
  }> {
    try {
      return JSON.parse(localStorage.getItem(this.ACTIVITY_KEY) || '[]');
    } catch (error) {
      console.error('Error getting activity history:', error);
      return [];
    }
  }

  // Clear activity history
  static clearActivityHistory(): void {
    try {
      localStorage.removeItem(this.ACTIVITY_KEY);
      console.log('Activity history cleared');
    } catch (error) {
      console.error('Error clearing activity history:', error);
    }
  }
}
