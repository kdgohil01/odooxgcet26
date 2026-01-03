import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Clock, Calendar, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useProfileContext } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import {
  getEmployeeAttendanceRecords,
  getAttendanceRecordsByWeek,
  getAttendanceRecordsByMonth,
  checkInEmployee,
  checkOutEmployee,
  getLastCheckIn,
  generateWeeklySummary,
  generateMonthlySummary,
  getWeekDates,
  getWeekNumber,
  addAttendanceEventListener,
  removeAttendanceEventListener,
  calculateHoursWorked,
  hasActiveClockIn,
  cleanupExpiredClockIns,
  type AttendanceRecord,
  type AttendanceStatus,
  initializeSampleAttendanceData
} from "../../utils/attendanceStorage";
import {
  generateAttendanceReportPDF,
  type AttendanceReportData,
  type AttendanceRecordData
} from "../../utils/pdfGenerator";

export function AttendanceView() {
  const { profile } = useProfileContext();
  const { currentUser } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [currentWeekNumber, setCurrentWeekNumber] = useState(getWeekNumber(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<AttendanceRecord[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<{ date: string; checkInTime: string } | null>(null);
  const [currentMonthRecords, setCurrentMonthRecords] = useState<AttendanceRecord[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRestoredSession, setIsRestoredSession] = useState(false);

  // Get employee information from current user or profile
  const employeeId = currentUser?.employeeId || (profile ? `EMP-${profile.personalInfo.firstName.charAt(0)}${profile.personalInfo.lastName.charAt(0)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` : "EMP-001");
  const employeeName = currentUser ? 
    `${currentUser.email.split('@')[0].charAt(0).toUpperCase() + currentUser.email.split('@')[0].slice(1)}` :
    (profile ? `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}` : "John Smith");
  const department = currentUser ? 
    (currentUser.role === 'HR' ? 'Human Resources' : 'General') :
    (profile ? profile.employmentInfo.department : "Engineering");
  const position = currentUser ? 
    (currentUser.role === 'HR' ? 'HR Manager' : 'Employee') :
    (profile ? profile.employmentInfo.position : "Software Developer");

  // Initialize sample data and cleanup expired clock-ins on first load
  useEffect(() => {
    initializeSampleAttendanceData();
    cleanupExpiredClockIns(); // Clean up any expired clock-ins
  }, []);

  // Load attendance data and restore clock-in state
  useEffect(() => {
    const records = getEmployeeAttendanceRecords(employeeId);
    setAttendanceRecords(records);
    
    // Load last check-in status from persistent storage
    const lastCheck = getLastCheckIn(employeeId);
    setLastCheckIn(lastCheck);
    
    // Check if user has active clock-in (more reliable than just last check-in)
    const hasActiveClock = hasActiveClockIn(employeeId);
    const wasClockedIn = hasActiveClock || !!lastCheck;
    setIsClockedIn(wasClockedIn);
    
    // Check if this is a restored session (clocked in from previous session)
    if (wasClockedIn && lastCheck) {
      const today = new Date().toISOString().split('T')[0];
      const isFromToday = lastCheck.date === today;
      const isFromRecentSession = !isFromToday; // If not from today, it's from a previous session
      
      if (isFromRecentSession) {
        setIsRestoredSession(true);
        // Show notification that clock-in was restored
        setTimeout(() => {
          toast.info(`Previous clock-in session restored. You clocked in at ${lastCheck.checkInTime} on ${lastCheck.date}`, {
            duration: 5000
          });
        }, 1000);
      }
    }
    
    // Load current week data
    const weekData = getAttendanceRecordsByWeek(currentWeekNumber, currentYear, employeeId);
    setWeeklyRecords(weekData);
    
    // Load current month data
    const currentMonth = new Date().getMonth() + 1;
    const monthData = getAttendanceRecordsByMonth(currentMonth, currentYear, employeeId);
    setCurrentMonthRecords(monthData);
    
    // Generate monthly summary
    const summary = generateMonthlySummary(currentMonth, currentYear, employeeId);
    setMonthlySummary(summary);
  }, [employeeId, currentWeekNumber, currentYear]);

  // Add event listener for real-time synchronization
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      const records = getEmployeeAttendanceRecords(employeeId);
      setAttendanceRecords(records);
      
      const lastCheck = getLastCheckIn(employeeId);
      setLastCheckIn(lastCheck);
      
      // Check active clock-in state
      const hasActiveClock = hasActiveClockIn(employeeId);
      setIsClockedIn(hasActiveClock || !!lastCheck);
      
      const weekData = getAttendanceRecordsByWeek(currentWeekNumber, currentYear, employeeId);
      setWeeklyRecords(weekData);
      
      const currentMonth = new Date().getMonth() + 1;
      const monthData = getAttendanceRecordsByMonth(currentMonth, currentYear, employeeId);
      setCurrentMonthRecords(monthData);
      
      const summary = generateMonthlySummary(currentMonth, currentYear, employeeId);
      setMonthlySummary(summary);
    };

    addAttendanceEventListener(handleAttendanceUpdate);

    return () => {
      removeAttendanceEventListener(handleAttendanceUpdate);
    };
  }, [employeeId, currentWeekNumber, currentYear]);

  // Real-time clock update when clocked in
  useEffect(() => {
    if (!isClockedIn) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date()); // Force re-render by updating state
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isClockedIn]);

  const handleClockAction = () => {
    if (isClockedIn) {
      // Clock out
      const record = checkOutEmployee(employeeId);
      if (record) {
        toast.success(`Clocked out successfully at ${record.checkOutTime}. Total hours: ${record.totalHours?.toFixed(1) || 0}`);
        setIsClockedIn(false);
        setLastCheckIn(null);
        
        // Refresh data immediately
        const updatedRecords = getEmployeeAttendanceRecords(employeeId);
        setAttendanceRecords(updatedRecords);
        const weekData = getAttendanceRecordsByWeek(currentWeekNumber, currentYear, employeeId);
        setWeeklyRecords(weekData);
        
        // Update monthly data
        const currentMonth = new Date().getMonth() + 1;
        const monthData = getAttendanceRecordsByMonth(currentMonth, currentYear, employeeId);
        setCurrentMonthRecords(monthData);
        const summary = generateMonthlySummary(currentMonth, currentYear, employeeId);
        setMonthlySummary(summary);
      } else {
        toast.error("No active check-in found. Please clock in first.");
      }
    } else {
      // Clock in
      const record = checkInEmployee(employeeId, employeeName, department, position);
      toast.success(`Clocked in successfully at ${record.checkInTime}`);
      setIsClockedIn(true);
      setLastCheckIn({ date: record.date, checkInTime: record.checkInTime || '' });
      
      // Refresh data immediately
      const updatedRecords = getEmployeeAttendanceRecords(employeeId);
      setAttendanceRecords(updatedRecords);
      const weekData = getAttendanceRecordsByWeek(currentWeekNumber, currentYear, employeeId);
      setWeeklyRecords(weekData);
      
      // Update monthly data
      const currentMonth = new Date().getMonth() + 1;
      const monthData = getAttendanceRecordsByMonth(currentMonth, currentYear, employeeId);
      setCurrentMonthRecords(monthData);
      const summary = generateMonthlySummary(currentMonth, currentYear, employeeId);
      setMonthlySummary(summary);
    }
  };

  // Calculate today's hours dynamically
  const getTodayHours = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceRecords.find(r => r.date === today);
    
    if (isClockedIn && todayRecord?.checkInTime) {
      // If currently clocked in, calculate hours up to now
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      return calculateHoursWorked(todayRecord.checkInTime, currentTime);
    }
    
    return todayRecord?.totalHours || 0;
  };

  // Format hours display
  const formatHours = (hours: number) => {
    if (hours <= 0) return '0h 0m';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours % 1) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Get current time for display
  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleExport = () => {
    try {
      // Convert attendance records to PDF format
      const attendanceRecordData: AttendanceRecordData[] = weeklyRecords.map(record => ({
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
        totalDays: weeklyRecords.length,
        presentDays: weeklyRecords.filter(r => r.status === 'Present').length,
        absentDays: weeklyRecords.filter(r => r.status === 'Absent').length,
        halfDays: weeklyRecords.filter(r => r.status === 'Half-day').length,
        leaveDays: weeklyRecords.filter(r => r.status === 'Leave').length,
        totalHours: weeklyRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0),
        averageHours: weeklyRecords.length > 0 ? weeklyRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0) / weeklyRecords.length : 0,
        attendanceRate: weeklyRecords.length > 0 ? Math.round((weeklyRecords.filter(r => r.status === 'Present').length / weeklyRecords.length) * 100) : 0
      };

      const reportData: AttendanceReportData = {
        reportPeriod: weekRange,
        reportType: 'weekly',
        employeeName,
        employeeId,
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

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, "default" | "secondary" | "destructive" | "outline"> = {
      'Present': 'default',
      'Absent': 'destructive',
      'Half-day': 'secondary',
      'Leave': 'outline'
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // Calculate today's hours dynamically
  const todayHours = getTodayHours();
  const todayHoursDisplay = formatHours(todayHours);

  // Get week date range
  const { startDate: weekStart, endDate: weekEnd } = getWeekDates(currentWeekNumber, currentYear);
  const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Filter weekly records
  const filteredWeeklyRecords = weeklyRecords.filter(record =>
    record.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate monthly stats
  const monthlyStats = monthlySummary ? [
    { label: "Total Working Days", value: monthlySummary.totalDays.toString() },
    { label: "Days Present", value: monthlySummary.presentDays.toString() },
    { label: "Days Absent", value: monthlySummary.absentDays.toString() },
    { label: "Total Hours", value: monthlySummary.totalHours.toFixed(1) },
    { label: "Avg. Hours/Day", value: monthlySummary.averageHours.toFixed(1) },
    { label: "Half Days", value: monthlySummary.halfDays.toString() },
  ] : [
    { label: "Total Working Days", value: "0" },
    { label: "Days Present", value: "0" },
    { label: "Days Absent", value: "0" },
    { label: "Total Hours", value: "0" },
    { label: "Avg. Hours/Day", value: "0" },
    { label: "Half Days", value: "0" },
  ];

  // Generate historical data
  const historicalData = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const summary = generateMonthlySummary(month, year, employeeId);
    
    if (summary) {
      const attendanceRate = summary.totalDays > 0 ? Math.round((summary.presentDays / summary.totalDays) * 100) : 0;
      historicalData.push({
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        days: `${summary.presentDays}/${summary.totalDays}`,
        hours: summary.totalHours.toFixed(1),
        attendance: `${attendanceRate}%`
      });
    }
  }

  // Filter historical data
  const filteredHistoricalData = historicalData.filter(month => {
    const matchesSearch = month.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         month.days.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         month.hours.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         month.attendance.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (monthFilter === "all") return matchesSearch;
    if (monthFilter === "excellent") return matchesSearch && parseInt(month.attendance) >= 95;
    if (monthFilter === "good") return matchesSearch && parseInt(month.attendance) >= 85 && parseInt(month.attendance) < 95;
    if (monthFilter === "poor") return matchesSearch && parseInt(month.attendance) < 85;
    
    return matchesSearch;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Clock In/Out Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground">Today's Attendance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isClockedIn ? "default" : "secondary"}>
                {isClockedIn ? "Clocked In" : "Not Clocked In"}
              </Badge>
              {isClockedIn && (
                <span className="text-sm text-muted-foreground">
                  Since {lastCheckIn?.checkInTime || '--:--'}
                  {isRestoredSession && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Restored from previous session
                    </Badge>
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Clock In</p>
              <p className="text-xl text-foreground">{lastCheckIn?.checkInTime || '--:--'}</p>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Hours Today</p>
              <p className="text-xl text-foreground font-semibold">{todayHoursDisplay}</p>
              {isClockedIn && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {getCurrentTime()}
                </p>
              )}
            </div>
            <Button 
              className="ml-4" 
              onClick={handleClockAction}
              variant={isClockedIn ? "destructive" : "default"}
              size="lg"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Monthly Stats */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {monthlyStats.map((stat, index) => (
            <div key={index}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Attendance Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-foreground">Week {currentWeekNumber} ({weekRange})</h3>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search attendance..."
                className="pl-10 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWeeklyRecords.length > 0 ? (
              filteredWeeklyRecords.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
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
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No attendance records found for this week
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Historical Data */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">Historical Attendance</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="pl-10 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="excellent">Excellent (95%+)</SelectItem>
                <SelectItem value="good">Good (85-94%)</SelectItem>
                <SelectItem value="poor">Poor (&lt;85%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Days Present/Total</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Attendance Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistoricalData.length > 0 ? (
              filteredHistoricalData.map((month, index) => (
                <TableRow key={index}>
                  <TableCell>{month.month}</TableCell>
                  <TableCell>{month.days}</TableCell>
                  <TableCell>{month.hours}</TableCell>
                  <TableCell>
                    <Badge variant={
                      parseInt(month.attendance) >= 95 ? 'default' :
                      parseInt(month.attendance) >= 85 ? 'secondary' : 'destructive'
                    }>
                      {month.attendance}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No historical data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}