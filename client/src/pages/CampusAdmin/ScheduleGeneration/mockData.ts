import type { Subject, Room, OptimizationConstraints, Department, Program, TimeSlot, Faculty, FacultyRecommendation } from '../../../types';

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Computer Science Department',
    code: 'CS',
    description: 'Department of Computer Science and Information Technology'
  },
  {
    id: 'dept-2',
    name: 'Engineering Department',
    code: 'ENG',
    description: 'Department of Engineering and Technology'
  },
  {
    id: 'dept-3',
    name: 'Business Administration Department',
    code: 'BA',
    description: 'Department of Business Administration and Management'
  }
];

// Mock Programs
export const mockPrograms: Program[] = [
  {
    id: 'prog-1',
    name: 'Bachelor of Science in Computer Science',
    code: 'BSCS',
    departmentId: 'dept-1',
    duration: 4
  },
  {
    id: 'prog-2',
    name: 'Bachelor of Science in Information Technology',
    code: 'BSIT',
    departmentId: 'dept-1',
    duration: 4
  },
  {
    id: 'prog-3',
    name: 'Bachelor of Science in Civil Engineering',
    code: 'BSCE',
    departmentId: 'dept-2',
    duration: 5
  }
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  // Computer Science Subjects - Year 1, Semester 1
  {
    id: 'subj-1',
    code: 'CS101',
    name: 'Introduction to Programming',
    units: 3,
    lectureHours: 2,
    labHours: 3,
    yearLevel: 1,
    semester: 1,
    prerequisites: [],
    programId: 'prog-1'
  },
  {
    id: 'subj-2',
    code: 'MATH101',
    name: 'College Algebra',
    units: 3,
    lectureHours: 3,
    labHours: 0,
    yearLevel: 1,
    semester: 1,
    prerequisites: [],
    programId: 'prog-1'
  },
  {
    id: 'subj-3',
    code: 'ENG101',
    name: 'English Communication',
    units: 3,
    lectureHours: 3,
    labHours: 0,
    yearLevel: 1,
    semester: 1,
    prerequisites: [],
    programId: 'prog-1'
  },
  {
    id: 'subj-4',
    code: 'PE101',
    name: 'Physical Education 1',
    units: 2,
    lectureHours: 0,
    labHours: 2,
    yearLevel: 1,
    semester: 1,
    prerequisites: [],
    programId: 'prog-1'
  },
  {
    id: 'subj-5',
    code: 'NSTP101',
    name: 'National Service Training Program 1',
    units: 3,
    lectureHours: 3,
    labHours: 0,
    yearLevel: 1,
    semester: 1,
    prerequisites: [],
    programId: 'prog-1'
  },
  // Computer Science Subjects - Year 1, Semester 2
  {
    id: 'subj-6',
    code: 'CS102',
    name: 'Object-Oriented Programming',
    units: 3,
    lectureHours: 2,
    labHours: 3,
    yearLevel: 1,
    semester: 2,
    prerequisites: ['subj-1'],
    programId: 'prog-1'
  },
  {
    id: 'subj-7',
    code: 'MATH102',
    name: 'Calculus 1',
    units: 3,
    lectureHours: 3,
    labHours: 0,
    yearLevel: 1,
    semester: 2,
    prerequisites: ['subj-2'],
    programId: 'prog-1'
  },
  {
    id: 'subj-8',
    code: 'CS103',
    name: 'Discrete Mathematics',
    units: 3,
    lectureHours: 3,
    labHours: 0,
    yearLevel: 1,
    semester: 2,
    prerequisites: ['subj-2'],
    programId: 'prog-1'
  },
  // Year 2 Subjects
  {
    id: 'subj-9',
    code: 'CS201',
    name: 'Data Structures and Algorithms',
    units: 3,
    lectureHours: 2,
    labHours: 3,
    yearLevel: 2,
    semester: 1,
    prerequisites: ['subj-6'],
    programId: 'prog-1'
  },
  {
    id: 'subj-10',
    code: 'CS202',
    name: 'Database Management Systems',
    units: 3,
    lectureHours: 2,
    labHours: 3,
    yearLevel: 2,
    semester: 1,
    prerequisites: ['subj-6'],
    programId: 'prog-1'
  },
  {
    id: 'subj-11',
    code: 'CS203',
    name: 'Computer Networks',
    units: 3,
    lectureHours: 2,
    labHours: 3,
    yearLevel: 2,
    semester: 2,
    prerequisites: ['subj-9'],
    programId: 'prog-1'
  },
  {
    id: 'subj-12',
    code: 'CS204',
    name: 'Web Development',
    units: 3,
    lectureHours: 2,
    labHours: 3,
    yearLevel: 2,
    semester: 2,
    prerequisites: ['subj-10'],
    programId: 'prog-1'
  },
  // Additional subjects with different unit values for testing
  {
    id: 'subj-13',
    code: 'CS301',
    name: 'Software Engineering',
    units: 7,
    lectureHours: 5,
    labHours: 6,
    yearLevel: 3,
    semester: 1,
    prerequisites: ['subj-9'],
    programId: 'prog-1'
  },
  {
    id: 'subj-14',
    code: 'CS302',
    name: 'Mobile Development',
    units: 5,
    lectureHours: 3,
    labHours: 4,
    yearLevel: 3,
    semester: 1,
    prerequisites: ['subj-12'],
    programId: 'prog-1'
  },
  {
    id: 'subj-15',
    code: 'CS303',
    name: 'Machine Learning',
    units: 4,
    lectureHours: 3,
    labHours: 3,
    yearLevel: 3,
    semester: 2,
    prerequisites: ['subj-9'],
    programId: 'prog-1'
  },
  {
    id: 'subj-16',
    code: 'CS304',
    name: 'Capstone Project',
    units: 6,
    lectureHours: 2,
    labHours: 12,
    yearLevel: 4,
    semester: 1,
    prerequisites: ['subj-13'],
    programId: 'prog-1'
  }
];

// Mock Faculty
export const mockFaculty: Faculty[] = [
  {
    id: 'fac-1',
    name: 'Dr. Maria Santos',
    department: 'Computer Science Department',
    specializations: ['Programming', 'Software Engineering', 'Web Development'],
    maxHoursPerWeek: 24,
    preferredTimeSlots: ['08:00-10:00', '10:00-12:00'],
    unavailableSlots: ['17:00-18:00'],
    experienceYears: 15,
    subjectExperience: [
      { subjectId: 'subj-1', subjectCode: 'CS101', yearsExperience: 10, proficiencyLevel: 95 },
      { subjectId: 'subj-6', subjectCode: 'CS102', yearsExperience: 8, proficiencyLevel: 90 },
      { subjectId: 'subj-12', subjectCode: 'CS204', yearsExperience: 5, proficiencyLevel: 85 }
    ],
    currentLoad: { units: 12, maxUnits: 24, courses: 4 },
    maxLoad: 24,
    performanceRating: 4.8,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Thursday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '08:00', endTime: '17:00', isAvailable: true }
    ],
    preferences: {
      preferredTimes: [
        { day: 'Monday', startTime: '08:00', endTime: '12:00' },
        { day: 'Wednesday', startTime: '08:00', endTime: '12:00' }
      ],
      preferredSubjects: ['CS101', 'CS102', 'CS204'],
      maxConsecutiveHours: 4
    }
  },
  {
    id: 'fac-2',
    name: 'Prof. John Rodriguez',
    department: 'Computer Science Department',
    specializations: ['Data Structures', 'Algorithms', 'Database Systems'],
    maxHoursPerWeek: 21,
    preferredTimeSlots: ['10:00-12:00', '13:00-14:00', '14:00-15:00'],
    unavailableSlots: ['07:00-08:00'],
    experienceYears: 12,
    subjectExperience: [
      { subjectId: 'subj-9', subjectCode: 'CS201', yearsExperience: 8, proficiencyLevel: 92 },
      { subjectId: 'subj-10', subjectCode: 'CS202', yearsExperience: 10, proficiencyLevel: 88 },
      { subjectId: 'subj-8', subjectCode: 'CS103', yearsExperience: 6, proficiencyLevel: 85 }
    ],
    currentLoad: { units: 9, maxUnits: 21, courses: 3 },
    maxLoad: 21,
    performanceRating: 4.6,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Thursday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '08:00', endTime: '17:00', isAvailable: true }
    ],
    preferences: {
      preferredTimes: [
        { day: 'Tuesday', startTime: '10:00', endTime: '15:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '15:00' }
      ],
      preferredSubjects: ['CS201', 'CS202', 'CS103'],
      maxConsecutiveHours: 3
    }
  },
  {
    id: 'fac-3',
    name: 'Dr. Ana Garcia',
    department: 'Computer Science Department',
    specializations: ['Mathematics', 'Statistics', 'Discrete Mathematics'],
    maxHoursPerWeek: 18,
    preferredTimeSlots: ['08:00-10:00', '14:00-16:00'],
    unavailableSlots: ['12:00-13:00'],
    experienceYears: 20,
    subjectExperience: [
      { subjectId: 'subj-2', subjectCode: 'MATH101', yearsExperience: 15, proficiencyLevel: 98 },
      { subjectId: 'subj-7', subjectCode: 'MATH102', yearsExperience: 12, proficiencyLevel: 95 },
      { subjectId: 'subj-8', subjectCode: 'CS103', yearsExperience: 8, proficiencyLevel: 90 }
    ],
    currentLoad: { units: 9, maxUnits: 18, courses: 3 },
    maxLoad: 18,
    performanceRating: 4.9,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Thursday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '08:00', endTime: '17:00', isAvailable: true }
    ],
    preferences: {
      preferredTimes: [
        { day: 'Monday', startTime: '08:00', endTime: '11:00' },
        { day: 'Friday', startTime: '14:00', endTime: '17:00' }
      ],
      preferredSubjects: ['MATH101', 'MATH102', 'CS103'],
      maxConsecutiveHours: 3
    }
  },
  {
    id: 'fac-4',
    name: 'Prof. Michael Chen',
    department: 'Computer Science Department',
    specializations: ['Networks', 'Cybersecurity', 'System Administration'],
    maxHoursPerWeek: 21,
    preferredTimeSlots: ['13:00-14:00', '14:00-15:00', '15:00-17:00'],
    unavailableSlots: ['07:00-09:00'],
    experienceYears: 10,
    subjectExperience: [
      { subjectId: 'subj-11', subjectCode: 'CS203', yearsExperience: 7, proficiencyLevel: 88 },
      { subjectId: 'subj-1', subjectCode: 'CS101', yearsExperience: 5, proficiencyLevel: 80 }
    ],
    currentLoad: { units: 6, maxUnits: 21, courses: 2 },
    maxLoad: 21,
    performanceRating: 4.4,
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
    ],
    preferences: {
      preferredTimes: [
        { day: 'Wednesday', startTime: '13:00', endTime: '17:00' },
        { day: 'Friday', startTime: '13:00', endTime: '17:00' }
      ],
      preferredSubjects: ['CS203'],
      maxConsecutiveHours: 4
    }
  },
  {
    id: 'fac-5',
    name: 'Ms. Sarah Johnson',
    department: 'General Education',
    specializations: ['English', 'Communication', 'Literature'],
    maxHoursPerWeek: 24,
    preferredTimeSlots: ['08:00-10:00', '10:00-12:00'],
    unavailableSlots: ['16:00-17:00'],
    experienceYears: 8,
    subjectExperience: [
      { subjectId: 'subj-3', subjectCode: 'ENG101', yearsExperience: 8, proficiencyLevel: 92 }
    ],
    currentLoad: { units: 15, maxUnits: 24, courses: 5 },
    maxLoad: 24,
    performanceRating: 4.7,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
    ],
    preferences: {
      preferredTimes: [
        { day: 'Tuesday', startTime: '08:00', endTime: '12:00' },
        { day: 'Thursday', startTime: '08:00', endTime: '12:00' }
      ],
      preferredSubjects: ['ENG101'],
      maxConsecutiveHours: 3
    }
  }
];

// Mock Rooms
export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Computer Laboratory 1',
    capacity: 40,
    type: 'Laboratory',
    equipment: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning'],
    building: 'IT Building'
  },
  {
    id: 'room-2',
    name: 'Computer Laboratory 2',
    capacity: 35,
    type: 'Laboratory',
    equipment: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning'],
    building: 'IT Building'
  },
  {
    id: 'room-3',
    name: 'Lecture Room 101',
    capacity: 50,
    type: 'Lecture',
    equipment: ['Projector', 'Sound System', 'Whiteboard', 'Air Conditioning'],
    building: 'Academic Building'
  },
  {
    id: 'room-4',
    name: 'Lecture Room 102',
    capacity: 45,
    type: 'Lecture',
    equipment: ['Projector', 'Sound System', 'Whiteboard', 'Air Conditioning'],
    building: 'Academic Building'
  },
  {
    id: 'room-5',
    name: 'Lecture Room 103',
    capacity: 60,
    type: 'Lecture',
    equipment: ['Projector', 'Sound System', 'Whiteboard', 'Air Conditioning'],
    building: 'Academic Building'
  },
  {
    id: 'room-6',
    name: 'Multi-Purpose Room',
    capacity: 80,
    type: 'Both',
    equipment: ['Projector', 'Sound System', 'Whiteboard', 'Air Conditioning', 'Movable Tables'],
    building: 'Main Building'
  },
  {
    id: 'room-7',
    name: 'Physics Laboratory',
    capacity: 30,
    type: 'Laboratory',
    equipment: ['Lab Equipment', 'Projector', 'Whiteboard', 'Safety Equipment'],
    building: 'Science Building'
  },
  {
    id: 'room-8',
    name: 'Mathematics Room',
    capacity: 40,
    type: 'Lecture',
    equipment: ['Whiteboard', 'Projector', 'Calculator Sets'],
    building: 'Academic Building'
  }
];

// Mock Optimization Constraints
export const mockConstraints: OptimizationConstraints = {
  maxConsecutiveHours: 4,
  minBreakBetweenClasses: 15,
  preferredStartTime: '08:00',
  preferredEndTime: '17:00',
  avoidBackToBackLabs: true,
  facultyMaxHoursPerDay: 8,
  roomUtilizationTarget: 80
};

// Mock Goals for testing different scenarios
export const mockGoals = {
  department: 'Computer Science Department',
  program: 'Bachelor of Science in Computer Science',
  yearLevel: 1,
  semester: 1,
  targetStudents: 35
};

// Additional test scenarios
export const testScenarios = {
  // Scenario 1: Year 1, Semester 1 - Basic subjects
  year1Sem1: {
    department: 'Computer Science Department',
    program: 'Bachelor of Science in Computer Science',
    yearLevel: 1,
    semester: 1,
    targetStudents: 35
  },
  
  // Scenario 2: Year 1, Semester 2 - With prerequisites
  year1Sem2: {
    department: 'Computer Science Department',
    program: 'Bachelor of Science in Computer Science',
    yearLevel: 1,
    semester: 2,
    targetStudents: 32
  },
  
  // Scenario 3: Year 2, Semester 1 - Advanced subjects
  year2Sem1: {
    department: 'Computer Science Department',
    program: 'Bachelor of Science in Computer Science',
    yearLevel: 2,
    semester: 1,
    targetStudents: 28
  },
  
  // Scenario 4: Year 2, Semester 2 - Specialized subjects
  year2Sem2: {
    department: 'Computer Science Department',
    program: 'Bachelor of Science in Computer Science',
    yearLevel: 2,
    semester: 2,
    targetStudents: 25
  }
};

// Mock Time Slots - 1.5-hour blocks from 7:00 AM to 8:00 PM
export const mockTimeSlots: TimeSlot[] = [
  // Monday slots - 1.5 hour blocks
  { id: 'ts-1', day: 'Monday', startTime: '07:00', endTime: '08:30', duration: 90 },
  { id: 'ts-2', day: 'Monday', startTime: '08:30', endTime: '10:00', duration: 90 },
  { id: 'ts-3', day: 'Monday', startTime: '10:00', endTime: '11:30', duration: 90 },
  { id: 'ts-4', day: 'Monday', startTime: '11:30', endTime: '13:00', duration: 90 },
  { id: 'ts-4a', day: 'Monday', startTime: '13:00', endTime: '14:00', duration: 60 },
  { id: 'ts-5', day: 'Monday', startTime: '14:00', endTime: '15:30', duration: 90 },
  { id: 'ts-6', day: 'Monday', startTime: '15:30', endTime: '17:00', duration: 90 },
  { id: 'ts-7', day: 'Monday', startTime: '17:00', endTime: '18:30', duration: 90 },
  { id: 'ts-8', day: 'Monday', startTime: '18:30', endTime: '20:00', duration: 90 },

  // Tuesday slots - 1.5 hour blocks
  { id: 'ts-9', day: 'Tuesday', startTime: '07:00', endTime: '08:30', duration: 90 },
  { id: 'ts-10', day: 'Tuesday', startTime: '08:30', endTime: '10:00', duration: 90 },
  { id: 'ts-11', day: 'Tuesday', startTime: '10:00', endTime: '11:30', duration: 90 },
  { id: 'ts-12', day: 'Tuesday', startTime: '11:30', endTime: '13:00', duration: 90 },
  { id: 'ts-12a', day: 'Tuesday', startTime: '13:00', endTime: '14:00', duration: 60 },
  { id: 'ts-13', day: 'Tuesday', startTime: '14:00', endTime: '15:30', duration: 90 },
  { id: 'ts-14', day: 'Tuesday', startTime: '15:30', endTime: '17:00', duration: 90 },
  { id: 'ts-15', day: 'Tuesday', startTime: '17:00', endTime: '18:30', duration: 90 },
  { id: 'ts-16', day: 'Tuesday', startTime: '18:30', endTime: '20:00', duration: 90 },

  // Wednesday slots - 1.5 hour blocks
  { id: 'ts-17', day: 'Wednesday', startTime: '07:00', endTime: '08:30', duration: 90 },
  { id: 'ts-18', day: 'Wednesday', startTime: '08:30', endTime: '10:00', duration: 90 },
  { id: 'ts-19', day: 'Wednesday', startTime: '10:00', endTime: '11:30', duration: 90 },
  { id: 'ts-20', day: 'Wednesday', startTime: '11:30', endTime: '13:00', duration: 90 },
  { id: 'ts-20a', day: 'Wednesday', startTime: '13:00', endTime: '14:00', duration: 60 },
  { id: 'ts-21', day: 'Wednesday', startTime: '14:00', endTime: '15:30', duration: 90 },
  { id: 'ts-22', day: 'Wednesday', startTime: '15:30', endTime: '17:00', duration: 90 },
  { id: 'ts-23', day: 'Wednesday', startTime: '17:00', endTime: '18:30', duration: 90 },
  { id: 'ts-24', day: 'Wednesday', startTime: '18:30', endTime: '20:00', duration: 90 },

  // Thursday slots - 1.5 hour blocks
  { id: 'ts-25', day: 'Thursday', startTime: '07:00', endTime: '08:30', duration: 90 },
  { id: 'ts-26', day: 'Thursday', startTime: '08:30', endTime: '10:00', duration: 90 },
  { id: 'ts-27', day: 'Thursday', startTime: '10:00', endTime: '11:30', duration: 90 },
  { id: 'ts-28', day: 'Thursday', startTime: '11:30', endTime: '13:00', duration: 90 },
  { id: 'ts-28a', day: 'Thursday', startTime: '13:00', endTime: '14:00', duration: 60 },
  { id: 'ts-29', day: 'Thursday', startTime: '14:00', endTime: '15:30', duration: 90 },
  { id: 'ts-30', day: 'Thursday', startTime: '15:30', endTime: '17:00', duration: 90 },
  { id: 'ts-31', day: 'Thursday', startTime: '17:00', endTime: '18:30', duration: 90 },
  { id: 'ts-32', day: 'Thursday', startTime: '18:30', endTime: '20:00', duration: 90 },

  // Friday slots - 1.5 hour blocks
  { id: 'ts-33', day: 'Friday', startTime: '07:00', endTime: '08:30', duration: 90 },
  { id: 'ts-34', day: 'Friday', startTime: '08:30', endTime: '10:00', duration: 90 },
  { id: 'ts-35', day: 'Friday', startTime: '10:00', endTime: '11:30', duration: 90 },
  { id: 'ts-36', day: 'Friday', startTime: '11:30', endTime: '13:00', duration: 90 },
  { id: 'ts-36a', day: 'Friday', startTime: '13:00', endTime: '14:00', duration: 60 },
  { id: 'ts-37', day: 'Friday', startTime: '14:00', endTime: '15:30', duration: 90 },
  { id: 'ts-38', day: 'Friday', startTime: '15:30', endTime: '17:00', duration: 90 },
  { id: 'ts-39', day: 'Friday', startTime: '17:00', endTime: '18:30', duration: 90 },
  { id: 'ts-40', day: 'Friday', startTime: '18:30', endTime: '20:00', duration: 90 },

  // Saturday slots - 1.5 hour blocks
  { id: 'ts-41', day: 'Saturday', startTime: '07:00', endTime: '08:30', duration: 90 },
  { id: 'ts-42', day: 'Saturday', startTime: '08:30', endTime: '10:00', duration: 90 },
  { id: 'ts-43', day: 'Saturday', startTime: '10:00', endTime: '11:30', duration: 90 },
  { id: 'ts-44', day: 'Saturday', startTime: '11:30', endTime: '13:00', duration: 90 },
  { id: 'ts-44a', day: 'Saturday', startTime: '13:00', endTime: '14:00', duration: 60 },
  { id: 'ts-45', day: 'Saturday', startTime: '14:00', endTime: '15:30', duration: 90 },
  { id: 'ts-46', day: 'Saturday', startTime: '15:30', endTime: '17:00', duration: 90 },
  { id: 'ts-47', day: 'Saturday', startTime: '17:00', endTime: '18:30', duration: 90 },
  { id: 'ts-48', day: 'Saturday', startTime: '18:30', endTime: '20:00', duration: 90 },

  // Sunday slots - 1.5 hour blocks
  { id: 'ts-49', day: 'Sunday', startTime: '07:00', endTime: '08:30', duration: 90 },
  { id: 'ts-50', day: 'Sunday', startTime: '08:30', endTime: '10:00', duration: 90 },
  { id: 'ts-51', day: 'Sunday', startTime: '10:00', endTime: '11:30', duration: 90 },
  { id: 'ts-52', day: 'Sunday', startTime: '11:30', endTime: '13:00', duration: 90 },
  { id: 'ts-52a', day: 'Sunday', startTime: '13:00', endTime: '14:00', duration: 60 },
  { id: 'ts-53', day: 'Sunday', startTime: '14:00', endTime: '15:30', duration: 90 },
  { id: 'ts-54', day: 'Sunday', startTime: '15:30', endTime: '17:00', duration: 90 },
  { id: 'ts-55', day: 'Sunday', startTime: '17:00', endTime: '18:30', duration: 90 },
  { id: 'ts-56', day: 'Sunday', startTime: '18:30', endTime: '20:00', duration: 90 }
];

// Mock Faculty Recommendations
export const mockFacultyRecommendations: FacultyRecommendation[] = [
  // CS101 - Introduction to Programming
  {
    facultyId: 'fac-1',
    facultyName: 'Dr. Maria Santos',
    matchScore: 95,
    reasons: [
      'Perfect specialization match in Programming',
      'Excellent student ratings (4.8/5)',
      'High availability during preferred times',
      'Strong programming background with 10 years experience'
    ],
    alternatives: [
      {
        id: 'fac-4',
        name: 'Prof. Michael Chen',
        specializations: ['Networks', 'Cybersecurity', 'System Administration'],
        experienceYears: 10,
        subjectExperience: 5,
        currentLoad: { units: 6, maxUnits: 21, courses: 2 },
        maxLoad: 21,
        matchScore: 80,
        availabilityScore: 85,
        workloadScore: 90,
        experienceScore: 75,
        overallScore: 82,
        strengths: ['Available capacity', 'Good availability'],
        concerns: ['Less specialized in programming', 'Limited programming experience']
      }
    ]
  },
  // CS102 - Object-Oriented Programming
  {
    facultyId: 'fac-1',
    facultyName: 'Dr. Maria Santos',
    matchScore: 90,
    reasons: [
      'Strong OOP expertise',
      'Previous experience with CS102',
      'Excellent performance rating',
      'Good availability'
    ],
    alternatives: [
      {
        id: 'fac-4',
        name: 'Prof. Michael Chen',
        specializations: ['Networks', 'Cybersecurity', 'System Administration'],
        experienceYears: 10,
        subjectExperience: 0,
        currentLoad: { units: 6, maxUnits: 21, courses: 2 },
        maxLoad: 21,
        matchScore: 70,
        availabilityScore: 85,
        workloadScore: 90,
        experienceScore: 60,
        overallScore: 76,
        strengths: ['Available capacity'],
        concerns: ['No OOP teaching experience', 'Specialization mismatch']
      }
    ]
  },
  // CS201 - Data Structures and Algorithms
  {
    facultyId: 'fac-2',
    facultyName: 'Prof. John Rodriguez',
    matchScore: 92,
    reasons: [
      'Expert in Data Structures and Algorithms',
      '8 years experience with CS201',
      'Strong performance rating (4.6/5)',
      'Specialized in this subject area'
    ],
    alternatives: [
      {
        id: 'fac-1',
        name: 'Dr. Maria Santos',
        specializations: ['Programming', 'Software Engineering', 'Web Development'],
        experienceYears: 15,
        subjectExperience: 0,
        currentLoad: { units: 12, maxUnits: 24, courses: 4 },
        maxLoad: 24,
        matchScore: 75,
        availabilityScore: 80,
        workloadScore: 70,
        experienceScore: 70,
        overallScore: 74,
        strengths: ['High experience years', 'Good programming background'],
        concerns: ['No direct data structures experience', 'Higher current load']
      }
    ]
  },
  // CS202 - Database Management Systems
  {
    facultyId: 'fac-2',
    facultyName: 'Prof. John Rodriguez',
    matchScore: 88,
    reasons: [
      'Specialized in Database Systems',
      '10 years experience with CS202',
      'Strong technical background',
      'Good availability'
    ],
    alternatives: [
      {
        id: 'fac-1',
        name: 'Dr. Maria Santos',
        specializations: ['Programming', 'Software Engineering', 'Web Development'],
        experienceYears: 15,
        subjectExperience: 0,
        currentLoad: { units: 12, maxUnits: 24, courses: 4 },
        maxLoad: 24,
        matchScore: 70,
        availabilityScore: 80,
        workloadScore: 70,
        experienceScore: 65,
        overallScore: 71,
        strengths: ['Strong programming background'],
        concerns: ['No database teaching experience', 'Higher current load']
      }
    ]
  },
  // MATH101 - College Algebra
  {
    facultyId: 'fac-3',
    facultyName: 'Dr. Ana Garcia',
    matchScore: 98,
    reasons: [
      'Mathematics specialist',
      '15 years experience with MATH101',
      'Highest performance rating (4.9/5)',
      'Perfect subject match'
    ],
    alternatives: [
      {
        id: 'fac-2',
        name: 'Prof. John Rodriguez',
        specializations: ['Data Structures', 'Algorithms', 'Database Systems'],
        experienceYears: 12,
        subjectExperience: 0,
        currentLoad: { units: 9, maxUnits: 21, courses: 3 },
        maxLoad: 21,
        matchScore: 60,
        availabilityScore: 75,
        workloadScore: 80,
        experienceScore: 50,
        overallScore: 66,
        strengths: ['Available capacity'],
        concerns: ['Not specialized in mathematics', 'No math teaching experience']
      }
    ]
  },
  // ENG101 - English Communication
  {
    facultyId: 'fac-5',
    facultyName: 'Ms. Sarah Johnson',
    matchScore: 92,
    reasons: [
      'English and Communication specialist',
      '8 years experience with ENG101',
      'Excellent performance rating (4.7/5)',
      'Perfect subject specialization match'
    ],
    alternatives: [
      {
        id: 'fac-1',
        name: 'Dr. Maria Santos',
        specializations: ['Programming', 'Software Engineering', 'Web Development'],
        experienceYears: 15,
        subjectExperience: 0,
        currentLoad: { units: 12, maxUnits: 24, courses: 4 },
        maxLoad: 24,
        matchScore: 40,
        availabilityScore: 80,
        workloadScore: 70,
        experienceScore: 30,
        overallScore: 55,
        strengths: ['High overall experience'],
        concerns: ['No English teaching background', 'Specialization mismatch', 'Higher current load']
      }
    ]
  }
];

// Export all mock data as a single object for easy import
export const mockData = {
  departments: mockDepartments,
  programs: mockPrograms,
  subjects: mockSubjects,
  faculty: mockFaculty,
  rooms: mockRooms,
  timeSlots: mockTimeSlots,
  constraints: mockConstraints,
  goals: mockGoals,
  testScenarios,
  facultyRecommendations: mockFacultyRecommendations
};
