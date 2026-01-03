import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Download, DollarSign, AlertCircle } from "lucide-react";
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

export function AdminPayroll() {
  const handleExportReport = () => {
    toast.success("Exporting payroll report...");
  };

  const handleProcessPayroll = () => {
    toast.success("Payroll processing initiated...");
  };

  const handleViewDetails = (employeeName: string) => {
    toast.info(`Viewing details for ${employeeName}`);
  };

  const payrollSummary = {
    totalEmployees: 247,
    totalGrossPayroll: 1234500,
    totalDeductions: 345600,
    totalNetPayroll: 888900,
    processingDate: "January 15, 2026",
  };

  const employeePayroll = [
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

  const departmentPayroll = [
    { department: "Engineering", employees: 89, totalGross: 534000, totalNet: 374400 },
    { department: "Sales", employees: 54, totalGross: 297000, totalNet: 207900 },
    { department: "Marketing", employees: 32, totalGross: 172800, totalNet: 120960 },
    { department: "HR", employees: 18, totalGross: 93600, totalNet: 65520 },
    { department: "Operations", employees: 54, totalGross: 237600, totalNet: 166320 },
  ];

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
                placeholder="Search by employee name or ID..."
                className="pl-10"
              />
            </div>
          </div>
          <Select defaultValue="all">
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
          <Select defaultValue="all">
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
        <h3 className="mb-4 text-foreground">Employee Payroll Details</h3>
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
            {employeePayroll.map((record) => (
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
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(record.employee)}>
                    View Details
                  </Button>
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
              2 employees have pending payroll items that require review before processing.
              Ensure all data is verified before the {payrollSummary.processingDate} deadline.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}