import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Clock,
  BookOpen,
  GraduationCap,
  MapPin,
  Award,
  User,
  Table,
  Search,
  Calendar,
  FileText,
  FileSpreadsheet,
  Eye,
  AlertTriangle,
  Edit,
  Plus,
  Save,
  X,
  Trash2
} from 'lucide-react';

import { useToast } from '@/hooks/useToast';


// Import Redux hooks and slice
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';


// Import types
import type { Subject } from '../../../types';

import { formatTimeRange as formatTimeRangeUtil } from '../../CampusAdmin/ScheduleGeneration/utils/timeUtils';
import type { ConflictDetail } from '../../CampusAdmin/ScheduleGeneration/utils/conflictValidation';
import { parseDaysCombination } from '../../CampusAdmin/ScheduleGeneration/utils/dayUtils';
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
  totalStudents?: number;
  recommendedFaculty?: any[];
  roomName?: string;
  type?: string;
  allSessions?: Schedule[];
}

// Session type for multiple schedule sessions
interface ScheduleSession {
  day: string;
  type: string;
  startTime: string;
  endTime: string;
  roomName: string;
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
  const [showConflictsDialog, setShowConflictsDialog] = useState(false);
const userData = useAppSelector((state) => state.auth.user);
  const toast = useToast();
  const [showFacultyRecommendations, setShowFacultyRecommendations] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("1st Semester");
  const [filterYearLevel, setFilterYearLevel] = useState("all");
  const [curriculumYear, setCurriculumYear] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [facultyMaxUnits, setFacultyMaxUnits] = useState<number>(18);
  const [instructors, setInstructors] = useState<any[]>([]);
    // State for faculty recommendations
    const [facultyRecommendations, setFacultyRecommendations] = useState<any[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScheduleItem, setEditScheduleItem] = useState<Schedule | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteScheduleItem, setDeleteScheduleItem] = useState<Schedule | null>(null);
  
  // State for multiple sessions
  const [scheduleSessions, setScheduleSessions] = useState<ScheduleSession[]>([{
    day: '',
    type: 'Lecture',
    startTime: '',
    endTime: '',
    roomName: ''
  }]);
  
  // State for autocomplete
  const [subjectSearch, setSubjectSearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [subjectSuggestions, setSubjectSuggestions] = useState<any[]>([]);
  const [facultySuggestions, setFacultySuggestions] = useState<any[]>([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [roomSuggestions, setRoomSuggestions] = useState<string[]>([]);
  const [showRoomDropdown, setShowRoomDropdown] = useState<number | null>(null);
  
  // Fetch instructors
  useEffect(() => {
    const getInstructors = async () => {
      try {
        const response = await api.get('/user/instructor');
        setInstructors(response.data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };
    getInstructors();
  }, []);

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
 
      // Ensure lec and lab fields are properly mapped
      const mappedSchedules = rawData.map((item: any) => ({
        ...item,
        lec: item.lec || 0,
        lab: item.lab || 0,
        units: item.units || 0,
        facultyId: item.facultyId || item.faculty,
        totalStudents: item.totalStudents || (item.students ? parseInt(item.students) : 0)
      }));

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

    const yearLevelMatch =
      !filterYearLevel ||
      filterYearLevel === "all" ||
      schedule.yearLevel === filterYearLevel;

    const programMatch =
      schedule.program === userData?.department;

    return searchMatch && semesterMatch && yearLevelMatch && programMatch;
  });



  return filtered;
}, [schedules, searchTerm, filterSemester, filterYearLevel]);


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

  // Helper function to convert day names to abbreviations
  const getDayAbbreviation = (day: string): string => {
    const dayMap: Record<string, string> = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'Th',
      'Friday': 'F',
      'Saturday': 'S',
      'Sunday': 'Su'
    };
    return dayMap[day] || day;
  };

  // Helper function to sort days in proper weekly order
  const sortDays = (days: string[]): string[] => {
    const dayOrder: Record<string, number> = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7
    };
    return days.sort((a, b) => (dayOrder[a] || 8) - (dayOrder[b] || 8));
  };

  // Helper function to group schedules by subject
  const groupSchedulesBySubject = (schedules: Schedule[]) => {
    const grouped: Record<string, Schedule[]> = {};
    
    schedules.forEach(schedule => {
      const key = `${schedule.subjectCode}-${schedule.program}-${schedule.yearLevel}-${schedule.semester}-${schedule.facultyName}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });
    
    return Object.values(grouped).map(group => {
      const first = group[0];
      const uniqueDays = [...new Set(group.map(s => s.day || ''))];
      const sortedDays = sortDays(uniqueDays);
      const days = sortedDays.map(d => getDayAbbreviation(d)).join('');
      const timeRanges = group.map(s => formatTimeRange(s.startTime || '', s.endTime || '')).join(', ');
      const rooms = [...new Set(group.map(s => s.roomName))].join(', ');
      
      return {
        ...first,
        day: days,
        timeRange: timeRanges,
        roomName: rooms
      };
    });
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
    
    // Group schedules by subject with sorted days
    const groupedSchedules = groupSchedulesBySubject(schedules);
    
    const tableData = groupedSchedules.map((item) => [
      item.subjectCode || '',
      item.subjectName || '',
      item.day || '',
      item.timeRange || formatTimeRange(item.startTime || '', item.endTime || ''),
      item.roomName || '',
      item.facultyName || '',
      `${item.units || 0}`,
      `${item.lec || 0} | ${item.lab || 0}`,
      item.students || '0/50',
      item.yearLevel || '',
      item.program || ''
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [['Code', 'Subject', 'Days', 'Time', 'Room', 'Faculty', 'Units', 'Lec|Lab', 'Students', 'Year', 'Program']],
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
        0: { cellWidth: 18 },
        1: { cellWidth: 40 },
        2: { cellWidth: 18 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 12 },
        7: { cellWidth: 18 },
        8: { cellWidth: 15 },
        9: { cellWidth: 18 },
        10: { cellWidth: 20 }
      }
    });
    
    const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  // Export to Excel using displayed table data
  const exportScheduleToExcel = (schedules: Schedule[], curriculumYear?: string, semester?: string) => {
    // Group schedules by subject
    const groupedSchedules = groupSchedulesBySubject(schedules);
    
    const excelData = groupedSchedules.map((item) => ({
      'Subject Code': item.subjectCode || '',
      'Subject Name': item.subjectName || '',
      'Days': item.day || '',
      'Time': item.timeRange || formatTimeRange(item.startTime || '', item.endTime || ''),
      'Room': item.roomName || '',
      'Faculty': item.facultyName || '',
      'Units': item.units || 0,
      'Lecture': item.lec || 0,
      'Lab': item.lab || 0,
      'Students': item.students || '0/50',
      'Year Level': item.yearLevel || '',
      'Semester': item.semester || '',
      'Program': item.program || ''
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
      { wch: 20 }, { wch: 25 }, { wch: 8 }, { wch: 8 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    
    const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export to CSV using displayed table data
  const exportScheduleToCSV = (schedules: Schedule[], curriculumYear?: string, semester?: string) => {
    // Group schedules by subject
    const groupedSchedules = groupSchedulesBySubject(schedules);
    
    const csvData = groupedSchedules.map((item) => ({
      'Subject Code': item.subjectCode || '',
      'Subject Name': item.subjectName || '',
      'Days': item.day || '',
      'Time': item.timeRange || formatTimeRange(item.startTime || '', item.endTime || ''),
      'Room': item.roomName || '',
      'Faculty': item.facultyName || '',
      'Units': item.units || 0,
      'Lecture': item.lec || 0,
      'Lab': item.lab || 0,
      'Students': item.students || '0/50',
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

  // Handle edit schedule
  const handleEditSchedule = (schedule: Schedule) => {
    setEditScheduleItem(schedule);
    setIsAddingNew(false);
    setSubjectSearch(schedule.subjectCode || '');
    setFacultySearch(schedule.facultyName || '');
    
    // Load all sessions for this subject
    const allSubjectSessions = filteredSchedules.filter(s => 
      s.subjectCode === schedule.subjectCode &&
      s.program === schedule.program &&
      s.yearLevel === schedule.yearLevel &&
      s.semester === schedule.semester
    );
    
    // Convert to session format
    const sessions = allSubjectSessions.map(s => ({
      day: s.day || '',
      type: s.type || 'Lecture',
      startTime: s.startTime || '',
      endTime: s.endTime || '',
      roomName: s.roomName || ''
    }));
    
    setScheduleSessions(sessions.length > 0 ? sessions : [{
      day: schedule.day || '',
      type: schedule.type || 'Lecture',
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      roomName: schedule.roomName || ''
    }]);
    
    setShowEditModal(true);
  };

  // Handle add new schedule
  const handleAddSchedule = () => {
    setEditScheduleItem({
      id: '',
      subject: '',
      subjectCode: '',
      subjectName: '',
      units: 0,
      lec: 0,
      lab: 0,
      startTime: '',
      endTime: '',
      faculty: '',
      facultyId: '',
      facultyName: '',
      room: '',
      time: '',
      day: '',
      semester: filterSemester || '1st Semester',
      academicYear: curriculumYear,
      program: userData?.department || '',
      yearLevel: '',
      roomName: '',
      type: 'Lecture',
      totalStudents: 0
    });
    setIsAddingNew(true);
    setSubjectSearch('');
    setFacultySearch('');
    setScheduleSessions([{ day: '', type: 'Lecture', startTime: '', endTime: '', roomName: '' }]);
    setShowEditModal(true);
  };

  // Handle save schedule (update or create) - with multiple sessions
  const handleSaveSchedule = async () => {
    if (!editScheduleItem) return;

    try {
      // Prepare the base data with all fields including totalStudents and students
      const baseData = {
        subjectCode: editScheduleItem.subjectCode,
        subjectName: editScheduleItem.subjectName,
        units: editScheduleItem.units || 0,
        lec: editScheduleItem.lec || 0,
        lab: editScheduleItem.lab || 0,
        facultyId: editScheduleItem.facultyId,
        facultyName: editScheduleItem.facultyName,
        semester: editScheduleItem.semester,
        academicYear: editScheduleItem.academicYear,
        program: editScheduleItem.program,
        yearLevel: editScheduleItem.yearLevel,
        students: editScheduleItem.students || '0/50',
        totalStudents: editScheduleItem.totalStudents || 0
      };


      if (isAddingNew) {
        // Create new schedules for each session
        const promises = scheduleSessions.map(session => 
          api.post('/schedules/generation/items', {
            ...baseData,
            day: session.day,
            type: session.type,
            startTime: session.startTime,
            endTime: session.endTime,
            roomName: session.roomName,
            room: session.roomName
          })
        );
        
        await Promise.all(promises);
        toast.success('Schedule(s) added successfully!');
      } else {
        // Edit mode: Delete old sessions and create new ones
        // First, get all existing sessions for this subject
        const existingSessions = filteredSchedules.filter(s => 
          s.subjectCode === editScheduleItem.subjectCode &&
          s.program === editScheduleItem.program &&
          s.yearLevel === editScheduleItem.yearLevel &&
          s.semester === editScheduleItem.semester
        );
        
        // Delete all existing sessions
        await Promise.all(existingSessions.map(session => 
          api.delete(`/schedules/generation/items/${session.id}`)
        ));
        
        // Create new sessions
        const promises = scheduleSessions.map(session => 
          api.post('/schedules/generation/items', {
            ...baseData,
            day: session.day,
            type: session.type,
            startTime: session.startTime,
            endTime: session.endTime,
            roomName: session.roomName,
            room: session.roomName
          })
        );
        
        await Promise.all(promises);
        toast.success('Schedule updated successfully!');
      }
      
      // Refresh schedules
      const fetchResponse = await api.get(`/schedules/generation/items?academicYear=${curriculumYear}`);
      setSchedules(fetchResponse.data?.data || []);
      
      setShowEditModal(false);
      setEditScheduleItem(null);
      setScheduleSessions([{ day: '', type: 'Lecture', startTime: '', endTime: '', roomName: '' }]);
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = (schedule: Schedule) => {
    setDeleteScheduleItem(schedule);
    setShowDeleteModal(true);
  };

  // Confirm delete schedule - Delete ALL sessions for this subject
  const confirmDeleteSchedule = async () => {
    if (!deleteScheduleItem) return;

    try {
      // Get all sessions for this subject
      const allSubjectSessions = filteredSchedules.filter(s => 
        s.subjectCode === deleteScheduleItem.subjectCode &&
        s.program === deleteScheduleItem.program &&
        s.yearLevel === deleteScheduleItem.yearLevel &&
        s.semester === deleteScheduleItem.semester
      );

      // Delete all sessions
      await Promise.all(allSubjectSessions.map(session => 
        api.delete(`/schedules/generation/items/${session.id}`)
      ));
      
      toast.success(`Deleted ${allSubjectSessions.length} schedule session(s) successfully!`);
      
      // Refresh schedules
      const fetchResponse = await api.get(`/schedules/generation/items?academicYear=${curriculumYear}`);
      setSchedules(fetchResponse.data?.data || []);
      
      setShowDeleteModal(false);
      setDeleteScheduleItem(null);
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    }
  };

  // Add new session
  const addSession = () => {
    setScheduleSessions([...scheduleSessions, {
      day: '',
      type: 'Lecture',
      startTime: '',
      endTime: '',
      roomName: ''
    }]);
  };

  // Remove session
  const removeSession = (index: number) => {
    if (scheduleSessions.length > 1) {
      setScheduleSessions(scheduleSessions.filter((_, i) => i !== index));
    }
  };

  // Update session
  const updateSession = (index: number, field: keyof ScheduleSession, value: string) => {
    const updated = [...scheduleSessions];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleSessions(updated);
  };

  // Search subjects
  const searchSubjects = async (query: string) => {
    setSubjectSearch(query);
    if (query.length < 2) {
      setSubjectSuggestions([]);
      setShowSubjectDropdown(false);
      return;
    }

    try {
      // Use the schedules/generation/prospectus endpoint to get subjects
      const response = await api.get(`/schedules/generation/prospectus?academicYear=${curriculumYear}&program=${userData?.department}`);
      
      if (response.data?.success && response.data?.data) {
        // Extract unique subjects from the prospectus data
        const allSubjects: any[] = [];
        const subjectMap = new Map();
        
        Object.values(response.data.data).forEach((yearData: any) => {
          Object.values(yearData).forEach((semesterSubjects: any) => {
            if (Array.isArray(semesterSubjects)) {
              semesterSubjects.forEach((subject: any) => {
                const key = subject.code;
                if (!subjectMap.has(key) && subject.code.toLowerCase().includes(query.toLowerCase())) {
                  subjectMap.set(key, {
                    code: subject.code,
                    name: subject.title,
                    units: subject.total,
                    lec: subject.lec,
                    lab: subject.lab
                  });
                }
              });
            }
          });
        });
        
        setSubjectSuggestions(Array.from(subjectMap.values()));
        setShowSubjectDropdown(true);
      }
    } catch (error) {
      console.error('Error searching subjects:', error);
      setSubjectSuggestions([]);
    }
  };

  // Search faculty
  const searchFaculty = async (query: string) => {
    setFacultySearch(query);
    if (query.length < 2) {
      setFacultySuggestions([]);
      setShowFacultyDropdown(false);
      return;
    }

    try {
      // Get all faculty from existing schedules
      const uniqueFaculty = new Map();
      schedules.forEach(schedule => {
        if (schedule.facultyName && 
            schedule.facultyName.toLowerCase().includes(query.toLowerCase())) {
          const key = schedule.facultyId || schedule.faculty;
          if (!uniqueFaculty.has(key)) {
            uniqueFaculty.set(key, {
              id: schedule.facultyId || schedule.faculty,
              firstname: schedule.facultyName.split(' ')[0] || '',
              lastname: schedule.facultyName.split(' ').slice(1).join(' ') || '',
              email: '',
              department: schedule.program
            });
          }
        }
      });
      
      setFacultySuggestions(Array.from(uniqueFaculty.values()));
      setShowFacultyDropdown(true);
    } catch (error) {
      console.error('Error searching faculty:', error);
      setFacultySuggestions([]);
    }
  };

  // Select subject from suggestions
  const selectSubject = (subject: any) => {
    if (editScheduleItem) {
      setEditScheduleItem({
        ...editScheduleItem,
        subjectCode: subject.code,
        subjectName: subject.name,
        units: subject.units || 0,
        lec: subject.lec || 0,
        lab: subject.lab || 0
      });
      setSubjectSearch(subject.code);
      setShowSubjectDropdown(false);
    }
  };

  // Select faculty from suggestions
  const selectFaculty = (faculty: any) => {
    if (editScheduleItem) {
      setEditScheduleItem({
        ...editScheduleItem,
        facultyId: faculty.id,
        facultyName: `${faculty.firstname} ${faculty.lastname}`,
        faculty: faculty.id
      });
      setFacultySearch(`${faculty.firstname} ${faculty.lastname}`);
      setShowFacultyDropdown(false);
    }
  };

  // Search rooms
  const searchRooms = (query: string, sessionIndex: number) => {
    if (query.length < 1) {
      setRoomSuggestions([]);
      setShowRoomDropdown(null);
      return;
    }

    // Get unique rooms from existing schedules
    const uniqueRooms = new Set<string>();
    schedules.forEach(schedule => {
      if (schedule.roomName && 
          schedule.roomName.toLowerCase().includes(query.toLowerCase())) {
        uniqueRooms.add(schedule.roomName);
      }
    });
    
    setRoomSuggestions(Array.from(uniqueRooms));
    setShowRoomDropdown(sessionIndex);
  };

  // Select room from suggestions
  const selectRoom = (room: string, sessionIndex: number) => {
    updateSession(sessionIndex, 'roomName', room);
    setShowRoomDropdown(null);
  };


  return (
    <div className="min-h-screen">
      <div className="w-[1220px] mx-auto  max-w-full  overflow-x-auto">

        {/* Generated Schedules Table */}
        <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
              {/* Header with Title */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Table className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Generated Schedules</h3>
                    <p className="text-blue-100 text-sm">Detailed view of all schedule items</p>
                  </div>
                </div>
                <Button
                  onClick={handleAddSchedule}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
              
              {/* Filter Controls - All in one row */}
              <div className="flex items-center gap-3">
                {/* Search Faculty */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                
                {/* Filter by Semester */}
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-4 py-2.5 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[160px]"
                >
                  <option value="all" className="text-gray-900">All Semesters</option>
                  <option value="1st Semester" className="text-gray-900">1st Semester</option>
                  <option value="2nd Semester" className="text-gray-900">2nd Semester</option>
                  <option value="Summer" className="text-gray-900">Summer</option>
                </select>

                {/* Filter by Year Level */}
                <select
                  value={filterYearLevel}
                  onChange={(e) => setFilterYearLevel(e.target.value)}
                  className="px-4 py-2.5 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[140px]"
                >
                  <option value="all" className="text-gray-900">All Year Levels</option>
                  <option value="1st Year" className="text-gray-900">1st Year</option>
                  <option value="2nd Year" className="text-gray-900">2nd Year</option>
                  <option value="3rd Year" className="text-gray-900">3rd Year</option>
                  <option value="4th Year" className="text-gray-900">4th Year</option>
                </select>

                {/* Curriculum Year */}
                <div className="flex items-center gap-2">
                  {/* <span className="text-sm font-medium whitespace-nowrap">Curriculum Year:</span> */}
                  <Select value={curriculumYear} onValueChange={setCurriculumYear}>
                    <SelectTrigger className="w-[140px] bg-white text-gray-900 border-white/50 hover:bg-white/95 focus:ring-2 focus:ring-white/50 font-semibold">
                      
                      <SelectValue placeholder="Select Year" />
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
                </div>

                {/* Export */}
                <Select 
                  onValueChange={(value) => handleExportSchedule(value as 'pdf' | 'excel' | 'csv')}
                >
                  <SelectTrigger className="w-[130px] bg-white text-gray-900 border-white/50 hover:bg-white/95 focus:ring-2 focus:ring-white/50 font-semibold">
                    <SelectValue placeholder="Export as..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="pdf" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-900 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span>PDF</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="excel" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-900 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        <span>Excel</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                      {/* Number of Students */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <span>Number of Students</span>
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
                      {/* Total Students */}
                      {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <span>Students</span>
                        </div>
                      </th> */}
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
                              <td className="px- py-5 truncate max-w-50">
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

                              {/* Number of Students */}
                              <td className="px-6 py-5 whitespace-nowrap">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                                  <Users className="h-3 w-3 mr-1 inline" />
                                  {firstSubject.students || '0/50'}
                                </Badge>
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
                                      // Get the specific faculty's max units based on their role
                                      const faculty = instructors.find(i => i.id.toString() === facultyId);
                                      const maxUnits = faculty?.role === 'CAMPUS_ADMIN' ? 6 : facultyMaxUnits;
                                      const isOverloaded = assignedUnits > maxUnits;
                                      return (
                                        <span className={isOverloaded ? 'text-red-600 font-medium' : ''}>
                                          {assignedUnits}/{maxUnits} units
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
                              
                              {/* Total Students */}
                              {/* <td className="px-6 py-5 whitespace-nowrap">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                                  {firstSubject.totalStudents || 0}
                                </Badge>
                              </td> */}
                              
                              {/* Actions */}
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditSchedule(firstSubject)}
                                    className="flex items-center gap-2 hover:bg-green-50 text-green-600 border-green-300"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSchedule(firstSubject)}
                                    className="flex items-center gap-2 hover:bg-red-50 text-red-600 border-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
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
               
                </div>
              </div>
            )}
          </CardContent>
        </Card>


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

                {/* Number of Students */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Students
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-4 py-2 bg-indigo-100 text-indigo-800 border-indigo-300 font-bold">
                      <Users className="h-4 w-4 mr-2 inline" />
                      {viewScheduleItem.students || '0/50'}
                    </Badge>
                    <p className="text-xs text-indigo-600">
                      Current enrollment / Maximum capacity
                    </p>
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

        {/* Edit/Add Schedule Modal */}
        {showEditModal && editScheduleItem && (
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isAddingNew ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {isAddingNew ? <Plus className="h-6 w-6 text-green-600" /> : <Edit className="h-6 w-6 text-blue-600" />}
                  </div>
                  <div>
                    <span className="text-xl font-bold">{isAddingNew ? 'Add New Schedule' : 'Edit Schedule'}</span>
                    <p className="text-sm text-gray-500 font-normal">
                      {isAddingNew ? 'Fill in the details to create a new schedule' : `Editing: ${editScheduleItem.subjectCode}`}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Subject Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Subject Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-xs text-blue-700 font-medium block mb-1">Subject Code *</label>
                      <input
                        type="text"
                        value={subjectSearch}
                        onChange={(e) => searchSubjects(e.target.value)}
                        onFocus={() => subjectSearch.length >= 2 && setShowSubjectDropdown(true)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type to search subjects..."
                      />
                      {showSubjectDropdown && subjectSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-blue-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {subjectSuggestions.map((subject, index) => (
                            <div
                              key={index}
                              onClick={() => selectSubject(subject)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                            >
                              <div className="font-semibold text-sm text-blue-900">{subject.code}</div>
                              <div className="text-xs text-gray-600">{subject.name}</div>
                              <div className="text-xs text-gray-500">Units: {subject.units} (Lec: {subject.lec}, Lab: {subject.lab})</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">Subject Name *</label>
                      <input
                        type="text"
                        value={editScheduleItem.subjectName || ''}
                        onChange={(e) => setEditScheduleItem({ ...editScheduleItem, subjectName: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Introduction to Programming"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">Year Level *</label>
                      <select
                        value={editScheduleItem.yearLevel || ''}
                        onChange={(e) => setEditScheduleItem({ ...editScheduleItem, yearLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Year Level</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">Semester *</label>
                      <select
                        value={editScheduleItem.semester || ''}
                        onChange={(e) => setEditScheduleItem({ ...editScheduleItem, semester: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule Information - Multiple Sessions */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Schedule Sessions ({scheduleSessions.length})
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addSession}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Session
                    </Button>
                  </div>
                  
                  {/* Always show multiple sessions interface */}
                  {true ? (
                    <div className="space-y-4">
                      {scheduleSessions.map((session, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-green-300 relative">
                          {scheduleSessions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSession(index)}
                              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          <div className="text-xs font-semibold text-green-800 mb-3">Session {index + 1}</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-green-700 font-medium block mb-1">Day *</label>
                              <select
                                value={session.day}
                                onChange={(e) => updateSession(index, 'day', e.target.value)}
                                className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">Select Day</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-green-700 font-medium block mb-1">Type *</label>
                              <select
                                value={session.type}
                                onChange={(e) => updateSession(index, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                <option value="Lecture">Lecture</option>
                                <option value="Laboratory">Laboratory</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-green-700 font-medium block mb-1">Start Time *</label>
                              <input
                                type="time"
                                value={session.startTime}
                                onChange={(e) => updateSession(index, 'startTime', e.target.value)}
                                className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-green-700 font-medium block mb-1">End Time *</label>
                              <input
                                type="time"
                                value={session.endTime}
                                onChange={(e) => updateSession(index, 'endTime', e.target.value)}
                                className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <label className="text-xs text-green-700 font-medium block mb-1">Room *</label>
                              <input
                                type="text"
                                value={session.roomName}
                                onChange={(e) => {
                                  updateSession(index, 'roomName', e.target.value);
                                  searchRooms(e.target.value, index);
                                }}
                                onFocus={() => session.roomName && searchRooms(session.roomName, index)}
                                className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Room 101"
                              />
                              {showRoomDropdown === index && roomSuggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-green-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                  {roomSuggestions.map((room, roomIndex) => (
                                    <div
                                      key={roomIndex}
                                      onClick={() => selectRoom(room, index)}
                                      className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                                    >
                                      <div className="text-sm text-green-900">{room}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">Day *</label>
                        <select
                          value={editScheduleItem?.day || ''}
                          onChange={(e) => editScheduleItem && setEditScheduleItem({ ...editScheduleItem, day: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">Type *</label>
                        <select
                          value={editScheduleItem?.type || 'Lecture'}
                          onChange={(e) => editScheduleItem && setEditScheduleItem({ ...editScheduleItem, type: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="Lecture">Lecture</option>
                          <option value="Laboratory">Laboratory</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">Start Time *</label>
                        <input
                          type="time"
                          value={editScheduleItem?.startTime || ''}
                          onChange={(e) => editScheduleItem && setEditScheduleItem({ ...editScheduleItem, startTime: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">End Time *</label>
                        <input
                          type="time"
                          value={editScheduleItem?.endTime || ''}
                          onChange={(e) => editScheduleItem && setEditScheduleItem({ ...editScheduleItem, endTime: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-green-700 font-medium block mb-1">Room *</label>
                        <input
                          type="text"
                          value={editScheduleItem?.roomName || ''}
                          onChange={(e) => editScheduleItem && setEditScheduleItem({ ...editScheduleItem, roomName: e.target.value, room: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., Room 101"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Faculty Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Faculty Information
                  </h3>
                  <div className="relative">
                    <label className="text-xs text-purple-700 font-medium block mb-1">Faculty Name *</label>
                    <input
                      type="text"
                      value={facultySearch}
                      onChange={(e) => searchFaculty(e.target.value)}
                      onFocus={() => facultySearch.length >= 2 && setShowFacultyDropdown(true)}
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Type to search faculty..."
                    />
                    {showFacultyDropdown && facultySuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-purple-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {facultySuggestions.map((faculty, index) => (
                          <div
                            key={index}
                            onClick={() => selectFaculty(faculty)}
                            className="px-3 py-2 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="font-semibold text-sm text-purple-900">
                              {faculty.firstname} {faculty.lastname}
                            </div>
                            <div className="text-xs text-gray-600">{faculty.email}</div>
                            <div className="text-xs text-gray-500">{faculty.department}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Units Information */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Units Information
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-yellow-700 font-medium block mb-1">Lecture Units *</label>
                      <input
                        type="number"
                        min="0"
                        value={editScheduleItem.lec || 0}
                        onChange={(e) => {
                          const lec = parseInt(e.target.value) || 0;
                          const lab = editScheduleItem.lab || 0;
                          setEditScheduleItem({ ...editScheduleItem, lec, units: lec + lab });
                        }}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-700 font-medium block mb-1">Lab Units *</label>
                      <input
                        type="number"
                        min="0"
                        value={editScheduleItem.lab || 0}
                        onChange={(e) => {
                          const lab = parseInt(e.target.value) || 0;
                          const lec = editScheduleItem.lec || 0;
                          setEditScheduleItem({ ...editScheduleItem, lab, units: lec + lab });
                        }}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-700 font-medium block mb-1">Total Units</label>
                      <input
                        type="number"
                        value={editScheduleItem.units || 0}
                        readOnly
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm bg-yellow-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Number of Students */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Students
                  </h3>
                  <div>
                    <label className="text-xs text-indigo-700 font-medium block mb-1">
                      Number of Students (format: current/max) *
                    </label>
                    <input
                      type="text"
                      value={editScheduleItem.students || '0/50'}
                      onChange={(e) => setEditScheduleItem({ ...editScheduleItem, students: e.target.value })}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 0/50"
                    />
                    <p className="text-xs text-indigo-600 mt-1">
                      Enter the current enrollment and maximum capacity (e.g., 25/50)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setShowEditModal(false);
                  setEditScheduleItem(null);
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSchedule} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  {isAddingNew ? 'Add Schedule' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deleteScheduleItem && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-xl font-bold">Delete Schedule</span>
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this schedule? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Schedule Details */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-red-700 font-medium">Subject:</span>
                      <p className="text-sm font-semibold text-red-900">
                        {deleteScheduleItem.subjectCode} - {deleteScheduleItem.subjectName}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-red-700 font-medium">Faculty:</span>
                        <p className="text-sm text-red-900">{deleteScheduleItem.facultyName}</p>
                      </div>
                      <div>
                        <span className="text-xs text-red-700 font-medium">Day:</span>
                        <p className="text-sm text-red-900">{deleteScheduleItem.day}</p>
                      </div>
                      <div>
                        <span className="text-xs text-red-700 font-medium">Time:</span>
                        <p className="text-sm text-red-900">
                          {formatTimeRange(deleteScheduleItem.startTime || '', deleteScheduleItem.endTime || '')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-red-700 font-medium">Room:</span>
                        <p className="text-sm text-red-900">{deleteScheduleItem.roomName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteScheduleItem(null);
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={confirmDeleteSchedule} className="bg-red-600 hover:bg-red-700 text-white">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Schedule
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
