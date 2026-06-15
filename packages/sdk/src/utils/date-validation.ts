/**
 * Date Validation Utilities
 *
 * Shared validation functions for date handling across SDK and CLI.
 *
 * @module utils/date-validation
 */

/**
 * Maximum allowed date range in days for statistics queries
 */
export const MAX_DATE_RANGE_DAYS = 60;

/**
 * Maximum allowed time range in months for max concurrent queries
 */
export const MAX_TIME_RANGE_MONTHS = 3;

/**
 * Maximum allowed time range in days for audience queries (Story 10.3)
 */
export const MAX_AUDIENCE_TIME_RANGE_DAYS = 90;

/**
 * Approximate number of days in 3 months (92 days)
 */
export const MAX_TIME_RANGE_DAYS = 92;

/**
 * Date format regex pattern (yyyy-MM-dd)
 */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Check if a date string is in valid yyyy-MM-dd format
 *
 * @param dateStr - Date string to validate
 * @returns true if the date is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidDateFormat('2024-01-15'); // true
 * isValidDateFormat('2024/01/15'); // false
 * isValidDateFormat('2024-02-30'); // false (invalid date)
 * ```
 */
export function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }

  if (!DATE_FORMAT_REGEX.test(dateStr)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return false;
  }

  // Check if the parsed date matches the input (handles cases like 2024-02-30)
  const [year, month, day] = dateStr.split('-').map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

/**
 * Calculate the difference between two dates in days
 *
 * @param startDay - Start date string (yyyy-MM-dd)
 * @param endDay - End date string (yyyy-MM-dd)
 * @returns Number of days between the dates (positive if endDay >= startDay)
 */
export function getDateDifferenceInDays(startDay: string, endDay: string): number {
  const startDate = new Date(startDay);
  const endDate = new Date(endDay);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Validate that startDay is before or equal to endDay
 *
 * @param startDay - Start date string (yyyy-MM-dd)
 * @param endDay - End date string (yyyy-MM-dd)
 * @returns true if startDay <= endDay, false otherwise
 */
export function isStartDateBeforeEndDate(startDay: string, endDay: string): boolean {
  const startDate = new Date(startDay);
  const endDate = new Date(endDay);
  return startDate <= endDate;
}

/**
 * Validate that startTime is before or equal to endTime (timestamps)
 *
 * @param startTime - Start timestamp (milliseconds)
 * @param endTime - End timestamp (milliseconds)
 * @returns true if startTime <= endTime, false otherwise
 */
export function isStartTimeBeforeEndTime(startTime: number, endTime: number): boolean {
  return startTime <= endTime;
}

/**
 * Check if a value is a valid timestamp (13-digit millisecond timestamp)
 *
 * @param value - Value to check
 * @returns true if the value is a valid timestamp, false otherwise
 *
 * @example
 * ```typescript
 * isValidTimestamp(1704067200000); // true
 * isValidTimestamp('not-a-timestamp'); // false
 * isValidTimestamp(1704067200); // false (10-digit, seconds)
 * ```
 */
export function isValidTimestamp(value: unknown): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }
  // Basic sanity check: timestamp should be positive and reasonable (after year 2000)
  return value > 946684800000; // Jan 1, 2000
}

/**
 * Validate date range does not exceed maximum allowed days
 *
 * @param startDay - Start date string (yyyy-MM-dd)
 * @param endDay - End date string (yyyy-MM-dd)
 * @param maxDays - Maximum allowed days (default: MAX_DATE_RANGE_DAYS)
 * @returns Object with validation result and error message if invalid
 */
export function validateDateRange(
  startDay: string,
  endDay: string,
  maxDays: number = MAX_DATE_RANGE_DAYS
): { valid: boolean; error?: string; daysDiff?: number } {
  // Check if startDay is before or equal to endDay
  if (!isStartDateBeforeEndDate(startDay, endDay)) {
    return {
      valid: false,
      error: 'startDay must be before or equal to endDay',
    };
  }

  // Calculate the difference in days
  const startDate = new Date(startDay);
  const endDate = new Date(endDay);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if range exceeds max days
  if (diffDays > maxDays) {
    return {
      valid: false,
      error: `Date range cannot exceed ${maxDays} days`,
      daysDiff: diffDays,
    };
  }

  return { valid: true, daysDiff: diffDays };
}

/**
 * Validate timestamp range does not exceed maximum allowed months
 *
 * @param startTime - Start timestamp (milliseconds)
 * @param endTime - End timestamp (milliseconds)
 * @param maxMonths - Maximum allowed months (default: MAX_TIME_RANGE_MONTHS)
 * @returns Object with validation result and error message if invalid
 */
export function validateTimestampRange(
  startTime: number,
  endTime: number,
  maxMonths: number = MAX_TIME_RANGE_MONTHS
): { valid: boolean; error?: string; daysDiff?: number } {
  // Check if startTime is before or equal to endTime
  if (!isStartTimeBeforeEndTime(startTime, endTime)) {
    return {
      valid: false,
      error: 'startTime must be before or equal to endTime',
    };
  }

  // Calculate the difference in days
  const diffTime = endTime - startTime;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if range exceeds max months (approximately 92 days for 3 months)
  const maxDays = maxMonths * 31; // Conservative estimate: 31 days per month
  if (diffDays > maxDays) {
    return {
      valid: false,
      error: `Time range cannot exceed ${maxMonths} months`,
      daysDiff: diffDays,
    };
  }

  return { valid: true, daysDiff: diffDays };
}

/**
 * Validate timestamp range does not exceed 90 days (for audience queries)
 *
 * @param startTime - Start timestamp (milliseconds)
 * @param endTime - End timestamp (milliseconds)
 * @returns Object with validation result and error message if invalid
 */
export function validate90DayTimestampRange(
  startTime: number,
  endTime: number
): { valid: boolean; error?: string; daysDiff?: number } {
  // Check if startTime is before or equal to endTime
  if (!isStartTimeBeforeEndTime(startTime, endTime)) {
    return {
      valid: false,
      error: 'startTime must be before or equal to endTime',
    };
  }

  // Calculate the difference in days
  const diffTime = endTime - startTime;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if range exceeds 90 days
  if (diffDays > MAX_AUDIENCE_TIME_RANGE_DAYS) {
    return {
      valid: false,
      error: `Time range cannot exceed ${MAX_AUDIENCE_TIME_RANGE_DAYS} days`,
      daysDiff: diffDays,
    };
  }

  return { valid: true, daysDiff: diffDays };
}

/**
 * Validate concurrency date range does not exceed maximum allowed days
 * Uses startDate/endDate parameter names for error messages
 *
 * @param startDate - Start date string (yyyy-MM-dd)
 * @param endDate - End date string (yyyy-MM-dd)
 * @param maxDays - Maximum allowed days (default: MAX_DATE_RANGE_DAYS)
 * @returns Object with validation result and error message if invalid
 */
export function validateConcurrencyDateRange(
  startDate: string,
  endDate: string,
  maxDays: number = MAX_DATE_RANGE_DAYS
): { valid: boolean; error?: string; daysDiff?: number } {
  // Check if startDate is before or equal to endDate
  if (!isStartDateBeforeEndDate(startDate, endDate)) {
    return {
      valid: false,
      error: 'startDate must be before or equal to endDate',
    };
  }

  // Calculate the difference in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if range exceeds max days
  if (diffDays > maxDays) {
    return {
      valid: false,
      error: `Date range cannot exceed ${maxDays} days`,
      daysDiff: diffDays,
    };
  }

  return { valid: true, daysDiff: diffDays };
}
