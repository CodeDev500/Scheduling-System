import type { ReactElement } from "react";

export type ArrayLink = {
  title: string;
  path: string;
  component: ReactElement;
};

export type LayoutHomeProps = {
  children: React.ReactNode;
};

export interface VerifyOTPProps {
  email: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  closeOTP: () => void;
  errorMessage?: string;
  loading?: boolean;
}

export interface User {
  id: number;
  image: string;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  designation: string;
  department: string;
  specialization?: string[];
  role: string;
  status: string;
  password: string;
  yearsOfExperience?: number;
  previousSubjects?: string[];
  availableDays?: string[];
  preferredTimeSlots?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectTypes {
  id: number | null;
  subjectCode: string;
  subjectDescription: string;
  lec: number;
  lab: number;
  units: number;
  tags?: string[];
  prerequisite?: string[];
}

export interface AcademicProgram {
  id: number | null;
  department?: string | null;
  programCode: string | null;
  programName: string | null;
  priority?: number; // Lower number = higher priority
}

export interface CurriculumCourse {
  id: number | null;
  curriculumYear?: string | null;
  programCode?: string | null;
  programName?: string | null;
  subjectCode: string;
  subjectDescription: string;
  lec: number | null;
  lab: number | null;
  units: number | null;
  hours?: number | null;
  period?: string | null;
  yearLevel?: string | null;
  semester?: string | null;
  prerequisites?: string[];
  schedules?: {
    id: number;
    day: string;
    timeStarts: string;
    timeEnds: string;
    room: string;
    isLoaded: number;
    offeringId: number;
    sectionName: string;
    instructor?: {
      id: number;
      name: string;
      email: string;
    } | null;
  }[];
  courseOfferings?: {
    id: number;
    courseType: string;
    description: string;
    sectionName: string;
    yearLevel: string;
    roomSchedules?: {
      id: number;
      day: string;
      timeStarts: string;
      timeEnds: string;
      room: string;
      isLoaded: number;
      offeringId: number;
      sectionName: string;
      instructor?: {
        id: number;
        name: string;
        email: string;
      } | null;
    }[];
  }[];
}

export type SubjectData = {
  id: number;
  code: string;
  name: string;
  lec: number;
  lab: number;
  units: number;
  programCode?: string;
  yearLevel?: string;
  room?: string;
  instructor?: string;
  schedule?: { day: string; time: string };
};

// Schedule Generation Types
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  duration: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'Lecture' | 'Laboratory' | 'Both';
  equipment: string[];
  building: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface SubjectExperience {
  subjectId: string;
  subjectCode: string;
  yearsExperience: number;
  proficiencyLevel: number;
}

export interface FacultyLoad {
  totalHours: number;
  subjects: string[];
  sections: number;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface FacultyPreferences {
  preferredDays: string[];
  preferredTimeSlots: string[];
  avoidConsecutiveClasses: boolean;
  maxDailyHours: number;
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectDescription: string;
  units: number;
  type: 'Lecture' | 'Laboratory';
  hoursPerWeek: number;
  studentCount: number;
  prerequisites: string[];
  corequisites: string[];
  programId: string;
  yearLevel: number;
  semester: number;
}

export interface OptimizationConstraints {
  maxConsecutiveHours: number;
  minBreakBetweenClasses: number;
  preferredTimeSlots: TimeSlot[];
  avoidTimeSlots: TimeSlot[];
  maxDailyHours: number;
  facultyPreferences: Record<string, any>;
  roomPreferences: Record<string, any>;
  prioritizeCore: boolean;
  balanceWorkload: boolean;
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

export interface ScheduledSubject {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectDescription: string;
  units: number;
  type: 'Lecture' | 'Laboratory';
  timeSlot: TimeSlot;
  room: Room;
  faculty: {
    id: string;
    name: string;
    email: string;
  };
  studentCount: number;
  yearLevel: number;
  semester: number;
}

export interface FacultyAssignment {
  facultyId: string;
  facultyName: string;
  subjects: {
    subjectId: string;
    subjectCode: string;
    timeSlot: TimeSlot;
    room: string;
  }[];
  totalHours: number;
  workloadScore: number;
}

export interface RoomAssignment {
  roomId: string;
  roomName: string;
  capacity: number;
  type: string;
  schedule: {
    timeSlot: TimeSlot;
    subjectCode: string;
    faculty: string;
    studentCount: number;
  }[];
  utilizationRate: number;
}

export interface Conflict {
  type: 'faculty' | 'room' | 'time';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedSubjects: string[];
  suggestions: string[];
}

export interface FacultyRecommendation {
  subjectId: string;
  subjectCode: string;
  candidates: FacultyCandidate[];
  recommendedFacultyId: string;
  confidence: number;
  reasoning: string[];
}

export interface FacultyCandidate {
  facultyId: string;
  facultyName: string;
  matchScore: number;
  strengths: string[];
  concerns: string[];
  availability: TimeSlot[];
  currentWorkload: number;
}

export interface OptimizationScore {
  overall: number;
  breakdown: ScoreBreakdown;
  improvements: string[];
  warnings: string[];
}

export interface ScoreBreakdown {
  facultyUtilization: number;
  roomUtilization: number;
  timeDistribution: number;
  conflictResolution: number;
  constraintSatisfaction: number;
}

// All interfaces are already exported individually above
