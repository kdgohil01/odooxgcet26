import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Download, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  getAllAttendanceRecords,
  getAttendanceRecordsByWeek,
  getAttendanceRecordsByMonth,
  getLatestAttendanceRecords,
  getWeekDates,
  getWeekNumber,
  addAttendanceEventListener,
  removeAttendanceEventListener,
  type AttendanceRecord,
  type AttendanceStatus,
  initializeSampleAttendanceData
} from "../../utils/attendanceStorage";
import {
  generateAttendanceReportPDF,
  generateDepartmentAttendancePDF,
  type AttendanceReportData,
  type AttendanceRecordData,
  type DepartmentAttendanceData
} from "../../utils/pdfGenerator";

export function AdminAttendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentWeekNumber, setCurrentWeekNumber] = useState(getWeekNumber(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<AttendanceRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleAttendanceData();
  }, []);

  // Load attendance data (only latest clock-in per employee)
  useEffect(() => {
    const records = getLatestAttendanceRecords(); // Use only latest records
    setAttendanceRecords(records);
    
    // Load current week data (still use all records for weekly view)
    const weekData = getAttendanceRecordsByWeek(currentWeekNumber, currentYear);
    setWeeklyRecords(weekData);
    
    // Load current month data (still use all records for monthly view)
    const monthData = getAttendanceRecordsByMonth(currentMonth, currentYear);
    setMonthlyRecords(monthData);
  }, [currentWeekNumber, currentYear, currentMonth]);

  // Add event listener for real-time synchronization
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      const records = getLatestAttendanceRecords(); // Use only latest records
      setAttendanceRecords(records);
      
      const weekData = getAttendanceRecordsByWeek(currentWeekNumber, currentYear);
      setWeeklyRecords(weekData);
      
      const monthData = getAttendanceRecordsByMonth(currentMonth, currentYear);
      setMonthlyRecords(monthData);
    };

    addAttendanceEventListener(handleAttendanceUpdate);

    return () => {
      removeAttendanceEventListener(handleAttendanceUpdate);
    };
  }, [currentWeekNumber, currentYear, currentMonth]);

  const handleExport = () => {
    try {
      const recordsToExport = viewMode === 'week' ? weeklyRecords : monthlyRecords;
      
      // Convert attendance records to PDF format
      const attendanceRecordData: AttendanceRecordData[] = recordsToExport.map(record => ({
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        department: record.department,
        position: record.position,
        date: record.date,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        totalHours: record.totalHours,
        status: record.status
      }));

      // Calculate summary statistics
      const summary = {
        totalDays: recordsToExport.length,
        presentDays: recordsToExport.filter(r => r.status === 'Present').length,
        absentDays: recordsToExport.filter(r => r.status === 'Absent').length,
        halfDays: recordsToExport.filter(r => r.status === 'Half-day').length,
        leaveDays: recordsToExport.filter(r => r.status === 'Leave').length,
        totalHours: recordsToExport.reduce((sum, r) => sum + (r.totalHours || 0), 0),
        averageHours: recordsToExport.length > 0 ? recordsToExport.reduce((sum, r) => sum + (r.totalHours || 0), 0) / recordsToExport.length : 0,
        attendanceRate: recordsToExport.length > 0 ? Math.round((recordsToExport.filter(r => r.status === 'Present').length / recordsToExport.length) * 100) : 0
      };

      const reportData: AttendanceReportData = {
        reportPeriod: viewMode === 'week' ? weekRange : 
          new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        reportType: viewMode === 'week' ? 'weekly' : 'monthly',
        records: attendanceRecordData,
        summary,
        generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      generateAttendanceReportPDF(reportData);
      toast.success("Attendance report exported successfully as PDF");
    } catch (error) {
      toast.error("Failed to export attendance report");
    }
  };

  const handleDepartmentExport = () => {
    try {
      const departmentData: DepartmentAttendanceData = {
        reportPeriod: viewMode === 'week' ? weekRange : 
          new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        departmentStats: departmentStats.map(dept => ({
          department: dept.department,
          totalEmployees: dept.employees,
          presentCount: dept.presentCount,
          absentCount: dept.totalCount - dept.presentCount - Math.round(dept.totalCount * 0.05),
          leaveCount: Math.round(dept.totalCount * 0.05),
          attendanceRate: dept.attendanceRate
        })),
        generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      generateDepartmentAttendancePDF(departmentData);
      toast.success("Department attendance report exported successfully as PDF");
    } catch (error) {
      toast.error("Failed to export department attendance report");
    }
  };

  const handlePreviousWeek = () => {
    if (currentWeekNumber > 1) {
      setCurrentWeekNumber(currentWeekNumber - 1);
    } else {
      setCurrentWeekNumber(52); // Go to last week of previous year
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekNumber < 52) {
      setCurrentWeekNumber(currentWeekNumber + 1);
    } else {
      setCurrentWeekNumber(1); // Go to first week of next year
      setCurrentYear(currentYear + 1);
    }
  };

  const handleCurrentWeek = () => {
    setCurrentWeekNumber(getWeekNumber(new Date()));
    setCurrentYear(new Date().getFullYear());
  };

  const handlePreviousMonth = () => {
    if (currentMonth > 1) {
      setCurrentMonth(currentMonth - 1);
    } else {
      setCurrentMonth(12); // Go to December of previous year
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth < 12) {
      setCurrentMonth(currentMonth + 1);
    } else {
      setCurrentMonth(1); // Go to January of next year
      setCurrentYear(currentYear + 1);
    }
  };

  const handleCurrentMonth = () => {
    setCurrentMonth(new Date().getMonth() + 1);
    setCurrentYear(new Date().getFullYear());
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, "default" | "secondary" | "destructive" | "outline"> = {
      'Present': 'default',
      'Absent': 'destructive',
      'Half-day': 'secondary',
      'Leave': 'outline'
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // Get week date range
  const { startDate: weekStart, endDate: weekEnd } = getWeekDates(currentWeekNumber, currentYear);
  const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Filter records based on current view
  const currentRecords = viewMode === 'week' ? weeklyRecords : monthlyRecords;

  // Filter logic for attendance data
  const filteredAttendanceData = currentRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || 
                             record.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(attendanceRecords.map(r => r.department)));

  // Calculate department-wise statistics
  const departmentStats = departments.map(dept => {
    const deptRecords = attendanceRecords.filter(r => r.department === dept);
    const presentCount = deptRecords.filter(r => r.status === 'Present').length;
    const totalCount = deptRecords.length;
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    
    return {
      department: dept,
      employees: new Set(deptRecords.map(r => r.employeeId)).size,
      presentCount,
      totalCount,
      attendanceRate
    };
  }).sort((a, b) => b.employees - a.employees);

  return (
    <div className="p-8 space-y-6">
      {/* Department Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">Department Attendance Overview - Today</h3>
          <Button variant="outline" size="sm" onClick={handleDepartmentExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Department Report
          </Button>
        </div>
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
                <TableCell>{dept.employees}</TableCell>
                <TableCell>{dept.presentCount}</TableCell>
                <TableCell>{dept.totalCount - dept.presentCount - (dept.totalCount * 0.05)}</TableCell>
                <TableCell>{Math.round(dept.totalCount * 0.05)}</TableCell>
                <TableCell>
                  <Badge variant={dept.attendanceRate >= 95 ? 'default' : dept.attendanceRate >= 85 ? 'secondary' : 'destructive'}>
                    {dept.attendanceRate}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Attendance Records */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-foreground">
              {viewMode === 'week' ? `Week ${currentWeekNumber} (${weekRange})` : 
               `${new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            </h3>
            <div className="flex gap-1">
              {viewMode === 'week' && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextWeek}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              {viewMode === 'month' && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCurrentMonth}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-10 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[140px]">
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
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Half-day">Half-day</SelectItem>
                <SelectItem value="Leave">Leave</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendanceData.length > 0 ? (
              filteredAttendanceData.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell>{record.checkInTime || '--:--'}</TableCell>
                  <TableCell>{record.checkOutTime || '--:--'}</TableCell>
                  <TableCell>
                    {record.totalHours ? `${Math.floor(record.totalHours)}h ${Math.round((record.totalHours % 1) * 60)}m` : '--'}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No attendance records found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}