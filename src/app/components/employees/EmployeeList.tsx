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
import { useState, useEffect } from "react";
import { getEmployees, type Employee } from "../../utils/employeeStorage";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { EmployeeDetailDialog } from "./EmployeeDetailDialog";

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Load employees from storage
  useEffect(() => {
    const loadedEmployees = getEmployees();
    setEmployees(loadedEmployees);
    setFilteredEmployees(loadedEmployees);
  }, []);

  // Filter employees based on search and filters
  useEffect(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(emp => emp.department.toLowerCase() === departmentFilter.toLowerCase());
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(emp => emp.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  // Calculate dynamic stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const onLeaveEmployees = employees.filter(emp => emp.status === 'on_leave').length;
  const newThisMonth = employees.filter(emp => {
    const joinDate = new Date(emp.joinDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  const handleExport = () => {
    const csvContent = [
      ['Employee ID', 'Name', 'Department', 'Position', 'Email', 'Phone', 'Join Date', 'Status'],
      ...filteredEmployees.map(emp => [
        emp.id,
        emp.name,
        emp.department,
        emp.position,
        emp.email,
        emp.phone,
        emp.joinDate,
        emp.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee_list_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success("Employee list exported successfully");
  };

  const handleAddEmployee = () => {
    setIsAddDialogOpen(true);
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailDialogOpen(true);
  };

  const handleEmployeeAdded = (newEmployee: Omit<Employee, 'id'>) => {
    // Refresh the employee list
    const updatedEmployees = getEmployees();
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
  };

  // Get unique departments for filter
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  return (
    <div className="p-8 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Employees</p>
          <p className="text-3xl text-foreground mt-2">{totalEmployees}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl text-foreground mt-2">{activeEmployees}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">On Leave</p>
          <p className="text-3xl text-foreground mt-2">{onLeaveEmployees}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">New This Month</p>
          <p className="text-3xl text-foreground mt-2">{newThisMonth}</p>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
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
        <h3 className="mb-4 text-foreground">All Employees ({filteredEmployees.length})</h3>
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
            {filteredEmployees.map((employee) => (
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
                  <Badge className={
                    employee.status === 'active' ? "bg-green-50 text-green-700 border-green-200" :
                    employee.status === 'on_leave' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }>
                    {employee.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onEmployeeAdded={handleEmployeeAdded}
      />

      {/* Employee Detail Dialog */}
      <EmployeeDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}