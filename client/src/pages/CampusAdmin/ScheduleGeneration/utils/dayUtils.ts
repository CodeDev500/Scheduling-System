// Utility functions for day combination and formatting

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface DayMapping {
  [key: string]: string;
}

// Day abbreviation mapping
export const DAY_ABBREVIATIONS: DayMapping = {
  'Monday': 'M',
  'Tuesday': 'T', 
  'Wednesday': 'W',
  'Thursday': 'Th',
  'Friday': 'F',
  'Saturday': 'S'
};

// Full day names mapping
export const DAY_FULL_NAMES: DayMapping = {
  'M': 'Monday',
  'T': 'Tuesday',
  'W': 'Wednesday', 
  'Th': 'Thursday',
  'F': 'Friday',
  'S': 'Saturday'
};

// Day order for sorting
export const DAY_ORDER: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Convert an array of day names to abbreviated format
 * @param days Array of full day names
 * @returns Abbreviated day combination (e.g., "MW", "MWF", "TTh")
 */
export const formatDaysCombination = (days: string[]): string => {
  if (!days || days.length === 0) return '';
  
  // Sort days according to week order
  const sortedDays = days.sort((a, b) => {
    const indexA = DAY_ORDER.indexOf(a as DayOfWeek);
    const indexB = DAY_ORDER.indexOf(b as DayOfWeek);
    return indexA - indexB;
  });
  
  // Convert to abbreviations
  const abbreviations = sortedDays.map(day => DAY_ABBREVIATIONS[day]).filter(Boolean);
  
  // Handle special cases for common combinations
  const combination = abbreviations.join('');
  
  // Special formatting for Tuesday-Thursday
  if (combination === 'TTh' || combination === 'ThT') {
    return 'TTh';
  }
  
  return combination;
};

/**
 * Convert abbreviated day combination back to full day names
 * @param daysCombination Abbreviated combination (e.g., "MW", "TTh")
 * @returns Array of full day names
 */
export const parseDaysCombination = (daysCombination: string): string[] => {
  if (!daysCombination) return [];
  
  // Handle special case for Tuesday-Thursday
  if (daysCombination === 'TTh') {
    return ['Tuesday', 'Thursday'];
  }
  
  const days: string[] = [];
  let i = 0;
  
  while (i < daysCombination.length) {
    // Check for 'Th' first (two characters)
    if (i < daysCombination.length - 1 && daysCombination.substring(i, i + 2) === 'Th') {
      days.push('Thursday');
      i += 2;
    } else {
      // Single character day
      const char = daysCombination[i];
      const fullDay = DAY_FULL_NAMES[char];
      if (fullDay) {
        days.push(fullDay);
      }
      i += 1;
    }
  }
  
  return days;
};

/**
 * Check if two day combinations are equivalent
 * @param days1 First day combination
 * @param days2 Second day combination  
 * @returns True if they represent the same days
 */
export const areDaysCombinationsEqual = (days1: string, days2: string): boolean => {
  const parsed1 = parseDaysCombination(days1).sort();
  const parsed2 = parseDaysCombination(days2).sort();
  
  return parsed1.length === parsed2.length && 
         parsed1.every((day, index) => day === parsed2[index]);
};

/**
 * Get display text for day combination
 * @param daysCombination Abbreviated combination
 * @param format Display format ('short' | 'long')
 * @returns Formatted display text
 */
export const getDayDisplayText = (daysCombination: string, format: 'short' | 'long' = 'short'): string => {
  if (format === 'short') {
    return daysCombination;
  }
  
  const fullDays = parseDaysCombination(daysCombination);
  if (fullDays.length === 0) return '';
  if (fullDays.length === 1) return fullDays[0];
  if (fullDays.length === 2) return fullDays.join(' & ');
  
  return fullDays.slice(0, -1).join(', ') + ' & ' + fullDays[fullDays.length - 1];
};

/**
 * Generate common day patterns for schedule generation
 * @param units Number of units for the subject
 * @returns Array of possible day combinations
 */
export const getCommonDayPatterns = (units: number): string[] => {
  switch (units) {
    case 1:
      // Single meeting, 1 hour
      return ['M', 'T', 'W', 'Th', 'F', 'S'];

    case 2:
      // 2 hours → could be 1 day (2 hrs) or 2 days (1 hr each)
      return ['M', 'T', 'W', 'Th', 'F', 'S', 'MW', 'TTh'];

    case 3:
      // 3 hours → could be 3 days (1 hr), 2 days (1.5 hrs), or 1 day (3 hrs)
      return ['MWF', 'TTh', 'MW', 'WF', 'TF', 'S'];

    case 4:
      // 4 hours → 2 days (2 hrs), 4 days (1 hr), or 1 day (4 hrs straight)
      return ['MW', 'TTh', 'MTWF', 'MWTh', 'F'];

    case 5:
      // 5 hours → rare, usually split across multiple days
      return ['MTWF', 'MWThF', 'MThF', 'TThS'];

    case 6:
      // 6 hours → 2 big blocks or spread across 3–5 days
      return ['MWF', 'TThS', 'MTWTh', 'Sat'];

    default:
      // 7+ units → usually labs or special cases
      return ['MTWThF', 'MWF', 'TTh', 'Sat'];
  }
};

