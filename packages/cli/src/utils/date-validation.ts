/**
 * @fileoverview Date validation utilities for CLI
 * @author Development Team
 * @since 10.1.0
 */

/**
 * Maximum allowed date range in days for statistics queries
 */
export const MAX_DATE_RANGE_DAYS = 60;

/**
 * Maximum allowed time range in milliseconds (3 months)
 */
export const MAX_TIME_RANGE_MS = 3 * 30 * 24 * 60 * 60 * 1000; // ~90 days

/**
 * Maximum allowed time range in days for audience queries (Story 10.3)
 */
export const MAX_AUDIENCE_TIME_RANGE_DAYS = 90;

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
 * Check if a value is a valid 13-digit millisecond timestamp
 *
 * @param value - Value to validate
 * @returns true if the value is a valid timestamp, false otherwise
 *
 * @example
 * ```typescript
 * isValidTimestamp(1704067200000); // true
 * isValidTimestamp('1704067200000'); // true
 * isValidTimestamp(1704067200000n); // true
 * isValidTimestamp(123456789); // false (too small)
 * isValidTimestamp('invalid'); // false
 * ```
 */
export function isValidTimestamp(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  let timestamp: number;

  if (typeof value === 'number') {
    timestamp = value;
  } else if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      return false;
    }
    timestamp = parsed;
  } else if (typeof value === 'bigint') {
    timestamp = Number(value);
  } else {
    return false;
  }

  // Check if it's a 13-digit number (reasonable timestamp range)
  // Valid range: 2000-01-01 to 2100-01-01
  if (timestamp < 946684800000 || timestamp > 4102444800000) {
    return false;
  }

  // Check if it creates a valid date
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

/**
 * Validate timestamp range does not exceed maximum allowed duration
 *
 * @param startTime - Start timestamp in milliseconds
 * @param endTime - End timestamp in milliseconds
 * @param maxMs - Maximum allowed duration in milliseconds (default: 3 months)
 * @returns Object with validation result and error message if invalid
 */
export function validateTimestampRange(
  startTime: number,
  endTime: number,
  maxMs: number = MAX_TIME_RANGE_MS
): { valid: boolean; error?: string; msDiff?: number } {
  // Check if startTime is before or equal to endTime
  if (startTime > endTime) {
    return {
      valid: false,
      error: 'startTime must be before or equal to endTime',
    };
  }

  // Calculate the difference in milliseconds
  const diffMs = endTime - startTime;

  // Check if range exceeds max duration
  if (diffMs > maxMs) {
    const maxDays = Math.floor(maxMs / (1000 * 60 * 60 * 24));
    return {
      valid: false,
      error: `Time range cannot exceed ${maxDays} days (~3 months)`,
      msDiff: diffMs,
    };
  }

  return { valid: true, msDiff: diffMs };
}

/**
 * Validate timestamp range does not exceed 90 days (for audience queries)
 *
 * @param startTime - Start timestamp in milliseconds
 * @param endTime - End timestamp in milliseconds
 * @returns Object with validation result and error message if invalid
 */
export function validate90DayTimestampRange(
  startTime: number,
  endTime: number
): { valid: boolean; error?: string; daysDiff?: number } {
  // Check if startTime is before or equal to endTime
  if (startTime > endTime) {
    return {
      valid: false,
      error: 'startTime must be before or equal to endTime',
    };
  }

  // Calculate the difference in days
  const diffMs = endTime - startTime;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

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
