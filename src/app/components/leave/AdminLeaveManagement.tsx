import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Search, Filter } from "lucide-react";
import { Input } from "../ui/input";
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
} from "../ui/dialog";
import { toast } from "sonner";

export function AdminLeaveManagement() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminComment, setAdminComment] = useState("");

  const handleApprove = () => {
    toast.success(`Leave request for ${selectedRequest?.employee} approved`);
    setSelectedRequest(null);
    setAdminComment("");
  };

  const handleReject = () => {
    toast.error(`Leave request for ${selectedRequest?.employee} rejected`);
    setSelectedRequest(null);
    setAdminComment("");
  };

  const leaveRequests = [
    { 
      id: 1, 
      employee: "Sarah Johnson", 
      department: "Engineering", 
      type: "Annual", 
      dates: "Jan 10-12, 2026", 
      days: 3, 
      status: "pending",
      appliedOn: "Dec 28, 2025",
      reason: "Family vacation planned for new year",
      balance: { total: 20, used: 5, available: 15 }
    },
    { 
      id: 2, 
      employee: "Michael Chen", 
      department: "Marketing", 
      type: "Sick", 
      dates: "Jan 15, 2026", 
      days: 1, 
      status: "pending",
      appliedOn: "Jan 2, 2026",
      reason: "Medical appointment",
      balance: { total: 10, used: 1, available: 9 }
    },
    { 
      id: 3, 
      employee: "Emily Davis", 
      department: "Sales", 
      type: "Annual", 
      dates: "Feb 1-5, 2026", 
      days: 5, 
      status: "pending",
      appliedOn: "Dec 20, 2025",
      reason: "Attending wedding out of state",
      balance: { total: 20, used: 8, available: 12 }
    },
    { 
      id: 4, 
      employee: "Robert Taylor", 
      department: "HR", 
      type: "Personal", 
      dates: "Jan 20, 2026", 
      days: 1, 
      status: "pending",
      appliedOn: "Jan 1, 2026",
      reason: "Personal matters to attend to",
      balance: { total: 5, used: 0, available: 5 }
    },
  ];

  const recentDecisions = [
    { employee: "Jennifer Wilson", type: "Annual", dates: "Dec 20-24, 2025", days: 5, status: "approved", decidedOn: "Dec 1, 2025" },
    { employee: "David Brown", type: "Sick", dates: "Dec 15, 2025", days: 1, status: "approved", decidedOn: "Dec 15, 2025" },
    { employee: "Lisa Anderson", type: "Personal", dates: "Jan 8, 2026", days: 1, status: "rejected", decidedOn: "Dec 30, 2025" },
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
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Pending Requests</p>
          <p className="text-3xl text-foreground mt-2">8</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Approved This Month</p>
          <p className="text-3xl text-foreground mt-2">24</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Rejected This Month</p>
          <p className="text-3xl text-foreground mt-2">3</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">On Leave Today</p>
          <p className="text-3xl text-foreground mt-2">12</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
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
            </SelectContent>
          </Select>
          <Select defaultValue="pending">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Pending Leave Requests */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Pending Leave Requests</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employee}</TableCell>
                <TableCell>{request.department}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{request.type}</Badge>
                </TableCell>
                <TableCell>{request.dates}</TableCell>
                <TableCell>{request.days}</TableCell>
                <TableCell>{request.appliedOn}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Review
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Decisions */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Recent Decisions</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Decided On</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDecisions.map((decision, index) => (
              <TableRow key={index}>
                <TableCell>{decision.employee}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{decision.type}</Badge>
                </TableCell>
                <TableCell>{decision.dates}</TableCell>
                <TableCell>{decision.days}</TableCell>
                <TableCell>{decision.decidedOn}</TableCell>
                <TableCell>{getStatusBadge(decision.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this leave request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="text-foreground mt-1">{selectedRequest.employee}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="text-foreground mt-1">{selectedRequest.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <p className="text-foreground mt-1">{selectedRequest.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="text-foreground mt-1">{selectedRequest.dates}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number of Days</p>
                  <p className="text-foreground mt-1">{selectedRequest.days} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied On</p>
                  <p className="text-foreground mt-1">{selectedRequest.appliedOn}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="text-foreground mt-2">{selectedRequest.reason}</p>
              </div>

              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground mb-2">Leave Balance</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-foreground">{selectedRequest.balance.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Used</p>
                    <p className="text-foreground">{selectedRequest.balance.used}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="text-foreground">{selectedRequest.balance.available}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Comments (Optional)</p>
                <Textarea 
                  placeholder="Add any comments or notes..." 
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}