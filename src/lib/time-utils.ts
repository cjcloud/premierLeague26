/**
 * Utility functions for time-based operations
 */

// The deadline for predictions - August 15th, 2025 at 7pm London time
const PREDICTIONS_DEADLINE = new Date('2025-08-15T19:00:00+01:00');

/**
 * Check if the prediction deadline has passed
 * @returns boolean - true if the deadline has passed, false if still active
 */
export function isPredictionDeadlinePassed(): boolean {
  const now = new Date();
  return now > PREDICTIONS_DEADLINE;
}

/**
 * Get a formatted string representation of the predictions deadline
 * @returns string - formatted deadline
 */
export function getFormattedDeadline(): string {
  return PREDICTIONS_DEADLINE.toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'Europe/London',
    timeZoneName: 'short'
  });
}
