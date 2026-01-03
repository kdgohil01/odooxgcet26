import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getLeaveData, setLeaveData, updateLeaveRequests, updateRecentDecisions } from '../utils/leaveStorage';

export interface LeaveRequest {
  id: number;
  employee: string;
  department: string;
  type: string;
  dates: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  reason: string;
  balance: {
    total: number;
    used: number;
    available: number;
  };
}

export interface LeaveDecision {
  employee: string;
  type: string;
  dates: string;
  days: number;
  status: 'approved' | 'rejected';
  decidedOn: string;
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  recentDecisions: LeaveDecision[];
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => void;
  approveLeaveRequest: (id: number) => void;
  rejectLeaveRequest: (id: number) => void;
  getEmployeeLeaveHistory: (employeeName: string) => LeaveDecision[];
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: ReactNode }) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<LeaveDecision[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const data = getLeaveData();
    setLeaveRequests(data.leaveRequests);
    setRecentDecisions(data.recentDecisions);
  }, []);

  const addLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now(),
      status: 'pending',
      appliedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    const updatedRequests = [newRequest, ...leaveRequests];
    setLeaveRequests(updatedRequests);
    updateLeaveRequests(updatedRequests);
  };

  const approveLeaveRequest = (id: number) => {
    const request = leaveRequests.find(req => req.id === id);
    if (!request) return;

    // Remove from pending requests
    const updatedRequests = leaveRequests.filter(req => req.id !== id);
    setLeaveRequests(updatedRequests);
    updateLeaveRequests(updatedRequests);
    
    // Add to recent decisions
    const decision: LeaveDecision = {
      employee: request.employee,
      type: request.type,
      dates: request.dates,
      days: request.days,
      status: 'approved',
      decidedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    const updatedDecisions = [decision, ...recentDecisions];
    setRecentDecisions(updatedDecisions);
    updateRecentDecisions(updatedDecisions);
  };

  const rejectLeaveRequest = (id: number) => {
    const request = leaveRequests.find(req => req.id === id);
    if (!request) return;

    // Remove from pending requests
    const updatedRequests = leaveRequests.filter(req => req.id !== id);
    setLeaveRequests(updatedRequests);
    updateLeaveRequests(updatedRequests);
    
    // Add to recent decisions
    const decision: LeaveDecision = {
      employee: request.employee,
      type: request.type,
      dates: request.dates,
      days: request.days,
      status: 'rejected',
      decidedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    const updatedDecisions = [decision, ...recentDecisions];
    setRecentDecisions(updatedDecisions);
    updateRecentDecisions(updatedDecisions);
  };

  const getEmployeeLeaveHistory = (employeeName: string) => {
    return recentDecisions.filter(decision => decision.employee === employeeName);
  };

  return (
    <LeaveContext.Provider value={{
      leaveRequests,
      recentDecisions,
      addLeaveRequest,
      approveLeaveRequest,
      rejectLeaveRequest,
      getEmployeeLeaveHistory
    }}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeaveContext() {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeaveContext must be used within a LeaveProvider');
  }
  return context;
}
