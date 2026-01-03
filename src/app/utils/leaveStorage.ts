import { type LeaveRequest, type LeaveDecision } from '../context/LeaveContext';

const STORAGE_KEY = 'dayflow_leave_data';

// Default leave data
const DEFAULT_LEAVE_REQUESTS: LeaveRequest[] = [
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

const DEFAULT_LEAVE_DECISIONS: LeaveDecision[] = [
  { employee: "Jennifer Wilson", type: "Annual", dates: "Dec 20-24, 2025", days: 5, status: "approved", decidedOn: "Dec 1, 2025" },
  { employee: "David Brown", type: "Sick", dates: "Dec 15, 2025", days: 1, status: "approved", decidedOn: "Dec 15, 2025" },
  { employee: "Lisa Anderson", type: "Personal", dates: "Jan 8, 2026", days: 1, status: "rejected", decidedOn: "Dec 30, 2025" },
];

interface LeaveData {
  leaveRequests: LeaveRequest[];
  recentDecisions: LeaveDecision[];
}

// Get leave data from localStorage or return defaults
export function getLeaveData(): LeaveData {
  if (typeof window === 'undefined') {
    return {
      leaveRequests: DEFAULT_LEAVE_REQUESTS,
      recentDecisions: DEFAULT_LEAVE_DECISIONS
    };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.leaveRequests) && Array.isArray(parsed.recentDecisions)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading leave data from localStorage:', error);
  }
  
  // If no data exists or there's an error, initialize with defaults
  setLeaveData({
    leaveRequests: DEFAULT_LEAVE_REQUESTS,
    recentDecisions: DEFAULT_LEAVE_DECISIONS
  });
  return {
    leaveRequests: DEFAULT_LEAVE_REQUESTS,
    recentDecisions: DEFAULT_LEAVE_DECISIONS
  };
}

// Save leave data to localStorage
export function setLeaveData(data: LeaveData): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving leave data to localStorage:', error);
  }
}

// Update leave requests
export function updateLeaveRequests(requests: LeaveRequest[]): void {
  const currentData = getLeaveData();
  setLeaveData({
    ...currentData,
    leaveRequests: requests
  });
}

// Update recent decisions
export function updateRecentDecisions(decisions: LeaveDecision[]): void {
  const currentData = getLeaveData();
  setLeaveData({
    ...currentData,
    recentDecisions: decisions
  });
}
