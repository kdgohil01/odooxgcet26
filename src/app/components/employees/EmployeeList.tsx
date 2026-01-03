import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Plus, Download } from "lucide-react";
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

export function EmployeeList() {
  const handleExport = () => {
    toast.success("Exporting employee list...");
  };

  const handleAddEmployee = () => {
    toast.info("Add employee dialog opened");
  };

  const handleViewDetails = (employeeName: string) => {
    toast.info(`Viewing details for ${employeeName}`);
  };

  const employees = [
    { 
      id: "EMP-001", 
      name: "Sarah Johnson", 
      department: "Engineering", 
      position: "Senior Developer",
      email: "sarah.j@company.com",
      phone: "+1 (555) 101-1001",
      joinDate: "Mar 15, 2023",
      status: "active" 
    },
    { 
      id: "EMP-002", 
      name: "Michael Chen", 
      department: "Marketing", 
      position: "Marketing Manager",
      email: "michael.c@company.com",
      phone: "+1 (555) 102-1002",
      joinDate: "Jan 10, 2022",
      status: "active" 
    },
    { 
      id: "EMP-003", 
      name: "Emily Davis", 
      department: "Sales", 
      position: "Sales Executive",
      email: "emily.d@company.com",
      phone: "+1 (555) 103-1003",
      joinDate: "Jun 20, 2023",
      status: "active" 
    },
    { 
      id: "EMP-004", 
      name: "Robert Taylor", 
      department: "HR", 
      position: "HR Specialist",
      email: "robert.t@company.com",
      phone: "+1 (555) 104-1004",
      joinDate: "Sep 5, 2021",
      status: "active" 
    },
    { 
      id: "EMP-005", 
      name: "Jennifer Wilson", 
      department: "Engineering", 
      position: "Junior Developer",
      email: "jennifer.w@company.com",
      phone: "+1 (555) 105-1005",
      joinDate: "Jan 2, 2026",
      status: "active" 
    },
    { 
      id: "EMP-006", 
      name: "David Brown", 
      department: "Sales", 
      position: "Sales Representative",
      email: "david.b@company.com",
      phone: "+1 (555) 106-1006",
      joinDate: "Dec 28, 2025",
      status: "active" 
    },
    { 
      id: "EMP-007", 
      name: "Lisa Anderson", 
      department: "Marketing", 
      position: "Content Specialist",
      email: "lisa.a@company.com",
      phone: "+1 (555) 107-1007",
      joinDate: "Dec 20, 2025",
      status: "active" 
    },
    { 
      id: "EMP-008", 
      name: "James Miller", 
      department: "Operations", 
      position: "Operations Manager",
      email: "james.m@company.com",
      phone: "+1 (555) 108-1008",
      joinDate: "Apr 12, 2020",
      status: "active" 
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Employees</p>
          <p className="text-3xl text-foreground mt-2">247</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl text-foreground mt-2">245</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">On Leave</p>
          <p className="text-3xl text-foreground mt-2">2</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">New This Month</p>
          <p className="text-3xl text-foreground mt-2">12</p>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee ID..."
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
          <Select defaultValue="active">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddEmployee}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </Card>

      {/* Employee Table */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">All Employees</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {employee.name}
                  </div>
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.joinDate}</TableCell>
                <TableCell>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee.name)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}