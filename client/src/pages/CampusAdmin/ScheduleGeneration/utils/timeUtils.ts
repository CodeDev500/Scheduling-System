/**
 * Converts 24-hour time format to 12-hour AM/PM format
 * @param time24 - Time in 24-hour format (e.g., "13:00", "09:30")
 * @returns Time in 12-hour AM/PM format (e.g., "1:00 PM", "9:30 AM")
 */
export function convertTo12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours, 10);
  const minute = minutes || '00';
  
  if (hour24 === 0) {
    return `12:${minute} AM`;
  } else if (hour24 < 12) {
    return `${hour24}:${minute} AM`;
  } else if (hour24 === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hour24 - 12}:${minute} PM`;
  }
}

/**
 * Converts 12-hour AM/PM format to 24-hour format
 * @param time12 - Time in 12-hour AM/PM format (e.g., "1:00 PM", "9:30 AM")
 * @returns Time in 24-hour format (e.g., "13:00", "09:30")
 */
export function convertTo24Hour(time12: string): string {
  if (!time12) return '';
  
  const [timePart, period] = time12.split(' ');
  const [hours, minutes] = timePart.split(':');
  let hour24 = parseInt(hours, 10);
  const minute = minutes || '00';
  
  if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  } else if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minute}`;
}

/**
 * Formats a time range from 24-hour to 12-hour AM/PM format
 * @param startTime - Start time in 24-hour format
 * @param endTime - End time in 24-hour format
 * @returns Formatted time range (e.g., "9:00 AM - 10:30 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start12 = convertTo12Hour(startTime);
  const end12 = convertTo12Hour(endTime);
  return `${start12} - ${end12}`;
}

/**
 * Gets display hour for grid positioning (7 AM = 0, 8 AM = 1, etc.)
 * @param time24 - Time in 24-hour format
 * @returns Grid position index
 */
export function getGridHour(time24: string): number {
  const hour = parseInt(time24.split(':')[0], 10);
  return hour - 7; // 7 AM is position 0
}
