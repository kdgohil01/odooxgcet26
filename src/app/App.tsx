import { useState, useEffect } from "react";
import { Navigation } from "./components/layout/Navigation";
import { Header } from "./components/layout/Header";
import { EmployeeDashboard } from "./components/dashboard/EmployeeDashboard";
import { AdminDashboard } from "./components/dashboard/AdminDashboard";
import { EmployeeProfile } from "./components/profile/EmployeeProfile";
import { AttendanceView } from "./components/attendance/AttendanceView";
import { AdminAttendance } from "./components/attendance/AdminAttendance";
import { LeaveManagement } from "./components/leave/LeaveManagement";
import { AdminLeaveManagement } from "./components/leave/AdminLeaveManagement";
import { PayrollView } from "./components/payroll/PayrollView";
import { AdminPayroll } from "./components/payroll/AdminPayroll";
import { EmployeeList } from "./components/employees/EmployeeList";
import { LoginWrapper } from "./components/auth/LoginWrapper";
import { Toaster } from "./components/ui/sonner";
import { LeaveProvider } from "./context/LeaveContext";
import { ProfileProvider } from "./context/ProfileContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { 
  saveCurrentView, 
  getCurrentView, 
  saveUserRole, 
  getUserRole, 
  validateViewForRole 
} from "./utils/navigationPersistence";

function AppContent() {
  const { isAuthenticated, userRole, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Initialize navigation state from localStorage on mount
  useEffect(() => {
    if (isAuthenticated) {
      // Load saved current view and validate it for the role
      const savedView = getCurrentView();
      const validView = validateViewForRole(savedView, userRole);
      setCurrentView(validView);
    }
  }, [isAuthenticated, userRole]);

  // Save current view to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated) {
      saveCurrentView(currentView);
    }
  }, [currentView, isAuthenticated]);

  const handleNavigate = (view: string) => {
    const validView = validateViewForRole(view, userRole);
    setCurrentView(validView);
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'profile': 'My Profile',
      'attendance': 'Attendance',
      'leave': 'Leave Management',
      'payroll': 'Payroll',
      'admin-dashboard': 'Admin Dashboard',
      'employees': 'Employee Management',
      'admin-attendance': 'Attendance Management',
      'admin-leave': 'Leave Management',
      'admin-payroll': 'Payroll Management',
      'admin-profile': 'Profile',
    };
    return titles[currentView] || 'Dashboard';
  };

  const renderContent = () => {
    if (userRole === 'employee') {
      switch (currentView) {
        case 'dashboard':
          return <EmployeeDashboard onNavigate={handleNavigate} />;
        case 'profile':
          return <EmployeeProfile />;
        case 'attendance':
          return <AttendanceView />;
        case 'leave':
          return <LeaveManagement />;
        case 'payroll':
          return <PayrollView />;
        default:
          return <EmployeeDashboard onNavigate={handleNavigate} />;
      }
    } else {
      switch (currentView) {
        case 'admin-dashboard':
          return <AdminDashboard onNavigate={handleNavigate} />;
        case 'employees':
          return <EmployeeList />;
        case 'admin-attendance':
          return <AdminAttendance />;
        case 'admin-leave':
          return <AdminLeaveManagement />;
        case 'admin-payroll':
          return <AdminPayroll />;
        case 'admin-profile':
          return <EmployeeProfile />;
        default:
          return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginWrapper onLoginSuccess={() => {}} />;
  }

  return (
    <ProfileProvider>
      <LeaveProvider>
        <div className="h-screen flex flex-col bg-background">
          <Toaster />

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <Navigation 
                currentView={currentView} 
                onNavigate={handleNavigate} 
                userRole={userRole}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header 
                title={getPageTitle()} 
              />
              
              <main className="flex-1 overflow-y-auto">
                {renderContent()}
              </main>
            </div>
          </div>
        </div>
      </LeaveProvider>
    </ProfileProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}