import { type PayrollRecord } from '../types/payroll';
import { getEmployees } from './employeeStorage';

export type { PayrollRecord } from '../types/payroll';

// Enhanced payroll record with employee ID and salary structure
export interface EnhancedPayrollRecord {
  id: number;
  employeeId: string;
  employee: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  salaryStructure: {
    basic: number;
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    providentFund: number;
    other: number;
  };
  gross: number;
  net: number;
  status: string;
  paymentDate: string;
  processedBy: string;
  lastUpdated: string;
}

// Salary structure template
export interface SalaryStructure {
  basic: number;
  housing: number;
  transport: number;
  medical: number;
  other: number;
}

const STORAGE_KEY = 'dayflow_payroll_data';
const SALARY_STRUCTURE_KEY = 'dayflow_salary_structures';

// Default payroll data
const DEFAULT_PAYROLL_DATA: PayrollRecord[] = [
  { 
    id: 1, 
    employee: "Sarah Johnson", 
    department: "Engineering", 
    position: "Senior Developer",
    gross: 7500, 
    deductions: 2100, 
    net: 5400,
    status: "processed" 
  },
  { 
    id: 2, 
    employee: "Michael Chen", 
    department: "Marketing", 
    position: "Marketing Manager",
    gross: 6800, 
    deductions: 1900, 
    net: 4900,
    status: "processed" 
  },
  { 
    id: 3, 
    employee: "Emily Davis", 
    department: "Sales", 
    position: "Sales Executive",
    gross: 5500, 
    deductions: 1550, 
    net: 3950,
    status: "pending" 
  },
  { 
    id: 4, 
    employee: "Robert Taylor", 
    department: "HR", 
    position: "HR Specialist",
    gross: 5200, 
    deductions: 1460, 
    net: 3740,
    status: "processed" 
  },
  { 
    id: 5, 
    employee: "Jennifer Wilson", 
    department: "Engineering", 
    position: "Junior Developer",
    gross: 4800, 
    deductions: 1344, 
    net: 3456,
    status: "processed" 
  },
  { 
    id: 6, 
    employee: "David Brown", 
    department: "Sales", 
    position: "Sales Representative",
    gross: 4500, 
    deductions: 1260, 
    net: 3240,
    status: "pending" 
  },
];

// Get all enhanced payroll records for admin view
export function getAllEmployeePayroll(): EnhancedPayrollRecord[] {
  try {
    const employees = getEmployees();
    const payrollData = getPayrollData();
    
    // Map payroll data to enhanced records with employee details
    return employees.map(employee => {
      const payrollRecord = payrollData.find(p => p.employee === employee.name);
      
      if (payrollRecord) {
        // Existing payroll record
        return {
          id: payrollRecord.id,
          employeeId: employee.id,
          employee: payrollRecord.employee,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          hireDate: employee.joinDate,
          salaryStructure: {
            basic: payrollRecord.gross * 0.6,
            housing: payrollRecord.gross * 0.2,
            transport: payrollRecord.gross * 0.15,
            medical: payrollRecord.gross * 0.05,
            other: 0
          },
          deductions: {
            tax: payrollRecord.deductions * 0.4,
            insurance: payrollRecord.deductions * 0.3,
            providentFund: payrollRecord.deductions * 0.2,
            other: payrollRecord.deductions * 0.1
          },
          gross: payrollRecord.gross,
          net: payrollRecord.net,
          status: payrollRecord.status,
          paymentDate: new Date().toISOString().split('T')[0],
          processedBy: 'System',
          lastUpdated: new Date().toISOString()
        };
      } else {
        // New employee with no payroll data (NA)
        return {
          id: Date.now(),
          employeeId: employee.id,
          employee: employee.name,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          hireDate: employee.joinDate,
          salaryStructure: {
            basic: 0,
            housing: 0,
            transport: 0,
            medical: 0,
            other: 0
          },
          deductions: {
            tax: 0,
            insurance: 0,
            providentFund: 0,
            other: 0
          },
          gross: 0,
          net: 0,
          status: 'NA',
          paymentDate: '',
          processedBy: '',
          lastUpdated: new Date().toISOString()
        };
      }
    });
  } catch (error) {
    console.error('Error getting all employee payroll:', error);
    return [];
  }
}

// Get payroll record for specific employee
export function getEmployeePayroll(employeeId: string): EnhancedPayrollRecord | null {
  try {
    const allPayroll = getAllEmployeePayroll();
    return allPayroll.find(p => p.employeeId === employeeId) || null;
  } catch (error) {
    console.error('Error getting employee payroll:', error);
    return null;
  }
}

// Update salary structure for an employee
export function updateSalaryStructure(employeeId: string, structure: SalaryStructure): boolean {
  try {
    const allPayroll = getAllEmployeePayroll();
    const index = allPayroll.findIndex(p => p.employeeId === employeeId);
    
    if (index === -1) {
      return false;
    }
    
    // Update the salary structure in the enhanced data
    allPayroll[index].salaryStructure = {
      basic: structure.basic,
      housing: structure.housing,
      transport: structure.transport,
      medical: structure.medical,
      other: structure.other
    };
    
    // Recalculate gross and net
    const totalGross = structure.basic + structure.housing + structure.transport + structure.medical + structure.other;
    const totalDeductions = allPayroll[index].deductions.tax + 
                          allPayroll[index].deductions.insurance + 
                          allPayroll[index].deductions.providentFund + 
                          allPayroll[index].deductions.other;
    const totalNet = totalGross - totalDeductions;
    
    allPayroll[index].gross = totalGross;
    allPayroll[index].net = totalNet;
    allPayroll[index].lastUpdated = new Date().toISOString();
    allPayroll[index].status = 'updated';
    
    // Save updated payroll data
    saveEnhancedPayrollData(allPayroll);
    
    // Save salary structure history
    saveSalaryStructureToHistory(employeeId, structure);
    
    return true;
  } catch (error) {
    console.error('Error updating salary structure:', error);
    return false;
  }
}

// Save salary structure to history
export function saveSalaryStructureToHistory(employeeId: string, structure: SalaryStructure): void {
  try {
    const structures = getSalaryStructures();
    const newStructure = {
      employeeId,
      ...structure,
      totalGross: structure.basic + structure.housing + structure.transport + structure.medical + structure.other,
      effectiveDate: new Date().toISOString().split('T')[0],
      updatedBy: 'Admin'
    };
    
    // Remove existing structure for this employee
    const filteredStructures = structures.filter(s => s.employeeId !== employeeId);
    const updatedStructures = [...filteredStructures, newStructure];
    
    localStorage.setItem(SALARY_STRUCTURE_KEY, JSON.stringify(updatedStructures));
  } catch (error) {
    console.error('Error saving salary structure to history:', error);
  }
}

// Get all salary structures
export function getSalaryStructures(): SalaryStructure[] {
  try {
    const stored = localStorage.getItem(SALARY_STRUCTURE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting salary structures:', error);
    return [];
  }
}

// Save enhanced payroll data
export function saveEnhancedPayrollData(data: EnhancedPayrollRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Convert back to original format for compatibility
    const originalFormat: PayrollRecord[] = data.map(record => ({
      id: record.id,
      employee: record.employee,
      department: record.department,
      position: record.position,
      gross: record.gross,
      deductions: record.net === 0 ? 0 : record.gross - record.net, // Calculate total deductions
      net: record.net,
      status: record.status
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(originalFormat));
  } catch (error) {
    console.error('Error saving enhanced payroll data:', error);
  }
}
export function getPayrollData(): PayrollRecord[] {
  if (typeof window === 'undefined') {
    return DEFAULT_PAYROLL_DATA;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading payroll data from localStorage:', error);
  }
  
  // If no data exists or there's an error, initialize with defaults
  try {
    setPayrollData(DEFAULT_PAYROLL_DATA);
  } catch (setError) {
    console.error('Error setting default payroll data:', setError);
  }
  return DEFAULT_PAYROLL_DATA;
}

// Save payroll data to localStorage
export function setPayrollData(data: PayrollRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving payroll data to localStorage:', error);
  }
}

// Get payroll record by employee name
export function getPayrollByEmployee(employeeName: string): PayrollRecord | undefined {
  const payrollData = getPayrollData();
  return payrollData.find(record => record.employee === employeeName);
}

// Update payroll record
export function updatePayrollRecord(id: number, updates: Partial<PayrollRecord>): void {
  const payrollData = getPayrollData();
  const index = payrollData.findIndex(record => record.id === id);
  
  if (index !== -1) {
    payrollData[index] = { ...payrollData[index], ...updates };
    setPayrollData(payrollData);
  }
}

// Add new payroll record
export function addPayrollRecord(record: Omit<PayrollRecord, 'id'>): PayrollRecord {
  const payrollData = getPayrollData();
  const newRecord: PayrollRecord = {
    ...record,
    id: Date.now()
  };
  
  payrollData.push(newRecord);
  setPayrollData(payrollData);
  return newRecord;
}

// Delete payroll record
export function deletePayrollRecord(id: number): void {
  const payrollData = getPayrollData();
  const filteredData = payrollData.filter(record => record.id !== id);
  setPayrollData(filteredData);
}

// Calculate payroll summary
export function calculatePayrollSummary() {
  try {
    const payrollData = getPayrollData();
    
    const totalEmployees = payrollData.length;
    const totalGrossPayroll = payrollData.reduce((sum, record) => sum + (record.gross || 0), 0);
    const totalDeductions = payrollData.reduce((sum, record) => sum + (record.deductions || 0), 0);
    const totalNetPayroll = payrollData.reduce((sum, record) => sum + (record.net || 0), 0);
    
    return {
      totalEmployees,
      totalGrossPayroll,
      totalDeductions,
      totalNetPayroll,
      processingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  } catch (error) {
    console.error('Error calculating payroll summary:', error);
    return {
      totalEmployees: 0,
      totalGrossPayroll: 0,
      totalDeductions: 0,
      totalNetPayroll: 0,
      processingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }
}

// Calculate department payroll breakdown
export function calculateDepartmentPayroll() {
  try {
    const payrollData = getPayrollData();
    const departmentMap = new Map<string, {
      employees: number;
      totalGross: number;
      totalNet: number;
    }>();
    
    payrollData.forEach(record => {
      const dept = record.department || 'Unknown';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          employees: 0,
          totalGross: 0,
          totalNet: 0
        });
      }
      
      const deptData = departmentMap.get(dept)!;
      deptData.employees += 1;
      deptData.totalGross += record.gross || 0;
      deptData.totalNet += record.net || 0;
    });
    
    return Array.from(departmentMap.entries()).map(([department, data]) => ({
      department,
      ...data
    }));
  } catch (error) {
    console.error('Error calculating department payroll:', error);
    return [];
  }
}
