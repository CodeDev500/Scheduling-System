// Utility functions for time formatting and day abbreviations

export const formatTime = (time: string): string => {
  // Convert 24-hour format to 12-hour format with AM/PM
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const getDayAbbreviation = (day: string): string => {
  const dayMap: { [key: string]: string } = {
    'Monday': 'M',
    'Tuesday': 'T', 
    'Wednesday': 'W',
    'Thursday': 'TH',
    'Friday': 'F',
    'Saturday': 'S',
    'Sunday': 'SU'
  };
  return dayMap[day] || day;
};

export const formatDayTimeSlot = (day: string, startTime: string, endTime: string): string => {
  const dayAbbr = getDayAbbreviation(day);
  const timeRange = formatTimeRange(startTime, endTime);
  return `${dayAbbr} ${timeRange}`;
};