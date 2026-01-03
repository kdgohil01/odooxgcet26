export interface EmployeeProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  employmentInfo: {
    employeeId: string;
    department: string;
    position: string;
    joinDate: string;
    reportingTo: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const STORAGE_KEY = 'dayflow_employee_profile';

// Default employee profile data
const DEFAULT_PROFILE: EmployeeProfile = {
  personalInfo: {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, San Francisco, CA 94105"
  },
  employmentInfo: {
    employeeId: "EMP-2023-0145",
    department: "Engineering",
    position: "Senior Software Engineer",
    joinDate: "March 15, 2023",
    reportingTo: "Sarah Johnson (Engineering Manager)"
  },
  emergencyContact: {
    name: "Jane Smith",
    relationship: "Spouse",
    phone: "+1 (555) 987-6543"
  }
};

// Get employee profile from localStorage or return defaults
export function getEmployeeProfile(): EmployeeProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure the stored data has the required structure
      if (parsed && parsed.personalInfo && parsed.employmentInfo && parsed.emergencyContact) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading employee profile from localStorage:', error);
  }
  
  // If no data exists or there's an error, initialize with defaults
  setEmployeeProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

// Save employee profile to localStorage
export function setEmployeeProfile(profile: EmployeeProfile): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving employee profile to localStorage:', error);
  }
}

// Update specific sections of the profile
export function updatePersonalInfo(personalInfo: Partial<EmployeeProfile['personalInfo']>): EmployeeProfile {
  const currentProfile = getEmployeeProfile();
  const updatedProfile = {
    ...currentProfile,
    personalInfo: {
      ...currentProfile.personalInfo,
      ...personalInfo
    }
  };
  setEmployeeProfile(updatedProfile);
  return updatedProfile;
}

export function updateEmploymentInfo(employmentInfo: Partial<EmployeeProfile['employmentInfo']>): EmployeeProfile {
  const currentProfile = getEmployeeProfile();
  const updatedProfile = {
    ...currentProfile,
    employmentInfo: {
      ...currentProfile.employmentInfo,
      ...employmentInfo
    }
  };
  setEmployeeProfile(updatedProfile);
  return updatedProfile;
}

export function updateEmergencyContact(emergencyContact: Partial<EmployeeProfile['emergencyContact']>): EmployeeProfile {
  const currentProfile = getEmployeeProfile();
  const updatedProfile = {
    ...currentProfile,
    emergencyContact: {
      ...currentProfile.emergencyContact,
      ...emergencyContact
    }
  };
  setEmployeeProfile(updatedProfile);
  return updatedProfile;
}
