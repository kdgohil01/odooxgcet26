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

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const stats = [
    {
      label: "Total Employees",
      value: "247",
      icon: Users,
      change: "+12 this month",
      trend: "up"
    },
    {
      label: "Present Today",
      value: "231",
      icon: Clock,
      change: "93.5% attendance",
      trend: "up"
    },
    {
      label: "Pending Leave Requests",
      value: "8",
      icon: Calendar,
      change: "Requires attention",
      trend: "neutral"
    },
    {
      label: "Payroll Due",
      value: "$589K",
      icon: TrendingUp,
      change: "Processing Jan 15",
      trend: "neutral"
    },
  ];

  const pendingLeaveRequests = [
    { id: 1, employee: "Sarah Johnson", department: "Engineering", dates: "Jan 10-12, 2026", days: 3, type: "Annual" },
    { id: 2, employee: "Michael Chen", department: "Marketing", dates: "Jan 15, 2026", days: 1, type: "Sick" },
    { id: 3, employee: "Emily Davis", department: "Sales", dates: "Feb 1-5, 2026", days: 5, type: "Annual" },
    { id: 4, employee: "Robert Taylor", department: "HR", dates: "Jan 20, 2026", days: 1, type: "Personal" },
  ];

  const recentEmployees = [
    { name: "Jennifer Wilson", department: "Engineering", joined: "Jan 2, 2026", status: "Active" },
    { name: "David Brown", department: "Sales", joined: "Dec 28, 2025", status: "Active" },
    { name: "Lisa Anderson", department: "Marketing", joined: "Dec 20, 2025", status: "Active" },
  ];

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
            {pendingLeaveRequests.map((request) => (
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
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <Card className="p-6">
          <h3 className="mb-4 text-foreground">Recent Hires</h3>
          <div className="space-y-4">
            {recentEmployees.map((employee, index) => (
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
            ))}
          </div>
        </Card>

        {/* Department Overview */}
        <Card className="p-6">
          <h3 className="mb-4 text-foreground">Department Overview</h3>
          <div className="space-y-4">
            {[
              { name: "Engineering", count: 89, attendance: "95%" },
              { name: "Sales", count: 54, attendance: "91%" },
              { name: "Marketing", count: 32, attendance: "94%" },
              { name: "HR", count: 18, attendance: "100%" },
              { name: "Operations", count: 54, attendance: "88%" },
            ].map((dept, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-foreground">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">{dept.count} employees</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{dept.attendance}</p>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}