import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Download, Filter } from "lucide-react";
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

export function AdminAttendance() {
  const handleExport = () => {
    toast.success("Exporting attendance report...");
  };

  const attendanceData = [
    { id: 1, employee: "Sarah Johnson", department: "Engineering", clockIn: "08:55 AM", clockOut: "05:30 PM", hours: "8.58", status: "present" },
    { id: 2, employee: "Michael Chen", department: "Marketing", clockIn: "09:10 AM", clockOut: "05:45 PM", hours: "8.58", status: "present" },
    { id: 3, employee: "Emily Davis", department: "Sales", clockIn: "—", clockOut: "—", hours: "—", status: "absent" },
    { id: 4, employee: "Robert Taylor", department: "HR", clockIn: "09:00 AM", clockOut: "05:35 PM", hours: "8.58", status: "present" },
    { id: 5, employee: "Jennifer Wilson", department: "Engineering", clockIn: "08:45 AM", clockOut: "—", hours: "—", status: "ongoing" },
    { id: 6, employee: "David Brown", department: "Sales", clockIn: "09:20 AM", clockOut: "05:50 PM", hours: "8.50", status: "late" },
    { id: 7, employee: "Lisa Anderson", department: "Marketing", clockIn: "—", clockOut: "—", hours: "—", status: "leave" },
    { id: 8, employee: "James Miller", department: "Operations", clockIn: "09:05 AM", clockOut: "05:40 PM", hours: "8.58", status: "present" },
  ];

  const departmentStats = [
    { department: "Engineering", total: 89, present: 84, absent: 2, leave: 3 },
    { department: "Sales", total: 54, present: 51, absent: 1, leave: 2 },
    { department: "Marketing", total: 32, present: 30, absent: 1, leave: 1 },
    { department: "HR", total: 18, present: 18, absent: 0, leave: 0 },
    { department: "Operations", total: 54, present: 48, absent: 3, leave: 3 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Late</Badge>;
      case 'leave':
        return <Badge variant="secondary">On Leave</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Department Overview */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Department Attendance Overview - Today</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Total Employees</TableHead>
              <TableHead>Present</TableHead>
              <TableHead>Absent</TableHead>
              <TableHead>On Leave</TableHead>
              <TableHead>Attendance Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentStats.map((dept, index) => (
              <TableRow key={index}>
                <TableCell>{dept.department}</TableCell>
                <TableCell>{dept.total}</TableCell>
                <TableCell>{dept.present}</TableCell>
                <TableCell>{dept.absent}</TableCell>
                <TableCell>{dept.leave}</TableCell>
                <TableCell>
                  {((dept.present / dept.total) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Filters and Search */}
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
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Attendance Records Table */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Employee Attendance - Friday, January 3, 2026</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.employee}</TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>{record.clockIn}</TableCell>
                <TableCell>{record.clockOut}</TableCell>
                <TableCell>{record.hours}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}