import { Home, Users, Clock, Calendar, DollarSign, User, Settings, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: 'employee' | 'admin';
}

export function Navigation({ currentView, onNavigate, userRole }: NavigationProps) {
  const employeeNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: Home },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'admin-attendance', label: 'Attendance', icon: Clock },
    { id: 'admin-leave', label: 'Leave Management', icon: Calendar },
    { id: 'admin-payroll', label: 'Payroll', icon: DollarSign },
    { id: 'admin-profile', label: 'Settings', icon: Settings },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl text-foreground">Dayflow</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {userRole === 'admin' ? 'Admin Portal' : 'Employee Portal'}
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded text-foreground hover:bg-accent transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
