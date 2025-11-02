/**
 * Conflict validation utilities for schedule generation
 * Validates time overlaps between classes with the same program, year level, and day pattern
 */

interface Schedule {
  id: string;
  subjectCode?: string;
  subjectName?: string;
  program: string;
  yearLevel: string;
  semester?: string;
  day: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  roomName?: string;
  roomId?: string;
  facultyId?: string;
  facultyName?: string;
  faculty?: string;
}

export interface ConflictDetail {
  subjectA: string;
  subjectB: string;
  days: string;
  startTime: string;
  endTime: string;
  program: string;
  yearLevel: string;
  conflictType: 'instructor' | 'room';
  room?: string;
  instructor?: string;
}

/**
 * Converts time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  if (!time || time === 'TBA') return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks if two time ranges overlap
 * Returns true if: StartTime1 < EndTime2 AND EndTime1 > StartTime2
 */
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  return start1Min < end2Min && end1Min > start2Min;
}

/**
 * Extracts individual days from a day pattern string
 * Examples: "MW" -> ["Monday", "Wednesday"], "TTh" -> ["Tuesday", "Thursday"]
 * Also handles full day names: "Monday", "Tuesday", etc.
 */
function parseDayPattern(dayPattern: string): string[] {
  if (!dayPattern || dayPattern === 'TBA') return [];
  
  // CRITICAL: Check if it's already a full day name (from backend)
  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (fullDayNames.includes(dayPattern)) {
    return [dayPattern];
  }
  
  // Handle comma-separated full day names (e.g., "Monday,Wednesday")
  if (dayPattern.includes(',')) {
    return dayPattern.split(',').map(d => d.trim()).filter(d => fullDayNames.includes(d));
  }
  
  // Handle complex patterns like "F 09:00-11:30; F 13:00-15:00"
  if (dayPattern.includes(';')) {
    // Extract unique days from semicolon-separated patterns
    const parts = dayPattern.split(';').map(p => p.trim());
    const days = new Set<string>();
    parts.forEach(part => {
      const dayMatch = part.match(/^([A-Za-z]+)/);
      if (dayMatch) {
        days.add(expandDayAbbreviation(dayMatch[1]));
      }
    });
    return Array.from(days);
  }
  
  // Handle standard abbreviations: MW, TTh, F, S, etc.
  const days: string[] = [];
  let i = 0;
  
  while (i < dayPattern.length) {
    // Check for two-character abbreviations first
    if (i < dayPattern.length - 1) {
      const twoChar = dayPattern.substring(i, i + 2);
      if (twoChar === 'Th' || twoChar === 'Su') {
        days.push(expandDayAbbreviation(twoChar));
        i += 2;
        continue;
      }
    }
    
    // Single character abbreviation
    const oneChar = dayPattern.charAt(i);
    days.push(expandDayAbbreviation(oneChar));
    i++;
  }
  
  return days;
}

/**
 * Expands day abbreviation to full day name
 */
function expandDayAbbreviation(abbr: string): string {
  const dayMap: Record<string, string> = {
    'M': 'Monday',
    'T': 'Tuesday',
    'W': 'Wednesday',
    'Th': 'Thursday',
    'F': 'Friday',
    'S': 'Saturday',
    'Su': 'Sunday'
  };
  return dayMap[abbr] || abbr;
}

/**
 * Checks if two day patterns share any common days
 */
function dayPatternsOverlap(pattern1: string, pattern2: string): boolean {
  const days1 = parseDayPattern(pattern1);
  const days2 = parseDayPattern(pattern2);
  
  return days1.some(day => days2.includes(day));
}

/**
 * Validates schedules for time conflicts
 * Checks both:
 * 1. Same program/year level with overlapping times
 * 2. Same room with overlapping times (regardless of program/year)
 * Returns an array of conflict details if conflicts exist
 */
export function validateScheduleConflicts(schedules: Schedule[]): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];
  
  console.log('🔍 Starting conflict validation for', schedules.length, 'schedules');
  
  // Filter out schedules with missing time information
  const validSchedules = schedules.filter(schedule => {
    if (!schedule.startTime || !schedule.endTime || 
        schedule.startTime === 'TBA' || schedule.endTime === 'TBA') {
      console.log('⏭️ Skipping schedule (missing time):', schedule.subjectCode);
      return false;
    }
    return true;
  });
  
  console.log(`📋 Validating ${validSchedules.length} schedules with complete time info`);
  
  // Check all pairs of schedules for conflicts
  for (let i = 0; i < validSchedules.length; i++) {
    for (let j = i + 1; j < validSchedules.length; j++) {
      const scheduleA = validSchedules[i];
      const scheduleB = validSchedules[j];
      
      // CRITICAL: Skip if comparing the same subject's different sessions
      // (e.g., CC 100 Monday vs CC 100 Wednesday - these are paired sessions, not conflicts)
      const sameSubject = scheduleA.subjectCode === scheduleB.subjectCode && 
                          scheduleA.program === scheduleB.program &&
                          scheduleA.yearLevel === scheduleB.yearLevel &&
                          scheduleA.semester === scheduleB.semester;
      
      if (sameSubject) {
        continue; // Same subject's different sessions - NOT a conflict
      }
      
      // Check if they share any common days
      const daysOverlap = dayPatternsOverlap(scheduleA.day, scheduleB.day);
      
      if (!daysOverlap) {
        continue; // No day overlap, skip
      }
      
      // Check if time ranges overlap
      const timesOverlap = timeRangesOverlap(
        scheduleA.startTime!,
        scheduleA.endTime!,
        scheduleB.startTime!,
        scheduleB.endTime!
      );
      
      if (!timesOverlap) {
        continue; // No time overlap, skip
      }
      
      // At this point, we have both day and time overlap
      // Now check if this is a conflict
      
      // CRITICAL: Only conflicts if SAME SEMESTER
      const sameSemester = scheduleA.semester === scheduleB.semester;
      
      if (!sameSemester) {
        console.log(`✅ Different semester - IGNORE: ${scheduleA.subjectCode} (${scheduleA.semester}) vs ${scheduleB.subjectCode} (${scheduleB.semester})`);
        continue; // Different semesters = NO CONFLICT
      }
      
      // Check for REAL conflicts: same instructor OR same room
      const facultyA = scheduleA.facultyId || scheduleA.faculty || scheduleA.facultyName || '';
      const facultyB = scheduleB.facultyId || scheduleB.faculty || scheduleB.facultyName || '';
      const sameInstructor = facultyA && facultyB && facultyA === facultyB;
      
      const roomA = scheduleA.roomName || scheduleA.room || '';
      const roomB = scheduleB.roomName || scheduleB.room || '';
      const sameRoom = roomA && roomB && roomA === roomB;
      
      // Find the overlapping days
      const daysA = parseDayPattern(scheduleA.day);
      const daysB = parseDayPattern(scheduleB.day);
      const commonDays = daysA.filter(day => daysB.includes(day));
      
      // Calculate the actual overlap time range
      const overlapStart = timeToMinutes(scheduleA.startTime!) > timeToMinutes(scheduleB.startTime!) 
        ? scheduleA.startTime! 
        : scheduleB.startTime!;
      const overlapEnd = timeToMinutes(scheduleA.endTime!) < timeToMinutes(scheduleB.endTime!) 
        ? scheduleA.endTime! 
        : scheduleB.endTime!;
      
      // ONLY flag conflict if same instructor OR same room (not just same program/year)
      if (sameInstructor) {
        console.log(`⚠️ INSTRUCTOR CONFLICT: ${scheduleA.subjectCode} vs ${scheduleB.subjectCode} (${scheduleA.facultyName || facultyA})`);
        conflicts.push({
          subjectA: scheduleA.subjectCode || scheduleA.subjectName || 'Unknown',
          subjectB: scheduleB.subjectCode || scheduleB.subjectName || 'Unknown',
          days: commonDays.join(', '),
          startTime: overlapStart,
          endTime: overlapEnd,
          program: `${scheduleA.program} vs ${scheduleB.program}`,
          yearLevel: `${scheduleA.yearLevel} vs ${scheduleB.yearLevel}`,
          conflictType: 'instructor',
          instructor: scheduleA.facultyName || facultyA
        });
      }
      
      if (sameRoom) {
        console.log(`⚠️ ROOM CONFLICT: ${scheduleA.subjectCode} vs ${scheduleB.subjectCode} (${roomA})`);
        conflicts.push({
          subjectA: scheduleA.subjectCode || scheduleA.subjectName || 'Unknown',
          subjectB: scheduleB.subjectCode || scheduleB.subjectName || 'Unknown',
          days: commonDays.join(', '),
          startTime: overlapStart,
          endTime: overlapEnd,
          program: `${scheduleA.program} vs ${scheduleB.program}`,
          yearLevel: `${scheduleA.yearLevel} vs ${scheduleB.yearLevel}`,
          conflictType: 'room',
          room: roomA
        });
      }
    }
  }
  
  console.log(`\n✅ Validation complete: ${conflicts.length} conflicts found`);
  return conflicts;
}

/**
 * Formats conflict details into a user-friendly error message
 */
export function formatConflictMessage(conflicts: ConflictDetail[]): string {
  if (conflicts.length === 0) return '';
  
  const messages = conflicts.map(conflict => 
    `⚠️ Conflict detected: ${conflict.subjectA} overlaps with ${conflict.subjectB} ` +
    `on ${conflict.days} from ${conflict.startTime} to ${conflict.endTime} ` +
    `(${conflict.program} - ${conflict.yearLevel})`
  );
  
  return messages.join('\n');
}
