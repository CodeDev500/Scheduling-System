// Direct definition of schedule-related types to avoid export issues

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface OptimizationScore {
  overall: number;
  breakdown: {
    timeSlotUtilization: number;
    facultyWorkload: number;
    roomUtilization: number;
    conflictResolution: number;
  };
}

export interface ScheduledSubject {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectDescription: string;
  units: number;
  type: 'Lecture' | 'Laboratory';
  timeSlot: TimeSlot;
  facultyId: string;
  roomId: string;
}

export interface Conflict {
  id: string;
  type: 'faculty' | 'room' | 'time';
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedSubjects: string[];
}

export interface FacultyAssignment {
  facultyId: string;
  subjectIds: string[];
  totalHours: number;
  workloadPercentage: number;
}

export interface RoomAssignment {
  roomId: string;
  subjectIds: string[];
  utilizationPercentage: number;
}

export interface GeneratedSchedule {
  id: string;
  department: string;
  program: string;
  yearLevel: string;
  algorithm: string;
  processingTime: number;
  createdAt: string;
  optimizationScore: OptimizationScore;
  subjects: ScheduledSubject[];
  conflicts: Conflict[];
  facultyAssignments: FacultyAssignment[];
  roomAssignments: RoomAssignment[];
  analytics: {
    totalSubjects: number;
    totalFaculty: number;
    totalRooms: number;
    utilizationRate: number;
    conflictCount: number;
  };
}