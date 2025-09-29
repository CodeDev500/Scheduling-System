import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Grid, 
  Users, 
  Clock,
  BookOpen,
  GraduationCap,
  MapPin,
  Star,
  Award,
  Eye,
  ChevronRight,
  User,
  Target,
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Table,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  GripVertical,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import extracted components
import { ScheduleHeader } from './components/ScheduleHeader';
import { GenerationProgress } from './components/GenerationProgress';
import { ScheduleGridView } from './components/ScheduleGridView';
import { ScheduleTableView } from './components/ScheduleTableView';

// Import hooks
import { useScheduleGeneration } from './hooks/useScheduleGeneration';
import { useScheduleEditing } from './hooks/useScheduleEditing';

// Import Redux hooks and slice
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchAcademicPrograms } from '../../../services/academicProgramSlice';
import { fetchCurriculums } from '../../../services/curriculumSlice';

import { fetchProgramPriorities, saveProgramPriorities } from '../../../services/programPrioritySlice';

// Import types
import type { GeneratedSchedule, ScheduleItem, FacultyRecommendation, Subject } from '../../../types';
import type { AcademicProgram } from '../../../types/types';

// Import day utilities
import { getDayDisplayText, parseDaysCombination, formatDaysCombination } from './utils/dayUtils';
import { convertTo12Hour, formatTimeRange as formatTimeRangeUtil } from './utils/timeUtils';
import api from '@/api/axios';
import { ScheduleGenerationService } from './services/scheduleGenerationService';

// Define Schedule type for the sample data
interface Schedule {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  time: string;
  day: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
  courseCode?: string;
  credits?: number;
  type?: string;
  students?: string;
}

// Utility function to format time range using timeUtils
const formatTimeRange = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime || startTime === 'TBA' || endTime === 'TBA') {
    return 'TBA';
  }
  
  return formatTimeRangeUtil(startTime, endTime);
};

const ScheduleGeneration: React.FC = () => {
  // Redux hooks
  const dispatch = useAppDispatch();
  const { academicPrograms, isLoading: programsLoading, error: programsError } = useAppSelector((state) => state.academicProgram);
  const { programPriorities: savedProgramPriorities, isLoading: prioritiesLoading, error: prioritiesError } = useAppSelector((state) => state.programPriority);



  // Additional state for UI
  const [showFacultyRecommendations, setShowFacultyRecommendations] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);
  const [activeTab, setActiveTab] = useState('generation');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");

  const [programs, setPrograms] = useState<any[]>([]);
  const [programPriorities, setProgramPriorities] = useState<string[]>([]);
  const [showPrioritySettings, setShowPrioritySettings] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { curriculums, isLoading: curriculumsLoading, error: curriculumsError } = useAppSelector((state) => state.curriculum);

  useEffect(() => {
    const getInstructors = async () => {
      try {
        const response = await api.get('/user/instructor');
        console.log('Instructors fetched:', response.data);
        setInstructors(response.data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };
    getInstructors();
  }, []);
  // Helper function to get program name from program code
  const getProgramName = (programCode: string): string => {
    const program = academicPrograms?.find((p: AcademicProgram) => p.programCode === programCode);
    return program?.programName || programCode;
  };

  // Save program priorities to database
  const handleSaveProgramPriorities = async () => {
    try {
      
      const prioritiesData = programPriorities.map((programCode, index) => ({
        programCode,
        programName: getProgramName(programCode),
        priority: index + 1,
        department: selectedDepartment || undefined
      }));

      console.log('Priorities data to save:', prioritiesData);
      
      const result = await dispatch(saveProgramPriorities(prioritiesData)).unwrap();
      console.log('Save result:', result);
      
      toast.success('Program priorities saved successfully!');
    } catch (error) {
      console.error('Error saving program priorities:', error);
      toast.error('Failed to save program priorities. Please try again.');
    }
  };

  // Use extracted hooks
  const {
    selectedDepartment,
    setSelectedDepartment,
    selectedProgram,
    setSelectedProgram,
    selectedYearLevel,
    setSelectedYearLevel,
    selectedSemester,
    setSelectedSemester,
    targetStudents,
    setTargetStudents,
    isGenerating,
    generatedSchedules,
    setGeneratedSchedules,
    selectedSchedule,
    setSelectedSchedule,
    showScheduleDetails,
    setShowScheduleDetails,
    generationProgress,
    completedSteps,
    estimatedTime,
    currentStep,
    handleGenerateSchedule
  } = useScheduleGeneration(instructors);

  useEffect(() => {
    console.log("curriculums", curriculums)
    console.log("generatedSchedules updated:", generatedSchedules);
    console.log("generatedSchedules length:", generatedSchedules.length);
    // Fetch academic programs and program priorities when component mounts
    dispatch(fetchAcademicPrograms());
    dispatch(fetchProgramPriorities());
    dispatch(fetchCurriculums());
    
    // Note: Using separate API call for instructors instead of Redux faculty data
    // This provides all instructors for schedule assignment purposes
  }, [dispatch]);

  const {

  } = useScheduleEditing(selectedSchedule, setSelectedSchedule, setGeneratedSchedules);

  // Update program priorities when academic programs are loaded
  useEffect(() => {
    if (academicPrograms && academicPrograms.length > 0) {
      const programCodes = academicPrograms.map((program: AcademicProgram) => program.programCode);
      setPrograms(programCodes);
      
      // If we have saved priorities, use them; otherwise use default order
      if (savedProgramPriorities && savedProgramPriorities.length > 0) {
        const savedPriorityCodes = [...savedProgramPriorities]
          .sort((a, b) => a.priority - b.priority)
          .map(p => p.programCode);
        
        // Include any new programs that aren't in saved priorities
        const newPrograms = programCodes.filter((code): code is string => code !== null && !savedPriorityCodes.includes(code));
        setProgramPriorities([...savedPriorityCodes, ...newPrograms]);
      } else {
        setProgramPriorities(programCodes.filter((code): code is string => code !== null));
      }
    }
  }, [academicPrograms, savedProgramPriorities]);

  useEffect(() => {
    // Convert generatedSchedules data to table format - preserve all original data
    console.log("Processing generatedSchedules for display:", generatedSchedules);
    console.log("generatedSchedules length in processing useEffect:", generatedSchedules.length);
    
    if (generatedSchedules && generatedSchedules.length > 0) {
      const scheduleItems: Schedule[] = [];
      
      generatedSchedules.forEach((schedule, scheduleIndex) => {
        console.log(`Processing schedule ${scheduleIndex}:`, schedule);
        console.log(`Schedule ${scheduleIndex} subjects:`, schedule.subjects);
        console.log(`Schedule ${scheduleIndex} subjects length:`, schedule.subjects?.length || 0);
        
        if (schedule.subjects && Array.isArray(schedule.subjects)) {
          // Preserve all original data from the generated schedule
          schedule.subjects.forEach((item: any) => {
            console.log('Processing perfect schedule item:', item);
            
            scheduleItems.push({
              // Core identification
              id: item.id,
              subjectId: item.subjectId,
              
              // Subject information - preserve all fields
              subject: item.subjectName || item.subject?.name || 'Unknown Subject',
              subjectCode: item.subjectCode || item.subject?.code || 'N/A',
              subjectName: item.subjectName || item.subject?.name || 'Unknown Subject',
              subjectDescription: item.subjectDescription || item.subject?.description || '',
              
              // Faculty information - preserve all fields
              faculty: item.facultyName || item.faculty?.name || 'Unassigned',
              facultyId: item.facultyId,
              facultyName: item.facultyName || item.faculty?.name || 'Unassigned',
              
              // Room information - preserve all fields
              room: item.roomName || item.room?.name || item.room || 'TBA',
              roomId: item.roomId,
              roomName: item.roomName || item.room?.name || item.room || 'TBA',
              
              // Time and scheduling - preserve all fields
              time: item.startTime && item.endTime ? formatTimeRange(item.startTime, item.endTime) : 'TBA',
              day: item.day || 'TBA',
              startTime: item.startTime,
              endTime: item.endTime,
              
              // Academic information - preserve all fields
              semester: item.semester || 'Unknown Semester',
              academicYear: '2024-2025',
              program: item.program || item.programCode || 'Unknown Program',
              yearLevel: item.yearLevel || 'Unknown Year Level',
              credits: item.subject?.credits || item.units || 3,
              units: item.units || item.subject?.credits || 3,
              type: item.subject?.type || item.type || 'Lecture',
              
              // Additional fields that might be present
              students: '0/50',
              section: item.section || 'A',
              tags: item.tags || [],
              
              // Preserve any other fields that might exist
              ...item
            });
          });
        }
      });

      console.log('Final schedule items with all preserved data:', scheduleItems);
      setSchedules(scheduleItems);
    } else {
      // Clear schedules if no generated schedules
      setSchedules([]);
    }
  }, [generatedSchedules, selectedSemester, selectedProgram, selectedYearLevel]);

   // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);
  console.log(schedules)

  // Filter schedules based on search term, semester, and program
  const filteredSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) {
      console.log('No schedules to filter');
      return [];
    }

    console.log('Filtering schedules with:', { searchTerm, filterSemester, filterProgram });
    console.log('Total schedules before filtering:', schedules.length);
    console.log('Sample schedule data structure:', schedules[0]);
    
    // Log all semester values to debug
    console.log('All semester values:', schedules.map(s => ({ id: s.id, subject: s.subject, semester: s.semester })));
    
    let filtered = schedules.filter((schedule) => {
      // Enhanced search filter - search across all available fields
      const searchMatch = !searchTerm || 
        (schedule.subject && schedule.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.subjectName && schedule.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.subjectCode && schedule.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.subjectDescription && schedule.subjectDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.faculty && schedule.faculty.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.facultyName && schedule.facultyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.room && schedule.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.roomName && schedule.roomName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.day && schedule.day.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.time && schedule.time.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.type && schedule.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.section && schedule.section.toLowerCase().includes(searchTerm.toLowerCase()));

      // Enhanced semester filter with detailed logging
      const semesterMatch = !filterSemester || 
        filterSemester === 'all' || 
        schedule.semester === filterSemester;

      // Enhanced program filter
      const programMatch = !filterProgram || 
        filterProgram === 'all' || 
        schedule.program === filterProgram;

      // Log filtering decisions for debugging
      if (!semesterMatch) {
        console.log(`Schedule ${schedule.id} filtered out by semester: schedule.semester="${schedule.semester}", filterSemester="${filterSemester}"`);
      }

      return searchMatch && semesterMatch && programMatch;
    });

    console.log('Filtered schedules count:', filtered.length);
    console.log('Sample filtered schedules:', filtered.slice(0, 3));
    
    return filtered;
  }, [schedules, searchTerm, filterSemester, filterProgram]);

  console.log(schedules)

  // Sort schedules by program priority
  const processedSchedules = useMemo(() => {
    return [...filteredSchedules].sort((a, b) => {
      const aPriority = programPriorities.indexOf(a.program);
      const bPriority = programPriorities.indexOf(b.program);
      
      // If both programs are in priorities, sort by priority order
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }
      
      // If only one is in priorities, prioritize it
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      // If neither is in priorities, sort alphabetically
      return a.program.localeCompare(b.program);
    });
  }, [filteredSchedules, programPriorities]);

  // Handle priority reordering
  const handlePriorityReorder = (startIndex: number, endIndex: number) => {
    const result = Array.from(programPriorities);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setProgramPriorities(result);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      console.log('Drag end - active:', active.id, 'over:', over?.id);
      console.log('Current programPriorities before reorder:', programPriorities);
      
      setProgramPriorities((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        
        console.log('Old index:', oldIndex, 'New index:', newIndex);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        console.log('New order after arrayMove:', newOrder);
        
        return newOrder;
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

// Sortable Item Component for Priority Settings
const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };



  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-move"
      {...attributes}
    >
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 mr-3"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      {children}
    </div>
  );
};



  // Export handler
  const handleExportSchedule = (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedSchedule) {
      toast.error('No schedule selected for export');
      return;
    }
    
    toast.success(`Exporting schedule as ${format.toUpperCase()}...`);
    // Implementation would go here
  };

  // Handle schedule item click for details
  const handleScheduleItemClick = (item: ScheduleItem) => {
    setSelectedScheduleItem(item);
    setShowScheduleDetail(true);
  };

  // State for faculty recommendations
  const [facultyRecommendations, setFacultyRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Handle faculty recommendation
  const handleShowFacultyRecommendations = async (subject: any) => {
    setSelectedSubject(subject);
    setShowFacultyRecommendations(true);
    setLoadingRecommendations(true);
    
    try {
      // Fetch faculty recommendations for the specific subject
      const response = await api.get(`/faculty-recommendations/subject/${subject.id}`);
      setFacultyRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching faculty recommendations:', error);
      setFacultyRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  console.log(generatedSchedules)
  console.log(isGenerating)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="mx-auto space-y-8">
        {/* Header Section */}
        <ScheduleHeader
          isGenerating={isGenerating}
          onGenerateSchedule={handleGenerateSchedule}
          onExportSchedule={handleExportSchedule}
        />

        {/* Generation Progress */}
        {isGenerating && (
          <GenerationProgress
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            currentStep={currentStep}
          />
        )}


        {/* Generated Schedules Table */}
        <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Table className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Generated Schedules</h3>
                    <p className="text-blue-100 text-sm">Detailed view of all schedule items</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm font-semibold px-3 py-1">
                  {generatedSchedules.length > 0 && generatedSchedules[0]?.subjects ? generatedSchedules[0].subjects.length : 0} schedule items
                </Badge>
              </div>
              
              {/* Enhanced Filter Controls */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all" className="text-gray-900">All Semesters</option>
                  <option value="1st Semester" className="text-gray-900">1st Semester</option>
                  <option value="2nd Semester" className="text-gray-900">2nd Semester</option>
                  <option value="Summer" className="text-gray-900">Summer</option>
                </select>
                
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all" className="text-gray-900">All Programs</option>
                  {programs.map(program => (
                    <option key={program} value={program} className="text-gray-900">{program}</option>
                  ))}
                </select>
                
                <Button
                  onClick={() => setShowPrioritySettings(true)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Priority Settings
                </Button>
              </div>
            </div>
            
            {generatedSchedules.length > 0 && generatedSchedules[0]?.subjects?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span>Subject Code</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span>Subject Name</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span> Units</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>Time</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Grid className="h-4 w-4 text-orange-500" />
                          <span>Day</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span>Room</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span>Faculty</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          <span>Program</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>Status</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredSchedules.map((subject, index) => {
                      return (
                        <React.Fragment key={subject.id}>
                          <tr className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer ${
                            index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
                          }`}
                            onClick={() => {
                              setSelectedScheduleItem({
                                id: subject.id,
                                subjectName: subject.subjectName,
                                facultyName: subject.facultyName,
                                startTime: subject.startTime,
                                endTime: subject.endTime,
                                day: subject.day,
                                roomName: subject.roomName,
                                semester: subject.semester,
                                program: subject.program,
                                yearLevel: subject.yearLevel,
                                subjectCode: subject.subjectCode,
                                type: subject.type,
                                units: subject.units
                              } as ScheduleItem);
                              setShowScheduleDetail(true);
                            }}
                          >
                            {/* Subject Code */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{subject.subjectCode}</div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Subject Name */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="text-sm font-bold text-gray-900 truncate">{subject.subjectName}</div>
                              </div>
                            </td>
                            
                            {/* Type */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <Badge 
                                variant="outline" 
                                className={subject.type === 'Laboratory' ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-green-50 text-green-700 border-green-300'}
                              >
                                {subject.units}
                              </Badge>
                            </td>
                            
                            {/* Time */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center text-sm font-semibold text-gray-900">
                                <Clock className="w-4 h-4 text-orange-500 mr-2" />
                                {formatTimeRange(subject.startTime, subject.endTime)}
                              </div>
                            </td>
                            
                            {/* Day */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <Badge variant="outline" className="text-xs px-2 py-1 bg-orange-50 text-orange-700 border-orange-200">
                                {subject.day || 'N/A'}
                              </Badge>
                            </td>
                            
                            {/* Room */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{subject.roomName}</div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Faculty */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{subject.facultyName}</div>
                                  <div className="text-xs text-gray-500">ID: {subject.facultyId}</div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Program */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="text-sm font-semibold text-gray-900">{subject.program}</div>
                                <div className="text-xs text-gray-500">{subject.yearLevel}</div>
                              </div>
                            </td>
                            
                            {/* Status */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <Badge 
                                variant="outline" 
                                className={subject.hasConflict ? 'bg-red-50 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-300'}
                              >
                                {subject.status || (subject.hasConflict ? 'Conflict' : 'OK')}
                              </Badge>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Generated Schedules</h3>
                  <p className="text-gray-600 mb-6">Generate a schedule to see the detailed schedule items here.</p>
                  <Button 
                    onClick={handleGenerateSchedule} 
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Schedule'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Detail Dialog */}
        {showScheduleDetail && selectedScheduleItem && (
          <Dialog open={showScheduleDetail} onOpenChange={setShowScheduleDetail}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Schedule Details</span>
                    <p className="text-sm text-gray-500 font-normal">Comprehensive information about the selected schedule item</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Subject Information</label>
                      <p className="text-xl font-bold text-blue-900 mt-1">{selectedScheduleItem.subjectName || 'N/A'}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          Course Code
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          3 Credits
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <label className="text-sm font-bold text-green-800 uppercase tracking-wide">Faculty</label>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-900">{selectedScheduleItem.facultyName || 'N/A'}</p>
                          <p className="text-sm text-green-700">Instructor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <label className="text-sm font-bold text-orange-800 uppercase tracking-wide">Schedule Time</label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <p className="text-lg font-bold text-orange-900">
                          {formatTimeRange(selectedScheduleItem.startTime, selectedScheduleItem.endTime)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 mt-2">
                        Daily Schedule
                      </Badge>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                      <label className="text-sm font-bold text-red-800 uppercase tracking-wide">Location</label>
                      <div className="flex items-center space-x-2 mt-2">
                        <MapPin className="h-5 w-5 text-red-600" />
                        <p className="text-lg font-bold text-red-900">{selectedScheduleItem.roomName || 'N/A'}</p>
                      </div>
                      <p className="text-sm text-red-700 mt-1">Classroom Assignment</p>
                    </div>
                  </div>
                </div>
                
                {selectedScheduleItem.type === 'Laboratory' && (
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3 text-purple-800 mb-3">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <Info className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-lg">Laboratory Session</span>
                    </div>
                    <p className="text-purple-700 leading-relaxed">
                      This is a laboratory session requiring special equipment and setup. Students should arrive 10 minutes early for proper preparation and safety briefing.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setShowScheduleDetail(false)}>
                    Close
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Edit Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Faculty Recommendations Dialog */}
        {/* Priority Settings Dialog */}
        {showPrioritySettings && (
          <Dialog open={showPrioritySettings} onOpenChange={setShowPrioritySettings}>
            <DialogContent className="max-w-2xl p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Program Priority Settings</span>
                    <p className="text-sm text-gray-500 font-normal">Arrange programs in order of priority for schedule generation</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Priority Order</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Drag and drop programs to reorder them. Programs at the top will have higher priority in schedule generation.
                  </p>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={programPriorities} strategy={verticalListSortingStrategy}>
                      {programPriorities.map((program, index) => (
                        <SortableItem key={program} id={program}>
                          <div className="flex items-center w-full justify-left space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{getProgramName(program)}</span>
                              <span className="text-sm text-gray-500">{program}</span>
                            </div>
                          </div>
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Total Programs: {programPriorities.length}
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setShowPrioritySettings(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={async () => {
                        await handleSaveProgramPriorities();
                        setShowPrioritySettings(false);
                      }}
                      className="bg-gradient-to-r text-white from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Priorities
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showFacultyRecommendations && selectedSubject && (
          <Dialog open={showFacultyRecommendations} onOpenChange={setShowFacultyRecommendations}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Faculty Recommendations
                </DialogTitle>
                <DialogDescription>
                  Recommended faculty members for {selectedSubject?.name || 'this subject'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {loadingRecommendations ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading faculty recommendations...</p>
                  </div>
                ) : facultyRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {facultyRecommendations.map((faculty, index) => (
                      <div key={faculty.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {faculty.firstname} {faculty.lastname}
                                {faculty.middleInitial && ` ${faculty.middleInitial}.`}
                              </h3>
                              <p className="text-sm text-gray-500">{faculty.email}</p>
                              <p className="text-sm text-gray-600">{faculty.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-green-600">
                                {Math.round(faculty.matchScore || 0)}% Match
                              </span>
                            </div>
                            {faculty.specialization && (
                              <p className="text-xs text-gray-500 mt-1">{faculty.specialization}</p>
                            )}
                          </div>
                        </div>
                        {faculty.matchingTags && faculty.matchingTags.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Matching expertise:</p>
                            <div className="flex flex-wrap gap-1">
                              {faculty.matchingTags.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No Faculty Recommendations</p>
                    <p className="text-sm">No suitable faculty found for this subject.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ScheduleGeneration;
