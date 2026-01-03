/**
 * PDF generation utilities for payslips and payroll documents
 */

import jsPDF from 'jspdf';

// Define interfaces for PDF data
export interface PayslipData {
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  payPeriod: string;
  payDate: string;
  grossSalary: number;
  deductions: {
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    otherAllowances: number;
    tax: number;
    insurance: number;
    pension: number;
    otherDeductions: number;
    totalDeductions: number;
  };
  netSalary: number;
  yearToDate: {
    gross: number;
    deductions: number;
    net: number;
  };
}

export interface TaxDocumentData {
  employeeName: string;
  employeeId: string;
  taxYear: string;
  totalIncome: number;
  taxableIncome: number;
  taxPaid: number;
  employerDetails: {
    name: string;
    address: string;
    ein: string;
  };
}

export interface FullReportData {
  reportPeriod: string;
  totalEmployees: number;
  totalGrossPayroll: number;
  totalDeductions: number;
  totalNetPayroll: number;
  departmentBreakdown: Array<{
    department: string;
    employees: number;
    totalGross: number;
    totalNet: number;
  }>;
  generatedDate: string;
}

// Attendance PDF interfaces
export interface AttendanceRecordData {
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave';
}

export interface AttendanceReportData {
  reportPeriod: string;
  reportType: 'weekly' | 'monthly';
  employeeName?: string;
  employeeId?: string;
  records: AttendanceRecordData[];
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
    leaveDays: number;
    totalHours: number;
    averageHours: number;
    attendanceRate: number;
  };
  generatedDate: string;
}

export interface DepartmentAttendanceData {
  reportPeriod: string;
  departmentStats: Array<{
    department: string;
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
    leaveCount: number;
    attendanceRate: number;
  }>;
  generatedDate: string;
}

/**
 * Generate a payslip PDF
 */
export function generatePayslipPDF(data: PayslipData): void {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.text('PAYSLIP', 105, 20, { align: 'center' });
  
  // Company info
  doc.setFontSize(12);
  doc.text('DayFlow HR Management System', 105, 30, { align: 'center' });
  doc.text('123 Business Street, City, State 12345', 105, 35, { align: 'center' });
  doc.text('Phone: (555) 123-4567 | Email: payroll@dayflow.com', 105, 40, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Employee Information
  doc.setFontSize(14);
  doc.text('Employee Information', 20, 55);
  doc.setFontSize(10);
  doc.text(`Name: ${data.employeeName}`, 20, 62);
  doc.text(`Employee ID: ${data.employeeId}`, 20, 67);
  doc.text(`Department: ${data.department}`, 20, 72);
  doc.text(`Position: ${data.position}`, 20, 77);
  doc.text(`Email: ${data.email}`, 110, 62);
  doc.text(`Phone: ${data.phone}`, 110, 67);
  
  // Pay Period Information
  doc.setFontSize(14);
  doc.text('Pay Period Information', 20, 87);
  doc.setFontSize(10);
  doc.text(`Pay Period: ${data.payPeriod}`, 20, 94);
  doc.text(`Pay Date: ${data.payDate}`, 20, 99);
  
  // Earnings Section
  doc.setFontSize(14);
  doc.text('Earnings', 20, 109);
  doc.setFontSize(10);
  doc.text('Basic Salary', 25, 116);
  doc.text(`$${data.deductions.basicSalary.toLocaleString()}`, 160, 116, { align: 'right' });
  
  doc.text('Housing Allowance', 25, 121);
  doc.text(`$${data.deductions.housingAllowance.toLocaleString()}`, 160, 121, { align: 'right' });
  
  doc.text('Transport Allowance', 25, 126);
  doc.text(`$${data.deductions.transportAllowance.toLocaleString()}`, 160, 126, { align: 'right' });
  
  doc.text('Other Allowances', 25, 131);
  doc.text(`$${data.deductions.otherAllowances.toLocaleString()}`, 160, 131, { align: 'right' });
  
  // Gross Salary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Gross Salary:', 25, 138);
  doc.text(`$${data.grossSalary.toLocaleString()}`, 160, 138, { align: 'right' });
  
  // Deductions Section
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Deductions', 20, 148);
  doc.setFontSize(10);
  doc.text('Income Tax', 25, 155);
  doc.text(`$${data.deductions.tax.toLocaleString()}`, 160, 155, { align: 'right' });
  
  doc.text('Health Insurance', 25, 160);
  doc.text(`$${data.deductions.insurance.toLocaleString()}`, 160, 160, { align: 'right' });
  
  doc.text('Pension Fund', 25, 165);
  doc.text(`$${data.deductions.pension.toLocaleString()}`, 160, 165, { align: 'right' });
  
  doc.text('Other Deductions', 25, 170);
  doc.text(`$${data.deductions.otherDeductions.toLocaleString()}`, 160, 170, { align: 'right' });
  
  // Total Deductions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Deductions:', 25, 177);
  doc.text(`$${data.deductions.totalDeductions.toLocaleString()}`, 160, 177, { align: 'right' });
  
  // Net Salary
  doc.setFontSize(14);
  doc.text('Net Salary:', 25, 187);
  doc.text(`$${data.netSalary.toLocaleString()}`, 160, 187, { align: 'right' });
  
  // Year-to-Date Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Year-to-Date Summary', 20, 197);
  doc.setFontSize(10);
  doc.text(`YTD Gross: $${data.yearToDate.gross.toLocaleString()}`, 25, 204);
  doc.text(`YTD Deductions: $${data.yearToDate.deductions.toLocaleString()}`, 25, 209);
  doc.text(`YTD Net: $${data.yearToDate.net.toLocaleString()}`, 25, 214);
  
  // Footer
  doc.line(20, 225, 190, 225);
  doc.setFontSize(8);
  doc.text('This is a computer-generated document. No signature required.', 105, 230, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 235, { align: 'center' });
  
  // Save the PDF
  const fileName = `payslip_${data.employeeName.replace(/\s+/g, '_')}_${data.payPeriod}.pdf`;
  doc.save(fileName);
}

/**
 * Generate a tax document PDF
 */
export function generateTaxDocumentPDF(data: TaxDocumentData): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('TAX STATEMENT', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('DayFlow HR Management System', 105, 30, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Tax Year
  doc.setFontSize(14);
  doc.text(`Tax Year: ${data.taxYear}`, 20, 45);
  
  // Employee Information
  doc.setFontSize(12);
  doc.text('Employee Information', 20, 55);
  doc.setFontSize(10);
  doc.text(`Name: ${data.employeeName}`, 20, 62);
  doc.text(`Employee ID: ${data.employeeId}`, 20, 67);
  
  // Tax Summary
  doc.setFontSize(14);
  doc.text('Tax Summary', 20, 77);
  doc.setFontSize(10);
  doc.text(`Total Income: $${data.totalIncome.toLocaleString()}`, 20, 84);
  doc.text(`Taxable Income: $${data.taxableIncome.toLocaleString()}`, 20, 89);
  doc.text(`Tax Paid: $${data.taxPaid.toLocaleString()}`, 20, 94);
  
  // Employer Information
  doc.setFontSize(12);
  doc.text('Employer Information', 20, 104);
  doc.setFontSize(10);
  doc.text(`Company: ${data.employerDetails.name}`, 20, 111);
  doc.text(`Address: ${data.employerDetails.address}`, 20, 116);
  doc.text(`EIN: ${data.employerDetails.ein}`, 20, 121);
  
  // Footer
  doc.line(20, 135, 190, 135);
  doc.setFontSize(8);
  doc.text('This is a computer-generated tax statement for informational purposes only.', 105, 140, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 145, { align: 'center' });
  
  // Save the PDF
  const fileName = `tax_statement_${data.employeeName.replace(/\s+/g, '_')}_${data.taxYear}.pdf`;
  doc.save(fileName);
}

/**
 * Generate a full payroll report PDF
 */
export function generateFullReportPDF(data: FullReportData): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('PAYROLL REPORT', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('DayFlow HR Management System', 105, 30, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Report Period
  doc.setFontSize(14);
  doc.text(`Report Period: ${data.reportPeriod}`, 20, 45);
  
  // Summary
  doc.setFontSize(12);
  doc.text('Summary', 20, 55);
  doc.setFontSize(10);
  doc.text(`Total Employees: ${data.totalEmployees}`, 20, 62);
  doc.text(`Total Gross Payroll: $${data.totalGrossPayroll.toLocaleString()}`, 20, 67);
  doc.text(`Total Deductions: $${data.totalDeductions.toLocaleString()}`, 20, 72);
  doc.text(`Total Net Payroll: $${data.totalNetPayroll.toLocaleString()}`, 20, 77);
  
  // Department Breakdown
  doc.setFontSize(12);
  doc.text('Department Breakdown', 20, 87);
  
  let yPos = 94;
  data.departmentBreakdown.forEach((dept, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(10);
    doc.text(`${dept.department}:`, 20, yPos);
    doc.text(`Employees: ${dept.employees}`, 30, yPos + 5);
    doc.text(`Gross: $${dept.totalGross.toLocaleString()}`, 30, yPos + 10);
    doc.text(`Net: $${dept.totalNet.toLocaleString()}`, 30, yPos + 15);
    
    yPos += 25;
  });
  
  // Footer
  doc.line(20, 280, 190, 280);
  doc.setFontSize(8);
  doc.text(`Generated on ${data.generatedDate}`, 105, 285, { align: 'center' });
  
  // Save the PDF
  const fileName = `payroll_report_${data.reportPeriod.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Download a file (helper function for future use)
 */
export function downloadFile(content: string, fileName: string, mimeType: string = 'application/pdf'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate attendance report PDF
 */
export function generateAttendanceReportPDF(data: AttendanceReportData): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('ATTENDANCE REPORT', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('DayFlow HR Management System', 105, 30, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Report Information
  doc.setFontSize(14);
  doc.text('Report Information', 20, 45);
  doc.setFontSize(10);
  doc.text(`Report Period: ${data.reportPeriod}`, 20, 52);
  doc.text(`Report Type: ${data.reportType.charAt(0).toUpperCase() + data.reportType.slice(1)}`, 20, 57);
  doc.text(`Generated: ${data.generatedDate}`, 20, 62);
  
  if (data.employeeName) {
    doc.text(`Employee: ${data.employeeName}`, 20, 67);
    doc.text(`Employee ID: ${data.employeeId}`, 20, 72);
  }
  
  // Summary Section
  doc.setFontSize(14);
  doc.text('Attendance Summary', 20, 82);
  doc.setFontSize(10);
  doc.text(`Total Days: ${data.summary.totalDays}`, 20, 89);
  doc.text(`Present Days: ${data.summary.presentDays}`, 20, 94);
  doc.text(`Absent Days: ${data.summary.absentDays}`, 20, 99);
  doc.text(`Half Days: ${data.summary.halfDays}`, 20, 104);
  doc.text(`Leave Days: ${data.summary.leaveDays}`, 20, 109);
  doc.text(`Total Hours: ${data.summary.totalHours.toFixed(1)}`, 20, 114);
  doc.text(`Average Hours/Day: ${data.summary.averageHours.toFixed(1)}`, 20, 119);
  doc.text(`Attendance Rate: ${data.summary.attendanceRate}%`, 20, 124);
  
  // Attendance Records Table
  doc.setFontSize(14);
  doc.text('Attendance Records', 20, 134);
  
  // Table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 25, 141);
  doc.text('Check In', 60, 141);
  doc.text('Check Out', 95, 141);
  doc.text('Hours', 130, 141);
  doc.text('Status', 165, 141);
  
  // Table data
  doc.setFont('helvetica', 'normal');
  let yPos = 148;
  const maxRowsPerPage = 10;
  
  data.records.forEach((record, index) => {
    if (index > 0 && index % maxRowsPerPage === 0) {
      doc.addPage();
      yPos = 20;
      
      // Re-add headers on new page
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 25, yPos);
      doc.text('Check In', 60, yPos);
      doc.text('Check Out', 95, yPos);
      doc.text('Hours', 130, yPos);
      doc.text('Status', 165, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
    }
    
    doc.text(record.date, 25, yPos);
    doc.text(record.checkInTime || '--:--', 60, yPos);
    doc.text(record.checkOutTime || '--:--', 95, yPos);
    doc.text(record.totalHours ? record.totalHours.toFixed(1) : '--', 130, yPos);
    doc.text(record.status, 165, yPos);
    
    yPos += 7;
  });
  
  // Footer
  doc.line(20, 280, 190, 280);
  doc.setFontSize(8);
  doc.text('This is a computer-generated attendance report.', 105, 285, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
  
  // Save the PDF
  const fileName = data.employeeName 
    ? `attendance_${data.employeeName.replace(/\s+/g, '_')}_${data.reportType}_${data.reportPeriod.replace(/\s+/g, '_')}.pdf`
    : `attendance_report_${data.reportType}_${data.reportPeriod.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Generate department attendance PDF
 */
export function generateDepartmentAttendancePDF(data: DepartmentAttendanceData): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('DEPARTMENT ATTENDANCE REPORT', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('DayFlow HR Management System', 105, 30, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Report Information
  doc.setFontSize(14);
  doc.text('Report Information', 20, 45);
  doc.setFontSize(10);
  doc.text(`Report Period: ${data.reportPeriod}`, 20, 52);
  doc.text(`Generated: ${data.generatedDate}`, 20, 57);
  
  // Department Statistics Table
  doc.setFontSize(14);
  doc.text('Department Statistics', 20, 67);
  
  // Table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Department', 25, 74);
  doc.text('Total', 70, 74);
  doc.text('Present', 95, 74);
  doc.text('Absent', 120, 74);
  doc.text('Leave', 145, 74);
  doc.text('Rate', 170, 74);
  
  // Table data
  doc.setFont('helvetica', 'normal');
  let yPos = 81;
  
  data.departmentStats.forEach((dept) => {
    doc.text(dept.department, 25, yPos);
    doc.text(dept.totalEmployees.toString(), 70, yPos);
    doc.text(dept.presentCount.toString(), 95, yPos);
    doc.text(dept.absentCount.toString(), 120, yPos);
    doc.text(dept.leaveCount.toString(), 145, yPos);
    doc.text(`${dept.attendanceRate}%`, 170, yPos);
    
    yPos += 7;
  });
  
  // Footer
  doc.line(20, 280, 190, 280);
  doc.setFontSize(8);
  doc.text('This is a computer-generated department attendance report.', 105, 285, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
  
  // Save the PDF
  const fileName = `department_attendance_${data.reportPeriod.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
