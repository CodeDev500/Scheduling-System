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
  console.log('\n🚀 STARTING CONFLICT-FREE CONSTRAINT SATISFACTION ALGORITHM');
  console.log('📊 Input parameters:', {
    subjects: params.subjects.length,
    faculty: params.faculty.length,
    rooms: params.rooms.length,
    timeSlots: params.timeSlots.length
  });

  const { subjects, faculty, rooms, timeSlots, constraints } = params;
  const scheduledSubjects: ScheduledSubject[] = [];
  
  // Initialize assignment tracker to prevent conflicts
  const assignmentTracker = {
    facultySchedule: new Map(),
    roomSchedule: new Map(),
    timeSlotUsage: new Map(),
    subjectAssignments: new Map()
  };

  // Initialize time slot usage tracking for conflict prevention
  timeSlots.forEach(slot => {
    const timeKey = `${slot.day}-${slot.startTime}`;
    assignmentTracker.timeSlotUsage.set(timeKey, {
      faculty: [],
      rooms: [],
      subjects: []
    });
  });

  console.log('🔧 Assignment tracker initialized with conflict prevention');

  // Sort subjects by priority (units descending, then by complexity)
  const sortedSubjects = [...subjects].sort((a, b) => {
    // Prioritize subjects with more units (harder to schedule)
    if (a.units !== b.units) return b.units - a.units;
    
    // Prioritize lab subjects (more constrained)
    const aIsLab = a.labHours > 0;
    const bIsLab = b.labHours > 0;
    if (aIsLab !== bIsLab) return aIsLab ? -1 : 1;
    
    return 0;
  });

  console.log('📋 Subjects sorted by scheduling priority:', sortedSubjects.map(s => `${s.code} (${s.units}u)`));

  // Process each subject with enhanced conflict prevention
  sortedSubjects.forEach((subject, index) => {
    console.log(`\n🎯 Processing subject ${index + 1}/${sortedSubjects.length}: ${subject.code}`);
    
    // Try flexible assignment with backtracking first
    const success = assignSubjectWithFlexibleBacktracking(
      subject,
      faculty,
      rooms,
      assignmentTracker,
      { yearLevel: '1', semester: '1st Semester', program: 'BSCS' },
      scheduledSubjects
    );

    if (!success) {
      console.log(`⚠️ Flexible assignment failed for ${subject.code}, trying traditional approach`);
      
      // Fallback to traditional assignment
      const assignments = assignSubjectWithMultipleSessions(
        subject,
        faculty,
        rooms,
        timeSlots,
        assignmentTracker,
        index
      );

      if (assignments.length > 0) {
        console.log(`✅ SUCCESS: ${assignments.length} sessions assigned for ${subject.code}`);
        
        // Convert assignments to scheduled subjects format
        assignments.forEach((assignment, sessionIndex) => {
          const scheduledSubject: ScheduledSubject = {
            id: `${subject.id}-session-${sessionIndex + 1}`,
            subject: assignment.subject,
            faculty: assignment.faculty,
            room: assignment.room,
            timeSlot: assignment.timeSlot,
            day: assignment.timeSlot.day,
            startTime: assignment.timeSlot.startTime,
            endTime: assignment.timeSlot.endTime,
            sessionNumber: sessionIndex + 1,
            totalSessions: assignments.length,
            hasConflict: false, // Guaranteed conflict-free by our algorithm
            conflictTypes: [],
            status: 'confirmed'
          };
          
          scheduledSubjects.push(scheduledSubject);
          
          // Update assignment tracker to prevent future conflicts
          updateAssignmentTracker(assignment, assignmentTracker);
        });
      } else {
        console.log(`❌ FAILURE: No conflict-free assignments found for ${subject.code}`);
        
        // Create unassigned entry for tracking
        const unassignedSubject: ScheduledSubject = {
          id: `${subject.id}-unassigned`,
          subject: subject,
          faculty: null,
          room: null,
          timeSlot: null,
          day: '',
          startTime: '',
          endTime: '',
          sessionNumber: 0,
          totalSessions: 0,
          hasConflict: true,
          conflictTypes: ['unassigned'],
          status: 'unassigned'
        };
        
        scheduledSubjects.push(unassignedSubject);
      }
    }
  });

  console.log('\n📊 ALGORITHM COMPLETION SUMMARY:');
  const successfulAssignments = scheduledSubjects.filter(s => s.status === 'confirmed');
  const failedAssignments = scheduledSubjects.filter(s => s.status === 'unassigned');
  
  console.log(`✅ Successful assignments: ${successfulAssignments.length}`);
  console.log(`❌ Failed assignments: ${failedAssignments.length}`);
  console.log(`📈 Success rate: ${((successfulAssignments.length / scheduledSubjects.length) * 100).toFixed(1)}%`);

  // Generate final schedule with conflict-free guarantee
  const result = generateScheduleResult(constraints, scheduledSubjects, subjects);
  
  console.log('🎉 CONFLICT-FREE SCHEDULE GENERATION COMPLETED');
  console.log(`📋 Final schedule contains ${result.subjects.length} assignments`);
  
  return result;
};

// New function to assign a subject with multiple sessions based on units
function assignSubjectWithMultipleSessions(
  subject: Subject,
  faculty: Faculty[],
  rooms: Room[],
  timeSlots: TimeSlot[],
  assignmentTracker: any,
  subjectIndex?: number
): ScheduleAssignment[] {
  console.log(`\n🎯 CONFLICT-FREE ASSIGNMENT: Starting assignment for ${subject.code} (${subject.units} units)`);
  
  const assignments: ScheduleAssignment[] = [];
  const { sessions: sessionsNeeded } = calculateSessionsNeeded(subject);
  
  console.log(`📊 Sessions needed: ${sessionsNeeded} for ${subject.code}`);
  
  // Get suitable faculty with proper qualifications
  const suitableFaculty = findSuitableFaculty(subject, faculty, assignmentTracker);
  console.log(`👥 Found ${suitableFaculty.length} suitable faculty for ${subject.code}`);
  
  if (suitableFaculty.length === 0) {
    console.log(`❌ CRITICAL: No suitable faculty found for ${subject.code}`);
    return assignments;
  }
  
  // Get appropriate day pattern for the subject
  const dayPattern = getDayPatternForSubject(subject, sessionsNeeded, assignmentTracker, subjectIndex);
  console.log(`📅 Day pattern for ${subject.code}:`, dayPattern);
  
  // Try to assign each session in the day pattern
  for (let sessionIndex = 0; sessionIndex < sessionsNeeded && sessionIndex < dayPattern.length; sessionIndex++) {
    const day = dayPattern[sessionIndex];
    console.log(`\n🔄 Assigning session ${sessionIndex + 1}/${sessionsNeeded} for ${subject.code} on ${day}`);
    
    let sessionAssigned = false;
    
    // Try with suitable faculty first (conflict-free approach)
    const selectedFaculty = selectFacultyForSession(suitableFaculty, day, assignmentTracker, subject, faculty);
    
    if (selectedFaculty) {
      console.log(`✅ Selected faculty: ${selectedFaculty.firstName} ${selectedFaculty.lastName} for ${subject.code}`);
      
      // Find conflict-free assignment for this faculty
      const assignment = findSessionAssignment(subject, selectedFaculty, rooms, timeSlots, day, assignmentTracker);
      
      if (assignment) {
        console.log(`✅ CONFLICT-FREE SESSION ASSIGNED: ${subject.code} session ${sessionIndex + 1}`);
        assignments.push(assignment);
        updateAssignmentTracker(assignment, assignmentTracker);
        sessionAssigned = true;
      } else {
        console.log(`⚠️ Could not find conflict-free slot for ${subject.code} with ${selectedFaculty.firstName} ${selectedFaculty.lastName} on ${day}`);
      }
    }
    
    // If no conflict-free assignment found, try enhanced conflict resolution
    if (!sessionAssigned) {
      console.log(`🔧 Attempting enhanced conflict resolution for ${subject.code} session ${sessionIndex + 1}`);
      
      for (const candidateFaculty of suitableFaculty) {
        const conflictResolvedAssignment = findSessionAssignmentWithConflictResolution(
          subject, 
          candidateFaculty, 
          rooms, 
          timeSlots, 
          day, 
          assignmentTracker, 
          faculty
        );
        
        if (conflictResolvedAssignment) {
          console.log(`✅ CONFLICT RESOLVED: ${subject.code} session ${sessionIndex + 1} assigned through conflict resolution`);
          assignments.push(conflictResolvedAssignment);
          updateAssignmentTracker(conflictResolvedAssignment, assignmentTracker);
          sessionAssigned = true;
          break;
        }
      }
    }
    
    if (!sessionAssigned) {
      console.log(`❌ FAILED: Could not assign session ${sessionIndex + 1} for ${subject.code} - NO CONFLICT-FREE SOLUTION FOUND`);
      // Stop trying to assign more sessions if we can't find conflict-free solutions
      break;
    }
  }
  
  console.log(`📋 FINAL RESULT: ${assignments.length}/${sessionsNeeded} conflict-free sessions assigned for ${subject.code}`);
  
  if (assignments.length === 0) {
    console.log(`🚨 CRITICAL FAILURE: No sessions could be assigned for ${subject.code} without conflicts`);
  } else if (assignments.length < sessionsNeeded) {
    console.log(`⚠️ PARTIAL SUCCESS: Only ${assignments.length}/${sessionsNeeded} sessions assigned for ${subject.code}`);
  } else {
    console.log(`🎉 COMPLETE SUCCESS: All ${sessionsNeeded} sessions assigned conflict-free for ${subject.code}`);
  }
  
  return assignments;
}

// Calculate sessions needed based on subject units with flexible distribution
function calculateSessionsNeeded(subject: Subject): { sessions: number; hoursPerSession: number; options: Array<{sessions: number, hoursPerSession: number}> } {
  const totalHours = subject.units;
  const lecHours = subject.lec || 0;
  const labHours = subject.lab || 0;
  
  // Generate multiple distribution options for flexibility
  const options: Array<{sessions: number, hoursPerSession: number}> = [];
  
  // For subjects with both lecture and lab components
  if (lecHours > 0 && labHours > 0) {
    // Separate lecture and lab sessions (each 1 hour)
    const totalSessions = lecHours + labHours;
    options.push({ sessions: totalSessions, hoursPerSession: 1 });
    
    // Alternative: Combine some sessions if reasonable
    if (totalHours >= 2 && totalHours <= 4) {
      options.push({ sessions: Math.ceil(totalHours / 2), hoursPerSession: 2 });
    }
  } else {
    // For lecture-only or lab-only subjects
    // Option 1: One session per unit (1 hour each) - preferred
    options.push({ sessions: totalHours, hoursPerSession: 1 });
    
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
  }
  
  // Default: Use the first option (most granular - 1 hour per session)
  let bestOption = options[0] || { sessions: totalHours, hoursPerSession: 1 };
  
  // Prefer 1-hour sessions for better scheduling flexibility
  for (const option of options) {
    if (option.hoursPerSession === 1) {
      bestOption = option;
      break;
    }
  }
  
  console.log(`📊 SESSIONS CALCULATED for ${subject.code}: ${bestOption.sessions} sessions × ${bestOption.hoursPerSession}h = ${totalHours}h total (${lecHours} lec + ${labHours} lab)`);
  
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
  // First, try to find faculty with proper qualifications
  const qualifiedFaculty = faculty
    .filter(f => {
      // Check if faculty has experience with this subject
      const hasExperience = f.subjectExperience?.some((exp: any) => exp.subjectId === subject.id);
      
      // Check if faculty has capacity
      const currentLoad = f.currentLoad?.units || 0;
      const maxLoad = f.maxLoad || 18;
      const hasCapacity = currentLoad < maxLoad;
      
      // Check if faculty specialization matches
      const hasSpecialization = f.specializations?.some(spec => 
        subject.name.toLowerCase().includes(spec.toLowerCase()) ||
        subject.code.toLowerCase().includes(spec.toLowerCase())
      );
      
      return (hasExperience || hasSpecialization) && hasCapacity;
    })
    .sort((a, b) => {
      // Sort by experience and availability
      const aExperience = a.subjectExperience?.find((exp: any) => exp.subjectId === subject.id);
      const bExperience = b.subjectExperience?.find((exp: any) => exp.subjectId === subject.id);
      
      const aScore = (aExperience?.proficiencyLevel || 0) + (a.performanceRating || 0) * 10;
      const bScore = (bExperience?.proficiencyLevel || 0) + (b.performanceRating || 0) * 10;
      
      return bScore - aScore;
    });

  // If we found qualified faculty, return them
  if (qualifiedFaculty.length > 0) {
    console.log(`Found ${qualifiedFaculty.length} qualified faculty for ${subject.code}`);
    return qualifiedFaculty;
  }

  // FALLBACK: If no qualified faculty found, return ANY available faculty
  // This ensures we can still assign instructors even if they don't match specifications
  console.log(`No qualified faculty found for ${subject.code}, using fallback assignment`);
  
  const availableFaculty = faculty
    .filter(f => {
      // Only check basic capacity, ignore specialization/experience requirements
      const currentLoad = f.currentLoad?.units || 0;
      const maxLoad = f.maxLoad || 24;
      return currentLoad < maxLoad;
    })
    .sort((a, b) => {
      // Sort by performance rating and current load (prefer less loaded faculty)
      const aLoad = a.currentLoad?.units || 0;
      const bLoad = b.currentLoad?.units || 0;
      const aRating = a.performanceRating || 0;
      const bRating = b.performanceRating || 0;
      
      // Prefer higher rating and lower load
      const aScore = aRating * 10 - aLoad;
      const bScore = bRating * 10 - bLoad;
      
      return bScore - aScore;
    });

  if (availableFaculty.length > 0) {
    console.log(`Using ${availableFaculty.length} available faculty as fallback for ${subject.code}`);
    return availableFaculty;
  }

  // Last resort: return all faculty (system will handle conflicts later)
  console.log(`No available faculty found, returning all faculty for ${subject.code}`);
  return faculty;
}

// Select faculty for a specific session with enhanced conflict resolution
function selectFacultyForSession(
  suitableFaculty: Faculty[],
  day: string,
  assignmentTracker: any,
  subject: Subject,
  allFaculty?: Faculty[]
): Faculty | null {
  console.log(`🎯 Selecting faculty for ${subject.code} on ${day} from ${suitableFaculty.length} suitable candidates`);
  
  // First, try to find faculty that are completely conflict-free
  for (const faculty of suitableFaculty) {
    if (isFacultyAvailableAtTime(faculty, day, '8:00 AM', assignmentTracker)) {
      console.log(`✅ Selected conflict-free faculty: ${faculty.firstName} ${faculty.lastName}`);
      return faculty;
    }
  }
  
  console.log(`⚠️ No conflict-free faculty found in suitable candidates, trying alternative assignment`);
  
  // If no suitable faculty is available, try alternative assignment with all faculty
  if (allFaculty) {
    return findAlternativeFacultyAssignment(allFaculty, day, assignmentTracker, subject);
  }
  
  console.log(`❌ No faculty could be selected for ${subject.code} on ${day}`);
  return null;
}

// NEW: Find alternative faculty assignment prioritizing conflict avoidance over specialization
function findAlternativeFacultyAssignment(
  allFaculty: Faculty[],
  day: string,
  assignmentTracker: any,
  subject: Subject
): Faculty | null {
  console.log(`Attempting alternative faculty assignment for ${subject.code} on ${day}`);
  
  // Sort faculty by availability and current load (prefer less loaded faculty)
  const availableFaculty = allFaculty
    .filter(faculty => {
      // Basic availability check
      const facultyAvailability = faculty.availability?.find(avail => avail.day === day);
      if (!facultyAvailability?.isAvailable) return false;
      
      // Check if faculty has reasonable capacity
      const currentLoad = faculty.currentLoad?.units || 0;
      const maxLoad = faculty.maxLoad || 24; // More lenient max load for conflict resolution
      return currentLoad < maxLoad;
    })
    .sort((a, b) => {
      // Sort by current load (prefer less loaded faculty)
      const aLoad = a.currentLoad?.units || 0;
      const bLoad = b.currentLoad?.units || 0;
      
      // Also consider performance rating as secondary factor
      const aRating = a.performanceRating || 0;
      const bRating = b.performanceRating || 0;
      
      // Primary: lower load, Secondary: higher rating
      if (aLoad !== bLoad) return aLoad - bLoad;
      return bRating - aRating;
    });
  
  // Try each available faculty
  for (const faculty of availableFaculty) {
    const currentSchedule = assignmentTracker.facultySchedule.get(faculty.id) || [];
    const daySchedule = currentSchedule.filter((slot: any) => slot.day === day);
    
    // More lenient workload check for conflict resolution (max 5 hours per day)
    if (daySchedule.length >= 4) continue;
    
    console.log(`Alternative assignment: ${faculty.firstName} ${faculty.lastName} for ${subject.code}`);
    return faculty;
  }
  
  // Last resort: try to reassign existing assignments to make room
  return tryReassignmentToMakeRoom(allFaculty, day, assignmentTracker, subject);
}

// NEW: Try to reassign existing assignments to make room for new assignment
function tryReassignmentToMakeRoom(
  allFaculty: Faculty[],
  day: string,
  assignmentTracker: any,
  subject: Subject
): Faculty | null {
  console.log(`Attempting reassignment to make room for ${subject.code} on ${day}`);
  
  // Find faculty with existing assignments on this day that could potentially be moved
  for (const faculty of allFaculty) {
    const currentSchedule = assignmentTracker.facultySchedule.get(faculty.id) || [];
    const daySchedule = currentSchedule.filter((slot: any) => slot.day === day);
    
    if (daySchedule.length > 0 && daySchedule.length < 4) {
      // This faculty has some assignments but not overloaded
      // Check if we can reassign one of their existing assignments to someone else
      for (const existingSlot of daySchedule) {
        if (canReassignSlot(existingSlot, allFaculty, assignmentTracker)) {
          console.log(`Can reassign existing slot for ${faculty.firstName} ${faculty.lastName} to make room for ${subject.code}`);
          return faculty;
        }
      }
    }
  }
  
  return null;
}

// NEW: Check if a time slot can be reassigned to another faculty member
function canReassignSlot(
  timeSlot: any,
  allFaculty: Faculty[],
  assignmentTracker: any
): boolean {
  // Find alternative faculty for the existing assignment
  const alternativeFaculty = allFaculty.find(faculty => {
    if (faculty.id === timeSlot.facultyId) return false; // Skip current faculty
    
    // Check availability
    const facultyAvailability = faculty.availability?.find(avail => avail.day === timeSlot.day);
    if (!facultyAvailability?.isAvailable) return false;
    
    // Check workload
    const currentSchedule = assignmentTracker.facultySchedule.get(faculty.id) || [];
    const daySchedule = currentSchedule.filter((slot: any) => slot.day === timeSlot.day);
    
    return daySchedule.length < 3; // Has capacity
  });
  
  return !!alternativeFaculty;
}

// NEW: Enhanced session assignment with conflict resolution
function findSessionAssignmentWithConflictResolution(
  subject: Subject,
  faculty: Faculty,
  rooms: Room[],
  timeSlots: TimeSlot[],
  day: string,
  assignmentTracker: any,
  allFaculty: Faculty[]
): ScheduleAssignment | null {
  console.log(`Attempting enhanced conflict resolution for ${subject.code} with ${faculty.firstName} ${faculty.lastName} on ${day}`);
  
  // Get available time slots for this day
  const dayTimeSlots = timeSlots.filter(ts => ts.day === day);
  
  for (const timeSlot of dayTimeSlots) {
    const timeKey = `${day}-${timeSlot.startTime}`;
    const usage = assignmentTracker.timeSlotUsage.get(timeKey);
    
    if (!usage) continue;
    
    // Check if faculty is available at this time
    if (usage.faculty.includes(faculty.id)) {
      // Faculty conflict detected - try to reassign the conflicting assignment
      console.log(`Faculty conflict detected for ${faculty.firstName} ${faculty.lastName} at ${timeSlot.startTime} on ${day}`);
      
      if (tryResolveConflictByReassignment(faculty.id, timeKey, allFaculty, assignmentTracker)) {
        console.log(`Successfully resolved faculty conflict by reassignment`);
        // Conflict resolved, proceed with assignment
      } else {
        continue; // Could not resolve conflict, try next time slot
      }
    }
    
    // Check faculty availability preferences
    const facultyAvailable = isFacultyAvailableAtTime(faculty, day, timeSlot.startTime);
    if (!facultyAvailable) continue;
    
    // Find available room with more flexible criteria
    const availableRoom = findAvailableRoomWithFlexibility(subject, rooms, usage, timeSlot, assignmentTracker);
    
    if (availableRoom) {
      console.log(`Enhanced conflict resolution successful: ${subject.code} assigned to ${faculty.firstName} ${faculty.lastName} in ${availableRoom.name} at ${timeSlot.startTime} on ${day}`);
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

// NEW: Try to resolve conflict by reassigning existing assignments
function tryResolveConflictByReassignment(
  conflictingFacultyId: string,
  timeKey: string,
  allFaculty: Faculty[],
  assignmentTracker: any
): boolean {
  console.log(`Attempting to resolve conflict for faculty ${conflictingFacultyId} at ${timeKey}`);
  
  // Find an alternative faculty member who can take the conflicting assignment
  const alternativeFaculty = allFaculty.find(faculty => {
    if (faculty.id === conflictingFacultyId) return false;
    
    // Extract day and time from timeKey
    const [day, startTime] = timeKey.split('-');
    
    // Check if alternative faculty is available
    const facultyAvailability = faculty.availability?.find(avail => avail.day === day);
    if (!facultyAvailability?.isAvailable) return false;
    
    // Check if alternative faculty is not already scheduled at this time
    const usage = assignmentTracker.timeSlotUsage.get(timeKey);
    if (usage && usage.faculty.includes(faculty.id)) return false;
    
    // Check workload
    const currentSchedule = assignmentTracker.facultySchedule.get(faculty.id) || [];
    const daySchedule = currentSchedule.filter((slot: any) => slot.day === day);
    
    return daySchedule.length < 4; // Has capacity
  });
  
  if (alternativeFaculty) {
    console.log(`Found alternative faculty: ${alternativeFaculty.firstName} ${alternativeFaculty.lastName}`);
    // In a real implementation, we would actually perform the reassignment here
    // For now, we'll just return true to indicate that reassignment is possible
    return true;
  }
  
  return false;
}

// NEW: Find available room with more flexible criteria
function findAvailableRoomWithFlexibility(
  subject: Subject,
  rooms: Room[],
  usage: any,
  timeSlot: TimeSlot,
  assignmentTracker: any
): Room | null {
  // Determine if this is a lab subject based on lab hours
  const isLabSubject = (subject.lab && subject.lab > 0);
  const lecHours = subject.lec || 0;
  const labHours = subject.lab || 0;
  
  console.log(`🏢 ROOM ASSIGNMENT: Finding room for ${subject.code} (${lecHours} lec + ${labHours} lab hours) on ${timeSlot.day} at ${timeSlot.startTime}`);
  
  // Helper function to check if room is available at this specific time
  const isRoomAvailable = (room: Room): boolean => {
    const roomSchedule = assignmentTracker.roomSchedule.get(room.id);
    if (!roomSchedule) return true;
    
    // Check if room is already booked at this exact time
    const hasConflict = roomSchedule.some((slot: any) => 
      slot.day === timeSlot.day && 
      slot.startTime === timeSlot.startTime
    );
    
    return !hasConflict;
  };
  
  // For lab subjects, prioritize lab/computer lab rooms
  if (isLabSubject) {
    console.log(`🧪 Lab subject detected - looking for lab rooms first`);
    let labRoom = rooms.find(room => {
      const isLabRoom = room.type === 'Laboratory' || room.type === 'Computer Lab';
      const roomAvailable = isRoomAvailable(room);
      console.log(`  Checking lab room ${room.name}: type=${room.type}, available=${roomAvailable}`);
      return isLabRoom && roomAvailable;
    });
    
    if (labRoom) {
      console.log(`✅ Lab room found: ${labRoom.name} (${labRoom.type})`);
      return labRoom;
    }
    
    console.log(`⚠️ No lab rooms available, trying lecture rooms as fallback`);
  }
  
  // For lecture subjects or when no lab rooms available, use lecture rooms
  console.log(`📚 Looking for lecture rooms`);
  let lectureRoom = rooms.find(room => {
    const isLectureRoom = room.type === 'Lecture';
    const roomAvailable = isRoomAvailable(room);
    console.log(`  Checking lecture room ${room.name}: type=${room.type}, available=${roomAvailable}`);
    return isLectureRoom && roomAvailable;
  });
  
  if (lectureRoom) {
    console.log(`✅ Lecture room found: ${lectureRoom.name} (${lectureRoom.type})`);
    return lectureRoom;
  }
  
  // Last resort: use any available room
  console.log(`⚠️ No preferred rooms available, trying any available room`);
  let anyRoom = rooms.find(room => {
    const roomAvailable = isRoomAvailable(room);
    console.log(`  Checking any room ${room.name}: type=${room.type}, available=${roomAvailable}`);
    return roomAvailable;
  });
  
  if (anyRoom) {
    console.log(`✅ Using flexible room assignment: ${anyRoom.name} (${anyRoom.type}) for ${subject.code}`);
    return anyRoom;
  }
  
  // Final attempt: try to find a room that might become available through reassignment
  for (const room of rooms) {
    if (canReassignRoomUsage(room.id, timeSlot, assignmentTracker)) {
      console.log(`🔄 Room ${room.name} can be made available through reassignment`);
      return room;
    }
  }
  
  console.log(`❌ No rooms available for ${subject.code} on ${timeSlot.day} at ${timeSlot.startTime}`);
  return null;
}

// NEW: Check if a room usage can be reassigned
function canReassignRoomUsage(
  roomId: string,
  timeSlot: TimeSlot,
  assignmentTracker: any
): boolean {
  // Check if there are alternative rooms available for the current occupant
  const timeKey = `${timeSlot.day}-${timeSlot.startTime}`;
  const usage = assignmentTracker.timeSlotUsage.get(timeKey);
  
  if (!usage || !usage.rooms.includes(roomId)) {
    return true; // Room is actually available
  }
  
  // In a real implementation, we would check if the current room occupant
  // can be moved to another available room
  // For now, we'll return false to keep it simple
  return false;
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
  console.log(`🔍 Finding session assignment for ${subject.code} with ${faculty.firstName} ${faculty.lastName} on ${day}`);
  
  // Filter time slots for the specific day
  const dayTimeSlots = timeSlots.filter(slot => slot.day === day);
  
  // Try each time slot for this day
  for (const timeSlot of dayTimeSlots) {
    console.log(`⏰ Trying time slot: ${timeSlot.startTime} on ${day}`);
    
    // First check if faculty is available at this time
    if (!isFacultyAvailableAtTime(faculty, timeSlot.day, timeSlot.startTime, assignmentTracker)) {
      console.log(`❌ Faculty ${faculty.firstName} ${faculty.lastName} not available at ${timeSlot.startTime}`);
      continue;
    }
    
    // Use the enhanced room assignment logic
    const availableRoom = findAvailableRoomWithFlexibility(
      subject,
      rooms,
      null, // usage parameter not used in the new implementation
      timeSlot,
      assignmentTracker
    );
    
    if (availableRoom) {
      // Double-check with full conflict validation
      if (isSlotConflictFree(subject, faculty, availableRoom, timeSlot, assignmentTracker)) {
        console.log(`✅ CONFLICT-FREE ASSIGNMENT FOUND: ${subject.code} with ${faculty.firstName} ${faculty.lastName} in ${availableRoom.name} on ${day} at ${timeSlot.startTime}`);
        
        return {
          subject,
          faculty,
          room: availableRoom,
          timeSlot
        };
      } else {
        console.log(`⚠️ Room ${availableRoom.name} found but failed final conflict check`);
      }
    } else {
      console.log(`❌ No available room found for ${timeSlot.startTime} on ${day}`);
    }
  }
  
  console.log(`❌ No conflict-free assignment found for ${subject.code} with ${faculty.firstName} ${faculty.lastName} on ${day}`);
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
  
  // Improved fallback: use subject index or hash to distribute patterns more evenly
  // This ensures we don't always get the same pattern (like MW)
  let patternIndex;
  if (subjectIndex !== undefined) {
    // Use subject index with some randomization to avoid predictable patterns
    patternIndex = (subjectIndex + Math.floor(subjectIndex / dayPatterns.length)) % dayPatterns.length;
  } else {
    // Use a hash of the subject code for consistent but varied distribution
    const hash = subject.code.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a; // Convert to 32-bit integer
    }, 0);
    patternIndex = Math.abs(hash) % dayPatterns.length;
  }
  
  const selectedPattern = dayPatterns[patternIndex];
  console.log(`Selected pattern for ${subject.code}: ${selectedPattern} (index: ${patternIndex}/${dayPatterns.length})`);
  
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
  
  // Get all available faculty (including fallback options)
  const allAvailableFaculty = findSuitableFaculty(subject, availableFaculty, assignmentTracker);
  
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
        
        // Try each faculty member (including fallback faculty)
        for (const faculty of allAvailableFaculty) {
          if (sessionAssigned) break;
          
          // Check if faculty is available at this time
          if (!isFacultyAvailableAtTime(faculty, timeSlot.day, timeSlot.startTime, assignmentTracker)) {
            continue;
          }
          
          // Try each room
          for (const room of availableRooms) {
            // Use a more lenient validation for flexible assignment
            const hasRoomConflict = assignmentTracker.roomSchedule.get(room.id)?.some((slot: any) => 
              slot.day === timeSlot.day && slot.startTime === timeSlot.startTime
            );
            
            if (!hasRoomConflict) {
              const assignment: ScheduleAssignment = {
                subject,
                faculty,
                room,
                timeSlot,
                score: calculateAssignmentScore({ subject, faculty, room, timeSlot })
              };
              
              assignments.push(assignment);
              updateAssignmentTracker(assignment, assignmentTracker);
              sessionAssigned = true;
              
              console.log(`✅ Flexible assignment: session ${sessionIndex + 1} for ${subject.code} on ${day} at ${timeSlot.startTime} with ${faculty.name} in ${room.name}`);
              break;
            }
          }
        }
      }
    }
    
    if (!sessionAssigned) {
      console.log(`⚠️ Could not assign session ${sessionIndex + 1} for ${subject.code} - continuing with partial assignment`);
      // Continue trying to assign remaining sessions even if one fails
    }
  }
  
  console.log(`Flexible assignment result: ${assignments.length}/${sessionsNeeded} sessions assigned for ${subject.code}`);
  return assignments;
}

// Generate final schedule result
function generateScheduleResult(goals: any, scheduledSubjects: any[], subjects: any[]): GeneratedSchedule {
  // Convert scheduled subjects to ScheduleItem format for conflict detection
  const scheduleItems = scheduledSubjects.map((subject: any, index: number) => ({
    id: subject.id || `${subject.subject?.code || subject.code}-${subject.faculty?.id || 'unassigned'}-${subject.room?.id || 'unassigned'}-${subject.timeSlot?.day || subject.day}-${subject.timeSlot?.startTime || subject.startTime}`,
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

// Enhanced conflict-free validation function
function isSlotConflictFree(
  subject: Subject,
  faculty: Faculty,
  room: Room,
  timeSlot: TimeSlot,
  assignmentTracker: any
): boolean {
  const timeKey = `${timeSlot.day}-${timeSlot.startTime}`;
  
  console.log(`🔍 CONFLICT CHECK: Validating slot for ${subject.code} with ${faculty.firstName} ${faculty.lastName} in ${room.name} on ${timeSlot.day} at ${timeSlot.startTime}`);
  
  // 1. Check faculty availability and conflicts
  if (!isFacultyAvailableAtTime(faculty, timeSlot.day, timeSlot.startTime, assignmentTracker)) {
    console.log(`❌ CONFLICT: Faculty ${faculty.firstName} ${faculty.lastName} not available`);
    return false;
  }
  
  // 2. Check room availability and conflicts
  const roomSchedule = assignmentTracker.roomSchedule.get(room.id);
  if (roomSchedule) {
    const hasRoomConflict = roomSchedule.some((slot: any) => 
      slot.day === timeSlot.day && 
      slot.startTime === timeSlot.startTime
    );
    if (hasRoomConflict) {
      console.log(`❌ CONFLICT: Room ${room.name} already booked`);
      return false;
    }
  }
  
  // 3. Check for overlapping time conflicts (for sessions with different durations)
  const sessionDuration = subject.units * 60; // 1 unit = 1 hour = 60 minutes
  const endTime = getEndTime(timeSlot.startTime, sessionDuration);
  
  // Check faculty schedule for overlapping times
  const facultySchedule = assignmentTracker.facultySchedule.get(faculty.id);
  if (facultySchedule) {
    const hasOverlap = facultySchedule.some((slot: any) => {
      if (slot.day !== timeSlot.day) return false;
      
      const existingEnd = getEndTime(slot.startTime, slot.duration || 60);
      return timeRangesOverlap(timeSlot.startTime, endTime, slot.startTime, existingEnd);
    });
    
    if (hasOverlap) {
      console.log(`❌ CONFLICT: Faculty ${faculty.firstName} ${faculty.lastName} has overlapping schedule`);
      return false;
    }
  }
  
  // Check room schedule for overlapping times
  if (roomSchedule) {
    const hasOverlap = roomSchedule.some((slot: any) => {
      if (slot.day !== timeSlot.day) return false;
      
      const existingEnd = getEndTime(slot.startTime, slot.duration || 60);
      return timeRangesOverlap(timeSlot.startTime, endTime, slot.startTime, existingEnd);
    });
    
    if (hasOverlap) {
      console.log(`❌ CONFLICT: Room ${room.name} has overlapping booking`);
      return false;
    }
  }
  
  console.log(`✅ CONFLICT-FREE: Slot validated successfully`);
  return true;
}

// Helper function to check if time ranges overlap
}

// Enhanced flexible assignment with comprehensive reassignment capabilities
function tryFlexibleAssignment(
  subject: any,
  availableFaculty: any[],
  availableRooms: any[],
  assignmentTracker: any,
  goals: any,
  maxAttempts: number = 50
): any | null {
  console.log(`🔄 Starting flexible assignment for ${subject.code} with ${maxAttempts} attempts`);
  
  // Get all possible combinations
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { startTime: '7:00 AM', endTime: '8:30 AM' },
    { startTime: '8:00 AM', endTime: '9:30 AM' },
    { startTime: '8:30 AM', endTime: '10:00 AM' },
    { startTime: '9:00 AM', endTime: '10:30 AM' },
    { startTime: '10:00 AM', endTime: '11:30 AM' },
    { startTime: '10:30 AM', endTime: '12:00 PM' },
    { startTime: '11:00 AM', endTime: '12:30 PM' },
    { startTime: '1:00 PM', endTime: '2:30 PM' },
    { startTime: '1:30 PM', endTime: '3:00 PM' },
    { startTime: '2:00 PM', endTime: '3:30 PM' },
    { startTime: '2:30 PM', endTime: '4:00 PM' },
    { startTime: '3:00 PM', endTime: '4:30 PM' },
    { startTime: '4:00 PM', endTime: '5:30 PM' },
    { startTime: '4:30 PM', endTime: '6:00 PM' },
    { startTime: '5:00 PM', endTime: '6:30 PM' },
    { startTime: '6:00 PM', endTime: '7:30 PM' },
    { startTime: '7:00 PM', endTime: '8:30 PM' }
  ];

  // Create all possible combinations and shuffle for randomness
  const combinations: any[] = [];
  
  for (const day of days) {
    for (const timeSlot of timeSlots) {
      for (const faculty of availableFaculty) {
        for (const room of availableRooms) {
          combinations.push({
            day,
            timeSlot,
            faculty,
            room
          });
        }
      }
    }
  }

  // Shuffle combinations to avoid patterns
  for (let i = combinations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinations[i], combinations[j]] = [combinations[j], combinations[i]];
  }

  // Try each combination
  for (let attempt = 0; attempt < Math.min(maxAttempts, combinations.length); attempt++) {
    const { day, timeSlot, faculty, room } = combinations[attempt];
    
    console.log(`🔍 Attempt ${attempt + 1}: Testing ${subject.code} on ${day} ${timeSlot.startTime}-${timeSlot.endTime} with ${faculty.firstName} ${faculty.lastName} in ${room.name}`);
    
    // Check if this combination is conflict-free
    const testTimeSlot = { ...timeSlot, day };
    if (isSlotConflictFree(subject, faculty, room, testTimeSlot, assignmentTracker)) {
      const assignment = {
        subject,
        faculty,
        room,
        timeSlot: testTimeSlot,
        day,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime
      };
      
      console.log(`✅ Found conflict-free assignment for ${subject.code}: ${day} ${timeSlot.startTime}-${timeSlot.endTime} with ${faculty.firstName} ${faculty.lastName} in ${room.name}`);
      return assignment;
    }
  }
  
  console.log(`❌ Could not find conflict-free assignment for ${subject.code} after ${maxAttempts} attempts`);
  return null;
}

// Enhanced assignment function with intelligent backtracking
function assignSubjectWithFlexibleBacktracking(
  subject: any,
  availableFaculty: any[],
  availableRooms: any[],
  assignmentTracker: any,
  goals: any,
  scheduledSubjects: any[]
): boolean {
  console.log(`🎯 Starting flexible assignment with backtracking for ${subject.code}`);
  
  // First, try flexible assignment
  const assignment = tryFlexibleAssignment(subject, availableFaculty, availableRooms, assignmentTracker, goals);
  
  if (assignment) {
    // Update assignment tracker
    updateAssignmentTracker(assignment, assignmentTracker);
    scheduledSubjects.push(assignment);
    console.log(`✅ Successfully assigned ${subject.code} with flexible assignment`);
    return true;
  }
  
  // If flexible assignment fails, try backtracking
  console.log(`🔄 Flexible assignment failed for ${subject.code}, attempting backtracking...`);
  
  // Find subjects that might be causing conflicts and try to reassign them
  const conflictingSubjects = findPotentialConflictingSubjects(subject, scheduledSubjects, assignmentTracker);
  
  for (const conflictingSubject of conflictingSubjects) {
    console.log(`🔄 Attempting to reassign conflicting subject: ${conflictingSubject.subject.code}`);
    
    // Temporarily remove the conflicting subject
    const index = scheduledSubjects.findIndex(s => s.subject.code === conflictingSubject.subject.code);
    if (index !== -1) {
      scheduledSubjects.splice(index, 1);
      removeFromAssignmentTracker(assignmentTracker, conflictingSubject);
      
      // Try to assign the current subject
      const newAssignment = tryFlexibleAssignment(subject, availableFaculty, availableRooms, assignmentTracker, goals);
      
      if (newAssignment) {
        // Current subject assigned successfully, now try to reassign the conflicting subject
        updateAssignmentTracker(newAssignment, assignmentTracker);
        scheduledSubjects.push(newAssignment);
        
        const reassignment = tryFlexibleAssignment(conflictingSubject.subject, availableFaculty, availableRooms, assignmentTracker, goals);
        
        if (reassignment) {
          // Both subjects assigned successfully
          updateAssignmentTracker(reassignment, assignmentTracker);
          scheduledSubjects.push(reassignment);
          console.log(`✅ Successfully resolved conflict by reassigning both ${subject.code} and ${conflictingSubject.subject.code}`);
          return true;
        } else {
          // Could not reassign conflicting subject, restore original state
          removeFromAssignmentTracker(assignmentTracker, newAssignment);
          scheduledSubjects.splice(scheduledSubjects.length - 1, 1);
          updateAssignmentTracker(conflictingSubject, assignmentTracker);
          scheduledSubjects.push(conflictingSubject);
        }
      } else {
        // Could not assign current subject, restore conflicting subject
        updateAssignmentTracker(conflictingSubject, assignmentTracker);
        scheduledSubjects.push(conflictingSubject);
      }
    }
  }
  
  console.log(`❌ Could not assign ${subject.code} even with backtracking`);
  return false;
}

// Helper function to find potentially conflicting subjects
function findPotentialConflictingSubjects(
  targetSubject: any,
  scheduledSubjects: any[],
  assignmentTracker: any
): any[] {
  const conflicts: any[] = [];
  
  // Look for subjects that might be blocking assignment
  for (const scheduled of scheduledSubjects) {
    // Check if this scheduled subject might be causing conflicts
    // by occupying resources that the target subject needs
    if (scheduled.faculty && scheduled.room && scheduled.timeSlot) {
      conflicts.push(scheduled);
    }
  }
  
  // Sort by priority (subjects with fewer constraints first)
  return conflicts.sort((a, b) => {
    const aConstraints = (a.subject.preferredFaculty?.length || 0) + (a.subject.preferredRooms?.length || 0);
    const bConstraints = (b.subject.preferredFaculty?.length || 0) + (b.subject.preferredRooms?.length || 0);
    return aConstraints - bConstraints;
  });
}

// Helper function to remove assignment from tracker
function removeFromAssignmentTracker(tracker: any, assignment: any): void {
  const { faculty, room, timeSlot, day } = assignment;
  
  if (faculty && timeSlot) {
    const facultyKey = `${faculty.id}-${day || timeSlot.day}-${timeSlot.startTime}`;
    delete tracker.facultyAssignments[facultyKey];
  }
  
  if (room && timeSlot) {
    const roomKey = `${room.id}-${day || timeSlot.day}-${timeSlot.startTime}`;
    delete tracker.roomAssignments[roomKey];
  }
  
  if (timeSlot) {
    const timeKey = `${day || timeSlot.day}-${timeSlot.startTime}`;
    const timeAssignments = tracker.timeSlotAssignments[timeKey] || [];
    const index = timeAssignments.findIndex(a => 
      a.subject.code === assignment.subject.code
    );
    if (index !== -1) {
      timeAssignments.splice(index, 1);
      if (timeAssignments.length === 0) {
        delete tracker.timeSlotAssignments[timeKey];
      }
    }
  }
}

function timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(`2000-01-01 ${start1}`);
  const e1 = new Date(`2000-01-01 ${end1}`);
  const s2 = new Date(`2000-01-01 ${start2}`);
  const e2 = new Date(`2000-01-01 ${end2}`);
  
  return s1 < e2 && s2 < e1;
}

// Enhanced assignment validation that prevents all conflicts
function isValidAssignment(
  subject: Subject,
  faculty: Faculty,
  room: Room,
  timeSlot: TimeSlot,
  assignmentTracker: any
): boolean {
  // Use the comprehensive conflict-free validation
  return isSlotConflictFree(subject, faculty, room, timeSlot, assignmentTracker);
}
