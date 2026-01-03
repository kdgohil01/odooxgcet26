import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar, Plus } from "lucide-react";
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

export function LeaveManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");

  const handleSubmitLeave = () => {
    if (!leaveType) {
      toast.error("Please select a leave type");
      return;
    }
    toast.success("Leave request submitted successfully");
    setIsDialogOpen(false);
    setLeaveType("");
  };

  const leaveBalance = [
    { type: "Annual Leave", total: 20, used: 8, pending: 0, available: 12 },
    { type: "Sick Leave", total: 10, used: 2, pending: 0, available: 8 },
    { type: "Personal Leave", total: 5, used: 1, pending: 0, available: 4 },
  ];

  const leaveHistory = [
    { id: 1, type: "Annual", dates: "Dec 20-24, 2025", days: 5, status: "approved", appliedOn: "Nov 28, 2025" },
    { id: 2, type: "Sick", dates: "Nov 15, 2025", days: 1, status: "approved", appliedOn: "Nov 15, 2025" },
    { id: 3, type: "Annual", dates: "Oct 10-12, 2025", days: 3, status: "approved", appliedOn: "Sep 22, 2025" },
    { id: 4, type: "Personal", dates: "Sep 5, 2025", days: 1, status: "approved", appliedOn: "Aug 28, 2025" },
  ];

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
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Provide a brief reason for your leave..." rows={3} />
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
            </div>
          ))}
        </div>
      </Card>

      {/* Leave History */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Leave History</h3>
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
            {leaveHistory.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>
                  <Badge variant="secondary">{leave.type}</Badge>
                </TableCell>
                <TableCell>{leave.dates}</TableCell>
                <TableCell>{leave.days}</TableCell>
                <TableCell>{leave.appliedOn}</TableCell>
                <TableCell>{getStatusBadge(leave.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Upcoming Leave */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Upcoming Leave</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No upcoming leave scheduled</p>
        </div>
      </Card>
    </div>
  );
}