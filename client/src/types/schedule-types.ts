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
  type: 'Lec' | 'Lab' | 'Lec/Lab';
  units: number;
  lec: number;
  lab: number;
  yearLevel: string | number;
  semester: string | number;
  program?: string;
  hasConflict?: boolean;
  status?: string;
  conflictType?: 'faculty' | 'room' | 'section' | 'none';
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
  enhancedItems: ScheduleItem[];
  conflicts: Conflict[];
  severity: 'none' | 'low' | 'medium' | 'high';
  resolvable: boolean;
  suggestions: string[];
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  specializations: string[];
  maxHoursPerWeek: number;
  preferredTimeSlots: string[];
  unavailableSlots: string[];
  experienceYears: number;
  subjectExperience: SubjectExperience[];
  currentLoad: FacultyLoad;
  maxLoad: number;
  performanceRating: number;
  availability: AvailabilitySlot[];
  preferences: FacultyPreferences;
}

export interface SubjectExperience {
  subjectId: string;
  subjectCode: string;
  yearsExperience: number;
  proficiencyLevel: number;
}

export interface FacultyLoad {
  units: number;
  maxUnits: number;
  courses: number;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TimePreference {
  day: string;
  startTime: string;
  endTime: string;
}

export interface FacultyPreferences {
  preferredTimes: TimePreference[];
  preferredSubjects: string[];
  maxConsecutiveHours: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  units: number;
  lectureHours: number;
  labHours: number;
  yearLevel: number;
  semester: number;
  prerequisites: string[];
  programId: string;
}

export interface TimeSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  duration: number;
}

export interface OptimizationConstraints {
  maxConsecutiveHours: number;
  minBreakBetweenClasses: number;
  preferredStartTime: string;
  preferredEndTime: string;
  avoidBackToBackLabs: boolean;
  facultyMaxHoursPerDay: number;
  roomUtilizationTarget: number;
}

export interface GeneratedSchedule {
  id: string;
  name?: string;
  createdAt?: Date;
  departmentId?: string;
  programId?: string;
  yearLevel?: number;
  semester?: number;
  subjects: ScheduleItem[];
  conflicts: Conflict[];
  faculty?: string[];
  totalSubjects?: number;
  totalFaculty?: number;
  optimizationScore?: number;
  score?: OptimizationScore;
  generatedAt?: Date;
  constraints?: OptimizationConstraints;
  algorithm?: string;
  processingTime?: number;
  roomUtilization?: RoomUtilization[];
  facultyWorkload?: FacultyWorkload[];
}

export interface OptimizationScoreDetails {
  overall: number;
  roomUtilization: number;
  facultyWorkload: number;
  timeDistribution: number;
}

export interface RoomUtilization {
  roomId: string;
  roomName: string;
  utilizationPercentage: number;
  totalHours: number;
  availableHours: number;
}

export interface FacultyWorkload {
  facultyId: string;
  facultyName: string;
  workloadPercentage: number;
  assignedHours: number;
  maxHours: number;
}

export interface ScheduledSubject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyAssignments: FacultyAssignment[];
  roomAssignments: RoomAssignment[];
  timeSlots: TimeSlot[];
  units: number;
  lectureHours: number;
  labHours: number;
  room: AssignedRoom;
  faculty: AssignedFaculty;
}

export interface AssignedRoom {
  id: string;
  name: string;
  capacity: number;
  type: 'Lecture' | 'Laboratory' | 'Both';
}

export interface AssignedFaculty {
  id: string;
  name: string;
  overallScore: number;
  experienceScore?: number;
  specializations: string[];
}

export interface FacultyAssignment {
  facultyId: string;
  facultyName: string;
  type: 'Lecture' | 'Laboratory';
  hoursAssigned: number;
  recommendations: FacultyRecommendation[];
}

export interface RoomAssignment {
  roomId: string;
  roomName: string;
  type: 'Lecture' | 'Laboratory';
  capacity: number;
  timeSlots: TimeSlot[];
}

export interface Conflict {
  id: string;
  type: 'Faculty' | 'Room' | 'Time';
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  affectedSubjects: string[];
  suggestedResolution: string;
  autoResolvable: boolean;
  details: string;
  suggestions: string[];
}

export interface FacultyRecommendation {
  facultyId: string;
  facultyName: string;
  matchScore: number;
  reasons: string[];
  alternatives: FacultyCandidate[];
}

export interface FacultyCandidate {
  id: string;
  name: string;
  specializations: string[];
  experienceYears: number;
  subjectExperience: number;
  currentLoad: FacultyLoad;
  maxLoad: number;
  matchScore: number;
  availabilityScore: number;
  workloadScore: number;
  experienceScore: number;
  overallScore: number;
  strengths: string[];
  concerns: string[];
  facultyId?: string;
  facultyName?: string;
  availability?: number;
  expertise?: number;
  workload?: number;
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