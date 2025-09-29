import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Users, GraduationCap, Calendar, Clock, MapPin, Move, Save, Plus, Edit, AlertTriangle, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjects } from '../../../services/subjectSlice';
import { fetchCurriculumCoursesWithFilters } from '../../../services/curriculumSlice';
import { fetchFacultyWithSubjects, fetchFacultyByDepartment } from '../../../services/facultySlice';
import type { AppDispatch, RootState } from '../../../app/store';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import api from '../../../api/axios';

interface Subject {
  id: string;
  subjectCode: string;
  subjectDescription: string;
  lec: number;
  lab: number;
  units: number;
  yearLevel?: number;
  semester?: number;
  section?: string;
  capacity?: number;
  enrolled?: number;
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
  }[];
  courseOfferings?: {
    id: number;
    courseType: string;
    description: string;
    sectionName: string;
    yearLevel: string;
  }[];
  department?: string;
}

interface Faculty {
  id: string;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  subjects: {
    id: number;
    subjectCode: string;
    subjectDescription: string;
    lec: number;
    lab: number;
    units: number;
  }[];
  maxLoad?: number;
  currentLoad?: number;
}

interface Schedule {
  id: string;
  subjectId: string;
  facultyId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'Draft' | 'Published';
}

interface CalendarSlot {
  time: string;
  day: string;
  schedule?: Schedule;
  subject?: Subject;
  faculty?: Faculty;
}

interface FacultySubjectAssignment {
  id: number;
  facultyId: number;
  subjectCode: string;
  subjectDescription: string;
  units: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  yearLevel: string | null;
  semester: string | null;
  section: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

const FacultyVLLoading: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const userData = useAppSelector((state) => state.auth.user);
  const programCode = userData?.department;
  const { curriculums, isLoading: curriculumLoading } = useSelector((state: RootState) => state.curriculum);
  const { faculty: reduxFaculty, isLoading: facultyLoading } = useSelector((state: RootState) => state.faculty);
  const [localFaculty, setLocalFaculty] = useState<Faculty[]>([]);
  
  // State declarations
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [facultyAssignedSubjects, setFacultyAssignedSubjects] = useState<Subject[]>([]);
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [draggedSubject, setDraggedSubject] = useState<Subject | null>(null);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  const [conflictModalOpen, setConflictModalOpen] = useState<boolean>(false);
  const [conflictDetails, setConflictDetails] = useState<any[]>([]);
  const [totalUnitsConfig, setTotalUnitsConfig] = useState<number>(18);
  
  // Faculty subject assignment states
  const [facultySubjectAssignments, setFacultySubjectAssignments] = useState<FacultySubjectAssignment[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [isLoadingFacultySubjects, setIsLoadingFacultySubjects] = useState(false);

  const [selectedSubjectToAdd, setSelectedSubjectToAdd] = useState<Subject | null>(null);
  
  // Use local faculty state that can be updated immediately
  const faculty = localFaculty.length > 0 ? localFaculty : reduxFaculty;
  
  // Function to calculate current load based on calendar schedules
  const calculateFacultyLoad = (facultyId: string) => {
    const facultySchedules = calendarSlots.filter(slot => 
      slot.schedule && slot.schedule.facultyId === facultyId
    );
    
    const uniqueSubjects = new Set();
    let totalLoad = 0;
    
    facultySchedules.forEach(slot => {
      if (slot.subject && !uniqueSubjects.has(slot.subject.id)) {
        uniqueSubjects.add(slot.subject.id);
        totalLoad += slot.subject.units;
      }
    });
    
    return totalLoad;
  };

  // Update local faculty when Redux faculty changes, preserving calculated loads
  useEffect(() => {
    if (reduxFaculty.length > 0) {
      const updatedFaculty = reduxFaculty.map(f => ({
        ...f,
        currentLoad: calculateFacultyLoad(f.id)
      }));
      setLocalFaculty(updatedFaculty);
    }
  }, [reduxFaculty, calendarSlots]);

  // Effect to load existing assignments when selectedFaculty changes
  useEffect(() => {
    if (selectedFaculty) {
      loadExistingAssignments(selectedFaculty);
      fetchFacultySubjectAssignments(selectedFaculty);
      fetchAvailableSubjects();
    } else {
      // Clear calendar when no faculty is selected
      generateEmptyCalendarSlots();
      setSchedules([]);
      setFacultyAssignedSubjects([]);
      setFacultySubjectAssignments([]);
    }
  }, [selectedFaculty]);
  
  console.log(programCode)


  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 7; // 7 AM to 7 PM (7, 8, 9, ..., 19)
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }); // 7:00 AM to 7:00 PM in one-hour increments
  
  // Add 8:00 PM as the final slot
  timeSlots.push('8:00 PM');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch total units configuration
  const fetchTotalUnitsConfig = async () => {
    try {
      const response = await api.get('/total-units');
      const data = response.data;
      
      if (data.success && data.data) {
        setTotalUnitsConfig(data.data.totalUnits);
      }
    } catch (error) {
      console.error('Error fetching total units config:', error);
      // Keep default value of 18 if API call fails
    }
  };

  // Fetch faculty subject assignments and load them into calendar
  const fetchFacultySubjectAssignments = async (facultyId: string) => {
    setIsLoadingFacultySubjects(true);
    try {
      const response = await api.get(`/faculty-subjects/faculty/${facultyId}`);
      if (response.data.success) {
        const assignments = response.data.data;
        setFacultySubjectAssignments(assignments);
        
        // Load assignments into calendar slots
        if (assignments.length > 0) {
          loadAssignmentsIntoCalendar(assignments, facultyId);
        }
      }
    } catch (error) {
      console.error('Error fetching faculty subject assignments:', error);
      setFacultySubjectAssignments([]);
    } finally {
      setIsLoadingFacultySubjects(false);
    }
  };

  // Fetch available subjects
  const fetchAvailableSubjects = async () => {
    try {
      const response = await api.get('/faculty-subjects/available-subjects', {
        params: { department: programCode }
      });
      if (response.data.success) {
        const subjects = response.data.data.map((subject: any) => ({
          id: subject.id.toString(),
          subjectCode: subject.subjectCode,
          subjectDescription: subject.subjectDescription,
          lec: subject.lec || 0,
          lab: subject.lab || 0,
          units: subject.units || 0,
          yearLevel: subject.yearLevel ? parseInt(subject.yearLevel.replace(/\D/g, '')) : undefined,
          semester: subject.period ? parseInt(subject.period.replace(/\D/g, '')) : undefined,
          department: subject.programCode
        }));
        setAvailableSubjects(subjects);
      }
    } catch (error) {
      console.error('Error fetching available subjects:', error);
      setAvailableSubjects([]);
    }
  };

  // Load assignments into calendar slots
  const loadAssignmentsIntoCalendar = (assignments: FacultySubjectAssignment[], facultyId: string) => {
    const loadedSchedules: Schedule[] = [];
    const updatedSlots: CalendarSlot[] = [];
    const assignedSubjects: Subject[] = [];
    const uniqueSubjectIds = new Set<string>();
    
    // Generate empty slots first
    timeSlots.forEach(time => {
      days.forEach(day => {
        updatedSlots.push({ time, day });
      });
    });
    
    // Populate slots with assignments that have schedule information
    assignments.forEach((assignment) => {
      if (assignment.dayOfWeek && assignment.startTime && assignment.endTime) {
        const schedule: Schedule = {
          id: assignment.id.toString(),
          subjectId: assignment.id.toString(), // Using assignment id as subject id
          facultyId: facultyId,
          dayOfWeek: assignment.dayOfWeek,
          startTime: assignment.startTime,
          endTime: assignment.endTime,
          room: assignment.room || 'TBA',
          status: assignment.status === 'PUBLISHED' ? 'Published' : 'Draft'
        };
        
        loadedSchedules.push(schedule);
        
        // Create subject object from assignment data
        const subject: Subject = {
          id: assignment.id.toString(),
          subjectCode: assignment.subjectCode,
          subjectDescription: assignment.subjectDescription,
          lec: 0,
          lab: 0,
          units: assignment.units,
          yearLevel: assignment.yearLevel ? parseInt(assignment.yearLevel) : undefined,
          semester: assignment.semester ? parseInt(assignment.semester) : undefined,
          section: assignment.section || undefined
        };
        
        // Add unique subjects to the assigned subjects list
        if (!uniqueSubjectIds.has(subject.id)) {
          uniqueSubjectIds.add(subject.id);
          assignedSubjects.push(subject);
        }
        
        // Find and update the corresponding slot
        const slotIndex = updatedSlots.findIndex(slot => 
          slot.time === assignment.startTime && slot.day === assignment.dayOfWeek
        );
        
        if (slotIndex !== -1) {
          updatedSlots[slotIndex] = {
            ...updatedSlots[slotIndex],
            schedule,
            subject,
            faculty: selectedFacultyData
          };
        }
      }
    });
    
    setSchedules(loadedSchedules);
    setCalendarSlots(updatedSlots);
    setFacultyAssignedSubjects(assignedSubjects);
  };

  // Add subject to faculty
  const addSubjectToFaculty = async (subject: Subject) => {
    if (!selectedFaculty) return;
    
    try {
      const response = await api.post(`/faculty-subjects/faculty/${selectedFaculty}`, {
        subjectCode: subject.subjectCode,
        subjectDescription: subject.subjectDescription,
        units: subject.units,
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        room: null,
        yearLevel: subject.yearLevel?.toString() || null,
        semester: subject.semester?.toString() || null,
        section: subject.section || null
      });
      
      if (response.data.success) {
        // Refresh faculty subject assignments
        await fetchFacultySubjectAssignments(selectedFaculty);

        setSelectedSubjectToAdd(null);
      }
    } catch (error) {
      console.error('Error adding subject to faculty:', error);
    }
  };

  // Remove subject from faculty
  const removeSubjectFromFaculty = async (assignmentId: number) => {
    try {
      const response = await api.delete(`/faculty-subjects/assignment/${assignmentId}`);
      
      if (response.data.success) {
        // Refresh faculty subject assignments
        if (selectedFaculty) {
          await fetchFacultySubjectAssignments(selectedFaculty);
        }
      }
    } catch (error) {
      console.error('Error removing subject from faculty:', error);
    }
  };

  useEffect(() => {
    fetchTotalUnitsConfig();
    if (programCode) {
      dispatch(fetchCurriculumCoursesWithFilters({ 
        programCode, 
        yearLevel: selectedYearLevel, 
        semester: selectedSemester 
      }));
    }
    // Only fetch faculty data on initial load, not when filters change
    if (reduxFaculty.length === 0) {
      dispatch(fetchFacultyWithSubjects());
    }
  }, [dispatch, programCode, selectedYearLevel, selectedSemester, reduxFaculty.length]);

  // Fetch faculty by department when department filter changes
  useEffect(() => {
    if (selectedDepartment) {
      dispatch(fetchFacultyByDepartment(selectedDepartment));
    } else {
      dispatch(fetchFacultyWithSubjects());
    }
  }, [selectedDepartment, dispatch]);
  
  // Initialize empty calendar slots
  useEffect(() => {
    generateEmptyCalendarSlots();
  }, []);

  const generateEmptyCalendarSlots = () => {
    const slots: CalendarSlot[] = [];
    
    timeSlots.forEach(time => {
      days.forEach(day => {
        slots.push({
          time,
          day,
          schedule: undefined,
          subject: undefined,
          faculty: undefined
        });
      });
    });
    
    setCalendarSlots(slots);
  };

  // Transform curriculum courses from API to match component interface
  const transformedSubjects: Subject[] = curriculums.map(curriculum => ({
    id: curriculum.id?.toString() || '',
    subjectCode: curriculum.subjectCode,
    subjectDescription: curriculum.subjectDescription,
    lec: curriculum.lec || 0,
    lab: curriculum.lab || 0,
    units: curriculum.units || 0,
    yearLevel: curriculum.yearLevel ? parseInt(curriculum.yearLevel.replace(/\D/g, '')) : undefined,
    semester: curriculum.semester ? parseInt(curriculum.semester.replace(/\D/g, '')) : undefined,
    section: curriculum.courseOfferings?.[0]?.sectionName || 'A',
    capacity: 30,
    enrolled: 0,
    prerequisites: curriculum.prerequisites || [],
    schedules: curriculum.schedules || [],
    courseOfferings: curriculum.courseOfferings || [],
    department: programCode
  }));

  // Combine curriculum subjects with faculty assigned subjects when faculty is selected
  const allSubjects = selectedFaculty && facultyAssignedSubjects.length > 0 
    ? (() => {
        const subjectMap = new Map<string, Subject>();
        
        // Add curriculum subjects first
        transformedSubjects.forEach(subject => {
          subjectMap.set(subject.id, subject);
        });
        
        // Add or update with faculty assigned subjects
        facultyAssignedSubjects.forEach(subject => {
          subjectMap.set(subject.id, subject);
        });
        
        return Array.from(subjectMap.values());
      })()
    : transformedSubjects;

  const filteredSubjects = allSubjects.filter(subject => {
    if (selectedYearLevel !== 'all' && subject.yearLevel !== parseInt(selectedYearLevel)) return false;
    if (selectedSemester !== 'all' && subject.semester !== parseInt(selectedSemester)) return false;
    if (searchTerm && !subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !subject.subjectDescription.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const selectedFacultyData = faculty.find(f => f.id.toString() === selectedFaculty);

  const handleDragStart = (e: React.DragEvent, subject: Subject) => {
    setDraggedSubject(subject);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Helper function to check time overlap
  const checkTimeOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const convertToMinutes = (time: string) => {
      const [timePart, period] = time.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === 'AM' && hours === 12) {
        totalMinutes -= 12 * 60;
      }
      
      return totalMinutes;
    };
    
    const start1Min = convertToMinutes(start1);
    const end1Min = convertToMinutes(end1);
    const start2Min = convertToMinutes(start2);
    const end2Min = convertToMinutes(end2);
    
    return (start1Min < end2Min && end1Min > start2Min);
  };

  // Function to check for schedule conflicts
  const checkScheduleConflicts = (newSchedules: { day: string; startTime: string; endTime: string; room: string }[]) => {
    const conflicts: any[] = [];
    
    newSchedules.forEach(newSched => {
      // Check against existing calendar slots
      calendarSlots.forEach(slot => {
        if (slot.schedule && slot.day === newSched.day) {
          const isTimeConflict = checkTimeOverlap(newSched.startTime, newSched.endTime, slot.schedule.startTime, slot.schedule.endTime);
          const isRoomConflict = newSched.room && slot.schedule.room && newSched.room === slot.schedule.room;
          const isFacultyConflict = slot.schedule.facultyId === selectedFacultyData?.id;
          
          if (isTimeConflict && (isRoomConflict || isFacultyConflict)) {
            conflicts.push({
              type: isRoomConflict ? 'room' : 'faculty',
              existingSubject: slot.subject,
              day: newSched.day,
              startTime: newSched.startTime,
              endTime: newSched.endTime,
              room: newSched.room,
              conflictDetails: {
                existingStartTime: slot.schedule.startTime,
                existingEndTime: slot.schedule.endTime,
                existingRoom: slot.schedule.room
              }
            });
          }
        }
      });
    });
    
    return conflicts;
  };

  const handleDrop = async (e: React.DragEvent, slot: CalendarSlot) => {
    e.preventDefault();
    
    if (draggedSubject && selectedFaculty) {
      // Convert 24-hour time to 12-hour AM/PM format
      const convertTo12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      };
      
      // Normalize day names
      const normalizeDayName = (day: string) => {
        const dayMap: { [key: string]: string } = {
          'Mon': 'Monday',
          'Tue': 'Tuesday', 
          'Wed': 'Wednesday',
          'Thu': 'Thursday',
          'Fri': 'Friday',
          'Sat': 'Saturday',
          'Sun': 'Sunday'
        };
        return dayMap[day] || day;
      };
      
      // Prepare schedules to check for conflicts
      const schedulesToCheck: { day: string; startTime: string; endTime: string; room: string }[] = [];
      
      // Automatically create schedule based on subject's existing schedules
      if (draggedSubject.schedules && draggedSubject.schedules.length > 0) {
        draggedSubject.schedules.forEach(subjectSchedule => {
          const scheduleStartTime = convertTo12Hour(subjectSchedule.timeStarts);
          const scheduleEndTime = convertTo12Hour(subjectSchedule.timeEnds);
          const normalizedDay = normalizeDayName(subjectSchedule.day);
          
          schedulesToCheck.push({
            day: normalizedDay,
            startTime: scheduleStartTime,
            endTime: scheduleEndTime,
            room: subjectSchedule.room
          });
        });
      } else {
        // If no existing schedules, create a default schedule for the dropped slot
        schedulesToCheck.push({
          day: slot.day,
          startTime: slot.time,
          endTime: slot.time, // This should be calculated based on subject duration
          room: 'TBA'
        });
      }
      
      // Check for conflicts
      const conflicts = checkScheduleConflicts(schedulesToCheck);
      
      if (conflicts.length > 0) {
        // Show conflict modal
        setConflictDetails(conflicts);
        setConflictModalOpen(true);
        setDraggedSubject(null);
        return;
      }
      
      // No conflicts, proceed with creating schedules
      if (draggedSubject.schedules && draggedSubject.schedules.length > 0) {
        draggedSubject.schedules.forEach(subjectSchedule => {
          const scheduleStartTime = convertTo12Hour(subjectSchedule.timeStarts);
          const scheduleEndTime = convertTo12Hour(subjectSchedule.timeEnds);
          const normalizedDay = normalizeDayName(subjectSchedule.day);
          
          // Find the corresponding slot for this schedule
          const targetSlot = calendarSlots.find(s => 
            s.time === scheduleStartTime && s.day === normalizedDay
          );
          
          if (targetSlot && !targetSlot.schedule) {
            const newSchedule: Schedule = {
              id: Date.now().toString() + Math.random().toString(),
              subjectId: draggedSubject.id,
              facultyId: selectedFacultyData!.id,
              dayOfWeek: normalizedDay,
              startTime: scheduleStartTime,
              endTime: scheduleEndTime,
              room: subjectSchedule.room,
              status: 'Draft'
            };
            
            setSchedules(prev => [...prev, newSchedule]);
            
            // Update calendar slots
            setCalendarSlots(prev => prev.map(s => {
              if (s.time === scheduleStartTime && s.day === normalizedDay) {
                return {
                  ...s,
                  schedule: newSchedule,
                  subject: draggedSubject,
                  faculty: selectedFacultyData
                };
              }
              return s;
            }));
          }
        });
      } else {
        // If no existing schedules, create a default schedule for the dropped slot
        const newSchedule: Schedule = {
          id: Date.now().toString() + Math.random().toString(),
          subjectId: draggedSubject.id,
          facultyId: selectedFacultyData!.id.toString(),
          dayOfWeek: slot.day,
          startTime: slot.time,
          endTime: slot.time, // This should be calculated based on subject duration
          room: 'TBA',
          status: 'Draft'
        };
        
        setSchedules(prev => [...prev, newSchedule]);
        
        // Update calendar slots
        setCalendarSlots(prev => prev.map(s => {
          if (s.time === slot.time && s.day === slot.day) {
            return {
              ...s,
              schedule: newSchedule,
              subject: draggedSubject,
              faculty: selectedFacultyData
            };
          }
          return s;
        }));
      }
      
      // Automatically add the subject to faculty assignments
      await addSubjectToFaculty(draggedSubject);
      
      // Update faculty load based on actual schedules in calendar
      if (selectedFacultyData) {
        // Recalculate load for all faculty to ensure accuracy
        const updatedFaculty = faculty.map(f => ({
          ...f,
          currentLoad: calculateFacultyLoad(f.id)
        }));
        
        // Update local faculty state for immediate UI update
        setLocalFaculty(updatedFaculty);
      }
    }
    
    setDraggedSubject(null);
  };



  const loadExistingAssignments = async (facultyId: string) => {
    setIsLoadingAssignments(true);
    
    try {
      const response = await api.get(`/faculty-assignments/faculty/${facultyId}`);
      
      if (response.status === 200 && response.data.assignments) {
        const existingAssignments = response.data.assignments;
        
        // Clear current calendar slots
        generateEmptyCalendarSlots();
        
        // Create schedules from existing assignments
        const loadedSchedules: Schedule[] = [];
        const updatedSlots: CalendarSlot[] = [];
        const assignedSubjects: Subject[] = [];
        const uniqueSubjectIds = new Set<string>();
        
        // Generate empty slots first
        const timeSlots = [
          '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
          '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
        ];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        days.forEach(day => {
          timeSlots.forEach(time => {
            updatedSlots.push({ time, day });
          });
        });
        
        // Populate slots with existing assignments
        existingAssignments.forEach((assignment: any) => {
          const schedule: Schedule = {
            id: assignment.id.toString(),
            subjectId: assignment.subjectId.toString(),
            facultyId: assignment.facultyId.toString(),
            dayOfWeek: assignment.dayOfWeek,
            startTime: assignment.startTime,
            endTime: assignment.endTime,
            room: assignment.room,
            status: assignment.status === 'PUBLISHED' ? 'Published' : 'Draft'
          };
          
          loadedSchedules.push(schedule);
          
          // Create subject object from assignment data
          const subject: Subject = {
            id: assignment.subjectId.toString(),
            subjectCode: assignment.subjectCode,
            subjectDescription: assignment.subjectDescription,
            lec: 0, // These might need to be fetched separately
            lab: 0,
            units: assignment.units
          };
          
          // Add unique subjects to the assigned subjects list
          if (!uniqueSubjectIds.has(subject.id)) {
            uniqueSubjectIds.add(subject.id);
            assignedSubjects.push(subject);
          }
          
          // Find and update the corresponding slot
          const slotIndex = updatedSlots.findIndex(slot => 
            slot.time === assignment.startTime && slot.day === assignment.dayOfWeek
          );
          
          if (slotIndex !== -1) {
            updatedSlots[slotIndex] = {
              ...updatedSlots[slotIndex],
              schedule,
              subject,
              faculty: selectedFacultyData
            };
          }
        });
        
        setSchedules(loadedSchedules);
        setCalendarSlots(updatedSlots);
        setFacultyAssignedSubjects(assignedSubjects);
      }
    } catch (error) {
      console.error('Error loading existing assignments:', error);
      // Don't show alert for this as it might be normal to have no assignments
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handlePublishSchedule = async () => {
    if (!selectedFacultyData) {
      alert('Please select a faculty member first.');
      return;
    }

    const assignedSchedules = calendarSlots.filter(slot => slot.schedule && slot.subject);
    
    if (assignedSchedules.length === 0) {
      alert('No subjects assigned to publish.');
      return;
    }

    setIsPublishing(true);
    
    try {
      // Prepare assignments data
      const assignments = assignedSchedules.map(slot => ({
        facultyId: parseInt(selectedFacultyData.id),
        subjectId: parseInt(slot.subject!.id),
        subjectCode: slot.subject!.subjectCode,
        subjectDescription: slot.subject!.subjectDescription,
        units: slot.subject!.units,
        dayOfWeek: slot.schedule!.dayOfWeek,
        startTime: slot.schedule!.startTime,
        endTime: slot.schedule!.endTime,
        room: slot.schedule!.room,
        status: 'PUBLISHED'
      }));

      // Save to database
      const response = await api.post('/faculty-assignments', {
        assignments
      });

      if (response.status === 201) {
        alert('Schedule published successfully!');
        
        // Update schedules status to published
        setSchedules(prev => prev.map(schedule => ({
          ...schedule,
          status: 'Published' as const
        })));
        
        // Update calendar slots
        setCalendarSlots(prev => prev.map(slot => {
          if (slot.schedule) {
            return {
              ...slot,
              schedule: {
                ...slot.schedule,
                status: 'Published' as const
              }
            };
          }
          return slot;
        }));
      }
    } catch (error) {
      console.error('Error publishing schedule:', error);
      alert('Failed to publish schedule. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRemoveSchedule = (slot: CalendarSlot) => {
    if (slot.schedule) {
      // Remove from schedules
      setSchedules(schedules.filter(s => s.id !== slot.schedule!.id));
      
      // Update calendar slots
      const updatedSlots = calendarSlots.map(s => 
        s.time === slot.time && s.day === slot.day 
          ? { ...s, schedule: undefined, subject: undefined, faculty: undefined }
          : s
      );
      setCalendarSlots(updatedSlots);
      
      // Update faculty load based on actual schedules in calendar
      if (slot.faculty) {
        // Recalculate load for all faculty to ensure accuracy
        const updatedFaculty = faculty.map(f => ({
          ...f,
          currentLoad: calculateFacultyLoad(f.id)
        }));
        
        // Update local faculty state for immediate UI update
        setLocalFaculty(updatedFaculty);
      }
    }
  };

  const getLoadPercentage = (currentLoad: number, maxLoad: number) => {
    // Handle undefined/null values and prevent division by zero
    const safeCurrentLoad = currentLoad || 0;
    const safeMaxLoad = maxLoad || 1;
    return (safeCurrentLoad / safeMaxLoad) * 100;
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty/VL Loading</h1>
          <p className="text-muted-foreground">
            Assign subjects to faculty members using drag and drop
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            disabled={curriculumLoading || facultyLoading || isPublishing || !selectedFacultyData}
            onClick={handlePublishSchedule}
          >
            <Save className="h-4 w-4 mr-2" />
            {isPublishing ? 'Publishing...' : 'Publish Schedule'}
          </Button>
        </div>
      </div>

      {(curriculumLoading || facultyLoading) && (
        <Alert>
          <AlertDescription>
            Loading data... Please wait.
          </AlertDescription>
        </Alert>
      )}

      {/* Subject Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Subject Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Subjects</Label>
              <Input
                type="text"
                placeholder="Search by subject code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Year Level</Label>
              <select 
                value={selectedYearLevel} 
                onChange={(e) => setSelectedYearLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All year levels</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Semester</Label>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All semesters</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Faculty Assignment
          </CardTitle>
          <CardDescription>
            Select a faculty member to assign subjects to their schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label>Faculty Member</Label>
              <select 
                value={selectedFaculty} 
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select faculty member to assign subjects</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id.toString()}>
                    {f.firstname} {f.lastname} - {f.department} ({f.currentLoad || 0}/{totalUnitsConfig} units)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Assignments Indicator */}
      {isLoadingAssignments && (
        <Alert>
          <AlertDescription>
            Loading existing assignments for selected faculty...
          </AlertDescription>
        </Alert>
      )}

      {/* Faculty Load Information */}
      {selectedFacultyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Faculty Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedFacultyData.firstname} {selectedFacultyData.middleInitial} {selectedFacultyData.lastname}</h3>
                  <p className="text-muted-foreground">{selectedFacultyData.department}</p>
                  <p className="text-sm text-muted-foreground">{selectedFacultyData.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedFacultyData.designation}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacultyData.subjects?.map((subject, index) => (
                      <Badge key={index} variant="secondary">{subject.subjectCode}</Badge>
                    )) || <p className="text-sm text-muted-foreground">No subjects assigned</p>}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Teaching Load</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedFacultyData.currentLoad || 0} / {totalUnitsConfig} units
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        getLoadColor(getLoadPercentage(selectedFacultyData.currentLoad, totalUnitsConfig))
                      }`}
                      style={{ 
                        width: `${Math.min(getLoadPercentage(selectedFacultyData.currentLoad, totalUnitsConfig), 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getLoadPercentage(selectedFacultyData.currentLoad, totalUnitsConfig).toFixed(1)}% of maximum load
                  </p>
                </div>
                {(selectedFacultyData.currentLoad || 0) >= totalUnitsConfig * 0.9 && (
                  <Alert>
                    <AlertDescription>
                      Warning: Faculty member is approaching maximum teaching load.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Subjects */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50 border-b border-slate-200 text-slate-700 py-3">
              <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Available Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              {!selectedFaculty ? (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Please select a faculty member first to view available subjects for assignment.</p>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No subjects found matching your criteria
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredSubjects.map(subject => (
                    <div
                      key={subject.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, subject)}
                      className="p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow bg-white hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">{subject.subjectCode}</h4>
                        <Badge variant="outline" className="text-xs">
                          {subject.units} {subject.units === 1 ? 'unit' : 'units'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{subject.subjectDescription}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Section {subject.section}</span>
                        <span>{subject.yearLevel}{subject.yearLevel === 1 ? 'st' : subject.yearLevel === 2 ? 'nd' : subject.yearLevel === 3 ? 'rd' : 'th'} Year, {subject.semester}{subject.semester === 1 ? 'st' : 'nd'} Sem</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Drag and Drop Instructions */}
          {selectedFaculty && (
            <Alert className="mt-4">
              <Move className="h-4 w-4" />
              <AlertDescription>
                Drag subjects from the list above to the schedule grid to assign them to the selected faculty member.
              </AlertDescription>
            </Alert>
          )}
        </div>



        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-50 border-b border-slate-200 text-slate-700 py-3">
               <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                 <Calendar className="h-5 w-5" />
                 Weekly Schedule
               </CardTitle>
             </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="flex min-w-[800px]">
                  {/* Time Column */}
                  <div className="flex flex-col min-w-[100px] border-r border-gray-300">
                    {/* Time Header */}
                    <div className="h-[44px] font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b border-gray-300 text-sm flex items-center justify-center">
                      TIME
                    </div>
                    {/* Time Slots */}
                    {timeSlots.map(timeSlot => (
                      <div key={timeSlot} className="h-[60px] text-xs text-center bg-gradient-to-b from-blue-600 to-purple-600 text-white border-b border-gray-300 flex items-center justify-center font-semibold">
                        {timeSlot}
                      </div>
                    ))}
                  </div>
                  
                  {/* Days Grid */}
                  <div className="flex-1">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-gray-300">
                      {days.map(day => (
                        <div key={day} className="h-[44px] font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white border-r border-blue-700 last:border-r-0 text-sm flex items-center justify-center">
                          {day.substring(0, 3).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    
                    {/* Schedule Grid */}
                    <div className="relative">
                      {/* Background grid for time slots */}
                      {timeSlots.map(timeSlot => (
                        <div key={timeSlot} className="grid grid-cols-7">
                          {days.map(day => {
                            const slot = calendarSlots.find(s => s.time === timeSlot && s.day === day);
                            const hasSchedule = slot?.schedule;
                            
                            return (
                              <div 
                                key={`${day}-${timeSlot}`} 
                                className={`h-[60px] text-xs border-r border-b border-gray-200 transition-colors duration-200 ${
                                  selectedFaculty && !hasSchedule 
                                    ? 'cursor-pointer hover:bg-blue-50' 
                                    : 'hover:bg-gray-50'
                                }`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, slot!)}
                              />
                            );
                          })}
                        </div>
                      ))}
                      
                      {/* Schedule blocks positioned absolutely */}
                      {calendarSlots.map((slot, index) => {
                        if (!slot.schedule || !slot.subject) return null;
                        
                        // Convert time to minutes for calculation
                        const convertTo24Hour = (time: string) => {
                          const [timePart, period] = time.split(' ');
                          const [hour, minute] = timePart.split(':').map(Number);
                          let hour24 = hour;
                          if (period === 'PM' && hour !== 12) hour24 += 12;
                          if (period === 'AM' && hour === 12) hour24 = 0;
                          return hour24 * 60 + minute;
                        };
                        
                        const startTimeMinutes = convertTo24Hour(slot.schedule.startTime);
                        const endTimeMinutes = convertTo24Hour(slot.schedule.endTime);
                        
                        // Find day column index
                        const dayIndex = days.indexOf(slot.day);
                        
                        // Only show blocks within 7 AM to 8 PM range
                        const startHour = Math.floor(startTimeMinutes / 60);
                        if (dayIndex < 0 || startHour < 7 || startHour > 20) return null;
                        
                        // Calculate precise positioning
                        const cellHeight = 60; // Height of each time slot cell
                        const gridStartTime = 7 * 60; // 7 AM in minutes
                        const pixelsPerMinute = cellHeight / 60;
                        
                        const topPosition = (startTimeMinutes - gridStartTime) * pixelsPerMinute;
                        const durationMinutes = endTimeMinutes - startTimeMinutes;
                        const blockHeight = durationMinutes * pixelsPerMinute;
                        
                        return (
                          <div
                            key={`${slot.schedule.id}-${slot.day}-${index}`}
                            className="absolute bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-700 rounded-md shadow-lg z-10 border border-blue-200"
                            style={{
                              top: `${topPosition}px`,
                              left: `${(dayIndex * (100 / 7))}%`,
                              width: `${(100 / 7)}%`,
                              height: `${blockHeight}px`
                            }}
                          >
                            <div className={`p-2 h-full flex flex-col justify-center relative ${
              blockHeight < 80 ? 'space-y-0.5' : 'space-y-1'
            }`}>
              <div className={`font-bold text-center ${
                blockHeight < 80 ? 'text-[10px] leading-tight' : 'text-xs'
              }`}>{slot.subject.subjectCode}</div>
              <div className={`opacity-90 text-center font-medium truncate ${
                blockHeight < 80 ? 'text-[9px] leading-tight' : 'text-xs'
              }`}>
                {slot.subject.subjectDescription}
              </div>
              <div className={`opacity-75 text-center font-medium ${
                blockHeight < 80 ? 'text-[9px] leading-tight' : 'text-xs'
              }`}>
                {slot.schedule.startTime} - {slot.schedule.endTime}
              </div>
              {slot.schedule.room && (
                <div className={`opacity-75 text-center font-medium ${
                  blockHeight < 80 ? 'text-[9px] leading-tight' : 'text-xs'
                }`}>
                  {slot.schedule.room}
                </div>
              )}
                              <button
                                onClick={() => handleRemoveSchedule(slot)}
                                className="absolute top-1 right-1 text-white hover:text-slate-200 text-sm font-bold bg-slate-400 hover:bg-slate-500 rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conflict Modal */}
      <Dialog open={conflictModalOpen} onOpenChange={setConflictModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Schedule Conflict Detected
            </DialogTitle>
            <DialogDescription>
              The following conflicts prevent this assignment:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {conflictDetails.map((conflict, index) => (
              <Alert key={index} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm">
                  <div className="font-medium text-red-800">
                    {conflict.type === 'room' ? 'Room Conflict' : 'Faculty Conflict'}
                  </div>
                  <div className="text-red-700 mt-1">
                    Conflicts with <strong>{conflict.existingSubject?.subjectCode}</strong> on {conflict.day}
                  </div>
                  <div className="text-red-600 text-xs mt-1">
                    Time: {conflict.conflictDetails.existingStartTime} - {conflict.conflictDetails.existingEndTime}
                    {conflict.type === 'room' && (
                      <span> in {conflict.conflictDetails.existingRoom}</span>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setConflictModalOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subject Modal */}
      <Dialog open={addSubjectModalOpen} onOpenChange={setAddSubjectModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Subject to Faculty
            </DialogTitle>
            <DialogDescription>
              Select a subject to assign to {selectedFacultyData?.firstname} {selectedFacultyData?.lastname}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {availableSubjects.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No available subjects found.</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {availableSubjects.map(subject => (
                    <div
                      key={subject.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSubjectToAdd?.id === subject.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSubjectToAdd(subject)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">{subject.subjectCode}</h4>
                        <Badge variant="outline" className="text-xs">
                          {subject.units} {subject.units === 1 ? 'unit' : 'units'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{subject.subjectDescription}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Section {subject.section}</span>
                        {subject.yearLevel && subject.semester && (
                          <span>
                            {subject.yearLevel}{subject.yearLevel === 1 ? 'st' : subject.yearLevel === 2 ? 'nd' : subject.yearLevel === 3 ? 'rd' : 'th'} Year, 
                            {subject.semester}{subject.semester === 1 ? 'st' : 'nd'} Sem
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddSubjectModalOpen(false);
                setSelectedSubjectToAdd(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedSubjectToAdd && addSubjectToFaculty(selectedSubjectToAdd)}
              disabled={!selectedSubjectToAdd}
            >
              Add Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default FacultyVLLoading;