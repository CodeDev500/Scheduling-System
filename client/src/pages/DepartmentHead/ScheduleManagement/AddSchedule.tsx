import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  MapPin, 
  X, 
  AlertTriangle, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Users,
  Building,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import ScheduleCalendar from '../../../components/schedule/ScheduleCalendar';
import { validateSchedule, getConflictSummary } from '../../../utils/scheduleConflicts';
import type { ScheduleItem as ConflictScheduleItem, ScheduleConflict } from '../../../utils/scheduleConflicts';
import { useFacultyPreferences } from '../../../contexts/FacultyPreferencesContext';
import { getFacultyPreferences } from '../../../utils/facultyPreferences';

// Type alias for Conflict
type Conflict = ScheduleConflict;

interface Subject {
  id: string;
  code: string;
  title: string;
  description: string;
  units: number;
  lecture: number;
  lab: number;
  prerequisites?: string[];
  level: string;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string[];
  maxUnits: number;
  currentUnits: number;
}

interface Room {
  id: string;
  name: string;
  type: 'Lecture' | 'Laboratory' | 'Computer Lab';
  capacity: number;
  building: string;
  floor: number;
  equipment: string[];
  availability: boolean;
}

interface ScheduleEntry {
  id: string;
  subjectIds: string[];
  subjects?: Subject[];
  days: string[];
  startTime: string;
  endTime: string;
  roomId: string;
  room?: Room;
  section: string;
  semester: string;
  academicYear: string;
}

interface SubjectSchedule {
  id?: string;
  subjects: Subject[];
  subjectIds: string[];
  startTime: string;
  endTime: string;
  days: string[];
  roomId: string;
  room?: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    building: string;
    floor: number;
    equipment: string[];
  };
  section: string;
  semester: string;
  academicYear: string;
}

interface ScheduleForm {
  facultyId: string;
  faculty?: Faculty;
  schedules: SubjectSchedule[];
}

const AddSchedule = () => {
  const navigate = useNavigate();
  const { preferences } = useFacultyPreferences();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [existingSchedules, setExistingSchedules] = useState<ConflictScheduleItem[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // Wizard state management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isStepValid, setIsStepValid] = useState(false);
  
  const wizardSteps = [
    { id: 1, title: 'Faculty Selection', icon: User, description: 'Choose faculty member' },
    { id: 2, title: 'Subject & Schedule', icon: BookOpen, description: 'Add subjects and time slots' },
    { id: 3, title: 'Room Assignment', icon: Building, description: 'Assign rooms to schedules' },
    { id: 4, title: 'Review & Conflicts', icon: Eye, description: 'Review and resolve conflicts' }
  ];
  
  const [formData, setFormData] = useState<ScheduleForm>({
    facultyId: '',
    schedules: [{
      subjects: [],
      subjectIds: [],
      startTime: '',
      endTime: '',
      days: [],
      roomId: '',
      section: '',
      semester: '1st Semester',
      academicYear: '2024-2025'
    }]
  });

  const addNewSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, {
        subjects: [],
        subjectIds: [],
        startTime: '',
        endTime: '',
        days: [],
        roomId: '',
        section: '',
        semester: '1st Semester',
        academicYear: '2024-2025'
      }]
    }));
  };

  const removeSchedule = (index: number) => {
    if (formData.schedules.length > 1) {
      setFormData(prev => ({
        ...prev,
        schedules: prev.schedules.filter((_, i) => i !== index)
      }));
    }
  };

  const dayOptions = [
    { value: 'M', label: 'Monday' },
    { value: 'T', label: 'Tuesday' },
    { value: 'W', label: 'Wednesday' },
    { value: 'Th', label: 'Thursday' },
    { value: 'F', label: 'Friday' },
    { value: 'S', label: 'Saturday' }
  ];

  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const commonDayPatterns = [
    { value: ['M', 'W', 'F'], label: 'MWF (Mon, Wed, Fri)' },
    { value: ['T', 'Th'], label: 'TTh (Tue, Thu)' },
    { value: ['M', 'T', 'W', 'Th', 'F'], label: 'MTWTHF (Mon-Fri)' },
    { value: ['S'], label: 'Saturday Only' }
  ];

  useEffect(() => {
    // Mock data initialization
    const mockSubjects: Subject[] = [
      {
        id: 'CS130',
        code: 'CS 130',
        title: 'CS THESIS I',
        description: 'Computer Science Thesis I',
        units: 3,
        lecture: 3,
        lab: 0,
        level: '3rd Year'
      },
      {
        id: 'CS132',
        code: 'CS 132',
        title: 'SOFTWARE ENGINEERING 2',
        description: 'Advanced Software Engineering Concepts',
        units: 3,
        lecture: 2,
        lab: 3,
        level: '3rd Year'
      },
      {
        id: 'CS101',
        code: 'CS 101',
        title: 'INTRODUCTION TO COMPUTING',
        description: 'Basic Computing Concepts',
        units: 3,
        lecture: 2,
        lab: 3,
        level: '1st Year'
      },
      {
        id: 'CS201',
        code: 'CS 201',
        title: 'DATA STRUCTURES AND ALGORITHMS',
        description: 'Data Structures and Algorithms',
        units: 3,
        lecture: 2,
        lab: 3,
        level: '2nd Year'
      },
      {
        id: 'CS301',
        code: 'CS 301',
        title: 'DATABASE SYSTEMS',
        description: 'Database Design and Management',
        units: 3,
        lecture: 2,
        lab: 3,
        level: '3rd Year'
      }
    ];

    const mockFaculty: Faculty[] = [
      {
        id: 'FAC001',
        name: 'Dr. Maria Santos',
        email: 'maria.santos@university.edu',
        department: 'Computer Science',
        specialization: ['Data Structures', 'Algorithms', 'Software Engineering'],
        maxUnits: 21,
        currentUnits: 15
      },
      {
        id: 'FAC002',
        name: 'Prof. John Dela Cruz',
        email: 'john.delacruz@university.edu',
        department: 'Computer Science',
        specialization: ['Database Systems', 'Web Development', 'Programming'],
        maxUnits: 21,
        currentUnits: 18
      },
      {
        id: 'FAC003',
        name: 'Ms. Ana Rodriguez',
        email: 'ana.rodriguez@university.edu',
        department: 'Computer Science',
        specialization: ['Mobile Development', 'UI/UX', 'Programming'],
        maxUnits: 12,
        currentUnits: 9
      }
    ];

    const mockRooms: Room[] = [
      {
        id: 'LAB1',
        name: 'LAB 1',
        type: 'Computer Lab',
        capacity: 40,
        building: 'IT Building',
        floor: 1,
        equipment: ['Computers', 'Projector', 'Whiteboard'],
        availability: true
      },
      {
        id: 'LAB2',
        name: 'LAB 2',
        type: 'Computer Lab',
        capacity: 35,
        building: 'IT Building',
        floor: 2,
        equipment: ['Computers', 'Projector', 'Smart Board'],
        availability: true
      },
      {
        id: 'ROOM102',
        name: 'ROOM 102',
        type: 'Lecture',
        capacity: 50,
        building: 'Main Building',
        floor: 1,
        equipment: ['Projector', 'Sound System', 'Whiteboard'],
        availability: true
      },
      {
        id: 'ROOM103',
        name: 'ROOM 103',
        type: 'Lecture',
        capacity: 45,
        building: 'Main Building',
        floor: 1,
        equipment: ['Projector', 'Whiteboard'],
        availability: true
      }
    ];

    // Mock existing schedules for conflict detection
    const mockExistingSchedules: ConflictScheduleItem[] = [
      {
        id: 'SCH001',
        subject: 'Data Structures and Algorithms',
        code: 'CS 201',
        faculty: 'Dr. Maria Santos',
        facultyId: 'FAC001',
        room: 'LAB 1',
        roomId: 'LAB1',
        startTime: '09:00',
        endTime: '11:00',
        day: 'Monday',
        section: 'BSCS-2A',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      {
        id: 'SCH002',
        subject: 'Database Systems',
        code: 'CS 301',
        faculty: 'Prof. John Dela Cruz',
        facultyId: 'FAC002',
        room: 'ROOM 102',
        roomId: 'ROOM102',
        startTime: '13:00',
        endTime: '15:00',
        day: 'Tuesday',
        section: 'BSCS-3A',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      {
        id: 'SCH003',
        subject: 'Introduction to Computing',
        code: 'CS 101',
        faculty: 'Ms. Ana Rodriguez',
        facultyId: 'FAC003',
        room: 'LAB 2',
        roomId: 'LAB2',
        startTime: '10:00',
        endTime: '12:00',
        day: 'Wednesday',
        section: 'BSCS-1B',
        semester: '1st Semester',
        academicYear: '2024-2025'
      }
    ];

    setSubjects(mockSubjects);
    setFaculty(mockFaculty);
    setRooms(mockRooms);
    setExistingSchedules(mockExistingSchedules);
  }, []);

  const addSubject = (scheduleIndex: number, subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, index) => 
        index === scheduleIndex && !schedule.subjectIds.includes(subjectId)
          ? {
              ...schedule,
              subjectIds: [...schedule.subjectIds, subjectId],
              subjects: [...(schedule.subjects || []), subjects.find(s => s.id === subjectId)!]
            }
          : schedule
      )
    }));
  };

  const removeSubject = (scheduleIndex: number, subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, index) => 
        index === scheduleIndex
          ? {
              ...schedule,
              subjectIds: schedule.subjectIds.filter(id => id !== subjectId),
              subjects: schedule.subjects?.filter(s => s.id !== subjectId) || []
            }
          : schedule
      )
    }));
  };

  // Wizard navigation functions
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.facultyId !== '';
      case 2:
        return formData.schedules.some(schedule => 
          schedule.subjectIds.length > 0 && 
          schedule.startTime && 
          schedule.endTime && 
          schedule.days.length > 0
        );
      case 3:
        return formData.schedules.every(schedule => 
          schedule.subjectIds.length === 0 || schedule.roomId !== ''
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < wizardSteps.length) {
      setCompletedSteps(prev => [...prev.filter(step => step !== currentStep), currentStep]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  // Update step validation when form data changes
  useEffect(() => {
    setIsStepValid(validateCurrentStep());
  }, [formData, currentStep]);

  const updateScheduleField = (scheduleIndex: number, field: keyof SubjectSchedule, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, index) => 
        index === scheduleIndex 
          ? {
              ...schedule,
              [field]: value,
              ...(field === 'roomId' && {
                room: rooms.find(r => r.id === value)
              })
            }
          : schedule
      )
    }));
  };

  // Check for conflicts whenever form data changes
  useEffect(() => {
    const selectedFaculty = faculty.find(f => f.id === formData.facultyId);
    
    if (selectedFaculty) {
      const allConflicts: Conflict[] = [];
      const allScheduleItems: ConflictScheduleItem[] = [];
      
      // Process each schedule
      formData.schedules.forEach((schedule, scheduleIndex) => {
        if (schedule.startTime && 
            schedule.endTime && 
            schedule.days.length > 0 && 
            schedule.roomId && 
            formData.facultyId) {
          
          const selectedRoom = rooms.find(r => r.id === schedule.roomId);
          
          if (selectedRoom) {
            // Create schedule items for each selected day
            const scheduleItems: ConflictScheduleItem[] = schedule.days.map(day => ({
              id: schedule.id || `new-${scheduleIndex}`,
              subject: schedule.subjects?.map(s => s.title).join(', ') || 'Selected Subjects',
              code: schedule.subjects?.map(s => s.code).join(', ') || 'Multiple',
              faculty: selectedFaculty.name,
              facultyId: formData.facultyId,
              room: selectedRoom.name,
              roomId: schedule.roomId,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              day: day,
              section: schedule.section,
              semester: schedule.semester,
              academicYear: schedule.academicYear
            }));
            
            allScheduleItems.push(...scheduleItems);
          }
        }
      });
      
      // Get faculty preferences for the selected faculty
      const facultyPrefs = getFacultyPreferences(formData.facultyId, preferences);
      
      // Check conflicts against existing schedules
      allScheduleItems.forEach(item => {
        const itemConflicts = validateSchedule(item, existingSchedules, facultyPrefs);
        allConflicts.push(...itemConflicts.conflicts);
      });
      
      // Check conflicts between new schedules
      for (let i = 0; i < allScheduleItems.length; i++) {
        for (let j = i + 1; j < allScheduleItems.length; j++) {
          const item1 = allScheduleItems[i];
          const item2 = allScheduleItems[j];
          const internalConflicts = validateSchedule(item1, [item2], facultyPrefs);
          allConflicts.push(...internalConflicts.conflicts);
        }
      }
      
      setConflicts(allConflicts);
    } else {
      setConflicts([]);
    }
  }, [formData, existingSchedules, faculty, rooms]);

  const updateFaculty = (facultyId: string) => {
    const selectedFaculty = faculty.find(f => f.id === facultyId);
    setFormData({
      ...formData,
      facultyId,
      faculty: selectedFaculty
    });
  };

  const toggleDay = (scheduleIndex: number, day: string) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, index) => 
        index === scheduleIndex
          ? {
              ...schedule,
              days: schedule.days.includes(day)
                ? schedule.days.filter(d => d !== day)
                : [...schedule.days, day].sort((a, b) => {
                    const order = ['M', 'T', 'W', 'Th', 'F', 'S'];
                    return order.indexOf(a) - order.indexOf(b);
                  })
            }
          : schedule
      )
    }));
  };

  const setDayPattern = (scheduleIndex: number, pattern: string[]) => {
    updateScheduleField(scheduleIndex, 'days', pattern);
  };

  const formatDays = (days: string[]) => {
    return days.join('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.facultyId) {
      alert('Please select a faculty member.');
      return;
    }
    
    // Validate all schedules
    const hasEmptySchedules = formData.schedules.some(schedule => 
      !schedule.subjects?.length || !schedule.startTime || !schedule.endTime || 
      !schedule.days.length || !schedule.roomId || !schedule.section
    );
    
    if (hasEmptySchedules) {
      alert('Please fill in all required fields for all schedules.');
      return;
    }
    
    // Check for conflicts before saving
    if (conflicts.length > 0) {
      const conflictSummary = getConflictSummary(conflicts);
      alert(`Cannot save schedules due to conflicts:\n\n${conflictSummary}\n\nPlease resolve these conflicts before saving.`);
      return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Schedule data:', formData);
    alert('Schedules created successfully!');
    navigate('/schedule-management');
  };

  const calculateTotalUnits = () => {
    return formData.schedules.reduce((total, schedule) => {
      const scheduleUnits = schedule.subjects?.reduce((subTotal, subject) => {
        return subTotal + (subject?.units || 0);
      }, 0) || 0;
      return total + scheduleUnits;
    }, 0);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderFacultySelection();
      case 2:
        return renderSubjectSchedule();
      case 3:
        return renderRoomAssignment();
      case 4:
        return renderReviewConflicts();
      default:
        return null;
    }
  };

  // Step rendering functions

  // Step 1: Faculty Selection
  function renderFacultySelection() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Select Faculty Member
          </CardTitle>
          <CardDescription>
            Choose the faculty member who will be assigned to these schedules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty Member *</Label>
              <select
                value={formData.facultyId}
                onChange={(e) => updateFaculty(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Faculty</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.currentUnits}/{f.maxUnits} units)
                  </option>
                ))}
              </select>
            </div>
            
            {formData.faculty && (
              <div className="space-y-2">
                <Label>Faculty Details</Label>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{formData.faculty.name}</span>
                    </div>
                    <div className="text-sm text-blue-700">{formData.faculty.email}</div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Specialization: {formData.faculty.specialization.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Current Load: {formData.faculty.currentUnits + calculateTotalUnits()}/{formData.faculty.maxUnits} units
                      </span>
                      <Badge variant={formData.faculty.currentUnits + calculateTotalUnits() > formData.faculty.maxUnits * 0.8 ? "destructive" : "secondary"}>
                        {Math.round(((formData.faculty.currentUnits + calculateTotalUnits()) / formData.faculty.maxUnits) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Subject & Schedule
  function renderSubjectSchedule() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Subject Schedules</h2>
            <p className="text-sm text-gray-600 mt-1">Add subjects and configure their time slots</p>
          </div>
          <Button onClick={addNewSchedule} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Subject Schedule
          </Button>
        </div>

        {/* Schedule Cards */}

        {formData.schedules.map((schedule, scheduleIndex) => (
          <Card key={scheduleIndex} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Schedule #{scheduleIndex + 1}
                </CardTitle>
                {formData.schedules.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSchedule(scheduleIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
              <CardDescription>
                Select subjects and set schedule details for this time slot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Add Subject</Label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addSubject(scheduleIndex, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Subject to Add</option>
                    {subjects
                      .filter(subject => !schedule.subjectIds.includes(subject.id))
                      .map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.code} - {subject.title} ({subject.units} units)
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Selected Subjects */}
                {schedule.subjects && schedule.subjects.length > 0 && (
                  <div>
                    <Label>Selected Subjects ({schedule.subjects.length})</Label>
                    <div className="mt-2 space-y-2">
                      {schedule.subjects.map(subject => (
                        <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{subject.code} - {subject.title}</div>
                            <div className="text-sm text-gray-600">
                              {subject.units} units • {subject.level}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubject(scheduleIndex, subject.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Schedule Details for each schedule */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Schedule Details</h2>
            <p className="text-sm text-gray-600 mt-1">Configure time, days, and room assignments</p>
          </div>
          
          {formData.schedules.map((schedule, scheduleIndex) => (
            <Card key={scheduleIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule #{scheduleIndex + 1} Details
                </CardTitle>
                <CardDescription>
                  Set the time, days, and other details for schedule #{scheduleIndex + 1}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Section */}
                  <div>
                    <Label>Section *</Label>
                    <Input
                      value={schedule.section}
                      onChange={(e) => updateScheduleField(scheduleIndex, 'section', e.target.value)}
                      placeholder="e.g., BSCS-3A"
                      required
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <Label>Start Time *</Label>
                    <select
                      value={schedule.startTime}
                      onChange={(e) => updateScheduleField(scheduleIndex, 'startTime', e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Start Time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* End Time */}
                  <div>
                    <Label>End Time *</Label>
                    <select
                      value={schedule.endTime}
                      onChange={(e) => updateScheduleField(scheduleIndex, 'endTime', e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select End Time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <Label>Semester</Label>
                    <select
                      value={schedule.semester}
                      onChange={(e) => updateScheduleField(scheduleIndex, 'semester', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <Label>Academic Year</Label>
                    <Input
                      value={schedule.academicYear}
                      onChange={(e) => updateScheduleField(scheduleIndex, 'academicYear', e.target.value)}
                      placeholder="e.g., 2024-2025"
                    />
                  </div>
                </div>

                {/* Days Selection */}
                <div className="mt-6">
                  <Label>Days *</Label>
                  
                  {/* Quick Select Patterns */}
                  <div className="mt-2 mb-3">
                    <Label className="text-sm text-gray-600">Quick Select:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {commonDayPatterns.map((pattern, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDayPattern(scheduleIndex, pattern.value)}
                          className="text-xs"
                        >
                          {pattern.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Individual Day Selection */}
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map(day => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={schedule.days.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(scheduleIndex, day.value)}
                        className="min-w-[60px]"
                      >
                        {day.value}
                      </Button>
                    ))}
                  </div>
                  
                  {schedule.days.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {formatDays(schedule.days)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Room Assignment
  function renderRoomAssignment() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Room Assignment</h2>
          <p className="text-sm text-gray-600 mt-1">Assign appropriate rooms to each schedule</p>
        </div>
        
        {formData.schedules.map((schedule, scheduleIndex) => (
          <Card key={scheduleIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Schedule #{scheduleIndex + 1} - Room Assignment
              </CardTitle>
              <CardDescription>
                {schedule.subjects && schedule.subjects.length > 0 ? (
                  <span>Subjects: {schedule.subjects.map(s => s.code).join(', ')}</span>
                ) : (
                  <span>No subjects selected</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.subjects && schedule.subjects.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <Label>Select Room *</Label>
                    <select
                      value={schedule.roomId}
                      onChange={(e) => updateScheduleField(scheduleIndex, 'roomId', e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Choose a room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} - {room.type} ({room.capacity} seats) - {room.building}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {schedule.room && (
                    <Card className="p-4 bg-green-50 border-green-200">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-900">{schedule.room.name}</span>
                          <Badge variant="secondary">{schedule.room.type}</Badge>
                        </div>
                        <div className="text-sm text-green-700">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {schedule.room.building}, Floor {schedule.room.floor}
                        </div>
                        <div className="text-sm text-green-700">
                          Capacity: {schedule.room.capacity} students
                        </div>
                        <div className="text-sm text-green-700">
                          Equipment: {schedule.room.equipment.join(', ')}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No subjects selected for this schedule</p>
                  <p className="text-sm">Go back to Step 2 to add subjects</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Step 4: Review & Conflicts
  function renderReviewConflicts() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Review & Conflicts</h2>
          <p className="text-sm text-gray-600 mt-1">Review your schedules and resolve any conflicts</p>
        </div>

        {/* Summary */}
        {formData.faculty && formData.schedules.some(s => s.subjects && s.subjects.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Schedule Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Faculty</Label>
                  <div className="text-sm font-medium">{formData.faculty.name}</div>
                  <div className="text-sm text-gray-600">
                    Total Units: {calculateTotalUnits()} / {formData.faculty.maxUnits}
                  </div>
                </div>
                
                <div>
                  <Label>Schedules ({formData.schedules.filter(s => s.subjects && s.subjects.length > 0).length})</Label>
                  <div className="space-y-2 mt-2">
                    {formData.schedules
                      .filter(s => s.subjects && s.subjects.length > 0)
                      .map((schedule, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">
                            {schedule.subjects?.map(s => s.code).join(', ')} - {schedule.section}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDays(schedule.days)} • {schedule.startTime} - {schedule.endTime}
                            {schedule.room && ` • ${schedule.room.name}`}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Schedule Conflicts ({conflicts.length})
              </CardTitle>
              <CardDescription>
                The following conflicts were detected. Please resolve them before saving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800">{conflict.type}</div>
                    <div className="text-sm text-red-600 mt-1">{conflict.message}</div>
                    {conflict.suggestion && (
                      <div className="text-sm text-red-600 mt-1">
                        <strong>Suggestion:</strong> {conflict.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Conflicts */}
        {conflicts.length === 0 && formData.schedules.some(s => s.subjects && s.subjects.length > 0) && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                No Conflicts Detected
              </CardTitle>
              <CardDescription>
                All schedules are valid and ready to be saved.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Schedule Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Preview
            </CardTitle>
            <CardDescription>
              Visual preview of the weekly schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showPreview && (
              <ScheduleCalendar
                schedules={[
                  ...existingSchedules,
                  ...formData.schedules.flatMap((schedule, scheduleIndex) => {
                    if (!schedule.startTime || !schedule.endTime || !schedule.days.length || !schedule.roomId) {
                      return [];
                    }
                    
                    const selectedFaculty = faculty.find(f => f.id === formData.facultyId);
                    const selectedRoom = rooms.find(r => r.id === schedule.roomId);
                    
                    return schedule.days.map(day => ({
                      id: `preview-${scheduleIndex}`,
                      subject: schedule.subjects?.map(s => s.title).join(', ') || 'Selected Subjects',
                      code: schedule.subjects?.map(s => s.code).join(', ') || 'Multiple',
                      faculty: selectedFaculty?.name || 'Unknown Faculty',
                      facultyId: formData.facultyId,
                      room: selectedRoom?.name || 'Unknown Room',
                      roomId: schedule.roomId,
                      startTime: schedule.startTime,
                      endTime: schedule.endTime,
                      day: day,
                      section: schedule.section,
                      semester: schedule.semester,
                      academicYear: schedule.academicYear,
                      isPreview: true
                    }));
                  })
                ]}
                conflicts={conflicts}
                className="max-h-96 overflow-y-auto"
              />
            )}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Calendar Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Add Schedule" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/schedule-management')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedule Management
          </Button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {wizardSteps.length}
            </span>
            <Progress value={(currentStep / wizardSteps.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < wizardSteps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={conflicts.length > 0 || !isStepValid}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Schedule
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSchedule;