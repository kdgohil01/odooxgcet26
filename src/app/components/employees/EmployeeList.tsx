import { useState, useEffect } from "react";
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
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { EmployeeDetailDialog } from "./EmployeeDetailDialog";
import { getEmployees, setEmployees, addEmployee, type Employee } from "../../utils/employeeStorage";

export function EmployeeList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployeesState] = useState<Employee[]>([]);

  // Load employees from localStorage on component mount
  useEffect(() => {
    const loadedEmployees = getEmployees();
    setEmployeesState(loadedEmployees);
  }, []);

  const handleExport = () => {
    toast.success("Exporting employee list...");
  };

  const handleAddEmployee = () => {
    setIsAddDialogOpen(true);
  };

  const handleEmployeeAdded = (newEmployee: Omit<Employee, 'id'>) => {
    const addedEmployee = addEmployee(newEmployee);
    setEmployeesState(prev => [addedEmployee, ...prev]);
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailDialogOpen(true);
  };

  // Filter logic for employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || 
                             employee.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

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
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
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
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No employees found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      <AddEmployeeDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onEmployeeAdded={handleEmployeeAdded}
      />
      
      <EmployeeDetailDialog 
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}