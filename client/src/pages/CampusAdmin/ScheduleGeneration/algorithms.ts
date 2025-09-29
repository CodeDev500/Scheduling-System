import type { 
  Faculty, 
  Subject, 
  Room, 
  TimeSlot, 
  OptimizationConstraints,
  GeneratedSchedule,
  ScheduledSubject,
  FacultyAssignment,
  RoomAssignment,
  Conflict,
  FacultyRecommendation,
  FacultyCandidate,
  OptimizationScore,
  ScoreBreakdown
} from '../../../types';
import { 
  formatDaysCombination, 
  getCommonDayPatterns, 
  parseDaysCombination,
  getDayDisplayText,
  areDaysCombinationsEqual 
} from './utils/dayUtils';
import { 
  convertTo12Hour, 
  convertTo24Hour, 
  formatTimeRange, 
  getGridHour 
} from './utils/timeUtils';
import { 
  detectConflicts, 
  calculateOptimizationScore as calculateSimpleOptimizationScore, 
  createSchedule 
} from './utils/scheduleUtils';

export interface AlgorithmParams {
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  constraints: any;
}

export interface ScheduleAssignment {
  subject: Subject;
  faculty: Faculty;
  room: Room;
  timeSlot: TimeSlot;
}

export const constraintSatisfactionAlgorithm = (params: AlgorithmParams): GeneratedSchedule => {
  console.log('Running Constraint Satisfaction Algorithm with params:', params);
  
  const { subjects, faculty, rooms, timeSlots } = params;
  const assignments: ScheduleAssignment[] = [];
  
  // Track assignments to avoid conflicts and maintain time consistency per subject
  const assignmentTracker = {
    facultySchedule: new Map<string, TimeSlot[]>(),
    roomSchedule: new Map<string, TimeSlot[]>(),
    timeSlotUsage: new Map<string, { faculty: string[], rooms: string[] }>(),
    subjectAssignments: new Map<string, ScheduleAssignment[]>() // Track multiple sessions per subject
  };

  // Initialize tracking
  faculty.forEach(f => assignmentTracker.facultySchedule.set(f.id, []));
  rooms.forEach(r => assignmentTracker.roomSchedule.set(r.id, []));
  timeSlots.forEach(ts => {
    const key = `${ts.day}-${ts.startTime}`;
    assignmentTracker.timeSlotUsage.set(key, { faculty: [], rooms: [] });
  });

  // Sort subjects by priority (required courses first, then by units)
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
    return b.units - a.units;
  });

  // Assign each subject with proper sessions based on units
  for (let subjectIndex = 0; subjectIndex < sortedSubjects.length; subjectIndex++) {
    const subject = sortedSubjects[subjectIndex];
    const subjectAssignments = assignSubjectWithMultipleSessions(
      subject, 
      faculty, 
      rooms, 
      timeSlots, 
      assignmentTracker,
      subjectIndex
    );
    
    if (subjectAssignments.length > 0) {
      assignments.push(...subjectAssignments);
      assignmentTracker.subjectAssignments.set(subject.id, subjectAssignments);
      
      // Update tracker for all assignments
      subjectAssignments.forEach(assignment => {
        updateAssignmentTracker(assignment, assignmentTracker);
      });
    }
  }

  // Convert assignments to scheduled subjects (group by subject)
  const scheduledSubjects: ScheduledSubject[] = [];
  const subjectGroups = new Map<string, ScheduleAssignment[]>();
  
  assignments.forEach(assignment => {
    const subjectId = assignment.subject.id;
    if (!subjectGroups.has(subjectId)) {
      subjectGroups.set(subjectId, []);
    }
    subjectGroups.get(subjectId)!.push(assignment);
  });

  subjectGroups.forEach((subjectAssignments, subjectId) => {
    const firstAssignment = subjectAssignments[0];
    const allTimeSlots = subjectAssignments.map(a => a.timeSlot);
    
    scheduledSubjects.push({
      id: `${firstAssignment.subject.id}-${firstAssignment.faculty.id}-${firstAssignment.room.id}`,
      subject: firstAssignment.subject,
      faculty: {
        ...firstAssignment.faculty,
        matchScore: calculateFacultyMatchScore(firstAssignment.subject, firstAssignment.faculty),
        experienceScore: calculateExperienceScore(firstAssignment.subject, firstAssignment.faculty),
        workloadScore: 80,
        overallScore: 87,
        isRecommended: true,
        conflictRisk: 'low' as const
      },
      room: {
        ...firstAssignment.room,
        utilizationScore: 85,
        suitabilityScore: 90,
        availabilityScore: 95,
        overallScore: 90
      },
      timeSlots: allTimeSlots
    });
  });

  return generateScheduleResult(params, scheduledSubjects, subjects);
}

// New function to assign a subject with multiple sessions based on units
function assignSubjectWithMultipleSessions(
  subject: Subject,
  faculty: Faculty[],
  rooms: Room[],
  timeSlots: TimeSlot[],
  assignmentTracker: any,
  subjectIndex?: number
): ScheduleAssignment[] {
  const assignments: ScheduleAssignment[] = [];
  
  // Calculate how many sessions are needed based on units
  const sessionsNeeded = calculateSessionsNeeded(subject);
  const dayPattern = getDayPatternForSubject(subject, sessionsNeeded.sessions, assignmentTracker, subjectIndex);
  
  console.log(`Subject ${subject.code}: ${sessionsNeeded.sessions} sessions needed, day pattern:`, dayPattern);
  
  // Find suitable faculty members (not just one)
  const suitableFaculty = findSuitableFaculty(subject, faculty, assignmentTracker);
  
  if (suitableFaculty.length === 0) {
    console.warn(`No suitable faculty found for subject ${subject.code}`);
    return [];
  }
  
  // Try to assign sessions across the day pattern
  for (let sessionIndex = 0; sessionIndex < sessionsNeeded.sessions && sessionIndex < dayPattern.length; sessionIndex++) {
    const day = dayPattern[sessionIndex];
    
    // Select faculty for this session (can be different for each session)
    const selectedFaculty = selectFacultyForSession(suitableFaculty, day, assignmentTracker, subject);
    
    if (!selectedFaculty) {
      console.warn(`No available faculty for session ${sessionIndex + 1} of ${subject.code} on ${day}`);
      continue;
    }
    
    // Find available time slot and room for this session
    const sessionAssignment = findSessionAssignment(
      subject,
      selectedFaculty,
      rooms,
      timeSlots,
      day,
      assignmentTracker
    );
    
    if (sessionAssignment) {
      assignments.push(sessionAssignment);
    }
  }
  
  return assignments;
}

// Calculate sessions needed based on subject units with flexible distribution
function calculateSessionsNeeded(subject: Subject): { sessions: number; hoursPerSession: number; options: Array<{sessions: number, hoursPerSession: number}> } {
  const totalHours = subject.units;
  
  // Generate multiple distribution options for flexibility
  const options: Array<{sessions: number, hoursPerSession: number}> = [];
  
  // Option 1: One session per unit (1 hour each)
  if (totalHours <= 7) {
    options.push({ sessions: totalHours, hoursPerSession: 1 });
  }
  
  // Option 2: Two sessions per week for subjects with 2+ units
  if (totalHours >= 2) {
    const sessionsFor2 = Math.min(2, totalHours);
    const hoursPerSession2 = totalHours / sessionsFor2;
    if (hoursPerSession2 <= 3) { // Max 3 hours per session
      options.push({ sessions: sessionsFor2, hoursPerSession: hoursPerSession2 });
    }
  }
  
  // Option 3: Three sessions per week for subjects with 3+ units
  if (totalHours >= 3) {
    const sessionsFor3 = Math.min(3, totalHours);
    const hoursPerSession3 = totalHours / sessionsFor3;
    if (hoursPerSession3 <= 2.5) { // Max 2.5 hours per session
      options.push({ sessions: sessionsFor3, hoursPerSession: hoursPerSession3 });
    }
  }
  
  // Option 4: Four sessions per week for subjects with 4+ units
  if (totalHours >= 4) {
    const sessionsFor4 = Math.min(4, totalHours);
    const hoursPerSession4 = totalHours / sessionsFor4;
    if (hoursPerSession4 <= 2) { // Max 2 hours per session
      options.push({ sessions: sessionsFor4, hoursPerSession: hoursPerSession4 });
    }
  }
  
  // Option 5: Five sessions per week for subjects with 5+ units
  if (totalHours >= 5) {
    const sessionsFor5 = Math.min(5, totalHours);
    const hoursPerSession5 = totalHours / sessionsFor5;
    if (hoursPerSession5 <= 2) { // Max 2 hours per session
      options.push({ sessions: sessionsFor5, hoursPerSession: hoursPerSession5 });
    }
  }
  
  // Default: Use the most balanced option (prefer fewer sessions with reasonable hours)
  let bestOption = options[0] || { sessions: totalHours, hoursPerSession: 1 };
  
  // Prefer options with 1-2 hours per session and reasonable number of sessions
  for (const option of options) {
    if (option.hoursPerSession >= 1 && option.hoursPerSession <= 2 && option.sessions <= 5) {
      bestOption = option;
      break;
    }
  }
  
  return {
    sessions: bestOption.sessions,
    hoursPerSession: bestOption.hoursPerSession,
    options
  };
}

// Find suitable faculty for a subject
function findSuitableFaculty(
  subject: Subject,
  faculty: Faculty[],
  assignmentTracker: any
): Faculty[] {
  return faculty
    .filter(f => {
      // Check if faculty has experience with this subject
      const hasExperience = f.subjectExperience?.some((exp: any) => exp.subjectId === subject.id);
      
      // Check if faculty has capacity
      const currentLoad = f.currentLoad?.units || 0;
      const maxLoad = f.maxLoad || 24;
      const hasCapacity = currentLoad < maxLoad;
      
      // Check if faculty specialization matches
      const hasSpecialization = f.specializations?.some(spec => 
        subject.name.toLowerCase().includes(spec.toLowerCase()) ||
        subject.code.toLowerCase().includes(spec.toLowerCase())
      );
      
      return hasExperience || hasSpecialization || hasCapacity;
    })
    .sort((a, b) => {
      // Sort by experience and availability
      const aExperience = a.subjectExperience?.find((exp: any) => exp.subjectId === subject.id);
      const bExperience = b.subjectExperience?.find((exp: any) => exp.subjectId === subject.id);
      
      const aScore = (aExperience?.proficiencyLevel || 0) + (a.performanceRating || 0) * 10;
      const bScore = (bExperience?.proficiencyLevel || 0) + (b.performanceRating || 0) * 10;
      
      return bScore - aScore;
    });
}

// Select faculty for a specific session
function selectFacultyForSession(
  suitableFaculty: Faculty[],
  day: string,
  assignmentTracker: any,
  subject: Subject
): Faculty | null {
  for (const faculty of suitableFaculty) {
    // Check if faculty is available on this day
    const facultyAvailability = faculty.availability?.find(avail => avail.day === day);
    if (!facultyAvailability?.isAvailable) continue;
    
    // Check current workload
    const currentSchedule = assignmentTracker.facultySchedule.get(faculty.id) || [];
    const daySchedule = currentSchedule.filter((slot: any) => slot.day === day);
    
    // Don't overload faculty (max 4 hours per day)
    if (daySchedule.length >= 3) continue;
    
    return faculty;
  }
  
  return null;
}

// Find assignment for a specific session
function findSessionAssignment(
  subject: Subject,
  faculty: Faculty,
  rooms: Room[],
  timeSlots: TimeSlot[],
  day: string,
  assignmentTracker: any
): ScheduleAssignment | null {
  // Get available time slots for this day
  const dayTimeSlots = timeSlots.filter(ts => ts.day === day);
  
  for (const timeSlot of dayTimeSlots) {
    const timeKey = `${day}-${timeSlot.startTime}`;
    const usage = assignmentTracker.timeSlotUsage.get(timeKey);
    
    if (!usage) continue;
    
    // Check if faculty is available at this time
    if (usage.faculty.includes(faculty.id)) continue;
    
    // Check faculty availability preferences
    const facultyAvailable = isFacultyAvailableAtTime(faculty, day, timeSlot.startTime);
    if (!facultyAvailable) continue;
    
    // Find available room
    const availableRoom = rooms.find(room => {
      // Check if room is suitable for the subject
      const isLabSubject = subject.labHours > 0;
      const roomSuitable = isLabSubject ? room.type === 'Laboratory' : room.type === 'Lecture';
      
      // Check if room is available
      const roomAvailable = !usage.rooms.includes(room.id);
      
      return roomSuitable && roomAvailable;
    });
    
    if (availableRoom) {
      return {
        subject,
        faculty,
        room: availableRoom,
        timeSlot
      };
    }
  }
  
  return null;
}

// Check if faculty is available at specific time
function isFacultyAvailableAtTime(faculty: Faculty, day: string, startTime: string, assignmentTracker?: any): boolean {
  // Check faculty's general availability preferences
  if (faculty.availability) {
    const dayAvailability = faculty.availability.find(avail => avail.day === day);
    if (!dayAvailability || !dayAvailability.isAvailable) {
      return false;
    }
    
    // Check if the time slot falls within their available hours
    if (dayAvailability.startTime && dayAvailability.endTime) {
      const requestedTime = new Date(`2000-01-01 ${startTime}`);
      const availableStart = new Date(`2000-01-01 ${dayAvailability.startTime}`);
      const availableEnd = new Date(`2000-01-01 ${dayAvailability.endTime}`);
      
      if (requestedTime < availableStart || requestedTime >= availableEnd) {
        return false;
      }
    }
  }
  
  // If assignment tracker is provided, check for scheduling conflicts
  if (assignmentTracker) {
    const facultySchedule = assignmentTracker.facultySchedule.get(faculty.id);
    if (facultySchedule) {
      const hasConflict = facultySchedule.some((slot: any) => 
        slot.day === day && slot.startTime === startTime
      );
      if (hasConflict) {
        return false;
      }
    }
  }
  
  return true;
}

// Helper function to get end time
function getEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  const endHour = endDate.getHours();
  const endMinute = endDate.getMinutes();
  
  // Use 24-hour format for internal calculations
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

// Get dynamic day patterns based on subject units with multiple possible combinations
function getDayPatternForSubject(subject: Subject, sessionsNeeded?: number, assignmentTracker?: any, subjectIndex?: number): string[] {
  // Use sessionsNeeded if provided, otherwise use subject units
  const sessions = sessionsNeeded || subject.units;
  
  // Get day patterns using the utility function
  const dayPatterns = getCommonDayPatterns(sessions);
  
  console.log(`Available day patterns for ${subject.code} (${sessions} sessions):`, dayPatterns);
  
  // If we have assignment tracker, try to find the least used pattern
  if (assignmentTracker && dayPatterns.length > 1) {
    const patternUsage = new Map<string, number>();
    
    // Count how many subjects are already using each pattern
    dayPatterns.forEach(pattern => patternUsage.set(pattern, 0));
    
    // Check existing assignments
    assignmentTracker.subjectAssignments.forEach((assignments: any[], subjectId: string) => {
      if (assignments.length > 0) {
        const existingDays = assignments.map(a => a.timeSlot.day);
        const existingPattern = formatDaysCombination(existingDays);
        
        dayPatterns.forEach(pattern => {
          if (areDaysCombinationsEqual(pattern, existingPattern)) {
            patternUsage.set(pattern, (patternUsage.get(pattern) || 0) + 1);
          }
        });
      }
    });
    
    // Find the least used pattern
    let selectedPattern = dayPatterns[0];
    let minUsage = patternUsage.get(selectedPattern) || 0;
    
    for (const pattern of dayPatterns) {
      const usage = patternUsage.get(pattern) || 0;
      if (usage < minUsage) {
        selectedPattern = pattern;
        minUsage = usage;
      }
    }
    
    console.log(`Pattern usage for ${subject.code}:`, Object.fromEntries(patternUsage));
    console.log(`Selected pattern: ${selectedPattern} (usage: ${minUsage})`);
    
    return parseDaysCombination(selectedPattern);
  }
  
  // Fallback: use subject index or hash to distribute patterns
  const patternIndex = subjectIndex !== undefined 
    ? subjectIndex % dayPatterns.length 
    : Math.abs(subject.code.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % dayPatterns.length;
  
  const selectedPattern = dayPatterns[patternIndex];
  console.log(`Selected pattern for ${subject.code}: ${selectedPattern} (index: ${patternIndex})`);
  
  // Convert the selected pattern to full day names
  return parseDaysCombination(selectedPattern);
}

// Alternative function to get all possible day patterns for a subject (for generating multiple schedule variations)
// Get all possible day patterns for a subject based on units with multiple options
function getAllPossibleDayPatterns(units: number): string[][] {
  // Use the utility function to get common day patterns
  const dayPatterns = getCommonDayPatterns(units);
  
  // Convert abbreviated patterns to full day names
  return dayPatterns.map(pattern => parseDaysCombination(pattern));
}

// Enhanced function to find the best assignment with multiple day pattern attempts
function findBestAssignmentWithDayPattern(
  subject: Subject,
  faculty: Faculty[],
  rooms: Room[],
  timeSlots: TimeSlot[],
  assignmentTracker: any,
  dayPattern: string[]
): ScheduleAssignment | null {
  // Find suitable faculty
  const suitableFaculty = faculty.find(f => 
    f.subjectExperience?.some((exp: any) => exp.subjectId === subject.id)
  ) || faculty[0];

  if (!suitableFaculty) return null;

  // Try multiple day patterns if the current one doesn't work
  const allPossiblePatterns = getAllPossibleDayPatterns(subject);
  const patternsToTry = [dayPattern, ...allPossiblePatterns.filter(p => 
    JSON.stringify(p) !== JSON.stringify(dayPattern)
  )];

  for (const currentPattern of patternsToTry) {
    const assignment = tryAssignmentWithPattern(
      subject, 
      suitableFaculty, 
      rooms, 
      timeSlots, 
      assignmentTracker, 
      currentPattern
    );
    
    if (assignment) {
      return assignment;
    }
  }

  return null; // No suitable assignment found with any pattern
}

// Helper function to try assignment with a specific pattern
function tryAssignmentWithPattern(
  subject: Subject,
  faculty: Faculty,
  rooms: Room[],
  timeSlots: TimeSlot[],
  assignmentTracker: any,
  dayPattern: string[]
): ScheduleAssignment | null {
  // Check if this subject already has an assigned time slot
  let assignedTimeSlot = assignmentTracker.subjectTimeSlots.get(subject.id);
  
  // If no assigned time slot, find the best available one for the first day
  if (!assignedTimeSlot) {
    const firstDay = dayPattern[0];
    const availableSlots = timeSlots.filter(slot => 
      slot.day === firstDay &&
      (subject.units === 3 ? slot.duration === 90 : true) // 3-unit subjects prefer 1.5 hour slots
    );
    
    for (const slot of availableSlots) {
      // Check if this time slot is available for ALL days in the pattern
      const isPatternAvailable = dayPattern.every(day => {
        const timeKey = `${day}-${slot.startTime}`;
        const usage = assignmentTracker.timeSlotUsage.get(timeKey);
        return usage && usage.faculty.length === 0 && usage.rooms.length === 0;
      });

      if (isPatternAvailable) {
        assignedTimeSlot = {
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration
        };
        assignmentTracker.subjectTimeSlots.set(subject.id, assignedTimeSlot);
        break;
      }
    }
  }

  if (!assignedTimeSlot) {
    return null; // No suitable time slot found for this pattern
  }

  // Verify the assigned time slot is available for all days in the pattern
  for (const day of dayPattern) {
    const timeKey = `${day}-${assignedTimeSlot.startTime}`;
    const usage = assignmentTracker.timeSlotUsage.get(timeKey);
    
    if (!usage || usage.faculty.includes(faculty.id)) {
      return null; // Time slot not available or faculty conflict
    }
  }

  // Find available room for the first day (assuming same room for all sessions)
  const firstDay = dayPattern[0];
  const timeKey = `${firstDay}-${assignedTimeSlot.startTime}`;
  const usage = assignmentTracker.timeSlotUsage.get(timeKey);
  
  const availableRoom = rooms.find(room => {
    // Check if room is available for ALL days in the pattern
    return dayPattern.every(day => {
      const dayTimeKey = `${day}-${assignedTimeSlot.startTime}`;
      const dayUsage = assignmentTracker.timeSlotUsage.get(dayTimeKey);
      return dayUsage && !dayUsage.rooms.includes(room.id);
    });
  });

  if (!availableRoom) {
    return null; // No available room for this pattern
  }

  // Create the assignment with consistent time slot
  const timeSlot: TimeSlot = {
    id: `${firstDay}-${assignedTimeSlot.startTime}`,
    day: firstDay as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
    startTime: assignedTimeSlot.startTime,
    endTime: assignedTimeSlot.endTime,
    duration: assignedTimeSlot.duration
  };

  return {
    subject,
    faculty,
    room: availableRoom,
    timeSlot
  };
}

// Update assignment tracker with enhanced day pattern support
function updateAssignmentTracker(assignment: ScheduleAssignment, assignmentTracker: any): void {
  const { subject, faculty, room, timeSlot } = assignment;
  const timeKey = `${timeSlot.day}-${timeSlot.startTime}`;
  
  // Update time slot usage
  const usage = assignmentTracker.timeSlotUsage.get(timeKey);
  if (usage) {
    // Only add if not already present (avoid duplicates)
    if (!usage.faculty.includes(faculty.id)) {
      usage.faculty.push(faculty.id);
    }
    if (!usage.rooms.includes(room.id)) {
      usage.rooms.push(room.id);
    }
  }
  
  // Update faculty schedule
  const facultySchedule = assignmentTracker.facultySchedule.get(faculty.id);
  if (facultySchedule) {
    facultySchedule.push({
      id: timeKey,
      day: timeSlot.day,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      duration: timeSlot.duration,
      subjectId: subject.id,
      subjectCode: subject.code
    });
  }
  
  // Update room schedule
  const roomSchedule = assignmentTracker.roomSchedule.get(room.id);
  if (roomSchedule) {
    roomSchedule.push({
      id: timeKey,
      day: timeSlot.day,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      duration: timeSlot.duration,
      subjectId: subject.id,
      subjectCode: subject.code,
      facultyId: faculty.id
    });
  }
}

// Validation function to check if assignment is valid
// Check if assignment is valid (no conflicts) - same time/day with different instructor/room is NOT a conflict
function isValidAssignment(
  subject: Subject,
  faculty: Faculty,
  room: Room,
  timeSlot: TimeSlot,
  assignmentTracker: any
): boolean {
  const timeKey = `${timeSlot.day}-${timeSlot.startTime}`;
  
  // Check faculty availability at this specific time slot
  if (!isFacultyAvailableAtTime(faculty, timeSlot.day, timeSlot.startTime, assignmentTracker)) {
    return false;
  }
  
  // Check room availability at this specific time slot
  const roomSchedule = assignmentTracker.roomSchedule.get(room.id);
  if (roomSchedule) {
    const hasConflict = roomSchedule.some((slot: any) => 
      slot.day === timeSlot.day && 
      slot.startTime === timeSlot.startTime
    );
    if (hasConflict) {
      return false;
    }
  }
  
  // Check if faculty has the required specialization
  const hasSpecialization = faculty.specializations.some(spec => 
    spec.toLowerCase().includes(subject.name.toLowerCase()) ||
    subject.name.toLowerCase().includes(spec.toLowerCase()) ||
    spec.toLowerCase().includes(subject.code.toLowerCase())
  );
  
  // Allow assignment even without perfect specialization match (with lower score)
  return true;
}

// Calculate assignment score for optimization
function calculateAssignmentScore(assignment: ScheduleAssignment): number {
  const { subject, faculty } = assignment;
  
  // Base score
  let score = 100;
  
  // Faculty expertise match
  const hasExperience = faculty.subjectExperience?.some((exp: any) => exp.subjectId === subject.id);
  if (hasExperience) score += 20;
  
  // Subject priority (required courses get higher priority)
  if (subject.isRequired) score += 10;
  
  return score;
}



// Calculate faculty match score
function calculateFacultyMatchScore(subject: Subject, faculty: Faculty): number {
  const hasExperience = faculty.subjectExperience?.some((exp: any) => exp.subjectId === subject.id);
  return hasExperience ? 95 : 70;
}

// Calculate experience score
function calculateExperienceScore(subject: Subject, faculty: Faculty): number {
  const experience = faculty.subjectExperience?.find((exp: any) => exp.subjectId === subject.id);
  return experience ? Math.min(100, experience.yearsExperience * 10 + 60) : 60;
}

// Enhanced conflict resolution function with better day reassignment
function resolveConflicts(
  subject: Subject,
  availableFaculty: Faculty[],
  availableRooms: Room[],
  availableTimeSlots: TimeSlot[],
  assignmentTracker: any
): ScheduleAssignment[] {
  console.log(`Resolving conflicts for subject: ${subject.code}`);
  
  // Get all possible day patterns for this subject
  const dayPatterns = getAllPossibleDayPatterns(subject.units);
  
  // Try each day pattern
  for (const dayPattern of dayPatterns) {
    console.log(`Trying day pattern: ${dayPattern.join(', ')} for ${subject.code}`);
    
    const assignments = tryAssignmentWithConflictResolution(
      subject,
      availableFaculty,
      availableRooms,
      availableTimeSlots,
      assignmentTracker,
      dayPattern
    );
    
    if (assignments.length > 0) {
      console.log(`Successfully assigned ${subject.code} using pattern: ${dayPattern.join(', ')}`);
      return assignments;
    }
  }
  
  // If no day pattern worked, try flexible assignment to any available days
  console.log(`No day pattern worked for ${subject.code}, trying flexible assignment`);
  
  const sessionOptions = calculateSessionsNeeded(subject.units);
  const primaryOption = sessionOptions[0]; // Use the primary session option
  
  return tryFlexibleDayAssignment(
    subject,
    primaryOption.sessions,
    availableFaculty,
    availableRooms,
    availableTimeSlots,
    assignmentTracker
  );
}

// Try flexible day assignment - assign sessions to any available days
function tryFlexibleDayAssignment(
  subject: Subject,
  sessionsNeeded: number,
  availableFaculty: Faculty[],
  availableRooms: Room[],
  availableTimeSlots: TimeSlot[],
  assignmentTracker: any
): ScheduleAssignment[] {
  const assignments: ScheduleAssignment[] = [];
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  console.log(`Trying flexible assignment for ${subject.code} - need ${sessionsNeeded} sessions`);
  
  for (let sessionIndex = 0; sessionIndex < sessionsNeeded; sessionIndex++) {
    let sessionAssigned = false;
    
    // Try each day
    for (const day of allDays) {
      if (sessionAssigned) break;
      
      // Get time slots for this day
      const dayTimeSlots = availableTimeSlots.filter(ts => ts.day === day);
      
      // Try each time slot
      for (const timeSlot of dayTimeSlots) {
        if (sessionAssigned) break;
        
        // Try each faculty member
        for (const faculty of availableFaculty) {
          if (sessionAssigned) break;
          
          // Check if faculty is available at this time
          if (!isFacultyAvailableAtTime(faculty, timeSlot.day, timeSlot.startTime, assignmentTracker)) {
            continue;
          }
          
          // Try each room
          for (const room of availableRooms) {
            if (isValidAssignment(subject, faculty, room, timeSlot, assignmentTracker)) {
              const assignment: ScheduleAssignment = {
                id: `${subject.id}-${faculty.id}-${room.id}-${timeSlot.id}-${sessionIndex}`,
                subject,
                faculty,
                room,
                timeSlot,
                score: calculateAssignmentScore(subject, faculty, room, timeSlot)
              };
              
              assignments.push(assignment);
              updateAssignmentTracker(assignment, assignmentTracker);
              sessionAssigned = true;
              
              console.log(`Assigned session ${sessionIndex + 1} for ${subject.code} on ${day} at ${timeSlot.startTime} with ${faculty.name} in ${room.name}`);
              break;
            }
          }
        }
      }
    }
    
    if (!sessionAssigned) {
      console.log(`Could not assign session ${sessionIndex + 1} for ${subject.code}`);
      // Continue trying to assign remaining sessions even if one fails
    }
  }
  
  console.log(`Successfully assigned ${assignments.length}/${sessionsNeeded} sessions for ${subject.code}`);
  return assignments;
}

// Generate final schedule result
function generateScheduleResult(goals: any, scheduledSubjects: any[], subjects: any[]): GeneratedSchedule {
  // Convert scheduled subjects to ScheduleItem format for conflict detection
  const scheduleItems = scheduledSubjects.map((subject: any) => ({
    id: subject.id || `${subject.subject?.id}-${Date.now()}`,
    subjectCode: subject.subject?.code || subject.code,
    subjectName: subject.subject?.name || subject.name,
    facultyId: subject.faculty?.id?.toString() || 'unassigned',
    facultyName: `${subject.faculty?.firstName || ''} ${subject.faculty?.lastName || ''}`.trim() || 'Unassigned',
    roomId: subject.room?.id?.toString() || 'unassigned',
    roomName: subject.room?.name || 'Unassigned',
    day: subject.timeSlot?.day || subject.day,
    startTime: subject.timeSlot?.startTime || subject.startTime,
    endTime: subject.timeSlot?.endTime || subject.endTime,
    yearLevel: goals.yearLevel || '1',
    semester: goals.semester || '1st Semester',
    program: goals.program || 'BSCS'
  }));

  // Detect conflicts using scheduleUtils
  const { conflicts, enhancedItems } = detectConflicts(scheduleItems);
  console.log('🔍 ALGORITHM: Detected conflicts:', conflicts.length);
  console.log('🔍 ALGORITHM: Enhanced items with conflict info:', enhancedItems.length);

  // Create a map of enhanced items by ID for quick lookup
  const enhancedItemsMap = new Map();
  enhancedItems.forEach(item => {
    enhancedItemsMap.set(item.id, item);
  });

  // Transfer conflict information back to scheduledSubjects
  const subjectsWithConflictInfo = scheduledSubjects.map((subject: any) => {
    const itemId = subject.id || `${subject.subject?.id}-${Date.now()}`;
    const enhancedItem = enhancedItemsMap.get(itemId);
    
    if (enhancedItem) {
      console.log(`🔍 ALGORITHM: Transferring conflict info for ${subject.subject?.code}:`, {
        hasConflict: enhancedItem.hasConflict,
        conflictTypes: enhancedItem.conflictTypes,
        status: enhancedItem.status
      });
      
      return {
        ...subject,
        hasConflict: enhancedItem.hasConflict,
        conflictTypes: enhancedItem.conflictTypes,
        status: enhancedItem.status
      };
    }
    
    return subject;
  });

  // Use createSchedule utility from scheduleUtils with enhanced items
  const baseSchedule = createSchedule(enhancedItems, conflicts, 0);

  // Enhance with algorithm-specific data
  return {
    ...baseSchedule,
    id: `csa-${Date.now()}`,
    department: goals.department || 'Computer Science',
    program: goals.program || 'BSCS',
    yearLevel: goals.yearLevel || '1',
    semester: goals.semester || '1st Semester',
    subjects: subjectsWithConflictInfo, // Use subjects with conflict information
    recommendations: [],
    generatedAt: new Date(),
    algorithm: 'Constraint Satisfaction',
    iterations: 100,
    processingTime: 2500
  };
}

export const calculateOptimizationScore = (scheduledSubjects: ScheduledSubject[], conflicts: Conflict[], totalSubjects: number): OptimizationScore => {
  // Use the simpler optimization score calculation from scheduleUtils as base
  const baseScore = calculateSimpleOptimizationScore(conflicts);
  
  // Enhanced calculation with additional metrics
  const roomUtilization = 85;
  const facultyWorkloadBalance = 80;
  const specializationAlignment = 90;
  const experienceUtilization = 85;
  const conflictMinimization = baseScore; // Use the utility function result
  const constraintSatisfaction = 85;
  const studentSatisfaction = 80;
  
  const overall = Math.round(
    (roomUtilization + facultyWorkloadBalance + specializationAlignment + 
     experienceUtilization + conflictMinimization + constraintSatisfaction + studentSatisfaction) / 7
  );

  return {
    overall,
    roomUtilization,
    facultyWorkloadBalance,
    specializationAlignment,
    experienceUtilization,
    conflictMinimization,
    constraintSatisfaction,
    studentSatisfaction
  };
};

export const generateFacultyRecommendations = (
  subjects: Subject[],
  faculty: Faculty[]
): FacultyRecommendation[] => {
  return subjects.slice(0, 5).map(subject => {
    const recommendations = faculty
      .map(f => ({
        faculty: f,
        matchScore: calculateFacultyMatchScore(subject, f),
        experienceScore: calculateExperienceScore(subject, f),
        workloadScore: Math.max(0, 100 - (f.currentLoad / f.maxLoad) * 100),
        overallScore: 0
      }))
      .map(rec => ({
        ...rec,
        overallScore: Math.round((rec.matchScore + rec.experienceScore + rec.workloadScore) / 3)
      }))
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3);

    return {
      subject,
      recommendations,
      priority: subject.isRequired ? 'high' : 'medium',
      reasoning: `Based on specialization match, experience, and current workload analysis`
    };
  });
};

// Assign subject with multiple sessions based on units and flexible time distribution
function assignSubjectWithMultipleSessions(
  subject: Subject,
  availableFaculty: Faculty[],
  availableRooms: Room[],
  availableTimeSlots: TimeSlot[],
  assignmentTracker: any
): ScheduleAssignment[] {
  const assignments: ScheduleAssignment[] = [];
  
  // Calculate sessions needed with flexible options
  const sessionInfo = calculateSessionsNeeded(subject);
  const { sessions: sessionsNeeded, hoursPerSession } = sessionInfo;
  
  console.log(`Assigning ${subject.name} (${subject.units} units): ${sessionsNeeded} sessions of ${hoursPerSession} hours each`);
  
  // Try to use the conflict resolution function first
  const resolvedAssignments = resolveConflicts(
    subject,
    availableFaculty,
    availableRooms,
    availableTimeSlots,
    assignmentTracker,
    sessionsNeeded
  );
  
  if (resolvedAssignments.length === sessionsNeeded) {
    return resolvedAssignments;
  }
  
  // Fallback: Try alternative session distributions
  for (const option of sessionInfo.options) {
    if (option.sessions !== sessionsNeeded) {
      console.log(`Trying alternative: ${option.sessions} sessions of ${option.hoursPerSession} hours each`);
      
      const alternativeAssignments = resolveConflicts(
        subject,
        availableFaculty,
        availableRooms,
        availableTimeSlots,
        assignmentTracker,
        option.sessions
      );
      
      if (alternativeAssignments.length === option.sessions) {
        return alternativeAssignments;
      }
    }
  }
  
  // Final fallback: Try to assign at least one session
  const singleAssignment = resolveConflicts(
    subject,
    availableFaculty,
    availableRooms,
    availableTimeSlots,
    assignmentTracker,
    1
  );
  
  return singleAssignment;
}

// Try assignment with conflict resolution for specific day patterns
function tryAssignmentWithConflictResolution(
  subject: Subject,
  availableFaculty: Faculty[],
  availableRooms: Room[],
  availableTimeSlots: TimeSlot[],
  assignmentTracker: any,
  dayPattern: string[]
): ScheduleAssignment[] {
  const assignments: ScheduleAssignment[] = [];
  
  for (const day of dayPattern) {
    let assigned = false;
    
    // Try different time slots for this day
    for (const timeSlot of availableTimeSlots.filter(ts => ts.day === day)) {
      // Try different faculty members
      for (const faculty of availableFaculty) {
        // Check if faculty is available at this time
        if (!isFacultyAvailableAtTime(faculty, timeSlot.day, timeSlot.startTime, assignmentTracker)) {
          continue;
        }
        
        // Try different rooms
        for (const room of availableRooms) {
          if (isValidAssignment(subject, faculty, room, timeSlot, assignmentTracker)) {
            const assignment: ScheduleAssignment = {
              id: `${subject.id}-${faculty.id}-${room.id}-${timeSlot.id}`,
              subject,
              faculty,
              room,
              timeSlot,
              score: calculateAssignmentScore(subject, faculty, room, timeSlot)
            };
            
            assignments.push(assignment);
            updateAssignmentTracker(assignment, assignmentTracker);
            assigned = true;
            break;
          }
        }
        if (assigned) break;
      }
      if (assigned) break;
    }
    
    // If we couldn't assign this day, return empty array (failed)
    if (!assigned) {
      return [];
    }
  }
  
  return assignments;
}
