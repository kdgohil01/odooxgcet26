import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, Calendar, DollarSign, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

interface EmployeeDashboardProps {
  onNavigate: (view: string) => void;
}

export function EmployeeDashboard({ onNavigate }: EmployeeDashboardProps) {
  const stats = [
    {
      label: "Hours This Week",
      value: "38.5",
      icon: Clock,
      subtitle: "Out of 40 hours",
      trend: "+2.5 from last week"
    },
    {
      label: "Leave Balance",
      value: "12",
      icon: Calendar,
      subtitle: "Days remaining",
      trend: "5 days pending approval"
    },
    {
      label: "Last Payroll",
      value: "$4,850",
      icon: DollarSign,
      subtitle: "Paid on Dec 28, 2025",
      trend: "Next payment: Jan 15, 2026"
    },
  ];

  const recentActivity = [
    { date: "2026-01-02", action: "Clock In", time: "09:02 AM", status: "completed" },
    { date: "2026-01-02", action: "Clock Out", time: "05:45 PM", status: "completed" },
    { date: "2025-12-30", action: "Leave Applied", time: "Feb 10-12, 2026", status: "pending" },
    { date: "2025-12-28", action: "Payroll Processed", time: "$4,850", status: "completed" },
  ];

  const upcomingEvents = [
    { date: "Jan 15", title: "Next Payroll", type: "payroll" },
    { date: "Feb 10-12", title: "Annual Leave (Pending)", type: "leave" },
    { date: "Mar 1", title: "Performance Review", type: "review" },
  ];

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
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  <p className="text-xs text-primary mt-2">{stat.trend}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="mb-4 text-foreground">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  {activity.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{activity.time}</p>
                  {activity.status === 'pending' && (
                    <Badge variant="secondary" className="mt-1">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <h3 className="mb-4 text-foreground">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-4 py-3 border-b border-border last:border-0">
                <div className="w-16 text-center">
                  <p className="text-xs text-muted-foreground">
                    {event.date.split(' ')[0]}
                  </p>
                  <p className="text-sm text-foreground">
                    {event.date.includes('-') ? event.date.split('-')[1] : event.date.split(' ')[1] || ''}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{event.title}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {event.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

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