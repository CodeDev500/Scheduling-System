import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GenerationParams {
  department: string;
  academicYear: string;
  semester: string;
  yearLevel?: string;
  constraints: any[];
  preferences: any;
}

interface ScheduleItem {
  id: string;
  subjectCode: string;
  subjectDescription: string;
  faculty?: string;
  room?: string;
  day: string;
  startTime: string;
  endTime: string;
  yearLevel: string;
  section: string;
  units: number;
  type: 'lecture' | 'laboratory';
}

interface Conflict {
  type: 'TIME_OVERLAP' | 'ROOM_DOUBLE_BOOKING' | 'FACULTY_OVERLOAD' | 'CONSTRAINT_VIOLATION' | 'RESOURCE_UNAVAILABLE';
  description: string;
  affectedItems: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface GenerationResult {
  success: boolean;
  scheduleData: ScheduleItem[];
  conflicts: Conflict[];
  statistics: {
    totalSubjects: number;
    scheduledSubjects: number;
    conflictsFound: number;
    roomUtilization: number;
  };
}

// Time slot utilities
const timeSlots = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Convert time string to minutes for easier calculation
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes back to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Check if two time ranges overlap
function timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  return start1Min < end2Min && start2Min < end1Min;
}

// Get available rooms
async function getAvailableRooms(): Promise<any[]> {
  return await prisma.room.findMany({
    orderBy: { capacity: 'desc' }
  });
}

// Get faculty assignments
async function getFacultyAssignments(department: string): Promise<any[]> {
  return await prisma.facultySubjectAssignment.findMany({
    where: {
      faculty: {
        department
      }
    },
    include: {
      faculty: true
    }
  });
}

// Get curriculum subjects for the department
async function getCurriculumSubjects(department: string, yearLevel?: string): Promise<any[]> {
  const whereClause: any = {
    programCode: department
  };
  
  if (yearLevel) {
    whereClause.yearLevel = yearLevel;
  }
  
  return await prisma.curriculumCourse.findMany({
    where: whereClause,
    include: {
      courseOfferings: true
    }
  });
}

// Check constraints
function checkConstraints(scheduleItem: ScheduleItem, constraints: any[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  for (const constraint of constraints) {
    const constraintValue = JSON.parse(constraint.constraintValue);
    
    switch (constraint.constraintType) {
      case 'TIME_PREFERENCE':
        if (constraintValue.avoidTimes) {
          for (const avoidTime of constraintValue.avoidTimes) {
            if (timeRangesOverlap(scheduleItem.startTime, scheduleItem.endTime, avoidTime.start, avoidTime.end)) {
              conflicts.push({
                type: 'CONSTRAINT_VIOLATION',
                description: `Schedule conflicts with time preference constraint`,
                affectedItems: [scheduleItem.id],
                severity: constraint.priority === 'HIGH' ? 'HIGH' : 'MEDIUM'
              });
            }
          }
        }
        break;
        
      case 'MAXIMUM_DAILY_HOURS':
        // This would need to be checked against the full day's schedule
        break;
        
      case 'BREAK_DURATION':
        if (constraintValue.minimumBreak) {
          // Check if there's sufficient break time
        }
        break;
    }
  }
  
  return conflicts;
}

// Detect conflicts in the schedule
function detectConflicts(schedule: ScheduleItem[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Check for time overlaps
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const item1 = schedule[i];
      const item2 = schedule[j];
      
      if (item1.day === item2.day) {
        // Check room conflicts
        if (item1.room === item2.room && timeRangesOverlap(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) {
          conflicts.push({
            type: 'ROOM_DOUBLE_BOOKING',
            description: `Room ${item1.room} is double-booked on ${item1.day}`,
            affectedItems: [item1.id, item2.id],
            severity: 'HIGH'
          });
        }
        
        // Check faculty conflicts
        if (item1.faculty === item2.faculty && timeRangesOverlap(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) {
          conflicts.push({
            type: 'FACULTY_OVERLOAD',
            description: `Faculty ${item1.faculty} has overlapping schedules on ${item1.day}`,
            affectedItems: [item1.id, item2.id],
            severity: 'CRITICAL'
          });
        }
      }
    }
  }
  
  return conflicts;
}

// Generate optimal time slot for a subject
function generateTimeSlot(subject: any, preferences: any, existingSchedule: ScheduleItem[]): { day: string; startTime: string; endTime: string } | null {
  const duration = subject.hours || (subject.lec + subject.lab);
  const durationMinutes = duration * 60;
  
  // Try preferred time slots first if available
  let preferredSlots: any[] = [];
  if (preferences?.preferredTimeSlots) {
    try {
      preferredSlots = JSON.parse(preferences.preferredTimeSlots);
    } catch (e) {
      preferredSlots = [];
    }
  }
  
  // Try each day
  for (const day of days) {
    // Try preferred time slots first
    for (const slot of preferredSlots) {
      const startTime = slot.start;
      const endTime = minutesToTime(timeToMinutes(startTime) + durationMinutes);
      
      if (isTimeSlotAvailable(day, startTime, endTime, existingSchedule)) {
        return { day, startTime, endTime };
      }
    }
    
    // Try regular time slots
    for (let i = 0; i < timeSlots.length - 1; i++) {
      const startTime = timeSlots[i];
      const endTime = minutesToTime(timeToMinutes(startTime) + durationMinutes);
      
      // Check if end time is within working hours
      if (timeToMinutes(endTime) > timeToMinutes('20:00')) continue;
      
      if (isTimeSlotAvailable(day, startTime, endTime, existingSchedule)) {
        return { day, startTime, endTime };
      }
    }
  }
  
  return null;
}

// Check if a time slot is available
function isTimeSlotAvailable(day: string, startTime: string, endTime: string, existingSchedule: ScheduleItem[]): boolean {
  return !existingSchedule.some(item => 
    item.day === day && timeRangesOverlap(startTime, endTime, item.startTime, item.endTime)
  );
}

// Assign room to schedule item
function assignRoom(scheduleItem: ScheduleItem, rooms: any[], existingSchedule: ScheduleItem[]): string | null {
  // Find available rooms for the time slot
  for (const room of rooms) {
    const isRoomAvailable = !existingSchedule.some(item => 
      item.room === room.name && 
      item.day === scheduleItem.day && 
      timeRangesOverlap(scheduleItem.startTime, scheduleItem.endTime, item.startTime, item.endTime)
    );
    
    if (isRoomAvailable) {
      return room.name;
    }
  }
  
  return null;
}

// Main schedule generation algorithm
export async function scheduleGenerationAlgorithm(params: GenerationParams): Promise<GenerationResult> {
  try {
    const { department, academicYear, semester, yearLevel, constraints, preferences } = params;
    
    // Get required data
    const subjects = await getCurriculumSubjects(department, yearLevel);
    const rooms = await getAvailableRooms();
    const facultyAssignments = await getFacultyAssignments(department);
    
    const schedule: ScheduleItem[] = [];
    const conflicts: Conflict[] = [];
    let scheduledCount = 0;
    
    // Process each subject
    for (const subject of subjects) {
      // Create schedule items for lecture and lab if applicable
      const scheduleItems: Partial<ScheduleItem>[] = [];
      
      if (subject.lec > 0) {
        scheduleItems.push({
          id: `${subject.id}-lec`,
          subjectCode: subject.subjectCode,
          subjectDescription: subject.subjectDescription,
          yearLevel: subject.yearLevel,
          section: 'A', // Default section
          units: subject.lec,
          type: 'lecture'
        });
      }
      
      if (subject.lab > 0) {
        scheduleItems.push({
          id: `${subject.id}-lab`,
          subjectCode: subject.subjectCode,
          subjectDescription: subject.subjectDescription,
          yearLevel: subject.yearLevel,
          section: 'A', // Default section
          units: subject.lab,
          type: 'laboratory'
        });
      }
      
      // Schedule each item
      for (const item of scheduleItems) {
        const timeSlot = generateTimeSlot(subject, preferences, schedule);
        
        if (timeSlot) {
          const completeItem: ScheduleItem = {
            ...item as ScheduleItem,
            day: timeSlot.day,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime
          };
          
          // Assign room
          const assignedRoom = assignRoom(completeItem, rooms, schedule);
          if (assignedRoom) {
            completeItem.room = assignedRoom;
          } else {
            conflicts.push({
              type: 'RESOURCE_UNAVAILABLE',
              description: `No available room for ${completeItem.subjectCode}`,
              affectedItems: [completeItem.id],
              severity: 'HIGH'
            });
          }
          
          // Assign faculty (simplified - would need more complex logic)
          const facultyAssignment = facultyAssignments.find(fa => fa.subjectCode === subject.subjectCode);
          if (facultyAssignment) {
            completeItem.faculty = `${facultyAssignment.faculty.firstname} ${facultyAssignment.faculty.lastname}`;
          }
          
          // Check constraints
          const constraintConflicts = checkConstraints(completeItem, constraints);
          conflicts.push(...constraintConflicts);
          
          schedule.push(completeItem);
          scheduledCount++;
        } else {
          conflicts.push({
            type: 'RESOURCE_UNAVAILABLE',
            description: `No available time slot for ${item.subjectCode}`,
            affectedItems: [item.id!],
            severity: 'CRITICAL'
          });
        }
      }
    }
    
    // Detect additional conflicts
    const additionalConflicts = detectConflicts(schedule);
    conflicts.push(...additionalConflicts);
    
    // Calculate statistics
    const totalSubjects = subjects.length;
    const roomUtilization = (schedule.length / (rooms.length * days.length * timeSlots.length)) * 100;
    
    return {
      success: true,
      scheduleData: schedule,
      conflicts,
      statistics: {
        totalSubjects,
        scheduledSubjects: scheduledCount,
        conflictsFound: conflicts.length,
        roomUtilization: Math.round(roomUtilization * 100) / 100
      }
    };
  } catch (error) {
    console.error('Schedule generation error:', error);
    return {
      success: false,
      scheduleData: [],
      conflicts: [{
        type: 'RESOURCE_UNAVAILABLE',
        description: 'Schedule generation failed due to system error',
        affectedItems: [],
        severity: 'CRITICAL'
      }],
      statistics: {
        totalSubjects: 0,
        scheduledSubjects: 0,
        conflictsFound: 1,
        roomUtilization: 0
      }
    };
  }
}