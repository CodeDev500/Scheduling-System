export interface ScheduleConflict {
  type: 'time' | 'room' | 'faculty' | 'preference';
  message: string;
  conflictingSchedules: string[];
  severity?: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface ScheduleItem {
  id: string;
  subject: string;
  code: string;
  faculty: string;
  facultyId: string;
  room: string;
  roomId: string;
  startTime: string;
  endTime: string;
  day: string;
  section: string;
  semester: string;
  academicYear: string;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time ranges overlap
 */
const timeRangesOverlap = (
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean => {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  return start1Min < end2Min && start2Min < end1Min;
};

/**
 * Normalize day strings for comparison
 */
const normalizeDayString = (day: string): string => {
  const dayMap: { [key: string]: string } = {
    'monday': 'monday',
    'tuesday': 'tuesday', 
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday',
    'mon': 'monday',
    'tue': 'tuesday',
    'wed': 'wednesday', 
    'thu': 'thursday',
    'fri': 'friday',
    'sat': 'saturday',
    'sun': 'sunday',
    'm': 'monday',
    't': 'tuesday',
    'w': 'wednesday',
    'th': 'thursday',
    'f': 'friday',
    's': 'saturday'
  };
  
  return dayMap[day.toLowerCase()] || day.toLowerCase();
};

/**
 * Check if two day strings represent the same day
 */
const daysMatch = (day1: string, day2: string): boolean => {
  return normalizeDayString(day1) === normalizeDayString(day2);
};

/**
 * Check for time conflicts between schedules
 */
export const checkTimeConflicts = (
  newSchedule: ScheduleItem,
  existingSchedules: ScheduleItem[]
): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  
  for (const existing of existingSchedules) {
    // Skip if different semester/academic year
    if (existing.semester !== newSchedule.semester || 
        existing.academicYear !== newSchedule.academicYear) {
      continue;
    }
    
    // Skip if same schedule
    if (existing.id === newSchedule.id) {
      continue;
    }
    
    // Check if days match
    if (daysMatch(existing.day, newSchedule.day)) {
      // Check if time ranges overlap
      if (timeRangesOverlap(
        existing.startTime, 
        existing.endTime,
        newSchedule.startTime, 
        newSchedule.endTime
      )) {
        conflicts.push({
          type: 'time',
          message: `Time conflict with ${existing.code} (${existing.startTime}-${existing.endTime})`,
          conflictingSchedules: [existing.id]
        });
      }
    }
  }
  
  return conflicts;
};

/**
 * Check for room conflicts between schedules
 */
export const checkRoomConflicts = (
  newSchedule: ScheduleItem,
  existingSchedules: ScheduleItem[]
): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  
  for (const existing of existingSchedules) {
    // Skip if different semester/academic year
    if (existing.semester !== newSchedule.semester || 
        existing.academicYear !== newSchedule.academicYear) {
      continue;
    }
    
    // Skip if same schedule
    if (existing.id === newSchedule.id) {
      continue;
    }
    
    // Check if same room
    if (existing.roomId === newSchedule.roomId && existing.roomId) {
      // Check if days match
      if (daysMatch(existing.day, newSchedule.day)) {
        // Check if time ranges overlap
        if (timeRangesOverlap(
          existing.startTime, 
          existing.endTime,
          newSchedule.startTime, 
          newSchedule.endTime
        )) {
          conflicts.push({
            type: 'room',
            message: `Room conflict: ${newSchedule.room} is already booked for ${existing.code} (${existing.startTime}-${existing.endTime})`,
            conflictingSchedules: [existing.id]
          });
        }
      }
    }
  }
  
  return conflicts;
};

/**
 * Check for faculty conflicts between schedules
 */
export const checkFacultyConflicts = (
  newSchedule: ScheduleItem,
  existingSchedules: ScheduleItem[]
): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  
  for (const existing of existingSchedules) {
    // Skip if different semester/academic year
    if (existing.semester !== newSchedule.semester || 
        existing.academicYear !== newSchedule.academicYear) {
      continue;
    }
    
    // Skip if same schedule
    if (existing.id === newSchedule.id) {
      continue;
    }
    
    // Check if same faculty
    if (existing.facultyId === newSchedule.facultyId && existing.facultyId) {
      // Check if days match
      if (daysMatch(existing.day, newSchedule.day)) {
        // Check if time ranges overlap
        if (timeRangesOverlap(
          existing.startTime, 
          existing.endTime,
          newSchedule.startTime, 
          newSchedule.endTime
        )) {
          conflicts.push({
            type: 'faculty',
            message: `Faculty conflict: ${newSchedule.faculty} is already assigned to ${existing.code} (${existing.startTime}-${existing.endTime})`,
            conflictingSchedules: [existing.id]
          });
        }
      }
    }
  }
  
  return conflicts;
};

/**
 * Check faculty preference conflicts
 */
export const checkPreferenceConflicts = (
  newSchedule: ScheduleItem,
  facultyPreferences: { day: string; startTime: string; endTime: string }[] = []
): ScheduleConflict[] => {
  if (facultyPreferences.length === 0) {
    return [];
  }
  
  const conflicts: ScheduleConflict[] = [];
  
  // Check if the schedule matches any faculty preferences
  const hasPreferenceMatch = facultyPreferences.some(pref => 
    daysMatch(pref.day, newSchedule.day) &&
    timeRangesOverlap(pref.startTime, pref.endTime, newSchedule.startTime, newSchedule.endTime)
  );
  
  // Check if it's on a preferred day
  const preferredDays = [...new Set(facultyPreferences.map(p => normalizeDayString(p.day)))];
  const isPreferredDay = preferredDays.includes(normalizeDayString(newSchedule.day));
  
  if (!hasPreferenceMatch && facultyPreferences.length > 0) {
    if (!isPreferredDay && preferredDays.length > 0) {
      conflicts.push({
        type: 'preference',
        message: `Scheduled on non-preferred day (${newSchedule.day}). Preferred days: ${preferredDays.join(', ')}`,
        conflictingSchedules: [],
        severity: 'high'
      });
    } else if (isPreferredDay) {
      conflicts.push({
        type: 'preference',
        message: `Time does not match faculty preferences for ${newSchedule.day}`,
        conflictingSchedules: [],
        severity: 'medium'
      });
    }
  }
  
  return conflicts;
};

/**
 * Check all types of conflicts for a schedule
 */
export const checkAllConflicts = (
  newSchedule: ScheduleItem,
  existingSchedules: ScheduleItem[],
  facultyPreferences: { day: string; startTime: string; endTime: string }[] = []
): ScheduleConflict[] => {
  const allConflicts: ScheduleConflict[] = [];
  
  // Check time conflicts
  allConflicts.push(...checkTimeConflicts(newSchedule, existingSchedules));
  
  // Check room conflicts
  allConflicts.push(...checkRoomConflicts(newSchedule, existingSchedules));
  
  // Check faculty conflicts
  allConflicts.push(...checkFacultyConflicts(newSchedule, existingSchedules));
  
  // Check preference conflicts
  allConflicts.push(...checkPreferenceConflicts(newSchedule, facultyPreferences));
  
  return allConflicts;
};

/**
 * Mark schedules with conflicts for display
 */
export const markScheduleConflicts = (
  schedules: ScheduleItem[],
  facultyPreferences: { day: string; startTime: string; endTime: string }[] = []
): (ScheduleItem & { hasConflict?: boolean; conflictType?: 'time' | 'room' | 'faculty' | 'preference'; conflicts?: ScheduleConflict[] })[] => {
  return schedules.map(schedule => {
    const conflicts = checkAllConflicts(schedule, schedules, facultyPreferences);
    
    if (conflicts.length === 0) {
      return schedule;
    }
    
    // Determine primary conflict type (prioritize room > faculty > time > preference)
    let conflictType: 'time' | 'room' | 'faculty' | 'preference' = 'preference';
    if (conflicts.some(c => c.type === 'room')) {
      conflictType = 'room';
    } else if (conflicts.some(c => c.type === 'faculty')) {
      conflictType = 'faculty';
    } else if (conflicts.some(c => c.type === 'time')) {
      conflictType = 'time';
    }
    
    return {
      ...schedule,
      hasConflict: true,
      conflictType,
      conflicts
    };
  });
};

/**
 * Validate a schedule before saving
 */
export const validateSchedule = (
  schedule: ScheduleItem,
  existingSchedules: ScheduleItem[],
  facultyPreferences: { day: string; startTime: string; endTime: string }[] = []
): { isValid: boolean; conflicts: ScheduleConflict[]; hasHardConflicts: boolean } => {
  const conflicts = checkAllConflicts(schedule, existingSchedules, facultyPreferences);
  
  // Hard conflicts are time, room, and faculty conflicts
  const hardConflicts = conflicts.filter(c => c.type !== 'preference');
  
  return {
    isValid: hardConflicts.length === 0,
    conflicts,
    hasHardConflicts: hardConflicts.length > 0
  };
};

/**
 * Get conflict summary for display
 */
export const getConflictSummary = (conflicts: ScheduleConflict[]): string => {
  if (conflicts.length === 0) return 'No conflicts';
  
  const conflictTypes = conflicts.map(c => c.type);
  const uniqueTypes = [...new Set(conflictTypes)];
  
  if (uniqueTypes.length === 1) {
    return `${conflicts.length} ${uniqueTypes[0]} conflict${conflicts.length > 1 ? 's' : ''}`;
  }
  
  return `${conflicts.length} conflicts (${uniqueTypes.join(', ')})`;
};