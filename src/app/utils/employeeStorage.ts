export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  joinDate: string;
  status: string;
  salary?: number;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  performance?: {
    rating: number;
    lastReview: string;
  };
}

const STORAGE_KEY = 'dayflow_employees';

// Default employee data
const DEFAULT_EMPLOYEES: Employee[] = [
  { 
    id: "EMP-001", 
    name: "Sarah Johnson", 
    department: "Engineering", 
    position: "Senior Developer",
    email: "sarah.j@company.com",
    phone: "+1 (555) 101-1001",
    joinDate: "Mar 15, 2023",
    status: "active",
    salary: 75000,
    address: "123 Tech Street, San Francisco, CA 94102",
    emergencyContact: "+1 (555) 101-1002",
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS"],
    performance: {
      rating: 5,
      lastReview: "Dec 15, 2025"
    }
  },
  { 
    id: "EMP-002", 
    name: "Michael Chen", 
    department: "Marketing", 
    position: "Marketing Manager",
    email: "michael.c@company.com",
    phone: "+1 (555) 102-1002",
    joinDate: "Jan 10, 2022",
    status: "active",
    salary: 68000,
    address: "456 Market Ave, San Francisco, CA 94103",
    emergencyContact: "+1 (555) 102-1003",
    skills: ["Digital Marketing", "SEO", "Content Strategy", "Analytics"],
    performance: {
      rating: 4,
      lastReview: "Nov 20, 2025"
    }
  },
  { 
    id: "EMP-003", 
    name: "Emily Davis", 
    department: "Sales", 
    position: "Sales Executive",
    email: "emily.d@company.com",
    phone: "+1 (555) 103-1003",
    joinDate: "Jun 20, 2023",
    status: "active",
    salary: 55000,
    address: "789 Sales Blvd, San Francisco, CA 94104",
    emergencyContact: "+1 (555) 103-1004",
    skills: ["Sales", "CRM", "Negotiation", "Client Relations"],
    performance: {
      rating: 4,
      lastReview: "Dec 1, 2025"
    }
  },
  { 
    id: "EMP-004", 
    name: "Robert Taylor", 
    department: "HR", 
    position: "HR Specialist",
    email: "robert.t@company.com",
    phone: "+1 (555) 104-1004",
    joinDate: "Sep 5, 2021",
    status: "active",
    salary: 52000,
    address: "321 HR Way, San Francisco, CA 94105",
    emergencyContact: "+1 (555) 104-1005",
    skills: ["Recruitment", "Employee Relations", "HR Policies", "Training"],
    performance: {
      rating: 5,
      lastReview: "Oct 15, 2025"
    }
  },
  { 
    id: "EMP-005", 
    name: "Jennifer Wilson", 
    department: "Engineering", 
    position: "Junior Developer",
    email: "jennifer.w@company.com",
    phone: "+1 (555) 105-1005",
    joinDate: "Jan 2, 2026",
    status: "active",
    salary: 48000,
    address: "654 Code Lane, San Francisco, CA 94106",
    emergencyContact: "+1 (555) 105-1006",
    skills: ["JavaScript", "HTML", "CSS", "React"],
    performance: {
      rating: 3,
      lastReview: "Jan 15, 2026"
    }
  },
  { 
    id: "EMP-006", 
    name: "David Brown", 
    department: "Sales", 
    position: "Sales Representative",
    email: "david.b@company.com",
    phone: "+1 (555) 106-1006",
    joinDate: "Dec 28, 2025",
    status: "active",
    salary: 45000,
    address: "987 Commerce St, San Francisco, CA 94107",
    emergencyContact: "+1 (555) 106-1007",
    skills: ["Sales", "Customer Service", "Product Knowledge"],
    performance: {
      rating: 3,
      lastReview: "Jan 10, 2026"
    }
  },
  { 
    id: "EMP-007", 
    name: "Lisa Anderson", 
    department: "Marketing", 
    position: "Content Specialist",
    email: "lisa.a@company.com",
    phone: "+1 (555) 107-1007",
    joinDate: "Dec 20, 2025",
    status: "active",
    salary: 50000,
    address: "147 Creative Ave, San Francisco, CA 94108",
    emergencyContact: "+1 (555) 107-1008",
    skills: ["Content Writing", "Social Media", "Copywriting", "SEO"],
    performance: {
      rating: 4,
      lastReview: "Dec 28, 2025"
    }
  },
  { 
    id: "EMP-008", 
    name: "James Miller", 
    department: "Operations", 
    position: "Operations Manager",
    email: "james.m@company.com",
    phone: "+1 (555) 108-1008",
    joinDate: "Apr 12, 2020",
    status: "active",
    salary: 65000,
    address: "258 Operations Dr, San Francisco, CA 94109",
    emergencyContact: "+1 (555) 108-1009",
    skills: ["Operations Management", "Logistics", "Process Optimization", "Team Leadership"],
    performance: {
      rating: 5,
      lastReview: "Nov 30, 2025"
    }
  },
];

// Get employees from localStorage or return defaults
export function getEmployees(): Employee[] {
  if (typeof window === 'undefined') {
    return DEFAULT_EMPLOYEES;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure the stored data has the required structure
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading employees from localStorage:', error);
  }
  
  // If no data exists or there's an error, initialize with defaults
  setEmployees(DEFAULT_EMPLOYEES);
  return DEFAULT_EMPLOYEES;
}

// Save employees to localStorage
export function setEmployees(employees: Employee[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees to localStorage:', error);
  }
}

// Add new employee from registration
export function addEmployeeFromAuth(user: any): Employee {
  const newEmployee: Employee = {
    id: user.employeeId || `EMP-${Date.now()}`,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    department: user.department || 'General',
    position: user.position || 'Employee',
    email: user.email || '',
    phone: user.phone || '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    salary: 0, // Will be set by admin
    address: '',
    emergencyContact: '',
    skills: [],
    performance: {
      rating: 0,
      lastReview: ''
    }
  };
  
  const currentEmployees = getEmployees();
  const updatedEmployees = [...currentEmployees, newEmployee];
  
  setEmployees(updatedEmployees);
  
  return newEmployee;
}

// Add a new employee
export function addEmployee(employee: Omit<Employee, 'id'>): Employee {
  const employees = getEmployees();
  const newEmployee: Employee = {
    ...employee,
    id: `EMP-${Date.now()}`,
  };
  
  const updatedEmployees = [newEmployee, ...employees];
  setEmployees(updatedEmployees);
  return newEmployee;
}

// Update an existing employee
export function updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedEmployee = { ...employees[index], ...updates };
  employees[index] = updatedEmployee;
  setEmployees(employees);
  
  return updatedEmployee;
}

// Delete an employee
export function deleteEmployee(id: string): boolean {
  const employees = getEmployees();
  const filteredEmployees = employees.filter(emp => emp.id !== id);
  
  if (filteredEmployees.length === employees.length) {
    return false; // Employee not found
  }
  
  setEmployees(filteredEmployees);
  return true;
}

// Get employee by ID
export function getEmployeeById(id: string): Employee | null {
  const employees = getEmployees();
  return employees.find(emp => emp.id === id) || null;
}
