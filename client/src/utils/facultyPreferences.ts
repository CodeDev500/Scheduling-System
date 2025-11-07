import { type TimeSlot } from '../contexts/FacultyPreferencesContext';

export interface PreferenceScore {
  isPreferred: boolean;
  score: number; // 0-100, higher is better
  reason?: string;
}

export interface ScheduleItem {
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}

/**
 * Calculate preference score for a given time slot
 * @param day - Day of the week
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @param preferences - Array of preferred time slots
 * @returns PreferenceScore object
 */
export function calculatePreferenceScore(
  day: string,
  startTime: string,
  endTime: string,
  preferences: TimeSlot[]
): PreferenceScore {
  // Check for exact match
  const exactMatch = preferences.find(
    p => p.day === day && p.startTime === startTime && p.endTime === endTime
  );
  
  if (exactMatch) {
    return {
      isPreferred: true,
      score: 100,
      reason: 'Exact preference match'
    };
  }
  
  // Check for overlapping preferred times
  const overlappingPreferences = preferences.filter(p => {
    if (p.day !== day) return false;
    
    const prefStart = timeToMinutes(p.startTime);
    const prefEnd = timeToMinutes(p.endTime);
    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);
    
    // Check if there's any overlap
    return slotStart < prefEnd && slotEnd > prefStart;
  });
  
  if (overlappingPreferences.length > 0) {
    // Calculate overlap percentage
    const slotDuration = timeToMinutes(endTime) - timeToMinutes(startTime);
    let totalOverlap = 0;
    
    overlappingPreferences.forEach(pref => {
      const prefStart = timeToMinutes(pref.startTime);
      const prefEnd = timeToMinutes(pref.endTime);
      const slotStart = timeToMinutes(startTime);
      const slotEnd = timeToMinutes(endTime);
      
      const overlapStart = Math.max(prefStart, slotStart);
      const overlapEnd = Math.min(prefEnd, slotEnd);
      const overlap = Math.max(0, overlapEnd - overlapStart);
      
      totalOverlap += overlap;
    });
    
    const overlapPercentage = Math.min(100, (totalOverlap / slotDuration) * 100);
    const score = Math.round(50 + (overlapPercentage / 2)); // 50-100 range
    
    return {
      isPreferred: true,
      score,
      reason: `${Math.round(overlapPercentage)}% overlap with preferred times`
    };
  }
  
  // Check if it's on a preferred day
  const preferredDays = [...new Set(preferences.map(p => p.day))];
  if (preferredDays.includes(day)) {
    return {
      isPreferred: false,
      score: 30,
      reason: 'Preferred day but not preferred time'
    };
  }
  
  // No preference match
  return {
    isPreferred: false,
    score: 0,
    reason: 'No preference match'
  };
}

/**
 * Get suggested time slots based on faculty preferences
 * @param preferences - Array of preferred time slots
 * @param excludeConflicts - Array of existing schedule items to avoid conflicts
 * @returns Array of suggested time slots sorted by preference score
 */
export function getSuggestedTimeSlots(
  preferences: TimeSlot[],
  excludeConflicts: ScheduleItem[] = []
): (TimeSlot & { score: number; reason: string })[] {
  if (preferences.length === 0) {
    return [];
  }
  
  // Generate suggestions based on preferences
  const suggestions: (TimeSlot & { score: number; reason: string })[] = [];
  
  preferences.forEach(pref => {
    // Check if this time slot conflicts with existing schedule
    const hasConflict = excludeConflicts.some(item => 
      item.day === pref.day &&
      timeToMinutes(item.startTime) < timeToMinutes(pref.endTime) &&
      timeToMinutes(item.endTime) > timeToMinutes(pref.startTime)
    );
    
    if (!hasConflict) {
      const score = calculatePreferenceScore(pref.day, pref.startTime, pref.endTime, preferences);
      suggestions.push({
        ...pref,
        score: score.score,
        reason: score.reason || 'Preferred time slot'
      });
    }
  });
  
  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
}

/**
 * Check if a schedule item conflicts with faculty preferences
 * @param item - Schedule item to check
 * @param preferences - Array of preferred time slots
 * @returns Object with conflict information
 */
export function checkPreferenceConflict(
  item: ScheduleItem,
  preferences: TimeSlot[]
): { hasConflict: boolean; severity: 'low' | 'medium' | 'high'; message?: string } {
  const score = calculatePreferenceScore(item.day, item.startTime, item.endTime, preferences);
  
  if (score.isPreferred) {
    return {
      hasConflict: false,
      severity: 'low',
      message: 'Matches faculty preferences'
    };
  }
  
  if (score.score >= 30) {
    return {
      hasConflict: true,
      severity: 'low',
      message: 'Partially matches preferences'
    };
  }
  
  // Check if it's completely outside preferred days
  const preferredDays = [...new Set(preferences.map(p => p.day))];
  if (preferredDays.length > 0 && !preferredDays.includes(item.day)) {
    return {
      hasConflict: true,
      severity: 'high',
      message: 'Scheduled on non-preferred day'
    };
  }
  
  return {
    hasConflict: true,
    severity: 'medium',
    message: 'Does not match faculty preferences'
  };
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Export preferences to JSON format
 */
export function exportPreferences(preferences: TimeSlot[]): string {
  return JSON.stringify(preferences, null, 2);
}

/**
 * Import preferences from JSON string
 */
export function importPreferences(jsonString: string): TimeSlot[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => 
        item && 
        typeof item.day === 'string' &&
        typeof item.startTime === 'string' &&
        typeof item.endTime === 'string'
      );
    }
    return [];
  } catch (error) {
    console.error('Failed to import preferences:', error);
    return [];
  }
}

/**
 * Get faculty preferences for a specific faculty member
 * @param facultyId - The faculty member's ID
 * @param allPreferences - All faculty preferences
 * @returns Array of time slots preferred by the faculty member
 */
export function getFacultyPreferences(_facultyId: string, allPreferences: TimeSlot[]): TimeSlot[] {
  // For now, return all preferences since we don't have faculty-specific preferences
  // In a real implementation, this would filter by facultyId
  return allPreferences;
}