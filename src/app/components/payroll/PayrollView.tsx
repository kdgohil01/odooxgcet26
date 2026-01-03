import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Download, DollarSign, Search, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { generatePayslipPDF, generateTaxDocumentPDF, type PayslipData, type TaxDocumentData } from "../../utils/pdfGenerator";
import { useProfileContext } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import { getEmployeePayroll, type EnhancedPayrollRecord } from "../../utils/payrollStorage";

export function PayrollView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const { profile } = useProfileContext();
  const { currentUser } = useAuth();
  
  // Get employee payroll data (read-only for employees)
  const employeePayroll = getEmployeePayroll(currentUser?.employeeId || '');
  
  // Get current payroll record for display with safe defaults
  const currentPayroll: EnhancedPayrollRecord = employeePayroll || {
    id: 0,
    employeeId: '',
    employee: "Not Available",
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: '',
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
    lastUpdated: ''
  };

  const handleDownloadPayslip = () => {
    // Calculate breakdown
    const grossSalary = currentPayroll.gross;
    const totalDeductions = currentPayroll.deductions.tax + 
                          currentPayroll.deductions.insurance + 
                          currentPayroll.deductions.providentFund + 
                          currentPayroll.deductions.other;
    const basicSalary = grossSalary * 0.6;
    const housingAllowance = grossSalary * 0.2;
    const transportAllowance = grossSalary * 0.15;
    const otherAllowances = grossSalary * 0.05;
    const tax = grossSalary * 0.15;
    const insurance = grossSalary * 0.04;
    const pension = grossSalary * 0.05;
    const otherDeductions = totalDeductions - tax - insurance - pension;

    const payslipData: PayslipData = {
      employeeName: currentPayroll.employee,
      employeeId: currentPayroll.employeeId,
      department: currentPayroll.department,
      position: currentPayroll.position,
      email: currentPayroll.email,
      phone: currentPayroll.phone,
      payPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      payDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      grossSalary: currentPayroll.gross,
      deductions: {
        basicSalary: currentPayroll.salaryStructure.basic,
        housingAllowance: currentPayroll.salaryStructure.housing,
        transportAllowance: currentPayroll.salaryStructure.transport,
        otherAllowances: currentPayroll.salaryStructure.other,
        tax: currentPayroll.deductions.tax,
        insurance: currentPayroll.deductions.insurance,
        pension: currentPayroll.deductions.providentFund,
        otherDeductions: currentPayroll.deductions.other,
        totalDeductions: totalDeductions
      },
      netSalary: currentPayroll.net,
      yearToDate: {
        gross: currentPayroll.gross,
        deductions: totalDeductions,
        net: currentPayroll.net
      }
    };
    
    generatePayslipPDF(payslipData);
    toast.success("Payslip downloaded successfully");
  };

  const handleDownloadTaxDoc = (docName: string) => {
    // Generate tax document (mock implementation)
    const taxData: TaxDocumentData = {
      employeeName: currentPayroll.employee,
      employeeId: currentPayroll.employeeId,
      taxYear: docName.includes('2025') ? '2025' : '2024',
      totalIncome: currentPayroll.gross * 12, // Annual income
      taxableIncome: currentPayroll.gross * 12 * 0.8, // 80% of gross is taxable
      taxPaid: currentPayroll.deductions.tax * 12, // Annual tax
      employerDetails: {
        name: "DayFlow Company",
        address: "123 Business St, San Francisco, CA 94105",
        ein: "12-3456789"
      }
    };
    
    generateTaxDocumentPDF(taxData);
    toast.success(`${docName} downloaded successfully`);
  };

  const filteredRecords = employeePayroll ? [employeePayroll] : [];

  return (
    <div className="p-8 space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-foreground">My Payroll</h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {currentPayroll.status === 'NA' && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">No Payroll Data Available</p>
                <p className="text-sm text-yellow-700">
                  Your payroll information is not yet available. Please contact your HR administrator to set up your salary structure.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPayroll.status !== 'NA' && (
          <>
            {/* Payroll Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Basic Salary</p>
                <p className="text-2xl text-foreground">
                  ${currentPayroll.salaryStructure.basic.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Housing Allowance</p>
                <p className="text-2xl text-foreground">
                  ${currentPayroll.salaryStructure.housing.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Transport Allowance</p>
                <p className="text-2xl text-foreground">
                  ${currentPayroll.salaryStructure.transport.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Other Allowances</p>
                <p className="text-2xl text-foreground">
                  ${currentPayroll.salaryStructure.other.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">Total Gross</p>
                <p className="text-2xl text-primary">
                  ${currentPayroll.gross.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tax</p>
                <p className="text-2xl text-foreground">
                  ${currentPayroll.deductions.tax.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Insurance</p>
                <p className="text-2xl text-foreground">
                  ${currentPayroll.deductions.insurance.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Provident Fund</p>
                <p className="text-2xl text-foreground">
                  ${currentPayroll.deductions.providentFund.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">Total Deductions</p>
                <p className="text-2xl text-red-700">
                  ${(currentPayroll.deductions.tax + currentPayroll.deductions.insurance + currentPayroll.deductions.providentFund + currentPayroll.deductions.other).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">Net Salary</p>
                <p className="text-2xl text-primary">
                  ${currentPayroll.net.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button onClick={handleDownloadPayslip} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Payslip
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Payroll History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-foreground">Payroll History</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Search payroll records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.paymentDate || 'Not Available'}</TableCell>
                <TableCell>${record.salaryStructure.basic.toLocaleString()}</TableCell>
                <TableCell>${(record.salaryStructure.housing + record.salaryStructure.transport + record.salaryStructure.other).toLocaleString()}</TableCell>
                <TableCell>${record.gross.toLocaleString()}</TableCell>
                <TableCell>${(record.deductions.tax + record.deductions.insurance + record.deductions.providentFund + record.deductions.other).toLocaleString()}</TableCell>
                <TableCell>${record.net.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={record.status === 'processed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Tax Documents */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Tax Documents</h3>
        <div className="space-y-3">
          {[
            { name: "W-2 Form 2025", year: "2025", size: "156 KB" },
            { name: "W-2 Form 2024", year: "2024", size: "148 KB" },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded">
              <div>
                <p className="text-sm text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">Tax Year: {doc.year} • {doc.size}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownloadTaxDoc(doc.name)}>
                <Download className="w-3 h-3 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}