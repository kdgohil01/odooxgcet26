import { useState } from "react";
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
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [userRole, setUserRole] = useState<'employee' | 'admin'>('employee');
  const [currentView, setCurrentView] = useState('dashboard');

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
      'admin-profile': 'Settings',
    };
    return titles[currentView] || 'Dashboard';
  };

  const renderContent = () => {
    if (userRole === 'employee') {
      switch (currentView) {
        case 'dashboard':
          return <EmployeeDashboard onNavigate={setCurrentView} />;
        case 'profile':
          return <EmployeeProfile />;
        case 'attendance':
          return <AttendanceView />;
        case 'leave':
          return <LeaveManagement />;
        case 'payroll':
          return <PayrollView />;
        default:
          return <EmployeeDashboard onNavigate={setCurrentView} />;
      }
    } else {
      switch (currentView) {
        case 'admin-dashboard':
          return <AdminDashboard onNavigate={setCurrentView} />;
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
          return <AdminDashboard onNavigate={setCurrentView} />;
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster />
      {/* Role Switcher - Demo purposes */}
      <div className="bg-card border-b border-border px-6 py-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Demo Mode: Switch between employee and admin views</p>
        <div className="flex gap-2">
          <Button 
            variant={userRole === 'employee' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => {
              setUserRole('employee');
              setCurrentView('dashboard');
            }}
          >
            Employee View
          </Button>
          <Button 
            variant={userRole === 'admin' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => {
              setUserRole('admin');
              setCurrentView('admin-dashboard');
            }}
          >
            Admin View
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <Navigation 
            currentView={currentView} 
            onNavigate={setCurrentView} 
            userRole={userRole}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title={getPageTitle()} 
            userName={userRole === 'admin' ? 'Admin User' : 'John Smith'}
          />
          
          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}