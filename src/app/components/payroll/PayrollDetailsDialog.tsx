import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign,
  Download,
  FileText,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { getEmployeeById } from "../../utils/employeeStorage";
import { type PayrollRecord } from "../../types/payroll";
import { generatePayslipPDF, generateTaxDocumentPDF, generateFullReportPDF, type PayslipData, type TaxDocumentData, type FullReportData } from "../../utils/pdfGenerator";
import { type EnhancedPayrollRecord } from "../../utils/payrollStorage";

interface PayrollDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRecord: EnhancedPayrollRecord | null;
}

export function PayrollDetailsDialog({ isOpen, onClose, payrollRecord }: PayrollDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deductions' | 'history' | 'documents'>('overview');

  if (!payrollRecord) return null;

  // Get employee details from storage with error handling
  let employee = null;
  try {
    employee = getEmployeeById(payrollRecord.employee);
  } catch (error) {
    console.error('Error fetching employee data:', error);
  }
  
  // Calculate detailed breakdown with safe calculations
  const gross = payrollRecord.gross || 0;
  const basicSalary = gross * 0.6;
  const housingAllowance = gross * 0.2;
  const transportAllowance = gross * 0.15;
  const otherAllowances = gross * 0.05;
  const taxDeduction = gross * 0.15;
  const insuranceDeduction = gross * 0.08;
  const pensionDeduction = gross * 0.05;
  const otherDeductions = (payrollRecord.deductions?.tax || 0) + 
                        (payrollRecord.deductions?.insurance || 0) + 
                        (payrollRecord.deductions?.providentFund || 0) + 
                        (payrollRecord.deductions?.other || 0);
  const totalDeductions = taxDeduction + insuranceDeduction + pensionDeduction + otherDeductions;
  const netSalary = gross - totalDeductions;

  const handleDownload = (type: string) => {
    if (!employee || !payrollRecord) {
      toast.error("Employee data not available");
      return;
    }

    switch (type) {
      case 'Payslip':
        const payslipData: PayslipData = {
          employeeName: payrollRecord.employee,
          employeeId: `EMP-${payrollRecord.id}`,
          department: payrollRecord.department,
          position: payrollRecord.position,
          email: employee.email || 'N/A',
          phone: employee.phone || 'N/A',
          payPeriod: "January 2026",
          payDate: "January 15, 2026",
          grossSalary: payrollRecord.gross,
          deductions: {
            basicSalary,
            housingAllowance,
            transportAllowance,
            otherAllowances,
            tax: taxDeduction,
            insurance: insuranceDeduction,
            pension: pensionDeduction,
            otherDeductions,
            totalDeductions: payrollRecord.deductions
          },
          netSalary: payrollRecord.net,
          yearToDate: {
            gross: payrollRecord.gross * 12, // Assume current month * 12
            deductions: payrollRecord.deductions * 12,
            net: payrollRecord.net * 12
          }
        };
        generatePayslipPDF(payslipData);
        break;

      case 'Tax Document':
        const taxData: TaxDocumentData = {
          employeeName: payrollRecord.employee,
          employeeId: `EMP-${payrollRecord.id}`,
          taxYear: "2025",
          totalIncome: payrollRecord.gross * 12,
          taxableIncome: payrollRecord.gross * 12 * 0.8,
          taxPaid: taxDeduction * 12,
          employerDetails: {
            name: "DayFlow HR Management System",
            address: "123 Business Street, City, State 12345",
            ein: "12-3456789"
          }
        };
        generateTaxDocumentPDF(taxData);
        break;

      case 'Complete Payroll Report':
        const reportData: FullReportData = {
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
        generateFullReportPDF(reportData);
        break;

      default:
        // Handle historical payslips
        if (type.includes('2025') || type.includes('2024')) {
          const historicalPayslipData: PayslipData = {
            employeeName: payrollRecord.employee,
            employeeId: `EMP-${payrollRecord.id}`,
            department: payrollRecord.department,
            position: payrollRecord.position,
            email: employee.email || 'N/A',
            phone: employee.phone || 'N/A',
            payPeriod: type,
            payDate: "28th of month",
            grossSalary: payrollRecord.gross,
            deductions: {
              basicSalary: payrollRecord.gross * 0.6,
              housingAllowance: payrollRecord.gross * 0.2,
              transportAllowance: payrollRecord.gross * 0.15,
              otherAllowances: payrollRecord.gross * 0.05,
              tax: payrollRecord.gross * 0.15,
              insurance: payrollRecord.gross * 0.08,
              pension: payrollRecord.gross * 0.05,
              otherDeductions: 0,
              totalDeductions: payrollRecord.deductions
            },
            netSalary: payrollRecord.net,
            yearToDate: {
              gross: payrollRecord.gross * 12,
              deductions: payrollRecord.deductions * 12,
              net: payrollRecord.net * 12
            }
          };
          generatePayslipPDF(historicalPayslipData);
        } else {
          toast.success(`Downloading ${type} for ${payrollRecord.employee}...`);
        }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Employee Information */}
      <Card className="p-4">
        <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          Employee Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="text-foreground">{employee?.name || payrollRecord.employee}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employee ID</p>
            <p className="text-foreground">{employee?.id || `EMP-${String(payrollRecord.id).padStart(4, '0')}`}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="text-foreground">{employee?.department || payrollRecord.department}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Position</p>
            <p className="text-foreground">{employee?.position || payrollRecord.position}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-foreground">{employee?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-foreground">{employee?.phone || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Payroll Summary */}
      <Card className="p-4">
        <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Payroll Summary - January 2026
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Gross Salary</p>
            <p className="text-2xl text-foreground mt-1">${payrollRecord.gross.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="text-2xl text-foreground mt-1">${payrollRecord.deductions.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded">
            <p className="text-sm text-primary">Net Salary</p>
            <p className="text-2xl text-primary mt-1">${payrollRecord.net.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Processing Status</p>
          <Badge className={payrollRecord.status === 'processed' ? 
            "bg-green-50 text-green-700 border-green-200" : 
            "bg-orange-50 text-orange-700 border-orange-200"}>
            {payrollRecord.status === 'processed' ? 'Processed' : 'Pending'}
          </Badge>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => handleDownload('Payslip')}>
          <Download className="w-4 h-4 mr-2" />
          Download Payslip
        </Button>
        <Button variant="outline" onClick={() => handleDownload('Tax Document')}>
          <FileText className="w-4 h-4 mr-2" />
          Download Tax Document
        </Button>
      </div>
    </div>
  );

  const renderDeductions = () => (
    <div className="space-y-6">
      {/* Earnings Breakdown */}
      <Card className="p-4">
        <h4 className="font-medium text-foreground mb-4">Earnings Breakdown</h4>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Basic Salary</TableCell>
              <TableCell className="text-right">${basicSalary.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Housing Allowance</TableCell>
              <TableCell className="text-right">${housingAllowance.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Transport Allowance</TableCell>
              <TableCell className="text-right">${transportAllowance.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Other Allowances</TableCell>
              <TableCell className="text-right">${otherAllowances.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="font-medium">
              <TableCell>Gross Salary</TableCell>
              <TableCell className="text-right">${payrollRecord.gross.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Deductions Breakdown */}
      <Card className="p-4">
        <h4 className="font-medium text-foreground mb-4">Deductions Breakdown</h4>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Income Tax (15%)</TableCell>
              <TableCell className="text-right">${taxDeduction.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Health Insurance (8%)</TableCell>
              <TableCell className="text-right">${insuranceDeduction.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Pension Fund (5%)</TableCell>
              <TableCell className="text-right">${pensionDeduction.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Other Deductions</TableCell>
              <TableCell className="text-right">${otherDeductions.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="font-medium">
              <TableCell>Total Deductions</TableCell>
              <TableCell className="text-right">${payrollRecord.deductions.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Payroll History - Last 6 Months
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { month: 'January 2026', gross: payrollRecord.gross, deductions: payrollRecord.deductions, net: payrollRecord.net, status: payrollRecord.status },
              { month: 'December 2025', gross: payrollRecord.gross, deductions: payrollRecord.deductions - 100, net: payrollRecord.net + 100, status: 'processed' },
              { month: 'November 2025', gross: payrollRecord.gross, deductions: payrollRecord.deductions - 50, net: payrollRecord.net + 50, status: 'processed' },
              { month: 'October 2025', gross: payrollRecord.gross, deductions: payrollRecord.deductions, net: payrollRecord.net, status: 'processed' },
              { month: 'September 2025', gross: payrollRecord.gross, deductions: payrollRecord.deductions + 50, net: payrollRecord.net - 50, status: 'processed' },
              { month: 'August 2025', gross: payrollRecord.gross, deductions: payrollRecord.deductions, net: payrollRecord.net, status: 'processed' },
            ].map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.month}</TableCell>
                <TableCell>${record.gross.toLocaleString()}</TableCell>
                <TableCell>${record.deductions.toLocaleString()}</TableCell>
                <TableCell>${record.net.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={record.status === 'processed' ? 
                    "bg-green-50 text-green-700 border-green-200" : 
                    "bg-orange-50 text-orange-700 border-orange-200"}>
                    {record.status === 'processed' ? 'Processed' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(`${record.month} Payslip`)}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Available Documents
        </h4>
        <div className="space-y-3">
          {[
            { name: 'January 2026 Payslip', type: 'Payslip', date: '2026-01-15' },
            { name: 'December 2025 Payslip', type: 'Payslip', date: '2025-12-15' },
            { name: 'Tax Statement 2025', type: 'Tax Document', date: '2025-12-31' },
            { name: 'Employment Verification', type: 'Verification', date: '2025-01-01' },
            { name: 'Salary Certificate', type: 'Certificate', date: '2025-06-30' },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
              <div>
                <p className="text-foreground">{doc.name}</p>
                <p className="text-sm text-muted-foreground">{doc.type} • {doc.date}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload(doc.name)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Payroll Details - {payrollRecord.employee}
          </DialogTitle>
          <DialogDescription>
            Comprehensive payroll information and documents for {payrollRecord.employee}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'deductions', label: 'Earnings & Deductions' },
            { id: 'history', label: 'History' },
            { id: 'documents', label: 'Documents' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="rounded-b-none"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'deductions' && renderDeductions()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'documents' && renderDocuments()}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleDownload('Complete Payroll Report')}>
              <Download className="w-4 h-4 mr-2" />
              Download Full Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
