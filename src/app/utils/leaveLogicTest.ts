// Test logic for leave balance calculation
// This demonstrates the correct behavior:

// Initial state:
// - Total: 20 days
// - Used: 0 days (no approved leaves)
// - Pending: 0 days
// - Available: 20 days

// Employee applies for 3 days leave:
// - Total: 20 days
// - Used: 0 days (still not approved)
// - Pending: 3 days
// - Available: 20 days (pending doesn't affect available)

// Admin approves the 3 days:
// - Total: 20 days
// - Used: 3 days (approved leaves count)
// - Pending: 0 days
// - Available: 17 days (20 - 3)

// Employee applies for 2 more days leave:
// - Total: 20 days
// - Used: 3 days (previous approved)
// - Pending: 2 days (new request)
// - Available: 17 days (still 17, pending doesn't affect)

// Admin rejects the 2 days:
// - Total: 20 days
// - Used: 3 days (rejected doesn't count)
// - Pending: 0 days
// - Available: 17 days (still 17, rejected doesn't affect)

export const testLogic = {
  initial: { total: 20, used: 0, pending: 0, available: 20 },
  afterApply: { total: 20, used: 0, pending: 3, available: 20 },
  afterApprove: { total: 20, used: 3, pending: 0, available: 17 },
  afterSecondApply: { total: 20, used: 3, pending: 2, available: 17 },
  afterReject: { total: 20, used: 3, pending: 0, available: 17 }
};
