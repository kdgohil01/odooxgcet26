import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { initializeDemoUsers } from '../utils/demoUsers';
import { addEmployeeFromAuth } from "../utils/employeeStorage";

export type UserRole = 'Employee' | 'HR';

export interface User {
  employeeId: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
}

export interface SessionData {
  user: User;
  loginTime: string;
  lastActivity: string;
  sessionId: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  userRole: 'employee' | 'admin';
  sessionData: SessionData | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'verified'>) => Promise<boolean>;
  updateLastActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session management utilities
const SESSION_KEY = 'dayflow_session';
const USERS_KEY = 'dayflow_users';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Generate unique session ID
const generateSessionId = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Check if session is still valid
const isSessionValid = (sessionData: SessionData): boolean => {
  const now = new Date().getTime();
  const lastActivity = new Date(sessionData.lastActivity).getTime();
  return (now - lastActivity) < SESSION_TIMEOUT;
};

// Save session data with timestamp
const saveSessionData = (user: User): void => {
  const sessionData: SessionData = {
    user,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    sessionId: generateSessionId()
  };
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log('Session saved:', sessionData.sessionId);
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

// Load and validate session data
const loadSessionData = (): SessionData | null => {
  try {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (!storedSession) {
      return null;
    }

    const sessionData: SessionData = JSON.parse(storedSession);
    
    if (!isSessionValid(sessionData)) {
      console.log('Session expired, removing...');
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    // Update last activity
    sessionData.lastActivity = new Date().toISOString();
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return sessionData;
  } catch (error) {
    console.error('Error loading session:', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

// Clear session data
const clearSessionData = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    console.log('Session cleared');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Initialize demo users and check for existing session on mount
  useEffect(() => {
    // Initialize demo users for testing
    initializeDemoUsers();
    
    // Check for existing session
    const existingSession = loadSessionData();
    if (existingSession) {
      console.log('Valid session found, user:', existingSession.user.email);
      setCurrentUser(existingSession.user);
      setIsAuthenticated(true);
      setSessionData(existingSession);
    } else {
      console.log('No valid session found');
    }
  }, []);

  // Update last activity periodically
  useEffect(() => {
    if (!isAuthenticated || !sessionData) return;

    const interval = setInterval(() => {
      updateLastActivity();
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionData]);

  const updateLastActivity = () => {
    if (!sessionData) return;
    
    const updatedSession = {
      ...sessionData,
      lastActivity: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      setSessionData(updatedSession);
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const usersData = localStorage.getItem(USERS_KEY) || localStorage.getItem('users');
      if (!usersData) {
        return false;
      }

      const users: User[] = JSON.parse(usersData);
      const user = users.find(u => u.email === email);

      if (!user || user.password !== password || !user.verified) {
        return false;
      }

      // Successful login - create new session
      setCurrentUser(user);
      setIsAuthenticated(true);
      saveSessionData(user);
      
      // Load the saved session data
      const newSessionData = loadSessionData();
      setSessionData(newSessionData);
      
      console.log('User logged in successfully:', email);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user:', currentUser?.email);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSessionData(null);
    clearSessionData();
  };

  const register = async (userData: Omit<User, 'verified'>): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem(USERS_KEY) || localStorage.getItem('users');
      const users: User[] = usersData ? JSON.parse(usersData) : [];

      // Check if user already exists
      if (users.some(u => u.email === userData.email)) {
        return false;
      }

      // Add new user (verified by default for demo purposes)
      const newUser: User = { ...userData, verified: true };
      users.push(newUser);
      
      // Save to both keys for compatibility
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem('users', JSON.stringify(users));

      console.log('User registered successfully:', userData.email);
      
      // Add employee to employee list
      addEmployeeFromAuth(newUser);
      
      // Automatically log in the user after successful registration
      const loginSuccess = await login(userData.email, userData.password);
      if (loginSuccess) {
        console.log('User automatically logged in after registration');
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Convert role for main app
  const userRole = currentUser?.role === 'HR' ? 'admin' : 'employee';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      userRole,
      sessionData,
      login,
      logout,
      register,
      updateLastActivity
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
