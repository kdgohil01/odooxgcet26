/**
 * Navigation persistence utilities
 */

// Storage keys
const STORAGE_KEYS = {
  CURRENT_VIEW: 'current_view',
  USER_ROLE: 'user_role'
};

/**
 * Save current view to localStorage
 */
export function saveCurrentView(view: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, view);
  } catch (error) {
    console.error('Error saving current view:', error);
  }
}

/**
 * Get current view from localStorage
 */
export function getCurrentView(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW);
    return stored || 'dashboard';
  } catch (error) {
    console.error('Error getting current view:', error);
    return 'dashboard';
  }
}

/**
 * Save user role to localStorage
 */
export function saveUserRole(role: 'employee' | 'admin'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  } catch (error) {
    console.error('Error saving user role:', error);
  }
}

/**
 * Get user role from localStorage
 */
export function getUserRole(): 'employee' | 'admin' {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    return (stored === 'admin' || stored === 'employee') ? stored : 'employee';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'employee';
  }
}

/**
 * Clear navigation data from localStorage
 */
export function clearNavigationData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_VIEW);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  } catch (error) {
    console.error('Error clearing navigation data:', error);
  }
}

/**
 * Validate view against user role
 */
export function validateViewForRole(view: string, role: 'employee' | 'admin'): string {
  const employeeViews = ['dashboard', 'profile', 'attendance', 'leave', 'payroll'];
  const adminViews = ['admin-dashboard', 'employees', 'admin-attendance', 'admin-leave', 'admin-payroll', 'admin-profile'];
  
  const validViews = role === 'admin' ? adminViews : employeeViews;
  
  if (validViews.includes(view)) {
    return view;
  }
  
  // Return default view for the role if current view is invalid
  return role === 'admin' ? 'admin-dashboard' : 'dashboard';
}
