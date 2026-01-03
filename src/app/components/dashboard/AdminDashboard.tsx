import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Users, Clock, Calendar, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState, useEffect } from "react";
import { getEmployees } from "../../utils/employeeStorage";
import { getLeaveData } from "../../utils/leaveStorage";
import { getAllAttendanceRecords } from "../../utils/attendanceStorage";
import { calculatePayrollSummary } from "../../utils/payrollStorage";

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState([
    {
      label: "Total Employees",
      value: "0",
      icon: Users,
      change: "+0 this month",
      trend: "up"
    },
    {
      label: "Present Today",
      value: "0",
      icon: Clock,
      change: "0% attendance",
      trend: "up"
    },
    {
      label: "Pending Leave Requests",
      value: "0",
      icon: Calendar,
      change: "Requires attention",
      trend: "neutral"
    },
    {
      label: "Payroll Due",
      value: "$0",
      icon: TrendingUp,
      change: "Processing",
      trend: "neutral"
    },
  ]);

  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<any[]>([]);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [departmentOverview, setDepartmentOverview] = useState<any[]>([]);

  // Load all dynamic data
  useEffect(() => {
    // Get employees
    const employees = getEmployees();
    
    // Get attendance records
    const attendanceRecords = getAllAttendanceRecords();
    const today = new Date().toISOString().split('T')[0];
    const presentToday = attendanceRecords.filter(record => 
      record.date === today && record.status === 'Present'
    ).length;
    
    // Get leave requests
    const leaveData = getLeaveData();
    const pendingLeaves = leaveData.leaveRequests.filter(request => 
      request.status === 'pending'
    );
    
    // Get payroll summary
    const payrollSummary = calculatePayrollSummary();
    
    // Calculate new hires this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newHires = employees.filter(emp => {
      const joinDate = new Date(emp.joinDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    });

    // Update stats
    setStats([
      {
        label: "Total Employees",
        value: employees.length.toString(),
        icon: Users,
        change: `+${newHires.length} this month`,
        trend: newHires.length > 0 ? "up" : "neutral"
      },
      {
        label: "Present Today",
        value: presentToday.toString(),
        icon: Clock,
        change: `${employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 0}% attendance`,
        trend: "up"
      },
      {
        label: "Pending Leave Requests",
        value: pendingLeaves.length.toString(),
        icon: Calendar,
        change: pendingLeaves.length > 0 ? "Requires attention" : "All clear",
        trend: pendingLeaves.length > 0 ? "neutral" : "up"
      },
      {
        label: "Payroll Due",
        value: `$${Math.round(payrollSummary.totalNetPayroll / 1000)}K`,
        icon: TrendingUp,
        change: `Processing ${payrollSummary.processingDate}`,
        trend: "neutral"
      },
    ]);

    // Set pending leave requests
    setPendingLeaveRequests(pendingLeaves.slice(0, 5)); // Show only first 5

    // Set recent employees (new hires)
    setRecentEmployees(newHires.slice(0, 3).map(emp => ({
      name: emp.name,
      department: emp.department,
      joined: emp.joinDate,
      status: "Active"
    })));

    // Calculate department overview
    const deptMap = new Map();
    employees.forEach(emp => {
      if (!deptMap.has(emp.department)) {
        deptMap.set(emp.department, { total: 0, present: 0 });
      }
      const dept = deptMap.get(emp.department);
      dept.total++;
    });

    // Calculate attendance per department
    attendanceRecords.forEach(record => {
      if (record.date === today && deptMap.has(record.department)) {
        const dept = deptMap.get(record.department);
        if (record.status === 'Present') {
          dept.present++;
        }
      }
    });

    const deptOverview = Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      count: data.total,
      attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));

    setDepartmentOverview(deptOverview);
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl mt-2 text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-primary" />}
                    {stat.trend === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
                    {stat.trend === 'neutral' && <AlertCircle className="w-3 h-3 text-muted-foreground" />}
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pending Leave Requests Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">Pending Leave Requests</h3>
          <Button variant="outline" size="sm" onClick={() => onNavigate('admin-leave')}>View All</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingLeaveRequests.length > 0 ? (
              pendingLeaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.employee}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{request.dates}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{request.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onNavigate('admin-leave')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => onNavigate('admin-leave')}>Reject</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No pending leave requests
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <Card className="p-6">
          <h3 className="mb-4 text-foreground">Recent Hires</h3>
          <div className="space-y-4">
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{employee.joined}</p>
                    <Badge variant="secondary" className="mt-1">{employee.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No recent hires</p>
            )}
          </div>
        </Card>

        {/* Department Overview */}
        <Card className="p-6">
          <h3 className="mb-4 text-foreground">Department Overview</h3>
          <div className="space-y-4">
            {departmentOverview.length > 0 ? (
              departmentOverview.map((dept, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm text-foreground">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.count} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{dept.attendance}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No department data available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}