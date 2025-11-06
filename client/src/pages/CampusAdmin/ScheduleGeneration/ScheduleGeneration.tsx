import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
 import {AlertTriangle} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Clock,
  BookOpen,
  GraduationCap,
  MapPin,
  Award,
  User,
  Target,
  Info,
  Table,
  Search,
  GripVertical,
  Save,
  Calendar, FileText,
  FileSpreadsheet
} from 'lucide-react';
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
import { useToast } from '@/hooks/useToast';
import { Eye } from 'lucide-react';

// Import extracted components
import { ScheduleHeader } from './components/ScheduleHeader';
import { GenerateScheduleModal } from './components/GenerateScheduleModal';
import { GenerationProgress } from './components/GenerationProgress';

// Import hooks
import { useScheduleGeneration } from './hooks/useScheduleGeneration';

// Import Redux hooks and slice
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchAcademicPrograms } from '../../../services/academicProgramSlice';
import { fetchCurriculums } from '../../../services/curriculumSlice';

import { fetchProgramPriorities, saveProgramPriorities } from '../../../services/programPrioritySlice';

// Import types
import type { Subject } from '../../../types';
import type { AcademicProgram } from '../../../types/types';

import { formatTimeRange as formatTimeRangeUtil } from './utils/timeUtils';
import { validateScheduleConflicts } from './utils/conflictValidation';
import type { ConflictDetail } from './utils/conflictValidation';
import { parseDaysCombination } from './utils/dayUtils';
import api from '@/api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Define Schedule type for the sample data
interface Schedule {
  id: string;
  subject: string;
  subjectCode?: string;
  subjectName?: string;
  units?: number;
  lec?: number;
  lab?: number;
  startTime?: string;
  endTime?: string;
  faculty: string;
  facultyId?: string;
  facultyName: string;
  room: string;
  time: string;
  day: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
  courseCode?: string;
  students?: string;
  recommendedFaculty?: any[];
  roomName?: string;
  type?: string;
  allSessions?: Schedule[];
}

// Utility function to format time range using timeUtils
const formatTimeRange = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime || startTime === 'TBA' || endTime === 'TBA') {
    return 'TBA';
  }
  
  return formatTimeRangeUtil(startTime, endTime);
};

const ScheduleGeneration: React.FC = () => {
  const [viewScheduleItem, setViewScheduleItem] = useState<Schedule | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [scheduleConflicts, setScheduleConflicts] = useState<ConflictDetail[]>([]);
  const [showConflictsDialog, setShowConflictsDialog] = useState(false);
  // Redux hooks
  const dispatch = useAppDispatch();
  const { academicPrograms, isLoading: programsLoading, error: programsError } = useAppSelector((state) => state.academicProgram);
  const { programPriorities: savedProgramPriorities, isLoading: prioritiesLoading, error: prioritiesError } = useAppSelector((state) => state.programPriority);

  const toast = useToast();
  const [showFacultyRecommendations, setShowFacultyRecommendations] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("1st Semester");
  const [filterProgram, setFilterProgram] = useState("all");
  const [curriculumYear, setCurriculumYear] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [programPriorities, setProgramPriorities] = useState<string[]>([]);
  const [showPrioritySettings, setShowPrioritySettings] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [facultyMaxUnits, setFacultyMaxUnits] = useState<number>(18);
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

  // Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Fetch academic years and set active one as default
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const response = await api.get('/academic-years');
        if (response.data.success) {
          setAcademicYears(response.data.data);
          // Set active year as default
          const activeYear = response.data.data.find((year: any) => year.isActive);
          if (activeYear) {
            setCurriculumYear(activeYear.year);
          }
        }
      } catch (error) {
        console.error('Error loading academic years:', error);
      }
    };
    loadAcademicYears();
  }, []);

  // Fetch faculty max units from settings
  useEffect(() => {
    const getFacultyMaxUnits = async () => {
      try {
        const response = await api.get('/total-units');
        const totalUnits = response.data.success && response.data.data ? response.data.data.totalUnits : 18;
        setFacultyMaxUnits(totalUnits);
      } catch (error) {
        console.error('Error fetching faculty max units:', error);
        setFacultyMaxUnits(18); // Default fallback
      }
    };
    getFacultyMaxUnits();
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
      await dispatch(saveProgramPriorities(prioritiesData)).unwrap();

      toast.success('Program priorities saved successfully!');
    } catch (error) {
      toast.error('Failed to save program priorities. Please try again.');
    }
  };

  // Use extracted hooks
  const {
    selectedDepartment,
    selectedProgram,
    selectedYearLevel,
    selectedSemester,
    isGenerating,
    generatedSchedules,
    selectedSchedule,
    generationProgress,
    currentStep,
    handleGenerateSchedule
  } = useScheduleGeneration(instructors, curriculumYear);

  useEffect(() => {
    // Fetch academic programs and program priorities when component mounts
    dispatch(fetchAcademicPrograms());
    dispatch(fetchProgramPriorities());
    dispatch(fetchCurriculums());
  }, [dispatch]);

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
    const fetchLatestSavedSchedule = async () => {
    // Only fetch if curriculumYear is set
    if (!curriculumYear) {
      console.log('⏳ Waiting for curriculum year to be set...');
      return;
    }

    try {
      // Use the unfiltered endpoint that returns all subject_schedules rows
      const response = await api.get(`/schedules/generation/items?academicYear=${curriculumYear}`);
      const rawData = response.data?.data || [];
      
      console.log('📥 Fetched saved schedules:', rawData);
      
      // Ensure lec and lab fields are properly mapped
      const mappedSchedules = rawData.map((item: any) => ({
        ...item,
        lec: item.lec || 0,
        lab: item.lab || 0,
        units: item.units || 0,
        facultyId: item.facultyId || item.faculty
      }));
      
      console.log('📊 Mapped schedules with lec/lab:', mappedSchedules);
      setSchedules(mappedSchedules);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Error fetching all subject schedules:', error);
      }
    }
  };
    // Fetch and display all subject_schedules rows directly (no filters, no wrapping)
    fetchLatestSavedSchedule();
  }, [curriculumYear]);

  
  // When generating a new schedule, clear current display first
  useEffect(() => {
    if (isGenerating) {
      setSchedules([]);
    }
  }, [isGenerating]);
  

  useEffect(() => {
    if (generatedSchedules && generatedSchedules.length > 0) {
      const scheduleItems: Schedule[] = [];
      
      generatedSchedules.forEach((schedule, scheduleIndex) => {
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
              academicYear: '2025-2026',
              program: item.program || item.programCode || 'Unknown Program',
              yearLevel: item.yearLevel || 'Unknown Year Level',
              units: item.units || 3,
              lec: item.lec || 0,
              lab: item.lab || 0,
              
              // Additional fields that might be present
              students: '0/50',
              tags: item.tags || [],
              recommendedFaculty: item.recommendedFaculty || [],
              
              // Preserve any other fields that might exist
              ...item
            });
          });
        }
      });
      
      setSchedules(scheduleItems);
    } else {
      // Clear schedules if no generated schedules
      setSchedules([]);
    }
  }, [generatedSchedules, selectedSemester, selectedProgram, selectedYearLevel]);


// Calculate faculty loads (total units assigned per faculty)
// IMPORTANT: Count units ONCE per subject, not per session!
const facultyLoads = useMemo(() => {
  const loads: Record<string, number> = {};
  const facultySubjects: Record<string, Set<string>> = {}; // Track which subjects each faculty has
  
  schedules?.forEach((schedule) => {
    const facultyId = schedule.facultyId || schedule.faculty;
    const subjectCode = schedule.subjectCode || schedule.subject;
    
    if (facultyId && facultyId !== 'unassigned' && subjectCode) {
      // Initialize tracking for this faculty if needed
      if (!facultySubjects[facultyId]) {
        facultySubjects[facultyId] = new Set();
        loads[facultyId] = 0;
      }
      
      // Only add units if this is the first time we see this subject for this faculty
      if (!facultySubjects[facultyId].has(subjectCode)) {
        facultySubjects[facultyId].add(subjectCode);
        const units = schedule.units || 0;
        loads[facultyId] += units;
      }
    }
  });
  
  return loads;
}, [schedules]);

const filteredSchedules = useMemo(() => {
  // Step 1: Expand schedules with combined days into separate rows
  const expandedSchedules: Schedule[] = [];
  
  schedules?.forEach((schedule) => {
    const dayString = schedule.day || '';
    
    // Parse the day combination to get individual days
    const individualDays = parseDaysCombination(dayString);
    
    // If there are multiple days, create a separate row for each day
    if (individualDays.length > 1) {
      individualDays.forEach((day) => {
        expandedSchedules.push({
          ...schedule,
          day: day, // Use the full day name (e.g., "Monday", "Tuesday")
          id: `${schedule.id}-${day}` // Create unique ID for each day
        });
      });
    } else {
      // Single day or no day, keep as is
      expandedSchedules.push(schedule);
    }
  });

  // Step 2: Filter schedules based on search term, semester, and program
  let filtered = expandedSchedules.filter((schedule) => {
    const searchMatch =
      !searchTerm ||
      (schedule.facultyName &&
        schedule.facultyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const semesterMatch =
      !filterSemester ||
      filterSemester === "all" ||
      schedule.semester === filterSemester;

    const programMatch =
      !filterProgram ||
      filterProgram === "all" ||
      schedule.program === filterProgram;

    return searchMatch && semesterMatch && programMatch;
  });

  // Step 3: If no filters applied, show all schedules
  if (!searchTerm && filterSemester === "all" && filterProgram === "all") {
    filtered = expandedSchedules;
  }

  // Step 4: Sort schedules based on program priority (BSIT → BSCS → BSIS)
  const sortedSchedules =
    programPriorities && programPriorities.length > 0
      ? [...filtered].sort((a, b) => {
          const indexA = programPriorities.indexOf(a.program);
          const indexB = programPriorities.indexOf(b.program);
          const priorityA = indexA === -1 ? 999 : indexA;
          const priorityB = indexB === -1 ? 999 : indexB;
          return priorityA - priorityB;
        })
      : filtered;

  return sortedSchedules;
}, [schedules, searchTerm, filterSemester, filterProgram, programPriorities]);



  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {

      setProgramPriorities((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        

        const newOrder = arrayMove(items, oldIndex, newIndex);

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



  // Export handler - exports the displayed table data (filteredSchedules)
  const handleExportSchedule = (format: 'pdf' | 'excel' | 'csv') => {
    if (!filteredSchedules || filteredSchedules.length === 0) {
      toast.error('No schedule data to export');
      return;
    }
    
    try {
      if (format === 'pdf') {
        exportScheduleToPDF(filteredSchedules, curriculumYear, filterSemester);
        toast.success('Schedule exported as PDF successfully!');
      } else if (format === 'excel') {
        exportScheduleToExcel(filteredSchedules, curriculumYear, filterSemester);
        toast.success('Schedule exported as Excel successfully!');
      } else if (format === 'csv') {
        exportScheduleToCSV(filteredSchedules, curriculumYear, filterSemester);
        toast.success('Schedule exported as CSV successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export schedule as ${format.toUpperCase()}`);
    }
  };

  // Export to PDF using displayed table data
  const exportScheduleToPDF = (schedules: Schedule[], curriculumYear?: string, semester?: string) => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('Class Schedule', 14, 15);
    
    doc.setFontSize(11);
    if (curriculumYear) {
      doc.text(`Curriculum Year: ${curriculumYear}`, 14, 25);
    }
    if (semester) {
      doc.text(`Semester: ${semester}`, 14, 32);
    }
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 39);
    
    const tableData = schedules.map((item) => [
      item.subjectCode || '',
      item.subjectName || '',
      item.day || '',
      `${item.startTime || ''} - ${item.endTime || ''}`,
      item.roomName || '',
      item.facultyName || '',
      `${item.units || 0}`,
      `${item.lec || 0} | ${item.lab || 0}`,
      item.yearLevel || '',
      item.program || ''
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [['Code', 'Subject', 'Days', 'Time', 'Room', 'Faculty', 'Units', 'Lec|Lab', 'Year', 'Program']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 45 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 45 },
        2: { cellWidth: 20 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
        5: { cellWidth: 35 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 25 }
      }
    });
    
    const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  // Export to Excel using displayed table data
  const exportScheduleToExcel = (schedules: Schedule[], curriculumYear?: string, semester?: string) => {
    const excelData = schedules.map((item) => ({
      'Subject Code': item.subjectCode || '',
      'Subject Name': item.subjectName || '',
      'Days': item.day || '',
      'Start Time': item.startTime || '',
      'End Time': item.endTime || '',
      'Room': item.roomName || '',
      'Faculty': item.facultyName || '',
      'Units': item.units || 0,
      'Lecture': item.lec || 0,
      'Lab': item.lab || 0,
      'Year Level': item.yearLevel || '',
      'Semester': item.semester || '',
      'Program': item.program || ''
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
      { wch: 20 }, { wch: 25 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    
    const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export to CSV using displayed table data
  const exportScheduleToCSV = (schedules: Schedule[], curriculumYear?: string, semester?: string) => {
    const csvData = schedules.map((item) => ({
      'Subject Code': item.subjectCode || '',
      'Subject Name': item.subjectName || '',
      'Days': item.day || '',
      'Start Time': item.startTime || '',
      'End Time': item.endTime || '',
      'Room': item.roomName || '',
      'Faculty': item.facultyName || '',
      'Units': item.units || 0,
      'Lecture': item.lec || 0,
      'Lab': item.lab || 0,
      'Year Level': item.yearLevel || '',
      'Semester': item.semester || '',
      'Program': item.program || ''
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvData);
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    
    const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.csv`;
    XLSX.writeFile(wb, fileName, { bookType: 'csv' });
  };

  // Save the currently selected/generated schedule to the server (overwriting previous)
  const handleSaveSchedule = async () => {
    try {
      // Save the raw schedules array exactly as generated/shown, without changing shape
      if (!schedules || schedules.length === 0) {
        toast.warning('No schedules to save. Generate a schedule first.');
        return;
      }

      // Check if curriculum year is selected
      if (!curriculumYear) {
        toast.error('Please select a curriculum year before saving.');
        return;
      }

      // Add curriculum year to each schedule
      const schedulesWithCurriculumYear = schedules.map(schedule => ({
        ...schedule,
        curriculumYear: curriculumYear
      }));

      // Validate for time conflicts before saving
      const conflicts = validateScheduleConflicts(schedulesWithCurriculumYear);
      
      if (conflicts.length > 0) {
        // Store conflicts and show dialog
        setScheduleConflicts(conflicts);
        setShowConflictsDialog(true);
        
        // Show error toast
        toast.error(`Cannot save schedule: ${conflicts.length} conflict(s) detected. Please review the conflicts.`);
        return;
      }

      const response = await api.post('/schedules/generation/save', schedulesWithCurriculumYear);
      if (response.data?.success) {
        const message = response.data?.message || `Schedule saved successfully for ${curriculumYear}`;
        toast.success(message);
      } else {
        toast.error(response.data?.message || 'Failed to save schedule.');
      }
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast.error(error?.response?.data?.message || 'Failed to save schedule.');
    }
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

  return (
    <div className="min-h-screen">
      <div className="w-[1220px] mx-auto  max-w-full  overflow-x-auto">
        {/* Header Section */}
        <ScheduleHeader
          isGenerating={isGenerating}
          onOpenGenerateModal={() => setShowGenerateModal(true)}
          onExportSchedule={handleExportSchedule}
          onSaveSchedule={handleSaveSchedule}
          canSave={schedules.length > 0}
        />

        {/* Generate Schedule Modal */}
        <GenerateScheduleModal
          open={showGenerateModal}
          onOpenChange={setShowGenerateModal}
          onGenerate={async (year, semester) => {
            await handleGenerateSchedule(year, semester);
            // Modal will close automatically after generation completes
            setShowGenerateModal(false);
          }}
          isGenerating={isGenerating}
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
                <div className='flex gap-2'>
              
               
                <div className="flex items-center space-x-3">
                  Curriculum Year:
                </div>
                <Select value={curriculumYear} onValueChange={setCurriculumYear}>
                  <SelectTrigger className="w-48 bg-white text-gray-900 border-white/50 hover:bg-white/95 focus:ring-2 focus:ring-white/50 font-semibold shadow-md">
                    <SelectValue placeholder="Select Curriculum Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {academicYears.map(year => (
                      <SelectItem 
                        key={year.id} 
                        value={year.year} 
                        className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-900 cursor-pointer"
                      >
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  <Select 
                onValueChange={(value) => handleExportSchedule(value as 'pdf' | 'excel' | 'csv')}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Export as..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="pdf" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-900 cursor-pointer"
                      >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span>PDF</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="excel" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-900 cursor-pointer"
                      >
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        <span>Excel</span>
                      </div>
                    </SelectItem>
                   
                  </SelectContent>
                </Select>
                 </div>
              </div>
              
              {/* Enhanced Filter Controls */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
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
            
            {schedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      {/* Subject */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span>Subject</span>
                        </div>
                      </th>
                      {/* Schedule */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>Schedule & Room</span>
                        </div>
                      </th>
                      {/* Faculty */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span>Faculty</span>
                        </div>
                      </th>
                      {/* Program */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          <span>Program</span>
                        </div>
                      </th>
                      {/* Semester */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <span>Semester</span>
                        </div>
                      </th>
                      {/* Units */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>Units</span>
                        </div>
                      </th>
                      {/* Actions */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(() => {
                      // Group schedules by subject code
                      const groupedSchedules = filteredSchedules.reduce((acc, subject) => {
                        const key = `${subject.subjectCode}-${subject.program}-${subject.yearLevel}-${subject.semester}`;
                        if (!acc[key]) {
                          acc[key] = [];
                        }
                        acc[key].push(subject);
                        return acc;
                      }, {} as Record<string, Schedule[]>);

                      return Object.entries(groupedSchedules).map(([key, subjects], groupIndex) => {
                        // Get the first subject for common info
                        const firstSubject = subjects[0];
                        
                        return (
                          <React.Fragment key={key}>
                            <tr className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                              groupIndex % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
                            }`}>
                              {/* Subject */}
                              <td className="px-6 py-5 truncate max-w-50">
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{firstSubject?.subjectCode || 'N/A'}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-xs">{firstSubject.subjectName}</div>
                                </div>
                              </td>
                              
                              {/* Schedule - Show all time slots grouped by time and room */}
                              <td className="px-6 py-5">
                                <div className="space-y-3">
                                  {(() => {
                                    // Group subjects by time, room, and type
                                    const grouped = subjects.reduce((acc: any, subject) => {
                                      const key = `${subject.startTime}-${subject.endTime}-${subject.roomName}-${subject.type}`;
                                      if (!acc[key]) {
                                        acc[key] = {
                                          days: [],
                                          startTime: subject.startTime,
                                          endTime: subject.endTime,
                                          roomName: subject.roomName,
                                          type: subject.type
                                        };
                                      }
                                      acc[key].days.push(subject.day);
                                      return acc;
                                    }, {});

                                    // Convert to array and sort by start time, then by type (Lecture before Lab)
                                    const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
                                      // First sort by start time (with safety checks)
                                      const timeA = a.startTime || '';
                                      const timeB = b.startTime || '';
                                      if (timeA !== timeB) {
                                        return timeA.localeCompare(timeB);
                                      }
                                      // Then by type (Lecture before Laboratory)
                                      const typeA = a.type || '';
                                      const typeB = b.type || '';
                                      return typeA.localeCompare(typeB);
                                    });

                                    return sortedGroups.map((group: any, idx) => {
                                      // Sort days in proper order (M, T, W, Th, F, S, Su)
                                      const dayOrder: any = {
                                        'Monday': 1,
                                        'Tuesday': 2,
                                        'Wednesday': 3,
                                        'Thursday': 4,
                                        'Friday': 5,
                                        'Saturday': 6,
                                        'Sunday': 7
                                      };
                                      
                                      const sortedDays = [...group.days].sort((a, b) => dayOrder[a] - dayOrder[b]);
                                      
                                      // Combine days (e.g., "Monday", "Wednesday" -> "MW")
                                      const dayAbbr = sortedDays.map((day: string) => {
                                        const abbr: any = {
                                          'Monday': 'M',
                                          'Tuesday': 'T',
                                          'Wednesday': 'W',
                                          'Thursday': 'Th',
                                          'Friday': 'F',
                                          'Saturday': 'S',
                                          'Sunday': 'Su'
                                        };
                                        return abbr[day] || day.charAt(0);
                                      }).join('');

                                      return (
                                        <div key={idx} className="flex whitespace-nowrap items-start gap-3 p-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-blue-100">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge variant="outline" className="text-xs px-2 py-1 bg-orange-100 text-orange-700 border-orange-300 font-bold">
                                                {dayAbbr}
                                              </Badge>
                                              <span className="text-xs font-semibold text-gray-700">
                                                {formatTimeRange(group.startTime || 'N/A', group.endTime || 'N/A')}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                              <MapPin className="h-3 w-3 text-red-500" />
                                              <span className="font-medium">{group.roomName || 'N/A'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </td>
                              
                              {/* Removed separate Room column since it's now integrated in Schedule */}
                              
                              {/* Faculty */}
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{firstSubject.facultyName}</div>
                                  <div className="text-xs text-gray-500">
                                    {(() => {
                                      const facultyId = firstSubject.facultyId || firstSubject.faculty;
                                      const assignedUnits = facultyLoads[facultyId] || 0;
                                      const isOverloaded = assignedUnits > facultyMaxUnits;
                                      return (
                                        <span className={isOverloaded ? 'text-red-600 font-medium' : ''}>
                                          {assignedUnits}/{facultyMaxUnits} units
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </td>
                              
                              {/* Program */}
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{firstSubject.program}</div>
                                  <div className="text-xs text-gray-500">{firstSubject.yearLevel}</div>
                                </div>
                              </td>
                              
                              {/* Semester */}
                              <td className="px-6 py-5 whitespace-nowrap">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                                  {firstSubject.semester || 'N/A'}
                                </Badge>
                              </td>
                              
                              {/* Units */}
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="space-y-1">
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                    {firstSubject.units || 0} units
                                  </Badge>
                                  <div className="text-xs text-gray-500">
                                    Lec: {firstSubject.lec || 0} | Lab: {firstSubject.lab || 0}
                                  </div>
                                </div>
                              </td>
                              
                              {/* Actions */}
                              <td className="px-6 py-5 whitespace-nowrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Get ALL sessions for this subject (not just grouped ones)
                                    const allSubjectSessions = filteredSchedules.filter(s => 
                                      s.subjectCode === firstSubject.subjectCode &&
                                      s.program === firstSubject.program &&
                                      s.yearLevel === firstSubject.yearLevel &&
                                      s.semester === firstSubject.semester
                                    );
                                    setViewScheduleItem({ ...firstSubject, allSessions: allSubjectSessions });
                                    setShowViewModal(true);
                                  }}
                                  className="flex items-center gap-2 hover:bg-blue-50"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      });
                    })()}
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
                    onClick={() => setShowGenerateModal(true)} 
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

        {/* View Schedule Details Modal */}
        {showViewModal && viewScheduleItem && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Schedule Details</span>
                    <p className="text-sm text-gray-500 font-normal">{viewScheduleItem.subjectCode} - {viewScheduleItem.subjectName}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Subject Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Subject Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Subject Code</p>
                      <p className="text-sm font-semibold text-blue-900">{viewScheduleItem.subjectCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Subject Name</p>
                      <p className="text-sm font-semibold text-blue-900">{viewScheduleItem.subjectName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Program</p>
                      <p className="text-sm font-semibold text-blue-900">{viewScheduleItem.program}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Year Level</p>
                      <p className="text-sm font-semibold text-blue-900">{viewScheduleItem.yearLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Information
                  </h3>
                  
                  {viewScheduleItem.allSessions && viewScheduleItem.allSessions.length > 1 ? (
                    // Show all sessions grouped by time and room
                    <div className="space-y-4">
                      {(() => {
                        // Group sessions by time, room, and type
                        const grouped = viewScheduleItem.allSessions.reduce((acc: any, session) => {
                          const key = `${session.startTime}-${session.endTime}-${session.roomName}-${session.type}`;
                          if (!acc[key]) {
                            acc[key] = {
                              days: [],
                              startTime: session.startTime,
                              endTime: session.endTime,
                              roomName: session.roomName,
                              type: session.type,
                              semester: session.semester
                            };
                          }
                          acc[key].days.push(session.day);
                          return acc;
                        }, {});

                        // Sort groups by start time, then by type
                        const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
                          // Safety checks for undefined values
                          const timeA = a.startTime || '';
                          const timeB = b.startTime || '';
                          if (timeA !== timeB) {
                            return timeA.localeCompare(timeB);
                          }
                          const typeA = a.type || '';
                          const typeB = b.type || '';
                          return typeA.localeCompare(typeB);
                        });

                        return sortedGroups.map((group: any, idx) => {
                          // Sort days in proper order (M, T, W, Th, F, S, Su)
                          const dayOrder: any = {
                            'Monday': 1,
                            'Tuesday': 2,
                            'Wednesday': 3,
                            'Thursday': 4,
                            'Friday': 5,
                            'Saturday': 6,
                            'Sunday': 7
                          };
                          
                          const sortedDays = [...group.days].sort((a, b) => dayOrder[a] - dayOrder[b]);
                          
                          // Combine days (e.g., "Monday", "Wednesday" -> "MW")
                          const dayAbbr = sortedDays.map((day: string) => {
                            const abbr: any = {
                              'Monday': 'M',
                              'Tuesday': 'T',
                              'Wednesday': 'W',
                              'Thursday': 'Th',
                              'Friday': 'F',
                              'Saturday': 'S',
                              'Sunday': 'Su'
                            };
                            return abbr[day] || day.charAt(0);
                          }).join('');

                          return (
                            <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                              {group.type && (
                                <Badge variant="outline" className="mb-2 bg-purple-100 text-purple-800 border-purple-300">
                                  {group.type}
                                </Badge>
                              )}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-green-700 font-medium">Days</p>
                                  <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 border-green-300 font-bold">
                                    {dayAbbr}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-green-700 font-medium">Time</p>
                                  <p className="text-sm font-semibold text-green-900 ">
                                    {formatTimeRange(group.startTime || 'N/A', group.endTime || 'N/A')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-green-700 font-medium">Room</p>
                                  <p className="text-sm font-semibold text-green-900">{group.roomName || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-green-700 font-medium">Semester</p>
                                  <p className="text-sm font-semibold text-green-900">{group.semester}</p>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    // Show single session
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-green-700 font-medium">Day</p>
                        <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 border-green-300">
                          {viewScheduleItem.day}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium">Time</p>
                        <p className="text-sm font-semibold text-green-900">
                          {formatTimeRange(viewScheduleItem.startTime || 'N/A', viewScheduleItem.endTime || 'N/A')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium">Room</p>
                        <p className="text-sm font-semibold text-green-900">{viewScheduleItem.roomName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium">Semester</p>
                        <p className="text-sm font-semibold text-green-900">{viewScheduleItem.semester}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Faculty Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Faculty Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Faculty Name</p>
                      <p className="text-sm font-semibold text-purple-900">{viewScheduleItem.facultyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Faculty Load</p>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 font-bold ${
                          (facultyLoads[viewScheduleItem.facultyId || viewScheduleItem.faculty] || 0) > facultyMaxUnits
                            ? 'bg-red-100 text-red-800 border-red-300' 
                            : 'bg-green-100 text-green-800 border-green-300'
                        }`}
                      >
                        {facultyLoads[viewScheduleItem.facultyId || viewScheduleItem.faculty] || 0}/{facultyMaxUnits} units
                      </Badge>
                    </div>
                  </div>

                  {/* Faculty Recommendations */}
                  {viewScheduleItem.recommendedFaculty && viewScheduleItem.recommendedFaculty.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-xs text-purple-700 font-medium mb-2">Recommended Faculty (Ranked by Priority)</p>
                      <div className="space-y-2">
                        {viewScheduleItem.recommendedFaculty.slice(0, 3).map((faculty: any, index: number) => {
                          const rankLabels = ['1st Choice', '2nd Choice', '3rd Choice'];
                          const rankColors = [
                            'bg-yellow-100 text-yellow-800 border-yellow-300',
                            'bg-gray-100 text-gray-800 border-gray-300',
                            'bg-orange-100 text-orange-800 border-orange-300'
                          ];
                          
                          return (
                            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {faculty.firstname} {faculty.lastname}
                                  </p>
                                  <p className="text-xs text-gray-500">{faculty.email}</p>
                                  <div className="space-y-1 mt-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-700">
                                        Tag Match: {faculty.tagMatchPercentage || 0}%
                                      </span>
                                      {faculty.matchedTagsCount !== undefined && faculty.totalTagsCount !== undefined && (
                                        <span className="text-xs text-gray-500">
                                          ({faculty.matchedTagsCount}/{faculty.totalTagsCount} tags)
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      {faculty.yearsOfExperience !== undefined && (
                                        <span className="flex items-center gap-1">
                                          <span className="font-medium">Experience:</span> {faculty.yearsOfExperience} {faculty.yearsOfExperience === 1 ? 'year' : 'years'}
                                        </span>
                                      )}
                                      {faculty.designation && (
                                        <span className="flex items-center gap-1">
                                          <span className="font-medium">Status:</span> {faculty.designation}
                                        </span>
                                      )}
                                    </div>
                                    {faculty.preferredTimeSlots && faculty.preferredTimeSlots.length > 0 && (
                                      <div className="text-xs text-gray-600">
                                        <span className="font-medium">Available:</span>{' '}
                                        {(() => {
                                          let start = '07:00', end = '17:00';
                                          faculty.preferredTimeSlots.forEach((slot: string) => {
                                            if (slot.startsWith('start:')) start = slot.replace('start:', '');
                                            if (slot.startsWith('end:')) end = slot.replace('end:', '');
                                          });
                                          return `${start} - ${end}`;
                                        })()}
                                      </div>
                                    )}
                                    {faculty.previousSubjects && faculty.previousSubjects.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium text-green-700">✓ Has taught:</span>{' '}
                                        <span className="text-gray-600">
                                          {Array.isArray(faculty.previousSubjects) 
                                            ? faculty.previousSubjects.slice(0, 3).join(', ')
                                            : faculty.previousSubjects}
                                          {faculty.previousSubjects.length > 3 && '...'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className={`font-semibold ${rankColors[index]}`}>
                                {rankLabels[index]}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Units & Load Information */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Units & Load Information
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">Lecture</p>
                      <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-800 border-blue-300">
                        {viewScheduleItem.lec || 0} units
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">Laboratory</p>
                      <Badge variant="outline" className="mt-1 bg-purple-100 text-purple-800 border-purple-300">
                        {viewScheduleItem.lab || 0} units
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">Total Units</p>
                      <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                        {viewScheduleItem.units || 0} units
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">Hours/Week</p>
                      <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 border-green-300 font-bold">
                        {/* Calculation: Lec units × 1 hour + Lab units × 3 hours */}
                        {((viewScheduleItem.lec || 0) * 1) + ((viewScheduleItem.lab || 0) * 3)} hrs
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Schedule Conflicts Dialog */}
        {showConflictsDialog && (
          <Dialog open={showConflictsDialog} onOpenChange={setShowConflictsDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-red-900">Schedule Conflicts Detected</span>
                    <p className="text-sm text-gray-500 font-normal">
                      {scheduleConflicts.length} conflict{scheduleConflicts.length !== 1 ? 's' : ''} found in the schedule
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 mb-1">Cannot Save Schedule</p>
                      <p className="text-sm text-red-700">
                        The following conflicts must be resolved before saving. Classes with the same program, 
                        year level, and overlapping day patterns cannot have overlapping time slots.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {scheduleConflicts.map((conflict, index) => (
                    <div 
                      key={index} 
                      className="border border-red-200 rounded-lg p-4 bg-white hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 font-semibold">
                              Conflict #{index + 1}
                            </Badge>
                            <Badge variant="outline" className={
                              conflict.conflictType === 'room' 
                                ? "bg-orange-100 text-orange-800 border-orange-300" 
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }>
                              {conflict.conflictType === 'room' ? '🚪 Room Conflict' : '👨‍🏫 Instructor Conflict'}
                            </Badge>
                            {conflict.conflictType === 'room' && conflict.room && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                {conflict.room}
                              </Badge>
                            )}
                            {conflict.conflictType === 'instructor' && (
                              <>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                  {conflict.instructor || 'Unknown Instructor'}
                                </Badge>
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                                  {conflict.yearLevel}
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">{conflict.subjectA}</span>
                              <span className="text-gray-500">overlaps with</span>
                              <span className="font-semibold text-gray-900">{conflict.subjectB}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 ml-6">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Days: <strong>{conflict.days}</strong></span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Time: <strong>{formatTimeRange(conflict.startTime, conflict.endTime)}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">How to resolve conflicts:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Regenerate the schedule to get a new conflict-free arrangement</li>
                        <li>Manually adjust the conflicting class times in the schedule generation settings</li>
                        <li>Review the curriculum to ensure proper course distribution</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowConflictsDialog(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ScheduleGeneration;
