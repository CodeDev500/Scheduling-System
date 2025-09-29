import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Save, CheckCircle, Send, ArrowLeft, Plus, Edit, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { programDescription } from '../../../utils/getProgramDescription';
import { fetchCurriculumByProgramAndYear } from '../../../services/curriculumSlice';
import api from '../../../api/axios';

interface Schedule {
  id: number;
  day: string;
  timeStarts: string;
  timeEnds: string;
  room: string;
  isLoaded: number;
  offeringId: number;
  sectionName: string;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

interface Subject {
  id: number;
  subjectCode: string;
  subjectDescription: string;
  lec: number;
  lab: number;
  units: number;
  hours: number;
  period: string;
  yearLevel: string;
  programCode: string;
  programName: string;
  schedules: Schedule[];
  courseOfferings: {
    id: number;
    courseType: string;
    description: string;
    sectionName: string;
    yearLevel: string;
  }[];
 department: string;
}

interface ScheduleBlock {
  subject: Subject;
  day: string;
  startHour: number;
  endHour: number;
}

const ViewProspectusScheduling: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.user);
  const { academicPrograms } = useAppSelector((state) => state.academicProgram);
  const { curriculums, isLoading } = useAppSelector((state) => state.curriculum);
  
  // Get parameters from URL
  const programCode = searchParams.get('programCode') || userData?.department || '';
  const yearLevel = searchParams.get('yearLevel') || '1st Year';
  const semester = searchParams.get('semester') || '1st Sem';
  
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024-2025');
  const [selectedYearLevel, setSelectedYearLevel] = useState<number>(parseInt(yearLevel.match(/\d+/)?.[0] || '1'));
  const [selectedSemester, setSelectedSemester] = useState<string>(semester);
  
  // State for subjects with schedules
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  

  
  // Form state for each subject
  const [subjectFormData, setSubjectFormData] = useState<{[key: number]: {
    startTime?: string;
    endTime?: string;
    room?: string;
    days: string[];
  }}>({});
  
  // Editable subject details state
  const [editableSubjects, setEditableSubjects] = useState<{[key: number]: {
    subjectCode: string;
    subjectDescription: string;
    units: number;
  }}>({});
  
  // Validation state for each subject
  const [validationState, setValidationState] = useState<{[key: number]: {
    isValidated: boolean;
    hasConflicts: boolean;
    conflicts: any[];
  }}>({});
  
  // Conflict modal state
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    conflicts: any[];
    subjectId?: number;
  }>({ isOpen: false, conflicts: [] });
  
  // Helper function to convert day names to abbreviations
  const getDayAbbreviation = (day: string): string => {
    const dayMap: {[key: string]: string} = {
      'Monday': 'Mon',
      'Tuesday': 'Tue', 
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return dayMap[day] || day;
  };

  // Initialize form data and editable subjects
  useEffect(() => {
    const initialFormData: {[key: number]: {startTime?: string; endTime?: string; days: string[]; room?: string}} = {};
    const initialEditableSubjects: {[key: number]: {subjectCode: string; subjectDescription: string; units: number}} = {};
    
    subjects.forEach(subject => {
      if (!subjectFormData[subject.id]) {
        // Pre-populate with existing schedule data if available
        const existingSchedule = subject.schedules[0]; // Use first schedule for common data
        const scheduledDays = subject.schedules.map(s => normalizeDayName(s.day)); // Collect all scheduled days and normalize them
        
        initialFormData[subject.id] = {
          startTime: existingSchedule?.timeStarts || '',
          endTime: existingSchedule?.timeEnds || '',
          room: existingSchedule?.room || '',
          days: scheduledDays
        };
      }
      if (!editableSubjects[subject.id]) {
        initialEditableSubjects[subject.id] = {
          subjectCode: subject.subjectCode,
          subjectDescription: subject.subjectDescription,
          units: subject.units
        };
      }
    });
    
    if (Object.keys(initialFormData).length > 0) {
      setSubjectFormData(prev => ({ ...prev, ...initialFormData }));
    }
    if (Object.keys(initialEditableSubjects).length > 0) {
      setEditableSubjects(prev => ({ ...prev, ...initialEditableSubjects }));
    }
  }, [subjects]);
  
  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Fetch subjects with schedules and instructors
  const fetchSubjectsWithSchedules = async () => {
    if (!programCode || !yearLevel) return;
    
    setLoading(true);
    try {
      const response = await api.get(
        `/schedules/subjects/${programCode}/${encodeURIComponent(yearLevel)}/${semester}`
      );
      
      console.log('Response data:', response.data);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects with schedules:', error);
    } finally {
      setLoading(false);
    }
  };
  

  
  useEffect(() => {
    fetchRooms();
    fetchSubjectsWithSchedules();
  }, [programCode, yearLevel, semester]);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);



  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 7; // 7 AM to 7 PM (7, 8, 9, ..., 19)
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }); // 7:00 AM to 7:00 PM in one-hour increments
  
  // Add 8:00 PM as the final slot
  timeSlots.push('8:00 PM');

  console.log('Subjects with schedules:', subjects);
  
  // Use all subjects since API already filters by semester
  const filteredSubjects = subjects;
  
  // Update form data for a subject
  const updateSubjectFormData = (subjectId: number, field: string, value: string | string[]) => {
    setSubjectFormData(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
    
    // Reset validation state when form data changes
    setValidationState(prev => ({
      ...prev,
      [subjectId]: {
        isValidated: false,
        hasConflicts: false,
        conflicts: []
      }
    }));
  };
  
  // Update editable subject data
  const updateEditableSubject = (subjectId: number, field: string, value: string | number) => {
    setEditableSubjects(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };
  

  
  // Create or update a schedule
  const createOrUpdateSchedule = async (scheduleData: {
    scheduleId?: number;
    curriculumCourseId: number;
    offeringId?: number;
    day: string;
    timeStarts: string;
    timeEnds: string;
    room?: string;
  }) => {
    setSaving(true);
    try {
      let response;
      if (scheduleData.scheduleId) {
        response = await api.put(`/schedules/${scheduleData.scheduleId}`, scheduleData);
      } else {
        response = await api.post('/schedules', scheduleData);
      }
      
      // Refresh the subjects data
      await fetchSubjectsWithSchedules();
      alert(scheduleData.scheduleId ? 'Schedule updated successfully!' : 'Schedule created successfully!');
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save schedule';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle schedule form submission
  const handleScheduleSubmit = async (subjectId: number, scheduleData: {
    scheduleId?: number;
    day: string;
    timeStarts: string;
    timeEnds: string;
    room?: string;
  }) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    const offeringId = subject.courseOfferings[0]?.id; // Use first offering or create one
    
    await createOrUpdateSchedule({
      ...scheduleData,
      curriculumCourseId: subjectId,
      offeringId,
    });
  };



  // Handle saving individual schedule
  const handleSaveSchedule = async (subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    const formData = subjectFormData[subjectId];
    if (!formData || !formData.startTime || !formData.endTime || !formData.days || formData.days.length === 0) {
      alert('Please fill in all schedule fields before saving.');
      return;
    }
    
    setSaving(true);
    try {
      const selectedDays = formData.days;
      
      // Delete schedules for days that are no longer selected
      for (const schedule of subject.schedules) {
        if (!selectedDays.includes(normalizeDayName(schedule.day))) {
          await api.delete(`/schedules/${schedule.id}`);
        }
      }
      
      // For each selected day, create/update a schedule
      for (const day of selectedDays) {
        const existingSchedule = subject.schedules.find(s => normalizeDayName(s.day) === day);
        
        const scheduleData = {
          curriculumCourseId: subjectId,
          offeringId: subject.courseOfferings[0]?.id,
          day: getDayAbbreviation(day), // Save abbreviated day name
          timeStarts: formData.startTime,
          timeEnds: formData.endTime,
          room: formData.room || ''
        };
        
        if (existingSchedule) {
          await api.put(`/schedules/${existingSchedule.id}`, scheduleData);
        } else {
          await api.post('/schedules', scheduleData);
        }
      }
      
      // Refresh the subjects data
      await fetchSubjectsWithSchedules();
      alert('Schedule saved successfully!');
      
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save schedule';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to convert 24-hour time to 12-hour AM/PM format
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to normalize day names
  const normalizeDayName = (day: string) => {
    const dayMap: { [key: string]: string } = {
      'Time': 'Time',
      'Mon': 'Monday',
      'Tue': 'Tuesday', 
      'Tuesday': 'Tuesday',
      'Wed': 'Wednesday',
      'Wednesday': 'Wednesday', 
      'Thu': 'Thursday',
      'Thursday': 'Thursday',
      'Fri': 'Friday',
      'Friday': 'Friday',
      'Sat': 'Saturday',
      'Saturday': 'Saturday',
      'Sun': 'Sunday',
      'Sunday': 'Sunday'
    };
    return dayMap[day] || day;
  };

  // Function to check for schedule conflicts
  const checkScheduleConflicts = (subjectId: number) => {
    const formData = subjectFormData[subjectId];
    if (!formData || !formData.startTime || !formData.endTime || !formData.days || formData.days.length === 0) {
      return [];
    }

    const conflicts: any[] = [];
    const currentSubject = subjects.find(s => s.id === subjectId);
    
    // Check against all other subjects
    subjects.forEach(otherSubject => {
      if (otherSubject.id === subjectId) return;
      
      const otherFormData = subjectFormData[otherSubject.id];
      if (!otherFormData || !otherFormData.startTime || !otherFormData.endTime || !otherFormData.days) {
        // Check against existing schedules if no form data
        otherSubject.schedules.forEach(schedule => {
          const scheduleDays = [normalizeDayName(schedule.day)];
          const hasCommonDay = formData.days.some(day => scheduleDays.includes(day));
          
          if (hasCommonDay) {
            const isTimeConflict = checkTimeOverlap(formData.startTime!, formData.endTime!, schedule.timeStarts, schedule.timeEnds);
            const isRoomConflict = formData.room && schedule.room && formData.room === schedule.room;
            
            if (isTimeConflict && isRoomConflict) {
              conflicts.push({
                type: 'time_room',
                subject: otherSubject,
                days: scheduleDays,
                startTime: convertTo12Hour(schedule.timeStarts),
                endTime: convertTo12Hour(schedule.timeEnds),
                room: schedule.room
              });
            } else if (isTimeConflict) {
              conflicts.push({
                type: 'time',
                subject: otherSubject,
                days: scheduleDays,
                startTime: convertTo12Hour(schedule.timeStarts),
                endTime: convertTo12Hour(schedule.timeEnds)
              });
            }
          }
        });
        return;
      }
      
      // Check against other form data
      const hasCommonDay = formData.days.some(day => otherFormData.days!.includes(day));
      
      if (hasCommonDay) {
        const isTimeConflict = checkTimeOverlap(formData.startTime!, formData.endTime!, otherFormData.startTime!, otherFormData.endTime!);
        const isRoomConflict = formData.room && otherFormData.room && formData.room === otherFormData.room;
        
        if (isTimeConflict && isRoomConflict) {
          conflicts.push({
            type: 'time_room',
            subject: otherSubject,
            days: otherFormData.days,
            startTime: otherFormData.startTime,
            endTime: otherFormData.endTime,
            room: otherFormData.room
          });
        } else if (isTimeConflict) {
          conflicts.push({
            type: 'time',
            subject: otherSubject,
            days: otherFormData.days,
            startTime: otherFormData.startTime,
            endTime: otherFormData.endTime
          });
        }
      }
    });
    
    return conflicts;
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

  // Handle validation
  const handleValidateSchedule = (subjectId: number) => {
    const conflicts = checkScheduleConflicts(subjectId);
    
    setValidationState(prev => ({
      ...prev,
      [subjectId]: {
        isValidated: true,
        hasConflicts: conflicts.length > 0,
        conflicts
      }
    }));
    
    if (conflicts.length > 0) {
      setConflictModal({
        isOpen: true,
        conflicts,
        subjectId
      });
    } else {
      alert('No conflicts found! Schedule is valid.');
    }
  };

  // Helper function to get abbreviated day names
  const getAbbreviatedDays = (daysList: string[]) => {
    const dayAbbreviations: { [key: string]: string } = {
      'Monday': 'M',
      'Tuesday': 'T', 
      'Wednesday': 'W',
      'Thursday': 'TH',
      'Friday': 'F',
      'Saturday': 'S',
      'Sunday': 'SU'
    };
    return daysList.map(day => dayAbbreviations[day] || day.substring(0, 2)).join('');
  };

  // Generate schedule blocks from filtered subjects with schedules
  const generateScheduleBlocks = () => {
    const blocks: any[] = [];
    
    filteredSubjects.forEach(subject => {
      // Group schedules by time slot (same start and end time)
      const timeGroups: { [key: string]: any[] } = {};
      
      subject.schedules.forEach(schedule => {
        const timeKey = `${schedule.timeStarts}-${schedule.timeEnds}`;
        if (!timeGroups[timeKey]) {
          timeGroups[timeKey] = [];
        }
        timeGroups[timeKey].push(schedule);
      });
      
      // Create one block per time group that spans across days
      Object.values(timeGroups).forEach(scheduleGroup => {
        const firstSchedule = scheduleGroup[0];
        const days = scheduleGroup.map(s => normalizeDayName(s.day)).sort();
        const abbreviatedDays = getAbbreviatedDays(days);
        
        // Create a single block for each day in the group (individual rendering)
        days.forEach(day => {
          const schedule = scheduleGroup.find(s => normalizeDayName(s.day) === day);
          if (schedule) {
            blocks.push({
              subject,
              schedule,
              day: day,
              startTime: convertTo12Hour(schedule.timeStarts),
              endTime: convertTo12Hour(schedule.timeEnds),
              room: schedule.room,
              abbreviatedDays: abbreviatedDays,
              groupedDays: days
            });
          }
        });
      });
    });
    
    // console.log('Generated schedule blocks:', blocks);
    return blocks;
  };

  const scheduleBlocks = generateScheduleBlocks();

  // Use real schedule data from server
  const displayScheduleBlocks = scheduleBlocks;



  return (
    <div className=" space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/schedule-management/view-prospectus/${programCode}/${encodeURIComponent(yearLevel)}`)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {selectedSemester} Schedule
          </h1>
          <p className="text-lg text-gray-600">{programDescription(programCode, academicPrograms ?? [])} - {yearLevel}</p>
        </div>
      </div>



      {/* Current Selection Info */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Academic Year</div>
              <div className="text-lg font-bold">{selectedAcademicYear}</div>
            </div>
            <div className="h-8 w-px bg-white opacity-30"></div>
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Year Level</div>
              <div className="text-lg font-bold">{yearLevel}</div>
            </div>
            <div className="h-8 w-px bg-white opacity-30"></div>
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Semester</div>
              <div className="text-lg font-bold">{selectedSemester}</div>
            </div>
            <div className="h-8 w-px bg-white opacity-30"></div>
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Total Subjects</div>
              <div className="text-lg font-bold">{filteredSubjects.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3">
          <CardTitle className="text-lg font-bold text-center">
            Subject Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-bold pl-4 text-gray-800 text-sm py-2">Subject</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 text-sm py-2">Units</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 text-sm py-2">Days</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 text-sm py-2">Start Time</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 text-sm py-2">End Time</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 text-sm py-2">Room</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 text-sm py-2 pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span className="text-gray-600 text-sm">Loading subjects...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        <p className="text-lg font-semibold">No subjects found</p>
                        <p className="text-xs mt-1">No curriculum subjects available for {programDescription(programCode, academicPrograms ?? [])} - {yearLevel}, {selectedSemester}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubjects.map((subject, index) => {
                  const editableData = editableSubjects[subject.id] || {
                    subjectCode: subject.subjectCode,
                    subjectDescription: subject.subjectDescription,
                    units: subject.units
                  };
                  
                  return (
                  <TableRow key={subject.id} data-subject-id={subject.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
                    <TableCell className="py-2 pl-4">
                      <div className="flex items-center space-x-2">
                        <Input 
                          value={editableData.subjectCode}
                          onChange={(e) => updateEditableSubject(subject.id, 'subjectCode', e.target.value)}
                          className="w-16 text-xs font-medium text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 h-8" 
                          placeholder="Code"
                        />
                        <Input 
                          value={editableData.subjectDescription}
                          onChange={(e) => updateEditableSubject(subject.id, 'subjectDescription', e.target.value)}
                          className="flex-1 text-xs text-gray-600 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 h-8" 
                          placeholder="Subject Description"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input 
                        type="number"
                        value={editableData.units}
                        onChange={(e) => updateEditableSubject(subject.id, 'units', parseInt(e.target.value) || 0)}
                        className="w-12 mx-auto text-center text-xs font-bold bg-purple-100 text-purple-800 border-purple-200 focus:bg-white focus:border-purple-400 h-8" 
                        placeholder="Units"
                      />
                    </TableCell>


                    <TableCell className="text-center">
                      <Select>
                        <SelectTrigger className="w-24 mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 focus:border-purple-400 h-8 text-xs">
                          <SelectValue placeholder="Days">
                            {subjectFormData[subject.id]?.days?.length > 0 && (
                              <span className="text-xs">
                                {subjectFormData[subject.id].days.map(day => getDayAbbreviation(day)).join(', ')}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-56 bg-white">
                          <div className="p-2 space-y-1">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'].map((day) => (
                              <label key={day} className="flex items-center space-x-1 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 p-1 rounded transition-all duration-200">
                                <Checkbox 
                                  className="w-3 h-3" 
                                  checked={subjectFormData[subject.id]?.days?.includes(day) || false}
                                  onCheckedChange={(checked) => {
                                    const currentDays = subjectFormData[subject.id]?.days || [];
                                    const newDays = checked 
                                      ? [...currentDays, day]
                                      : currentDays.filter(d => d !== day);
                                    updateSubjectFormData(subject.id, 'days', newDays);
                                  }}
                                />
                                <span className="text-xs font-medium">{getDayAbbreviation(day)}</span>
                              </label>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input 
                        type="time" 
                        value={subjectFormData[subject.id]?.startTime || ''}
                        className="w-24 mx-auto text-center bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 focus:from-blue-100 focus:to-cyan-100 focus:border-blue-400 h-8 text-xs" 
                        placeholder="Start"
                        onChange={(e) => updateSubjectFormData(subject.id, 'startTime', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Input 
                        type="time" 
                        value={subjectFormData[subject.id]?.endTime || ''}
                        className="w-24 mx-auto text-center bg-gradient-to-r from-red-50 to-rose-50 border-red-200 focus:from-red-100 focus:to-rose-100 focus:border-red-400 h-8 text-xs" 
                        placeholder="End"
                        onChange={(e) => updateSubjectFormData(subject.id, 'endTime', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                       <Select 
                         value={subjectFormData[subject.id]?.room || ''}
                         onValueChange={(value) => updateSubjectFormData(subject.id, 'room', value)}
                       >
                         <SelectTrigger className="w-20 bg-white mx-auto text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 focus:from-green-100 focus:to-emerald-100 focus:border-green-400 h-8 text-xs">
                           <SelectValue placeholder="Room" />
                         </SelectTrigger>
                         <SelectContent className="bg-white">
                           {rooms.map((room) => (
                             <SelectItem key={room.id} value={room.name}>
                               {room.name} (Capacity: {room.capacity})
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </TableCell>
                    <TableCell className="text-center pr-4">
                       <div className="flex flex-col items-center space-y-1">
                         <div className="flex items-center space-x-1">
                           <Button 
                             onClick={() => handleValidateSchedule(subject.id)}
                             size="sm"
                             variant={validationState[subject.id]?.isValidated ? 
                               (validationState[subject.id]?.hasConflicts ? "destructive" : "default") : 
                               "outline"
                             }
                             className={`font-medium px-2 py-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md text-xs ${
                               validationState[subject.id]?.isValidated ? 
                                 (validationState[subject.id]?.hasConflicts ? 
                                   "bg-red-500 hover:bg-red-600 text-white" : 
                                   "bg-blue-500 hover:bg-blue-600 text-white"
                                 ) : 
                                 "border-blue-500 text-blue-500 hover:bg-blue-50"
                             }`}
                           >
                             {validationState[subject.id]?.isValidated ? 
                               (validationState[subject.id]?.hasConflicts ? 
                                 <><AlertTriangle className="w-3 h-3 mr-1" />Conflicts</> : 
                                 <><CheckCircle2 className="w-3 h-3 mr-1" />Valid</>
                               ) : 
                               "Validate"
                             }
                           </Button>
                           <Button 
                             onClick={() => handleSaveSchedule(subject.id)}
                             disabled={saving || !validationState[subject.id]?.isValidated || validationState[subject.id]?.hasConflicts}
                             className="px-2 py-1 rounded-md transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50"
                             size="sm"
                           >
                             {saving ? (
                               <>
                                 <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                 <span className="text-xs">Saving...</span>
                               </>
                             ) : (
                               <>
                                 <Save className="w-3 h-3 mr-1" />
                                 <span className="text-xs">Save</span>
                               </>
                             )}
                           </Button>
                         </div>
                        
                       </div>
                     </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>



      {/* Conflict Modal */}
      <Dialog open={conflictModal.isOpen} onOpenChange={(open) => setConflictModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Schedule Conflicts Detected
            </DialogTitle>
            <DialogDescription>
              The following conflicts were found with your schedule. Please resolve them before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conflictModal.conflicts.map((conflict, index) => (
              <Alert key={index} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold text-red-800">
                      Conflict with: {conflict.subject.subjectCode} - {conflict.subject.subjectDescription}
                    </div>
                    <div className="text-sm text-red-700">
                      <div>Days: {Array.isArray(conflict.days) ? conflict.days.join(', ') : conflict.days}</div>
                      <div>Time: {conflict.startTime} - {conflict.endTime}</div>
                      {conflict.room && <div>Room: {conflict.room}</div>}
                      <div className="mt-1 font-medium">
                        {conflict.type === 'time_room' ? 
                          'Same time slot and room conflict' : 
                          'Same time slot conflict'
                        }
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setConflictModal(prev => ({ ...prev, isOpen: false }))}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timetable Preview */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="flex border border-gray-300">
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
                      {days.map(day => (
                        <div 
                          key={`${day}-${timeSlot}`} 
                          className="h-[60px] text-xs border-r border-b border-gray-200 transition-colors duration-200"
                        />
                      ))}
                    </div>
                  ))}
                  
                  {/* Schedule blocks positioned absolutely */}
                   {displayScheduleBlocks.map((block, index) => {
                    // Convert time to minutes for calculation
                    const convertTo24Hour = (time: string) => {
                      const [timePart, period] = time.split(' ');
                      const [hour, minute] = timePart.split(':').map(Number);
                      let hour24 = hour;
                      if (period === 'PM' && hour !== 12) hour24 += 12;
                      if (period === 'AM' && hour === 12) hour24 = 0;
                      return hour24 * 60 + minute;
                    };
                    
                    const startTimeMinutes = convertTo24Hour(block.startTime.includes('AM') || block.startTime.includes('PM') ? block.startTime : `${block.startTime} ${parseInt(block.startTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}`);
                    const endTimeMinutes = convertTo24Hour(block.endTime.includes('AM') || block.endTime.includes('PM') ? block.endTime : `${block.endTime} ${parseInt(block.endTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}`);
                    
                    // Calculate position and height using consistent formula
                    const startHour = Math.floor(startTimeMinutes / 60);
                    const endHour = Math.floor(endTimeMinutes / 60);
                    const startMinute = startTimeMinutes % 60;
                    const endMinute = endTimeMinutes % 60;
                    
                    // Find day column index
                    const dayIndex = days.indexOf(block.day);
                    
                    // Check if block is in 7:00AM-9:00AM range (no border)
                    const isEarlyMorning = startHour >= 7 && endHour <= 9;
                    
                    // Only show blocks within 7 AM to 8 PM range
                    if (dayIndex < 0 || startHour < 7 || startHour > 20) return null;
                    
                    // Calculate precise positioning using consistent formula
                    const cellHeight = 60; // Height of each time slot cell (matches grid)
                    const gridStartTime = 7 * 60; // 7 AM in minutes (grid starts at 7 AM)
                    const pixelsPerMinute = cellHeight / 60; // 1 pixel per minute
                    
                    // Calculate top position: (startTimeInMinutes - gridStartTime) * pixelsPerMinute
                    const topPosition = (startTimeMinutes - gridStartTime) * pixelsPerMinute;
                    
                    // Calculate block height: durationInMinutes * pixelsPerMinute
                    const durationMinutes = endTimeMinutes - startTimeMinutes;
                    const blockHeight = durationMinutes * pixelsPerMinute;
                    
                    return (
                     
                      <div
                        key={`${block.subject.id}-${block.day}-${index}`}
                        className={`absolute bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-md shadow-lg z-10 ${
                          isEarlyMorning ? '' : 'border border-blue-600'
                        }`}
                        style={{
                          
                          top: `${topPosition}px`,
                          left: `${(dayIndex * (100 / 7))}%`,
                          width: `${(100 / 7)}%`,
                          height: `${blockHeight}px`
                        }}
                      >
                        <div className="p-2 h-full flex flex-col justify-center space-y-1">
                          <div className="font-bold text-xs text-center">{block.subject.subjectCode}</div>
                          <div className="text-xs opacity-90 text-center font-semibold">{block.abbreviatedDays}</div>
                          <div className="text-xs opacity-75 text-center font-medium">
                            {block.startTime} - {block.endTime}
                          </div>
                          {block.room && (
                            <div className="text-xs opacity-75 text-center font-medium">
                              Room: {block.room}
                            </div>
                          )}
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
  );
};

export default ViewProspectusScheduling;