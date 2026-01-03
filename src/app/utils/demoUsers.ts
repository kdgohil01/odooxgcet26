import { User, UserRole } from '../context/AuthContext';

/**
 * Initialize demo users for testing purposes
 */
export function initializeDemoUsers(): void {
  // Check if users already exist in either storage location
  const existingUsers = localStorage.getItem('dayflow_users') || localStorage.getItem('users');
  if (existingUsers) {
    const users = JSON.parse(existingUsers);
    if (users.length > 0) {
      console.log('Demo users already exist:', users.length, 'users');
      return; // Users already exist, don't overwrite
    }
  }

  // Create demo users
  const demoUsers: User[] = [
    {
      employeeId: 'EMP001',
      email: 'employee@dayflow.com',
      password: 'Employee123!',
      role: 'Employee',
      verified: true
    },
    {
      employeeId: 'HR001',
      email: 'admin@dayflow.com',
      password: 'Admin123!',
      role: 'HR',
      verified: true
    },
    {
      employeeId: 'EMP002',
      email: 'john.smith@dayflow.com',
      password: 'Password123!',
      role: 'Employee',
      verified: true
    },
    {
      employeeId: 'HR002',
      email: 'jane.doe@dayflow.com',
      password: 'Password123!',
      role: 'HR',
      verified: true
    },
    {
      employeeId: 'EMP003',
      email: 'hem@dayflow.com',
      password: 'Hem123!',
      role: 'Employee',
      verified: true
    }
  ];

  // Save demo users to both storage locations for compatibility
  localStorage.setItem('dayflow_users', JSON.stringify(demoUsers));
  localStorage.setItem('users', JSON.stringify(demoUsers));
  
  console.log('Demo users initialized successfully:', demoUsers.length, 'users');
  console.log('Available demo accounts:');
  demoUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.role}) - Employee ID: ${user.employeeId}`);
  });
}

/**
 * Get demo user credentials for testing
 */
export function getDemoCredentials(): Array<{ email: string; password: string; role: string; description: string }> {
  return [
    {
      email: 'employee@dayflow.com',
      password: 'Employee123!',
      role: 'Employee',
      description: 'Demo Employee Account'
    },
    {
      email: 'admin@dayflow.com',
      password: 'Admin123!',
      role: 'Admin/HR',
      description: 'Demo Admin Account'
    },
    {
      email: 'john.smith@dayflow.com',
      password: 'Password123!',
      role: 'Employee',
      description: 'Additional Employee Account'
    },
    {
      email: 'jane.doe@dayflow.com',
      password: 'Password123!',
      role: 'Admin/HR',
      description: 'Additional Admin Account'
    },
    {
      email: 'hem@dayflow.com',
      password: 'Hem123!',
      role: 'Employee',
      description: 'Test User Account'
    }
  ];
}

/**
 * Check if demo users are initialized
 */
export function areDemoUsersInitialized(): boolean {
  try {
    const users = localStorage.getItem('dayflow_users') || localStorage.getItem('users');
    return users !== null && JSON.parse(users).length > 0;
  } catch (error) {
    console.error('Error checking demo users:', error);
    return false;
  }
}

/**
 * Reset demo users to initial state
 */
export function resetDemoUsers(): void {
  localStorage.removeItem('dayflow_users');
  localStorage.removeItem('users');
  localStorage.removeItem('dayflow_session');
  localStorage.removeItem('currentUser');
  initializeDemoUsers();
  console.log('Demo users reset to initial state');
}
