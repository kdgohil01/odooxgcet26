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
import { PayrollDetailsDialog } from "./PayrollDetailsDialog";
import { SalaryStructureDialog } from "./SalaryStructureDialog";
import { 
  getAllEmployeePayroll, 
  getEmployeePayroll, 
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
      
      setDepartmentPayroll(Object.entries(deptData).map(([dept, data]: [string, any]) => ({
        department: dept,
        ...data
      })));
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error("Failed to load payroll data");
      // Set fallback data
      setEmployeePayroll([]);
      setPayrollSummary({
        totalEmployees: 0,
        totalGrossPayroll: 0,
        totalDeductions: 0,
        totalNetPayroll: 0,
        processingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      });
      setDepartmentPayroll([]);
    }
  }, []);

  const handleExportReport = () => {
    toast.success("Exporting payroll report...");
  };

  const handleProcessPayroll = () => {
    toast.success("Payroll processing initiated...");
  };

  const handleViewDetails = (payrollRecord: EnhancedPayrollRecord) => {
    setSelectedPayrollRecord(payrollRecord);
    setIsDetailsDialogOpen(true);
  };

  const handleSalaryStructureUpdate = (record: EnhancedPayrollRecord) => {
    setSelectedPayrollRecord(record);
    setIsSalaryStructureDialogOpen(true);
  };

  const handleSalaryStructureClose = () => {
    setIsSalaryStructureDialogOpen(false);
    setSelectedPayrollRecord(null);
  };

  const handleSalaryStructureUpdated = () => {
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
    
    // Recalculate department breakdown
    const deptData = updatedPayroll.reduce((acc: any, record) => {
      const dept = record.department;
      if (!acc[dept]) {
        acc[dept] = { count: 0, totalGross: 0, totalNet: 0 };
      }
      acc[dept].count++;
      acc[dept].totalGross += record.gross;
      acc[dept].totalNet += record.net;
      return acc;
    }, {});
    
    setDepartmentPayroll(Object.entries(deptData).map(([dept, data]: [string, any]) => ({
      department: dept,
      ...data
    })));
    
    toast.success("Salary structure updated successfully");
  };

  const refreshData = () => {
    try {
      const updatedPayroll = getAllEmployeePayroll();
      setEmployeePayroll(updatedPayroll);
      
      // Calculate summary
      const summary = {
        totalEmployees: updatedPayroll.length,
        totalGrossPayroll: updatedPayroll.reduce((sum, record) => sum + record.gross, 0),
        totalDeductions: updatedPayroll.reduce((sum, record) => sum + (record.deductions.tax + record.deductions.insurance + record.deductions.providentFund + record.deductions.other), 0),
        totalNetPayroll: updatedPayroll.reduce((sum, record) => sum + record.net, 0),
        processingDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      setPayrollSummary(summary);
      
      // Recalculate department breakdown
      const deptData = updatedPayroll.reduce((acc: any, record) => {
        const dept = record.department;
        if (!acc[dept]) {
          acc[dept] = { count: 0, totalGross: 0, totalNet: 0 };
        }
        acc[dept].count++;
        acc[dept].totalGross += record.gross;
        acc[dept].totalNet += record.net;
        return acc;
      }, {});
      
      setDepartmentPayroll(Object.entries(deptData).map(([dept, data]: [string, any]) => ({
        department: dept,
        ...data
      })));
      
      toast.success("Payroll data refreshed");
    } catch (error) {
      console.error('Error refreshing payroll data:', error);
      toast.error('Failed to refresh payroll data');
    }
  };

  // Filter logic for employee payroll
  const filteredEmployeePayroll = employeePayroll.filter(record => {
    const matchesSearch = record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || 
                             record.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Payroll Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-foreground">Payroll Summary - January 2026</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Processing Date: {payrollSummary.processingDate}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData}>
              Refresh Data
            </Button>
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
              {payrollSummary.totalEmployees}
            </p>
          </div>
          <div className="p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Gross</p>
            <p className="text-2xl text-foreground mt-2">
              ${payrollSummary.totalGrossPayroll.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="text-2xl text-foreground mt-2">
              ${payrollSummary.totalDeductions.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded">
            <p className="text-sm text-primary">Total Net</p>
            <p className="text-2xl text-primary mt-2">
              ${payrollSummary.totalNetPayroll.toLocaleString()}
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
                <TableCell>{dept.employees}</TableCell>
                <TableCell>${dept.totalGross.toLocaleString()}</TableCell>
                <TableCell>${dept.totalNet.toLocaleString()}</TableCell>
                <TableCell>${Math.round(dept.totalNet / dept.employees).toLocaleString()}</TableCell>
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
                placeholder="Search by employee name or position..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
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
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Employee Payroll Table */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Employee Payroll Details ({filteredEmployeePayroll.length})</h3>
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
            {filteredEmployeePayroll.length > 0 ? (
              filteredEmployeePayroll.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employee}</TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>{record.position}</TableCell>
                  <TableCell>${record.gross.toLocaleString()}</TableCell>
                  <TableCell>${record.deductions.toLocaleString()}</TableCell>
                  <TableCell>${record.net.toLocaleString()}</TableCell>
                  <TableCell>
                    {record.status === 'processed' ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Processed
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetails(record)}
                      className="mr-2"
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSalaryStructureUpdate(record)}
                      disabled={record.status === 'NA'}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No payroll records found matching your criteria
                </TableCell>
              </TableRow>
            )}
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
              2 employees have pending payroll items that require review before processing.
              Ensure all data is verified before the {payrollSummary.processingDate} deadline.
            </p>
          </div>
        </div>
      </Card>

      {/* Salary Structure Dialog */}
      <SalaryStructureDialog
        isOpen={isSalaryStructureDialogOpen}
        onClose={handleSalaryStructureClose}
        payrollRecord={selectedPayrollRecord}
        onUpdate={handleSalaryStructureUpdated}
      />

      {/* Payroll Details Dialog */}
      <PayrollDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        payrollRecord={selectedPayrollRecord}
      />
    </div>
  );
}