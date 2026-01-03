import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Download, DollarSign, AlertCircle, Edit } from "lucide-react";
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
import { SalaryStructureDialog } from "./SalaryStructureDialog";
import { PayrollDetailsDialog } from "./PayrollDetailsDialog";
import { 
  getAllEmployeePayroll, 
  updateSalaryStructure, 
  type EnhancedPayrollRecord 
} from "../../utils/payrollStorage";

export function AdminPayroll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<EnhancedPayrollRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSalaryStructureDialogOpen, setIsSalaryStructureDialogOpen] = useState(false);
  const [employeePayroll, setEmployeePayroll] = useState<EnhancedPayrollRecord[]>([]);
  const [payrollSummary, setPayrollSummary] = useState({
    totalEmployees: 0,
    totalGrossPayroll: 0,
    totalDeductions: 0,
    totalNetPayroll: 0,
    processingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  });
  const [departmentPayroll, setDepartmentPayroll] = useState<any[]>([]);

  // Load payroll data on component mount
  useEffect(() => {
    try {
      const payrollData = getAllEmployeePayroll();
      setEmployeePayroll(payrollData);
      
      // Calculate summary
      const summary = {
        totalEmployees: payrollData.length,
        totalGrossPayroll: payrollData.reduce((sum, record) => sum + record.gross, 0),
        totalDeductions: payrollData.reduce((sum, record) => sum + (record.deductions.tax + record.deductions.insurance + record.deductions.providentFund + record.deductions.other), 0),
        totalNetPayroll: payrollData.reduce((sum, record) => sum + record.net, 0),
        processingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      setPayrollSummary(summary);
      
      // Calculate department payroll
      const deptData = payrollData.reduce((acc: any, record) => {
        const dept = record.department;
        if (!acc[dept]) {
          acc[dept] = { count: 0, totalGross: 0, totalNet: 0 };
        }
        acc[dept].count++;
        acc[dept].totalGross += record.gross;
        acc[dept].totalNet += record.net;
        return acc;
      }, {});
      
      const deptPayroll = Object.entries(deptData).map(([dept, data]: [string, any]) => ({
        department: dept,
        ...data
      }));
      
      setDepartmentPayroll(deptPayroll);
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error("Failed to load payroll data");
    }
  }, []);

  // Filter payroll data
  const filteredPayroll = employeePayroll.filter(record => {
    const matchesSearch = !searchTerm || 
      record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || 
      record.department.toLowerCase() === departmentFilter.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || 
      record.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleExportReport = () => {
    const csvContent = [
      ['Employee', 'Department', 'Position', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'],
      ...filteredPayroll.map(record => [
        record.employee,
        record.department,
        record.position,
        record.gross.toString(),
        (record.deductions.tax + record.deductions.insurance + record.deductions.providentFund + record.deductions.other).toString(),
        record.net.toString(),
        record.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success("Payroll report exported successfully");
  };

  const handleProcessPayroll = () => {
    toast.success("Payroll processing initiated...");
  };

  const handleViewDetails = (payrollRecord: EnhancedPayrollRecord) => {
    setSelectedPayrollRecord(payrollRecord);
    setIsDetailsDialogOpen(true);
  };

  const handleSalaryStructureEdit = (record: EnhancedPayrollRecord) => {
    setSelectedPayrollRecord(record);
    setIsSalaryStructureDialogOpen(true);
  };

  const handleSalaryStructureUpdate = () => {
    // Refresh payroll data
    const updatedPayroll = getAllEmployeePayroll();
    setEmployeePayroll(updatedPayroll);
    
    // Recalculate summary
    const summary = {
      totalEmployees: updatedPayroll.length,
      totalGrossPayroll: updatedPayroll.reduce((sum, record) => sum + record.gross, 0),
      totalDeductions: updatedPayroll.reduce((sum, record) => sum + (record.deductions.tax + record.deductions.insurance + record.deductions.providentFund + record.deductions.other), 0),
      totalNetPayroll: updatedPayroll.reduce((sum, record) => sum + record.net, 0),
      processingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setPayrollSummary(summary);
    
    toast.success("Salary structure updated successfully");
  };

  const handleDetailsClose = () => {
    setIsDetailsDialogOpen(false);
    setSelectedPayrollRecord(null);
  };

  const handleSalaryStructureClose = () => {
    setIsSalaryStructureDialogOpen(false);
    setSelectedPayrollRecord(null);
  };

  // Get unique departments for filter
  const departments = Array.from(new Set(employeePayroll.map(record => record.department)));

  return (
    <div className="p-8 space-y-6">
      {/* Payroll Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-foreground">Payroll Summary - {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Processing Date: {payrollSummary.processingDate}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={handleProcessPayroll}>Process Payroll</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-2xl text-foreground mt-2">
              {payrollSummary.totalEmployees || 0}
            </p>
          </div>
          <div className="p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Gross</p>
            <p className="text-2xl text-foreground mt-2">
              ${(payrollSummary.totalGrossPayroll || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="text-2xl text-foreground mt-2">
              ${(payrollSummary.totalDeductions || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded">
            <p className="text-sm text-primary">Total Net</p>
            <p className="text-2xl text-primary mt-2">
              ${(payrollSummary.totalNetPayroll || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Department Breakdown */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Department Payroll Breakdown</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Total Gross</TableHead>
              <TableHead>Total Net</TableHead>
              <TableHead>Avg. Per Employee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentPayroll.map((dept, index) => (
              <TableRow key={index}>
                <TableCell>{dept.department}</TableCell>
                <TableCell>{dept.count}</TableCell>
                <TableCell>${(dept.totalGross || 0).toLocaleString()}</TableCell>
                <TableCell>${(dept.totalNet || 0).toLocaleString()}</TableCell>
                <TableCell>${dept.count > 0 ? Math.round((dept.totalNet || 0) / dept.count).toLocaleString() : 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept.toLowerCase()}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="na">NA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Employee Payroll Table */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Employee Payroll Details ({filteredPayroll.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Gross Salary</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayroll.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.employee}</TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>{record.position}</TableCell>
                <TableCell>${record.gross.toLocaleString()}</TableCell>
                <TableCell>${(record.deductions.tax + record.deductions.insurance + record.deductions.providentFund + record.deductions.other).toLocaleString()}</TableCell>
                <TableCell>${record.net.toLocaleString()}</TableCell>
                <TableCell>
                  {record.status === 'processed' ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      Processed
                    </Badge>
                  ) : record.status === 'NA' ? (
                    <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                      NA
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(record)} className="mr-2">
                    View Details
                  </Button>
                  {record.status !== 'NA' && (
                    <Button variant="outline" size="sm" onClick={() => handleSalaryStructureEdit(record)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-1" />
          <div>
            <h4 className="text-foreground">Payroll Processing Notice</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {employeePayroll.filter(r => r.status === 'pending').length} employees have pending payroll items that require review before processing.
              Ensure all data is verified before the deadline.
            </p>
          </div>
        </div>
      </Card>

      {/* Payroll Details Dialog */}
      <PayrollDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={handleDetailsClose}
        payrollRecord={selectedPayrollRecord}
      />

      {/* Salary Structure Dialog */}
      <SalaryStructureDialog
        isOpen={isSalaryStructureDialogOpen}
        onClose={handleSalaryStructureClose}
        payrollRecord={selectedPayrollRecord}
        onUpdate={handleSalaryStructureUpdate}
      />
    </div>
  );
}