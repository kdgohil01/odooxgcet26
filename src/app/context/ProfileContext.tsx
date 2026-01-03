import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getEmployeeProfile, type EmployeeProfile } from '../utils/profileStorage';

interface ProfileContextType {
  profile: EmployeeProfile | null;
  profileName: string;
  profileInitials: string;
  updateProfile: (profile: EmployeeProfile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadedProfile = getEmployeeProfile();
    setProfile(loadedProfile);
  }, []);

  const profileName = profile ? `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}` : '';
  const profileInitials = profile ? 
    `${profile.personalInfo.firstName.charAt(0)}${profile.personalInfo.lastName.charAt(0)}` : 
    '';

  const updateProfile = (newProfile: EmployeeProfile) => {
    setProfile(newProfile);
  };

  return (
    <ProfileContext.Provider value={{ profile, profileName, profileInitials, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}
