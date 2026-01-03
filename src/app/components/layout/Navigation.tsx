import { Home, Users, Clock, Calendar, DollarSign, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProfileContext } from "../../context/ProfileContext";
import { getEmployeeProfile } from "../../utils/profileStorage";
import { useState, useEffect } from "react";

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: 'employee' | 'admin';
}

export function Navigation({ currentView, onNavigate, userRole }: NavigationProps) {
  const { logout, currentUser } = useAuth();
  const { profile } = useProfileContext();
  const [profileData, setProfileData] = useState<any>(null);

  // Load profile data when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      // Try to get profile from profile context first
      if (profile) {
        setProfileData(profile);
      } else {
        // Fallback to loading from storage
        const loadedProfile = getEmployeeProfile();
        setProfileData(loadedProfile);
      }
    }
  }, [currentUser, profile]);

  // Get display name from profile or current user
  const getDisplayName = () => {
    if (profileData?.personalInfo?.firstName && profileData?.personalInfo?.lastName) {
      return `${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}`;
    }
    
    if (currentUser) {
      const email = currentUser.email;
      const namePart = email.split('@')[0];
      const parts = namePart.split(/[._-]/);
      
      if (parts.length > 1) {
        const firstName = parts[0].replace(/[^a-zA-Z]/g, '');
        const lastName = parts[parts.length - 1].replace(/[^a-zA-Z]/g, '');
        return `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
      } else {
        return namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }
    }
    
    return 'User';
  };

  // Get position/role from profile or current user
  const getPosition = () => {
    if (profileData?.employmentInfo?.position) {
      return profileData.employmentInfo.position;
    }
    
    if (currentUser) {
      return currentUser.role === 'HR' ? 'HR Manager' : 'Employee';
    }
    
    return 'Employee';
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = getDisplayName();
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    } else {
      return name.charAt(0);
    }
  };
  
  const employeeNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
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
  ];

  const navItems = userRole === 'admin' ? adminNavItems : employeeNavItems;

  const handleLogout = () => {
    logout();
  };

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

      {/* Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {getPosition()}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => onNavigate(userRole === 'admin' ? 'admin-profile' : 'profile')}
          className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded transition-colors ${
            currentView === (userRole === 'admin' ? 'admin-profile' : 'profile')
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent'
          }`}
        >
          <User className="w-5 h-5" />
          <span>View Profile</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded text-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
