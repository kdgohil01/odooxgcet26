import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Clock, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import { toast } from "sonner";

export function AttendanceView() {
  const [isClockedIn, setIsClockedIn] = useState(true);

  const handleClockAction = () => {
    if (isClockedIn) {
      toast.success("Clocked out successfully at " + new Date().toLocaleTimeString());
      setIsClockedIn(false);
    } else {
      toast.success("Clocked in successfully at " + new Date().toLocaleTimeString());
      setIsClockedIn(true);
    }
  };

  const handleExport = () => {
    toast.success("Exporting attendance report...");
  };

  const handleSelectWeek = () => {
    toast.info("Week selector opened");
  };

  const currentWeekData = [
    { date: "Mon, Jan 29", clockIn: "09:02 AM", clockOut: "05:45 PM", hours: "8.72", status: "present" },
    { date: "Tue, Jan 30", clockIn: "08:58 AM", clockOut: "05:30 PM", hours: "8.53", status: "present" },
    { date: "Wed, Jan 31", clockIn: "09:15 AM", clockOut: "06:00 PM", hours: "8.75", status: "present" },
    { date: "Thu, Feb 1", clockIn: "09:00 AM", clockOut: "05:35 PM", hours: "8.58", status: "present" },
    { date: "Fri, Feb 2", clockIn: "09:05 AM", clockOut: "—", hours: "—", status: "ongoing" },
  ];

  const monthlyStats = [
    { label: "Total Working Days", value: "21" },
    { label: "Days Present", value: "20" },
    { label: "Days Absent", value: "1" },
    { label: "Total Hours", value: "162.5" },
    { label: "Avg. Hours/Day", value: "8.13" },
    { label: "Late Arrivals", value: "2" },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Clock In/Out Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground">Today's Attendance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Friday, January 3, 2026
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Clock In</p>
              <p className="text-xl text-foreground">09:05 AM</p>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Hours Today</p>
              <p className="text-xl text-foreground">4:28</p>
            </div>
            <Button className="ml-4" onClick={handleClockAction}>
              <Clock className="w-4 h-4 mr-2" />
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Monthly Stats */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">January 2026 Summary</h3>
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
          <h3 className="text-foreground">This Week</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectWeek}>
              <Calendar className="w-4 h-4 mr-2" />
              Select Week
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>Export</Button>
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
            {currentWeekData.map((day, index) => (
              <TableRow key={index}>
                <TableCell>{day.date}</TableCell>
                <TableCell>{day.clockIn}</TableCell>
                <TableCell>{day.clockOut}</TableCell>
                <TableCell>{day.hours}</TableCell>
                <TableCell>
                  {day.status === 'present' && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      Present
                    </Badge>
                  )}
                  {day.status === 'ongoing' && (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      In Progress
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Historical Data */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Attendance History</h3>
        <div className="space-y-2">
          {[
            { month: "December 2025", days: "22/22", hours: "176.5", attendance: "100%" },
            { month: "November 2025", days: "20/21", hours: "162.0", attendance: "95%" },
            { month: "October 2025", days: "21/21", hours: "168.5", attendance: "100%" },
          ].map((month, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded">
              <div>
                <p className="text-sm text-foreground">{month.month}</p>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Days</p>
                  <p className="text-sm text-foreground">{month.days}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Hours</p>
                  <p className="text-sm text-foreground">{month.hours}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Attendance</p>
                  <p className="text-sm text-foreground">{month.attendance}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}