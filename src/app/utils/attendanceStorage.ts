/**
 * Attendance storage utility for managing attendance data with persistence
 */

// Define attendance status types
export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave';

// Define attendance record interface
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD format
  checkInTime?: string; // HH:MM format
  checkOutTime?: string; // HH:MM format
  status: AttendanceStatus;
  department: string;
  position: string;
  notes?: string;
  totalHours?: number; // Calculated hours worked
  weekNumber: number; // ISO week number
  month: number; // 1-12
  year: number;
}

// Define weekly attendance summary
export interface WeeklyAttendanceSummary {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  employeeId: string;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  totalHours: number;
  averageHours: number;
}

// Define monthly attendance summary
export interface MonthlyAttendanceSummary {
  month: number;
  year: number;
  employeeId: string;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  totalHours: number;
  averageHours: number;
}

// Storage keys
const STORAGE_KEYS = {
  ATTENDANCE_RECORDS: 'attendance_records',
  WEEKLY_SUMMARIES: 'weekly_summaries',
  MONTHLY_SUMMARIES: 'monthly_summaries',
  LAST_CHECK_IN: 'last_check_in',
  ACTIVE_CLOCK_INS: 'active_clock_ins' // New: Track all active clock-ins per user
};

// Event system for data synchronization
type AttendanceEventListener = () => void;
const eventListeners: Set<AttendanceEventListener> = new Set();

/**
 * Add event listener for attendance data changes
 */
export function addAttendanceEventListener(listener: AttendanceEventListener): void {
  eventListeners.add(listener);
}

/**
 * Remove event listener for attendance data changes
 */
export function removeAttendanceEventListener(listener: AttendanceEventListener): void {
  eventListeners.delete(listener);
}

/**
 * Trigger event when attendance data changes
 */
function triggerAttendanceUpdate(): void {
  eventListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('Error in attendance event listener:', error);
    }
  });
}

/**
 * Get all attendance records from storage
 */
export function getAllAttendanceRecords(): AttendanceRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_RECORDS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting attendance records:', error);
    return [];
  }
}

/**
 * Save attendance records to storage
 */
export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving attendance records:', error);
  }
}

/**
 * Add or update an attendance record
 */
export function saveAttendanceRecord(record: AttendanceRecord): void {
  try {
    const records = getAllAttendanceRecords();
    const existingIndex = records.findIndex(r => 
      r.employeeId === record.employeeId && r.date === record.date
    );
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    saveAttendanceRecords(records);
    updateSummaries();
    triggerAttendanceUpdate(); // Trigger synchronization event
  } catch (error) {
    console.error('Error saving attendance record:', error);
  }
}

/**
 * Get attendance records for a specific employee
 */
export function getEmployeeAttendanceRecords(employeeId: string): AttendanceRecord[] {
  return getAllAttendanceRecords().filter(record => record.employeeId === employeeId);
}

/**
 * Get attendance records for a specific date range
 */
export function getAttendanceRecordsByDateRange(startDate: string, endDate: string): AttendanceRecord[] {
  return getAllAttendanceRecords().filter(record => 
    record.date >= startDate && record.date <= endDate
  );
}

/**
 * Get attendance records for a specific week
 */
export function getAttendanceRecordsByWeek(weekNumber: number, year: number, employeeId?: string): AttendanceRecord[] {
  const records = getAllAttendanceRecords();
  return records.filter(record => {
    const matchesWeek = record.weekNumber === weekNumber && record.year === year;
    const matchesEmployee = !employeeId || record.employeeId === employeeId;
    return matchesWeek && matchesEmployee;
  });
}

/**
 * Get attendance records for a specific month
 */
export function getAttendanceRecordsByMonth(month: number, year: number, employeeId?: string): AttendanceRecord[] {
  const records = getAllAttendanceRecords();
  return records.filter(record => {
    const matchesMonth = record.month === month && record.year === year;
    const matchesEmployee = !employeeId || record.employeeId === employeeId;
    return matchesMonth && matchesEmployee;
  });
}

/**
 * Calculate total hours worked between check-in and check-out times
 */
export function calculateHoursWorked(checkInTime: string, checkOutTime: string): number {
  if (!checkInTime || !checkOutTime) return 0;
  
  const [inHour, inMinute] = checkInTime.split(':').map(Number);
  const [outHour, outMinute] = checkOutTime.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMinute;
  const outMinutes = outHour * 60 + outMinute;
  
  const totalMinutes = outMinutes - inMinutes;
  return Math.max(0, totalMinutes / 60);
}

/**
 * Get week number from date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get week start and end dates
 */
export function getWeekDates(weekNumber: number, year: number): { startDate: Date; endDate: Date } {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (weekNumber - 1) * 7;
  const startDate = new Date(firstDayOfYear);
  startDate.setDate(startDate.getDate() + daysOffset - startDate.getDay() + 1);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return { startDate, endDate };
}

/**
 * Check in employee
 */
export function checkInEmployee(employeeId: string, employeeName: string, department: string, position: string): AttendanceRecord {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);
  const weekNumber = getWeekNumber(now);
  
  const record: AttendanceRecord = {
    id: `${employeeId}-${date}`,
    employeeId,
    employeeName,
    date,
    checkInTime: time,
    status: 'Present',
    department,
    position,
    weekNumber,
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
  
  saveAttendanceRecord(record);
  
  // Store last check-in for check-out validation (backward compatibility)
  localStorage.setItem(STORAGE_KEYS.LAST_CHECK_IN, JSON.stringify({
    employeeId,
    date,
    checkInTime: time
  }));
  
  // Save persistent clock-in state
  saveActiveClockIn(employeeId, employeeName, date, time, department, position);
  
  return record;
}

/**
 * Check out employee
 */
export function checkOutEmployee(employeeId: string): AttendanceRecord | null {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);
  
  const records = getEmployeeAttendanceRecords(employeeId);
  const todayRecord = records.find(r => r.date === date);
  
  if (!todayRecord || !todayRecord.checkInTime) {
    return null;
  }
  
  const totalHours = calculateHoursWorked(todayRecord.checkInTime, time);
  
  // Update status based on hours worked
  let status: AttendanceStatus = 'Present';
  if (totalHours < 4) {
    status = 'Half-day';
  } else if (totalHours === 0) {
    status = 'Absent';
  }
  
  const updatedRecord: AttendanceRecord = {
    ...todayRecord,
    checkOutTime: time,
    totalHours,
    status
  };
  
  saveAttendanceRecord(updatedRecord);
  
  // Clear last check-in (backward compatibility)
  localStorage.removeItem(STORAGE_KEYS.LAST_CHECK_IN);
  
  // Remove persistent clock-in state
  removeActiveClockIn(employeeId);
  
  return updatedRecord;
}

/**
 * Get last check-in info
 */
export function getLastCheckIn(employeeId: string): { date: string; checkInTime: string } | null {
  try {
    // First check the new persistent storage
    const activeClockIns = getActiveClockIns();
    const userClockIn = activeClockIns.find(clockIn => clockIn.employeeId === employeeId);
    
    if (userClockIn) {
      return {
        date: userClockIn.date,
        checkInTime: userClockIn.checkInTime
      };
    }
    
    // Fallback to old storage for backward compatibility
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_CHECK_IN);
    const lastCheckIn = stored ? JSON.parse(stored) : null;
    return lastCheckIn && lastCheckIn.employeeId === employeeId ? lastCheckIn : null;
  } catch (error) {
    console.error('Error getting last check-in:', error);
    return null;
  }
}

/**
 * Get all active clock-ins
 */
export function getActiveClockIns(): Array<{
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  department: string;
  position: string;
  timestamp: string;
}> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLOCK_INS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting active clock-ins:', error);
    return [];
  }
}

/**
 * Save active clock-in state
 */
export function saveActiveClockIn(
  employeeId: string,
  employeeName: string,
  date: string,
  checkInTime: string,
  department: string,
  position: string
): void {
  try {
    const activeClockIns = getActiveClockIns();
    
    // Remove any existing clock-in for this employee
    const filteredClockIns = activeClockIns.filter(clockIn => clockIn.employeeId !== employeeId);
    
    // Add new clock-in
    const newClockIn = {
      employeeId,
      employeeName,
      date,
      checkInTime,
      department,
      position,
      timestamp: new Date().toISOString()
    };
    
    filteredClockIns.push(newClockIn);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLOCK_INS, JSON.stringify(filteredClockIns));
    
    console.log('Active clock-in saved for employee:', employeeId);
  } catch (error) {
    console.error('Error saving active clock-in:', error);
  }
}

/**
 * Remove active clock-in state
 */
export function removeActiveClockIn(employeeId: string): void {
  try {
    const activeClockIns = getActiveClockIns();
    const filteredClockIns = activeClockIns.filter(clockIn => clockIn.employeeId !== employeeId);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLOCK_INS, JSON.stringify(filteredClockIns));
    
    console.log('Active clock-in removed for employee:', employeeId);
  } catch (error) {
    console.error('Error removing active clock-in:', error);
  }
}

/**
 * Check if user has active clock-in
 */
export function hasActiveClockIn(employeeId: string): boolean {
  const activeClockIns = getActiveClockIns();
  return activeClockIns.some(clockIn => clockIn.employeeId === employeeId);
}

/**
 * Clean up expired clock-ins (older than 24 hours)
 */
export function cleanupExpiredClockIns(): void {
  try {
    const activeClockIns = getActiveClockIns();
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    const validClockIns = activeClockIns.filter(clockIn => {
      const clockInTime = new Date(clockIn.timestamp).getTime();
      return (now - clockInTime) < twentyFourHours;
    });
    
    if (validClockIns.length !== activeClockIns.length) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CLOCK_INS, JSON.stringify(validClockIns));
      console.log('Cleaned up expired clock-ins');
    }
  } catch (error) {
    console.error('Error cleaning up expired clock-ins:', error);
  }
}

/**
 * Get only the latest clock-in record for each employee (for admin view)
 */
export function getLatestClockInRecords(): AttendanceRecord[] {
  try {
    const allRecords = getAllAttendanceRecords();
    const latestRecordsMap = new Map<string, AttendanceRecord>();
    
    // Group records by employee and find the latest one
    allRecords.forEach(record => {
      const existingRecord = latestRecordsMap.get(record.employeeId);
      
      // If no existing record or current record is newer, update
      if (!existingRecord || isNewerRecord(record, existingRecord)) {
        latestRecordsMap.set(record.employeeId, record);
      }
    });
    
    return Array.from(latestRecordsMap.values());
  } catch (error) {
    console.error('Error getting latest clock-in records:', error);
    return [];
  }
}

/**
 * Helper function to check if a record is newer than another
 */
function isNewerRecord(newRecord: AttendanceRecord, existingRecord: AttendanceRecord): boolean {
  // Compare dates first
  if (newRecord.date > existingRecord.date) {
    return true;
  }
  
  if (newRecord.date < existingRecord.date) {
    return false;
  }
  
  // If same date, compare check-in times
  if (newRecord.checkInTime && existingRecord.checkInTime) {
    return newRecord.checkInTime > existingRecord.checkInTime;
  }
  
  // If one has check-in time and other doesn't, the one with time is newer
  return !!newRecord.checkInTime;
}

/**
 * Get attendance records with only latest clock-in per employee
 */
export function getLatestAttendanceRecords(): AttendanceRecord[] {
  const latestRecords = getLatestClockInRecords();
  
  // Sort by date (newest first) and then by employee name
  return latestRecords.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    
    return a.employeeName.localeCompare(b.employeeName);
  });
}

/**
 * Generate weekly attendance summary
 */
export function generateWeeklySummary(weekNumber: number, year: number, employeeId: string): WeeklyAttendanceSummary | null {
  const records = getAttendanceRecordsByWeek(weekNumber, year, employeeId);
  if (records.length === 0) return null;
  
  const { startDate, endDate } = getWeekDates(weekNumber, year);
  const employeeName = records[0].employeeName;
  
  const summary: WeeklyAttendanceSummary = {
    weekNumber,
    year,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    employeeId,
    employeeName,
    totalDays: records.length,
    presentDays: records.filter(r => r.status === 'Present').length,
    absentDays: records.filter(r => r.status === 'Absent').length,
    halfDays: records.filter(r => r.status === 'Half-day').length,
    leaveDays: records.filter(r => r.status === 'Leave').length,
    totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    averageHours: 0
  };
  
  summary.averageHours = summary.totalDays > 0 ? summary.totalHours / summary.totalDays : 0;
  
  return summary;
}

/**
 * Generate monthly attendance summary
 */
export function generateMonthlySummary(month: number, year: number, employeeId: string): MonthlyAttendanceSummary | null {
  const records = getAttendanceRecordsByMonth(month, year, employeeId);
  if (records.length === 0) return null;
  
  const employeeName = records[0].employeeName;
  
  const summary: MonthlyAttendanceSummary = {
    month,
    year,
    employeeId,
    employeeName,
    totalDays: records.length,
    presentDays: records.filter(r => r.status === 'Present').length,
    absentDays: records.filter(r => r.status === 'Absent').length,
    halfDays: records.filter(r => r.status === 'Half-day').length,
    leaveDays: records.filter(r => r.status === 'Leave').length,
    totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    averageHours: 0
  };
  
  summary.averageHours = summary.totalDays > 0 ? summary.totalHours / summary.totalDays : 0;
  
  return summary;
}

/**
 * Update all summaries (called after any attendance change)
 */
export function updateSummaries(): void {
  // This function would recalculate and save summaries
  // For now, summaries are generated on-demand
  console.log('Attendance summaries updated');
}

/**
 * Export attendance data to PDF
 */
export function exportAttendanceToPDF(records: AttendanceRecord[]): string {
  // This function now delegates to the PDF generator
  // The actual PDF generation is handled in the components
  return "PDF export handled by components";
}

/**
 * Legacy CSV export function (kept for compatibility)
 */
export function exportAttendanceToCSV(records: AttendanceRecord[]): string {
  const headers = [
    'Employee Name',
    'Date',
    'Check In',
    'Check Out',
    'Status',
    'Department',
    'Position',
    'Total Hours',
    'Notes'
  ];
  
  const rows = records.map(record => [
    record.employeeName,
    record.date,
    record.checkInTime || '',
    record.checkOutTime || '',
    record.status,
    record.department,
    record.position,
    record.totalHours || 0,
    record.notes || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Initialize sample attendance data (for testing)
 */
export function initializeSampleAttendanceData(): void {
  const existingRecords = getAllAttendanceRecords();
  if (existingRecords.length > 0) return; // Don't overwrite existing data
  
  const sampleRecords: AttendanceRecord[] = [];
  const employeeId = 'EMP-001';
  const employeeName = 'John Smith';
  const department = 'Engineering';
  const position = 'Software Developer';
  
  // Generate sample data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    const weekNumber = getWeekNumber(date);
    
    // Random check-in and check-out times
    const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
    const checkInMinute = Math.floor(Math.random() * 60);
    const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
    const checkOutMinute = Math.floor(Math.random() * 60);
    
    const checkInTime = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`;
    const checkOutTime = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`;
    
    const totalHours = calculateHoursWorked(checkInTime, checkOutTime);
    
    // Random status (mostly present)
    const statuses: AttendanceStatus[] = ['Present', 'Present', 'Present', 'Present', 'Present', 'Half-day', 'Leave'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    sampleRecords.push({
      id: `${employeeId}-${dateStr}`,
      employeeId,
      employeeName,
      date: dateStr,
      checkInTime: status === 'Absent' ? undefined : checkInTime,
      checkOutTime: status === 'Absent' ? undefined : checkOutTime,
      status,
      department,
      position,
      totalHours: status === 'Absent' ? 0 : totalHours,
      weekNumber,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      notes: status === 'Leave' ? 'Approved leave' : undefined
    });
  }
  
  saveAttendanceRecords(sampleRecords);
  console.log('Sample attendance data initialized');
}
