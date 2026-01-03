// Test script to verify PDF generation functionality
// This can be used to test the PDF generation in the browser console

import { generatePayslipPDF, generateTaxDocumentPDF, generateFullReportPDF } from './pdfGenerator';

// Test payslip generation
export function testPayslipGeneration() {
  const testData = {
    employeeName: "John Smith",
    employeeId: "EMP-001",
    department: "Engineering",
    position: "Software Developer",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    payPeriod: "January 2026",
    payDate: "January 15, 2026",
    grossSalary: 6000,
    deductions: {
      basicSalary: 3600,
      housingAllowance: 1200,
      transportAllowance: 900,
      otherAllowances: 300,
      tax: 900,
      insurance: 240,
      pension: 300,
      otherDeductions: 60,
      totalDeductions: 1500
    },
    netSalary: 4500,
    yearToDate: {
      gross: 72000,
      deductions: 18000,
      net: 54000
    }
  };
  
  console.log('Testing payslip PDF generation...');
  generatePayslipPDF(testData);
}

// Test tax document generation
export function testTaxDocumentGeneration() {
  const testData = {
    employeeName: "John Smith",
    employeeId: "EMP-001",
    taxYear: "2025",
    totalIncome: 72000,
    taxableIncome: 57600,
    taxPaid: 10800,
    employerDetails: {
      name: "DayFlow HR Management System",
      address: "123 Business Street, City, State 12345",
      ein: "12-3456789"
    }
  };
  
  console.log('Testing tax document PDF generation...');
  generateTaxDocumentPDF(testData);
}

// Test full report generation
export function testFullReportGeneration() {
  const testData = {
    reportPeriod: "January 2026",
    totalEmployees: 247,
    totalGrossPayroll: 1234500,
    totalDeductions: 345600,
    totalNetPayroll: 888900,
    departmentBreakdown: [
      { department: "Engineering", employees: 89, totalGross: 534000, totalNet: 374400 },
      { department: "Sales", employees: 54, totalGross: 297000, totalNet: 207900 },
      { department: "Marketing", employees: 32, totalGross: 172800, totalNet: 120960 },
      { department: "HR", employees: 18, totalGross: 93600, totalNet: 65520 },
      { department: "Operations", employees: 54, totalGross: 237600, totalNet: 166320 }
    ],
    generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
  
  console.log('Testing full report PDF generation...');
  generateFullReportPDF(testData);
}

// Run all tests
export function runAllTests() {
  console.log('Starting PDF generation tests...');
  testPayslipGeneration();
  setTimeout(() => testTaxDocumentGeneration(), 1000);
  setTimeout(() => testFullReportGeneration(), 2000);
  setTimeout(() => console.log('All PDF generation tests completed!'), 3000);
}
