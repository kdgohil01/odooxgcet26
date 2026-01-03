import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar, Plus, Search } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { useLeaveContext } from "../../context/LeaveContext";
import { useProfileContext } from "../../context/ProfileContext";
import { validateCompleteDateRange, validateDateRange, calculateDaysBetween, getMinDate } from "../../utils/dateValidation";

export function LeaveManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { recentDecisions, addLeaveRequest, leaveRequests } = useLeaveContext();
  const { profile } = useProfileContext();

  // Calculate upcoming leave (approved leaves starting within 10 days)
  const upcomingLeave = recentDecisions.filter(decision => {
    if (decision.status !== 'approved') return false;
    
    // Parse the start date from the dates string (format: "Jan 1, 2024 - Jan 3, 2024")
    const startDateStr = decision.dates.split(' - ')[0];
    const startDate = new Date(startDateStr);
    const today = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(today.getDate() + 10);
    
    // Check if the leave starts within the next 10 days and is in the future
    return startDate >= today && startDate <= tenDaysFromNow;
  }).sort((a, b) => {
    // Sort by start date
    const dateA = new Date(a.dates.split(' - ')[0]);
    const dateB = new Date(b.dates.split(' - ')[0]);
    return dateA.getTime() - dateB.getTime();
  });

  // Handle start date change with validation
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    // If end date is already set and is before new start date, clear it
    if (endDate && value) {
      const validation = validateDateRange(value, endDate);
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        setEndDate("");
      }
    }
  };

  // Handle end date change with validation
  const handleEndDateChange = (value: string) => {
    if (value && startDate) {
      const validation = validateDateRange(startDate, value);
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        return; // Don't update if validation fails
      }
    }
    setEndDate(value);
  };

  // Get employee name from profile
  const employeeName = profile ? `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}` : "John Smith";
  const employeeDepartment = profile ? profile.employmentInfo.department : "Engineering";

  // Calculate dynamic leave balance based on actual usage
  const calculateLeaveBalance = (leaveType: string) => {
    const totalDays = leaveType === 'annual' ? 20 : leaveType === 'sick' ? 10 : 5;
    
    // Count used days ONLY from approved decisions (not pending or rejected)
    const usedDays = recentDecisions
      .filter(decision => 
        decision.employee === employeeName && 
        decision.status === 'approved' &&
        decision.type.toLowerCase() === leaveType
      )
      .reduce((total, decision) => total + decision.days, 0);
    
    // Count pending days for display purposes but don't subtract from available
    const pendingDays = leaveRequests
      .filter(request => 
        request.employee === employeeName && 
        request.type.toLowerCase() === leaveType
      )
      .reduce((total, request) => total + request.days, 0);
    
    // Available days = Total - Used (pending requests don't affect available balance)
    const availableDays = totalDays - usedDays;
    
    return {
      total: totalDays,
      used: usedDays,
      pending: pendingDays,
      available: availableDays
    };
  };

  const handleSubmitLeave = () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate dates using the utility function
    const validation = validateCompleteDateRange(startDate, endDate, {
      allowPastDates: false,
      maxFutureMonths: 6
    });
    
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    // Calculate days using the utility function
    const days = calculateDaysBetween(startDate, endDate);

    // Ensure days is positive
    if (days <= 0) {
      toast.error("Invalid date range selected");
      return;
    }

    // Check if enough days are available
    const balance = calculateLeaveBalance(leaveType);
    if (days > balance.available) {
      toast.error(`Not enough ${leaveType} leave days available. You have ${balance.available} days available (${balance.used} used, ${balance.pending} pending).`);
      return;
    }

    // Format dates
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const dates = `${formatDate(new Date(startDate))}${days > 1 ? ` - ${formatDate(new Date(endDate))}` : ''}`;

    // Add leave request through context
    addLeaveRequest({
      employee: employeeName,
      department: employeeDepartment,
      type: leaveType.charAt(0).toUpperCase() + leaveType.slice(1),
      dates,
      days,
      reason,
      balance: {
        total: balance.total,
        used: balance.used,
        available: balance.available - days
      }
    });

    toast.success("Leave request submitted successfully");
    setIsDialogOpen(false);
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const leaveBalance = [
    { type: "Annual Leave", ...calculateLeaveBalance('annual') },
    { type: "Sick Leave", ...calculateLeaveBalance('sick') },
    { type: "Personal Leave", ...calculateLeaveBalance('personal') },
  ];

  const leaveHistory = recentDecisions.filter(decision => decision.employee === employeeName);
  
  // Get pending leave requests for this employee
  const pendingRequests = leaveRequests.filter(request => request.employee === employeeName);

  // Filter logic for leave history
  const filteredLeaveHistory = leaveHistory.filter(decision => {
    const matchesSearch = decision.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         decision.dates.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || decision.status === statusFilter;
    const matchesType = typeFilter === "all" || decision.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Leave Balance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">Leave Balance - 2026</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Submit a new leave request. Your manager will review and approve.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    min={getMinDate(false)} // Prevent past dates
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={startDate || getMinDate(false)} // Prevent dates before start date
                    disabled={!startDate} // Disable until start date is selected
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea 
                    placeholder="Provide a brief reason for your leave..." 
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitLeave}>
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaveBalance.map((leave, index) => (
            <div key={index} className="p-4 border border-border rounded">
              <p className="text-sm text-muted-foreground">{leave.type}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl text-foreground mt-1">{leave.total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Used</p>
                  <p className="text-xl text-foreground mt-1">{leave.used}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-xl text-foreground mt-1">{leave.pending}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-xl text-primary mt-1">{leave.available}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                *Available = Total - Used (pending requests don't affect balance until approved)
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending Leave Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-foreground">Pending Leave Requests ({pendingRequests.length})</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Badge variant="secondary">{request.type}</Badge>
                  </TableCell>
                  <TableCell>{request.dates}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>{request.appliedOn}</TableCell>
                  <TableCell>
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                      Pending
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Leave History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">Leave History</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leave type or dates..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Decided On</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeaveHistory.length > 0 ? (
              filteredLeaveHistory.map((decision, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="secondary">{decision.type}</Badge>
                  </TableCell>
                  <TableCell>{decision.dates}</TableCell>
                  <TableCell>{decision.days}</TableCell>
                  <TableCell>{decision.decidedOn}</TableCell>
                  <TableCell>{getStatusBadge(decision.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No leave history found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Upcoming Leave */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Upcoming Leave</h3>
        {upcomingLeave.length > 0 ? (
          <div className="space-y-3">
            {upcomingLeave.map((leave, index) => {
              const startDateStr = leave.dates.split(' - ')[0];
              const startDate = new Date(startDateStr);
              const today = new Date();
              const daysUntilLeave = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {leave.type}
                      </Badge>
                      <span className="font-medium text-foreground">{leave.dates}</span>
                      <span className="text-sm text-muted-foreground">({leave.days} days)</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {daysUntilLeave === 0 ? 'Starting today' : 
                       daysUntilLeave === 1 ? 'Starting tomorrow' : 
                       `Starting in ${daysUntilLeave} days`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500 text-white">
                      Approved
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming leave scheduled (next 10 days)</p>
          </div>
        )}
      </Card>
    </div>
  );
}