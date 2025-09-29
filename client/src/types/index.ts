// Re-export all types from schedule-types
export * from './schedule-types';

// Define types inline as a fallback
export interface GeneratedSchedule {
  id: string;
  departmentId: string;
  programId: string;
  yearLevel: number;
  semester: number;
  subjects: ScheduledSubject[];
  conflicts: Conflict[];
  score: OptimizationScore;
  generatedAt: Date;
  constraints: OptimizationConstraints;
  optimizationScore: OptimizationScoreDetails;
  algorithm: string;
  processingTime: number;
  roomUtilization: RoomUtilization[];
  facultyWorkload: FacultyWorkload[];
}

export interface ScheduleItem {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomId: string;
  roomName: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'Lecture' | 'Laboratory';
  units: number;
  yearLevel: number;
  semester: number;
}

export interface FacultyRecommendation {
  facultyId: string;
  facultyName: string;
  matchScore: number;
  reasons: string[];
  alternatives: FacultyCandidate[];
}

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface ConflictDetectionResult {
  conflicts: Conflict[];
  severity: 'none' | 'low' | 'medium' | 'high';
  resolvable: boolean;
  suggestions: string[];
}

// Import remaining types from schedule-types
export type {
  OptimizationConstraints,
  Department,
  Program,
  Subject,
  Faculty,
  Room,
  TimeSlot,
  Conflict,
  ScheduledSubject,
  OptimizationScore,
  OptimizationScoreDetails,
  RoomUtilization,
  FacultyWorkload,
  FacultyCandidate
} from './schedule-types';