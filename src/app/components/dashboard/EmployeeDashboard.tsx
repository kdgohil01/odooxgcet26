import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, Calendar, DollarSign, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getEmployeeProfile } from "../../utils/profileStorage";
import { getEmployeePayroll } from "../../utils/payrollStorage";
import { getEmployeeAttendanceRecords } from "../../utils/attendanceStorage";
import { getLeaveData } from "../../utils/leaveStorage";
import { type EnhancedPayrollRecord } from "../../utils/payrollStorage";

interface EmployeeDashboardProps {
  onNavigate: (view: string) => void;
}

interface Stat {
  label: string;
  value: string;
  icon: any;
  subtitle?: string;
  trend: string;
}

interface AttendanceRecord {
  date: string;
  totalHours?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
}

interface LeaveRequest {
  employee: string;
  status: string;
  days: number;
  dates: string;
  type: string;
}

interface PayrollData {
  paymentDate: string;
  net: number;
}

export function EmployeeDashboard({ onNavigate }: EmployeeDashboardProps) {
  const [stats, setStats] = useState<Stat[]>([
    {
      label: "Hours This Week",
      value: "0",
      icon: Clock,
      subtitle: "Out of 40 hours",
      trend: "0 from last week"
    },
    {
      label: "Leave Balance",
      value: "0",
      icon: Calendar,
      subtitle: "Days remaining",
      trend: "No pending requests"
    },
    {
      label: "Last Payroll",
      value: "$0",
      icon: DollarSign,
      subtitle: "Not available",
      trend: "No payroll data"
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  // Load dynamic data for employee dashboard
  useEffect(() => {
    try {
      // Get employee profile
      const profile = getEmployeeProfile();
      
      // Get employee payroll data
      const payrollData: EnhancedPayrollRecord | null = getEmployeePayroll(profile?.employmentInfo?.employeeId || '');
      const lastPayroll: EnhancedPayrollRecord | null = payrollData;
      
      // Get attendance records
      const attendanceRecords: AttendanceRecord[] = getEmployeeAttendanceRecords(profile?.employmentInfo?.employeeId || '');
      
      // Get leave data
      const leaveData = getLeaveData();
      const employeeLeaveRequests: LeaveRequest[] = leaveData.leaveRequests.filter(request => 
        request.employee === `${profile?.personalInfo?.firstName || ''} ${profile?.personalInfo?.lastName || ''}`
      );

      // Calculate hours this week
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() + (6 - today.getDay())));
      
      const weekAttendance = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate <= weekEnd;
      });
      
      const totalHoursThisWeek = weekAttendance.reduce((sum, record) => sum + (record.totalHours || 0), 0);
      const hoursLastWeek = 40; // Standard 40-hour work week
      
      // Calculate leave balance
      const totalLeaveDays = 20; // Standard annual leave
      const usedLeaveDays = employeeLeaveRequests
        .filter(request => request.status === 'approved')
        .reduce((sum, request) => sum + request.days, 0);
      const pendingLeaveDays = employeeLeaveRequests
        .filter(request => request.status === 'pending')
        .reduce((sum, request) => sum + request.days, 0);
      const leaveBalance = totalLeaveDays - usedLeaveDays;
      
      // Update stats
      setStats([
        {
          label: "Hours This Week",
          value: totalHoursThisWeek.toFixed(1),
          icon: Clock,
          subtitle: `Out of ${hoursLastWeek} hours`,
          trend: totalHoursThisWeek > hoursLastWeek ? `+${(totalHoursThisWeek - hoursLastWeek).toFixed(1)} from last week` : `${(totalHoursThisWeek - hoursLastWeek).toFixed(1)} from last week`
        },
        {
          label: "Leave Balance",
          value: leaveBalance.toString(),
          icon: Calendar,
          subtitle: "Days remaining",
          trend: pendingLeaveDays > 0 ? `${pendingLeaveDays} days pending approval` : "No pending requests"
        },
        {
          label: "Last Payroll",
          value: lastPayroll ? `$${lastPayroll.net.toLocaleString()}` : "$0",
          icon: DollarSign,
          subtitle: lastPayroll ? `Paid on ${lastPayroll.paymentDate || 'N/A'}` : "Not available",
          trend: lastPayroll ? `Next payment: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : "No payroll data"
        },
      ]);

      // Set recent activity from attendance
      const activity = attendanceRecords.slice(-5).map(record => ({
        date: record.date,
        action: record.checkInTime ? "Clock In" : record.checkOutTime ? "Clock Out" : "No Activity",
        time: record.checkInTime || record.checkOutTime || "N/A",
        status: "completed"
      }));
      setRecentActivity(activity);

      // Set upcoming events
      const events = [];
      
      // Add next payroll date if available
      if (lastPayroll && lastPayroll.paymentDate) {
        const nextPayrollDate = new Date(lastPayroll.paymentDate);
        nextPayrollDate.setMonth(nextPayrollDate.getMonth() + 1);
        
        events.push({
          date: nextPayrollDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          title: "Next Payroll",
          type: "payroll"
        });
      }
      
      // Add pending leave requests
      employeeLeaveRequests
        .filter(request => request.status === 'pending')
        .forEach(request => {
          events.push({
            date: request.dates,
            title: `${request.type} Leave (Pending)`,
            type: "leave"
          });
        });
      
      // Add performance review (assuming annual review)
      const currentMonth = new Date().getMonth();
      const reviewMonth = (currentMonth + 3) % 12; // Review 3 months from now
      const reviewDate = new Date(new Date().getFullYear(), reviewMonth, 15);
      
      events.push({
        date: reviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        title: "Performance Review",
        type: "review"
      });
      
      setUpcomingEvents(events.slice(0, 3)); // Show only next 3 events
    } catch (error) {
      console.error('Error loading employee dashboard data:', error);
    }
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl mt-2 text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend.startsWith('+') && <TrendingUp className="w-3 h-3 text-primary" />}
                    {stat.trend.startsWith('-') && <TrendingUp className="w-3 h-3 text-destructive" />}
                    {!stat.trend.startsWith('+') && !stat.trend.startsWith('-') && <CheckCircle2 className="w-3 h-3 text-muted-foreground" />}
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.date} at {activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No recent activity</p>
          )}
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Upcoming Events</h3>
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {event.type === 'payroll' && <DollarSign className="w-5 h-5" />}
                    {event.type === 'leave' && <Calendar className="w-5 h-5" />}
                    {event.type === 'review' && <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No upcoming events</p>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onNavigate('leave')}>Apply for Leave</Button>
          <Button variant="outline" onClick={() => onNavigate('attendance')}>View Attendance</Button>
          <Button variant="outline" onClick={() => onNavigate('payroll')}>Download Payslip</Button>
          <Button variant="outline" onClick={() => onNavigate('profile')}>Update Profile</Button>
        </div>
      </Card>
    </div>
  );
}