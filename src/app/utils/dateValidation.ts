/**
 * Date validation utilities for the application
 */

export interface DateValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates that end date is not before start date
 */
export function validateDateRange(startDate: string, endDate: string): DateValidationResult {
  if (!startDate || !endDate) {
    return { isValid: true }; // Allow empty dates for form validation
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return {
      isValid: false,
      errorMessage: "End date cannot be before start date"
    };
  }

  return { isValid: true };
}

/**
 * Validates that a date is not in the past
 */
export function validateNotPastDate(date: string, fieldName: string = "Date"): DateValidationResult {
  if (!date) {
    return { isValid: true }; // Allow empty for form validation
  }

  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

  if (dateObj < today) {
    return {
      isValid: false,
      errorMessage: `${fieldName} cannot be before today`
    };
  }

  return { isValid: true };
}

/**
 * Validates that a date is not too far in the future
 */
export function validateFutureDate(
  date: string, 
  maxMonths: number = 6, 
  fieldName: string = "Date"
): DateValidationResult {
  if (!date) {
    return { isValid: true }; // Allow empty for form validation
  }

  const dateObj = new Date(date);
  const maxFutureDate = new Date();
  maxFutureDate.setMonth(maxFutureDate.getMonth() + maxMonths);

  if (dateObj > maxFutureDate) {
    return {
      isValid: false,
      errorMessage: `${fieldName} cannot be more than ${maxMonths} months in the future`
    };
  }

  return { isValid: true };
}

/**
 * Validates a complete date range with multiple checks
 */
export function validateCompleteDateRange(
  startDate: string, 
  endDate: string,
  options: {
    allowPastDates?: boolean;
    maxFutureMonths?: number;
  } = {}
): DateValidationResult {
  // Check if dates are provided
  if (!startDate) {
    return {
      isValid: false,
      errorMessage: "Start date is required"
    };
  }

  if (!endDate) {
    return {
      isValid: false,
      errorMessage: "End date is required"
    };
  }

  // Validate start date is not in past (if not allowed)
  if (!options.allowPastDates) {
    const startValidation = validateNotPastDate(startDate, "Start date");
    if (!startValidation.isValid) {
      return startValidation;
    }
  }

  // Validate start date is not too far in future
  if (options.maxFutureMonths) {
    const startFutureValidation = validateFutureDate(startDate, options.maxFutureMonths, "Start date");
    if (!startFutureValidation.isValid) {
      return startFutureValidation;
    }
  }

  // Validate end date is not before start date
  const rangeValidation = validateDateRange(startDate, endDate);
  if (!rangeValidation.isValid) {
    return rangeValidation;
  }

  return { isValid: true };
}

/**
 * Calculates the number of days between two dates
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Add 1 to include both start and end dates
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Gets the minimum allowed date for date inputs
 */
export function getMinDate(allowPastDates: boolean = false): string {
  if (allowPastDates) {
    // Allow dates from 1 year ago
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1);
    return minDate.toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Gets the maximum allowed date for date inputs
 */
export function getMaxDate(maxMonths: number = 6): string {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + maxMonths);
  return maxDate.toISOString().split('T')[0];
}
