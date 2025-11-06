import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, ChevronDown, Printer, Grid, CalendarDays } from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer, Views, type View } from 'react-big-calendar';
import moment from 'moment';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import api from '../../../api/axios';
import { useToast } from '../../../hooks/useToast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '../../../hooks/redux';
import { useReactToPrint } from 'react-to-print';
// import './TeachingLoad.css';

// Add print styles
const printStyles = `
  @media print {
    /* Hide non-essential elements */
    .no-print {
      display: none !important;
    }
    
    /* Hide navbar and other UI elements */
    nav, header, .sidebar, .navbar, [role="navigation"] {
      display: none !important;
    }
    
    /* Page setup - FIT TO ONE LANDSCAPE PAGE */
    @page {
      size: landscape;
      margin: 8mm;
    }
    
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Container adjustments - FILL ENTIRE PAGE */
    .print-container {
      width: 100%;
      max-width: none;
      padding: 0;
      background: white !important;
      margin: 0 !important;
      transform: scale(0.95);
      transform-origin: top center;
      page-break-after: avoid;
      page-break-inside: avoid;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    /* Print header - PROFESSIONAL DESIGN */
    .print-header {
      display: flex !important;
      flex-direction: column;
      align-items: center;
      margin-bottom: 8px;
      padding: 8px 0;
      border-bottom: 2px solid #333;
    }
    
    .print-header-circle {
      width: 55px;
      height: 55px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex !important;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
      font-size: 18px;
      font-weight: 700;
      color: white;
      letter-spacing: 1px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .print-header h1 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 3px 0;
      color: #1a1a1a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    
    .print-header p {
      font-size: 10px;
      margin: 0 0 4px 0;
      color: #666;
      font-weight: 500;
      font-style: italic;
    }
    
    /* Table styling for print - FILL PAGE */
    .print-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background: white;
      border: 2px solid #333;
      table-layout: fixed;
      border-radius: 4px;
      overflow: hidden;
      flex: 1;
    }
    
    .print-table th,
    .print-table td {
      border-right: 1px solid #ddd !important;
      border-bottom: 1px solid #ddd !important;
      padding: 6px 4px !important;
      text-align: center !important;
      vertical-align: top !important;
    }
    
    .print-table th:last-child,
    .print-table td:last-child {
      border-right: none !important;
    }
    
    .print-table th {
      background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%) !important;
      color: #1a1a1a !important;
      font-weight: 700 !important;
      font-size: 9px !important;
      padding: 8px 4px !important;
      border-bottom: 2px solid #333 !important;
    }
    
    .print-table td {
      min-height: 50px !important;
      height: 50px !important;
      font-size: 8px !important;
      background: white !important;
      overflow: hidden;
    }
    
    .print-table tbody tr:nth-child(even) td {
      background: #f8f9fa !important;
    }
    
    /* Day header badges - MODERN DESIGN */
    .day-badge-print {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 9px;
      color: white !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    
    /* Time column - LARGER FOR READABILITY */
    .time-column-print {
      background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%) !important;
      font-weight: 700 !important;
      font-size: 8px !important;
      color: #1a1a1a !important;
      width: 50px !important;
      max-width: 50px !important;
      min-width: 50px !important;
      padding: 6px 4px !important;
      text-align: center !important;
      vertical-align: middle !important;
      writing-mode: horizontal-tb !important;
      transform: none !important;
      border-right: 2px solid #333 !important;
    }
    
    .print-time-display {
      display: inline !important;
    }
    
    /* Schedule card styling - LARGER FOR VISIBILITY */
    .schedule-subject-card {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%) !important;
      color: #1a1a1a !important;
      padding: 4px !important;
      border-radius: 2px !important;
      font-size: 7px !important;
      line-height: 1.4 !important;
      margin: 2px !important;
      text-align: left !important;
      border-left: 2px solid #667eea !important;
      position: relative !important;
      display: block !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
    }
    
    .schedule-subject-card .font-medium {
      font-weight: 600 !important;
      color: #333 !important;
      margin-bottom: 2px !important;
      display: block !important;
      font-size: 8px !important;
    }
    
    .schedule-subject-card .opacity-75,
    .schedule-subject-card .opacity-60 {
      opacity: 1 !important;
      color: #666 !important;
      font-size: 7px !important;
      display: block !important;
      margin: 2px 0 !important;
    }
    
    /* Hide time display in schedule cards for print */
    .schedule-subject-card .opacity-60 {
      display: none !important;
    }
    
    .schedule-code {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
      font-size: 8px;
    }
    
    .schedule-time {
      color: #666;
      font-size: 7px;
      margin-bottom: 3px;
    }
    
    .schedule-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 2px;
      font-size: 7px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 2px;
    }
    
    .badge-lab1 {
      background-color: #f4c430 !important;
      color: #333 !important;
    }
    
    .badge-lab2 {
      background-color: #a8b8c8 !important;
      color: white !important;
    }
    
    .badge-lec {
      background-color: #6b9b6e !important;
      color: white !important;
    }
    
    /* Avoid page breaks inside table rows */
    tr {
      page-break-inside: avoid;
    }
  }
`;

const localizer = momentLocalizer(moment);

interface FacultySchedule {
  id: string;
  name: string;
  department: string;
  employmentType: 'Full Time' | 'Part Time';
  totalUnits: number;
  schedule: {
    [day: string]: {
      [time: string]: {
        subject: string;
        code: string;
        room?: string;
        startTime: string;
        endTime: string;
      } | null;
    };
  };
}

interface TimeSlot {
  time: string;
  display: string;
  endTime: string;
}

type ViewMode = 'grid' | 'calendar';

const TeachingLoad = () => {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultySchedule | null>(null);
  const [facultyList, setFacultyList] = useState<FacultySchedule[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
  const [isLoading, setIsLoading] = useState(false);
  const [curriculumYear, setCurriculumYear] = useState('2025-2026');
  const [semester, setSemester] = useState('1st Semester');
  const toast = useToast();
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const userData = useAppSelector((state) => state.auth.user);
  const id = userData?.id;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Teaching_Load_${selectedFaculty?.name || 'Schedule'}_${curriculumYear}`,
    pageStyle: `
      @page {
        size: landscape;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `
  });

  const timeSlots: TimeSlot[] = [
    { time: '7:00', display: '7:00 AM', endTime: '8:00' },
    { time: '8:00', display: '8:00 AM', endTime: '9:00' },
    { time: '9:00', display: '9:00 AM', endTime: '10:00' },
    { time: '10:00', display: '10:00 AM', endTime: '11:00' },
    { time: '11:00', display: '11:00 AM', endTime: '12:00' },
    { time: '12:00', display: '12:00 PM', endTime: '13:00' },
    { time: '13:00', display: '1:00 PM', endTime: '14:00' },
    { time: '14:00', display: '2:00 PM', endTime: '15:00' },
    { time: '15:00', display: '3:00 PM', endTime: '16:00' },
    { time: '16:00', display: '4:00 PM', endTime: '17:00' },
    { time: '17:00', display: '5:00 PM', endTime: '18:00' },
    { time: '18:00', display: '6:00 PM', endTime: '19:00' },
    { time: '19:00', display: '7:00 PM', endTime: '20:00' },
    { time: '20:00', display: '8:00 PM', endTime: '21:00' },
  ];

  // Inject print styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    
  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    } 
  };
  fetchAcademicYears();

  } , [])

  // Dynamic color mapping based on time range
  const getTimeRangeColor = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    const isPM = startTime.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
    
    // Color mapping based on time ranges
    if (hour24 >= 7 && hour24 < 9) return 'bg-blue-500';      // 7:00-8:59 AM - Blue
    if (hour24 >= 9 && hour24 < 11) return 'bg-green-500';    // 9:00-10:59 AM - Green
    if (hour24 >= 11 && hour24 < 13) return 'bg-yellow-500';  // 11:00 AM-12:59 PM - Yellow
    if (hour24 >= 13 && hour24 < 15) return 'bg-orange-500';  // 1:00-2:59 PM - Orange
    if (hour24 >= 15 && hour24 < 17) return 'bg-purple-500';  // 3:00-4:59 PM - Purple
    if (hour24 >= 17 && hour24 < 19) return 'bg-red-500';     // 5:00-6:59 PM - Red
    if (hour24 >= 19 && hour24 < 21) return 'bg-indigo-500';  // 7:00-8:59 PM - Indigo
    
    return 'bg-gray-500'; // Default for other times
  };

  // Get darker shade for hover effects based on time range
  const getTimeRangeColorDark = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    const isPM = startTime.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
    
    // Darker color mapping based on time ranges
    if (hour24 >= 7 && hour24 < 9) return 'bg-blue-600';      // 7:00-8:59 AM - Blue
    if (hour24 >= 9 && hour24 < 11) return 'bg-green-600';    // 9:00-10:59 AM - Green
    if (hour24 >= 11 && hour24 < 13) return 'bg-yellow-600';  // 11:00 AM-12:59 PM - Yellow
    if (hour24 >= 13 && hour24 < 15) return 'bg-orange-600';  // 1:00-2:59 PM - Orange
    if (hour24 >= 15 && hour24 < 17) return 'bg-purple-600';  // 3:00-4:59 PM - Purple
    if (hour24 >= 17 && hour24 < 19) return 'bg-red-600';     // 5:00-6:59 PM - Red
    if (hour24 >= 19 && hour24 < 21) return 'bg-indigo-600';  // 7:00-8:59 PM - Indigo
    
    return 'bg-gray-600'; // Default for other times
  };

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Transform schedule data to calendar events
  const transformToCalendarEvents = (faculty: FacultySchedule) => {
    const events: any[] = [];
    const currentWeek = moment().startOf('week');
    
    Object.entries(faculty.schedule).forEach(([day, daySchedule]) => {
      const dayIndex = days.indexOf(day);
      if (dayIndex === -1 || !daySchedule) return;
      
      const processedSubjects = new Set<string>();
      
      Object.entries(daySchedule).forEach(([time, scheduleItem]) => {
        if (!scheduleItem) return;
        
        const subjectKey = `${day}-${scheduleItem.subject}-${scheduleItem.startTime}`;
        if (processedSubjects.has(subjectKey)) return;
        
        processedSubjects.add(subjectKey);
        
        const eventDate = currentWeek.clone().add(dayIndex, 'days');
        const startTime = moment(scheduleItem.startTime, 'h:mm A');
        const endTime = moment(scheduleItem.endTime, 'h:mm A');
        
        const start = eventDate.clone()
          .hour(startTime.hour())
          .minute(startTime.minute())
          .toDate();
          
        const end = eventDate.clone()
          .hour(endTime.hour())
          .minute(endTime.minute())
          .toDate();
        
        events.push({
          id: `${faculty.id}-${subjectKey}`,
          title: `${scheduleItem.subject} (${scheduleItem.code})`,
          start,
          end,
          resource: {
            subject: scheduleItem.subject,
            code: scheduleItem.code,
            room: scheduleItem.room,
            faculty: faculty.name
          }
        });
      });
    });
    
    return events;
  };

  // Fetch real data from API
  useEffect(() => {
      const fetchFacultySchedules = async () => {
    try {
      setIsLoading(true);
      
      // Fetch faculty with teaching load
      const facultyResponse = await api.get(`/user/faculty/with-load`);
      const facultyData = facultyResponse.data.filter((f: any) => f.status === 'APPROVED');

      // Fetch all subject schedules
      const schedulesResponse = await api.get('/schedules/latest');
      const schedules = schedulesResponse.data?.scheduleItems || [];

      // Group schedules by faculty
      const facultySchedules: FacultySchedule[] = facultyData.map((faculty: any) => {
        const facultyScheduleItems = schedules.filter(
          (s: any) => String(s.facultyId) === String(userData?.id) && s.academicYear === String(curriculumYear) && s.semester === String(semester)
        );

        // Transform schedules into the required format
        const schedule: any = {};
        
        facultyScheduleItems.forEach((item: any) => {
          const dayMap: any = {
            'M': 'MON',
            'T': 'TUE',
            'W': 'WED',
            'Th': 'THU',
            'F': 'FRI',
            'S': 'SAT',
            'Su': 'SUN',
            'MW': ['MON', 'WED'],
            'TTh': ['TUE', 'THU'],
            'MWF': ['MON', 'WED', 'FRI']
          };

          // Parse day string
          let daysArray: string[] = [];
          if (dayMap[item.day]) {
            daysArray = Array.isArray(dayMap[item.day]) ? dayMap[item.day] : [dayMap[item.day]];
          } else {
            // Try to parse complex day patterns
            if (item.day.includes('MW')) daysArray.push('MON', 'WED');
            else if (item.day.includes('TTh')) daysArray.push('TUE', 'THU');
            else if (item.day.includes('M')) daysArray.push('MON');
            if (item.day.includes('T') && !item.day.includes('Th')) daysArray.push('TUE');
            if (item.day.includes('W')) daysArray.push('WED');
            if (item.day.includes('Th')) daysArray.push('THU');
            if (item.day.includes('F')) daysArray.push('FRI');
            if (item.day.includes('S') && !item.day.includes('Su')) daysArray.push('SAT');
            if (item.day.includes('Su')) daysArray.push('SUN');
          }

          // Convert 24h time to 12h format
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
          };

          const startTime = formatTime(item.startTime);
          const endTime = formatTime(item.endTime);

          // Generate hourly slots
          const startHour = parseInt(item.startTime.split(':')[0]);
          const endHour = parseInt(item.endTime.split(':')[0]);

          daysArray.forEach(day => {
            if (!schedule[day]) schedule[day] = {};

            for (let hour = startHour; hour < endHour; hour++) {
              const hourKey = `${hour}:00`;
              schedule[day][hourKey] = {
                subject: item.subjectName || item.subject,
                code: item.subjectCode,
                room: item.roomName || item.room,
                startTime,
                endTime
              };
            }
          });
        });

        return {
          id: String(faculty.id),
          name: `${faculty.firstname} ${faculty.middleInitial}. ${faculty.lastname}`,
          department: faculty.department,
          employmentType: 'Full Time',
          totalUnits: faculty.totalUnits || 0,
          schedule
        };
      });

      setFacultyList(facultySchedules);
      if (facultySchedules.length > 0) {
        setSelectedFaculty(facultySchedules[0]);
      }
    } catch (error) {
      console.error('Error fetching faculty schedules:', error);
      toast.error('Failed to load faculty schedules');
    } finally {
      setIsLoading(false);
    }
  };

    fetchFacultySchedules();
  }, [curriculumYear, semester]);


  // Simplified schedule processing with improved duration calculation
  const processScheduleForGrid = (faculty: FacultySchedule) => {
    const processedSchedule: { [day: string]: { [time: string]: any } } = {};
    
    days.forEach(day => {
      processedSchedule[day] = {};
      const daySchedule = faculty.schedule[day] || {};
      const processedSubjects = new Set<string>();
      
      timeSlots.forEach(slot => {
        const scheduleItem = daySchedule[slot.time];
        
        if (!scheduleItem) {
          processedSchedule[day][slot.time] = null;
          return;
        }
        
        const subjectKey = `${scheduleItem.subject}-${scheduleItem.startTime}`;
        
        if (processedSubjects.has(subjectKey)) {
          processedSchedule[day][slot.time] = 'skip'; // Mark as skip for rowspan
          return;
        }
        
        processedSubjects.add(subjectKey);
        
        // Calculate precise duration in hours
        const startTime = moment(scheduleItem.startTime, 'h:mm A');
        const endTime = moment(scheduleItem.endTime, 'h:mm A');
        const durationInMinutes = endTime.diff(startTime, 'minutes');
        const duration = Math.max(1, Math.ceil(durationInMinutes / 60)); // Minimum 1 hour, round up
        
        // Calculate exact duration for height calculation (can be fractional)
        const exactDuration = durationInMinutes / 60;
        
        // Calculate precise positioning based on exact start and end times
        const startMinutes = startTime.minutes();
        const endMinutes = endTime.minutes();
        const startHour = startTime.hour();
        const endHour = endTime.hour();
        
        // Calculate offset from the slot start time in minutes
        const slotStartTime = moment(slot.time, 'H:mm'); // Parse 24-hour format slot time
        const offsetMinutes = Math.max(0, startTime.diff(slotStartTime, 'minutes')); // Ensure non-negative offset
        const offsetPercentage = (offsetMinutes / 60) * 100; // Percentage offset within the slot
        

        
        // Calculate the exact height based on precise start and end times
        const totalDurationMinutes = endTime.diff(startTime, 'minutes');
        const exactHeightDuration = totalDurationMinutes / 60;
        
        processedSchedule[day][slot.time] = {
          ...scheduleItem,
          duration, // For rowspan (integer)
          exactDuration, // For height calculation (can be fractional)
          exactHeightDuration, // Precise height based on exact start/end times
          offsetPercentage, // Vertical offset percentage within the slot
          offsetMinutes, // Exact offset in minutes from slot start
          totalDurationMinutes, // Total duration in minutes for precise calculations
          colorClass: getTimeRangeColor(scheduleItem.startTime),
          colorClassDark: getTimeRangeColorDark(scheduleItem.startTime),
          durationText: `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m`
        };
      });
    });
    
    return processedSchedule;
  };

  /**
   * Calculate dynamic height based on class duration and screen size
   * 
   * This function implements dynamic height scaling for schedule blocks:
   * - Base height: 64px (desktop) / 48px (mobile) for 1-hour classes
   * - Height scales proportionally with duration
   * - Examples:
   *   - 1 hour class: 64px height
   *   - 2 hour class: 128px height (7:00 AM - 9:00 AM)
   *   - 3 hour class: 192px height (11:00 AM - 2:00 PM)
   *   - 1.5 hour class: 96px height (fractional durations supported)
   * 
   * @param duration - Duration in hours (can be fractional, e.g., 1.5 for 90 minutes)
   * @returns Height in pixels for the schedule block
   */
  const calculateCellHeight = (duration: number) => {
    // Check if screen is mobile (640px or less)
    const isMobile = window.innerWidth <= 640;
    const baseHeight = isMobile ? 48 : 64; // Base height for 1 hour in pixels
    return Math.round(duration * baseHeight); // Round to avoid fractional pixels
  };

  // Add window resize listener to recalculate heights on screen size change
  useEffect(() => {
    const handleResize = () => {
      // Force re-render when screen size changes
      setSelectedFaculty(prev => prev ? { ...prev } : null);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderGridCell = (day: string, time: string, processedSchedule: any) => {
    const cellData = processedSchedule[day]?.[time];
    
    if (cellData === 'skip') {
      return null; // This cell is covered by a rowspan
    }
    
    if (!cellData) {
      return (
        <td key={`${day}-${time}`} className="p-0 border border-gray-200 h-16">
          <div className="h-16"></div>
        </td>
      );
    }
    
    // Calculate precise height based on exact start and end times
    const baseSlotHeight = window.innerWidth <= 640 ? 48 : 64; // Same as calculateCellHeight base
    const dynamicHeight = Math.round((cellData.exactHeightDuration || cellData.exactDuration || cellData.duration) * baseSlotHeight);
    
    // Calculate the top offset based on the offsetPercentage
    const baseSlotHeightForOffset = window.innerWidth <= 640 ? 48 : 64;
    const topOffset = (cellData.offsetPercentage / 100) * baseSlotHeightForOffset;
    
    return (
      <td 
        key={`${day}-${time}`} 
        className="p-0 border text-nowrap border-gray-200 relative" 
        rowSpan={cellData.duration}
        // style={{ height: `${dynamicHeight}px` }}
      >
        <div 
          className={`schedule-subject-card text-white text-xs absolute left-0 right-0`}
          style={{ 
            height: `${dynamicHeight - 2}px`, // Subtract 2px for border
            minHeight: `${dynamicHeight - 2}px`,
            top: `${topOffset}px`, // Position based on exact start time within the hour
            backgroundColor: cellData.colorClass.replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
                            cellData.colorClass.replace('bg-', '').replace('-500', '') === 'green' ? '#10b981' :
                            cellData.colorClass.replace('bg-', '').replace('-500', '') === 'yellow' ? '#f59e0b' :
                            cellData.colorClass.replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' :
                            cellData.colorClass.replace('bg-', '').replace('-500', '') === 'purple' ? '#8b5cf6' :
                            cellData.colorClass.replace('bg-', '').replace('-500', '') === 'red' ? '#ef4444' :
                            cellData.colorClass.replace('bg-', '').replace('-500', '') === 'indigo' ? '#6366f1' :
                            '#6b7280' // gray default
          }}
        >
          <div className="font-medium text-center">{cellData.code} - {cellData.subject}</div>
          {cellData.room && <div className="opacity-75 text-center">{cellData.room}</div>}
          <div className="opacity-60 mt-1 text-center text-xs">
            {cellData.startTime} - {cellData.endTime}
          </div>
     {/*     {cellData.exactDuration > 1 && (
            <div className="opacity-50 text-center text-xs mt-1 font-medium">
              Duration: {cellData.durationText}
            </div>
          )} */}
        </div>
      </td>
    );
  };
  // Get faculty initials for print
  const getFacultyInitials = (name: string) => {
    if (!name) return 'DR';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen print-container" ref={printRef}>
        {/* Print Header - Only visible when printing */}
        <div className="print-header" style={{ display: 'none' }}>
          <div className="print-header-circle">
            {getFacultyInitials(selectedFaculty?.name || '')}
          </div>
          <h1>{(selectedFaculty?.name || 'Faculty Name').toUpperCase()}</h1>
          <p>Class schedule</p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0 no-print">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">View Teaching Load</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* View Toggle */}
            <div className="view-toggle-container flex p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle-button flex items-center space-x-2 px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'active text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
                <span>Grid View</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`view-toggle-button flex items-center space-x-2 px-3 py-2 text-sm font-medium ${
                  viewMode === 'calendar'
                    ? 'active text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Calendar View</span>
              </button>
            </div>
            <button 
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print Schedule"
            >
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Faculty Selection */}
        <div className="bg-white rounded-lg shadow mb-2 no-print">

          {/* <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Faculty Loading ({selectedFaculty?.employmentType})</span>
          </div> */}
          
          {/* <div className="mt-4 relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between w-full max-w-md px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {selectedFaculty ? selectedFaculty.name : 'Select Faculty'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-md shadow-lg">
                {facultyList.map((faculty) => (
                  <button
                    key={faculty.id}
                    onClick={() => {
                      setSelectedFaculty(faculty);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="text-sm font-medium text-gray-900">{faculty.name}</div>
                    <div className="text-xs text-gray-500">{faculty.department} • {faculty.employmentType}</div>
                  </button>
                ))}
              </div>
            )}
          </div> */}
          
          {/* {selectedFaculty && (
            <div className="mt-4 text-sm text-gray-600">
              Total No. of Units Loaded: {selectedFaculty.totalUnits}
            </div>
          )} */}
                  <div className="space-y-6 p-4 flex gap-4">
          {/* Curriculum Year Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Curriculum Year <span className="text-red-500">*</span>
            </label>
            <Select 
              value={curriculumYear} 
              onValueChange={setCurriculumYear}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder= "Select curriculum year"/>
              </SelectTrigger>
              <SelectContent className='bg-white'>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.year}>
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Semester <span className="text-red-500">*</span>
            </label>
            <Select 
              value={semester} 
              onValueChange={setSemester}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="1st Semester">1st Semester</SelectItem>
                <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Message */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The system will generate schedules only for courses within the maximum unit limit. 
              Overload courses must be assigned by the Program Head.
            </p>
          </div> */}
        </div>

        </div>

        {/* Schedule Views */}
        {selectedFaculty && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === 'grid' ? (
              /* Grid View */
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed print-table">
                  <colgroup>
                    <col className="w-20" />
                    {days.map((day) => (
                      <col key={day} style={{ width: `${100 / days.length}%` }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-red-800 text-white">
                      <th className="px-4 text-nowrap py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <span className="no-print">Time</span>
                      </th>
                      {days.map((day, index) => {
                        const dayColors = [
                          '#E8C5B5', // M - Peach/Tan
                          '#B5D4E8', // T - Light Blue
                          '#D4C99C', // W - Beige/Yellow
                          '#B5B5B5', // TH - Gray
                          '#D4D4A8', // F - Light Green/Yellow
                          '#C5B5E8', // S - Light Purple
                          '#E8B5D4'  // SU - Light Pink
                        ];
                        return (
                          <th key={day} className="px-4 text-nowrap py-3 text-center text-xs font-medium uppercase tracking-wider">
                            <span className="no-print">{day}</span>
                            <div className="day-badge-print" style={{ 
                              backgroundColor: dayColors[index],
                              display: 'none'
                            }}>
                              {day}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const processedSchedule = processScheduleForGrid(selectedFaculty);
                      let timeSlotIndex = 0;
                      const timeCategories = ['MORNING', '', 'AFTERNOON'];
                      
                      return timeSlots.map((slot) => {
                        // Render all cells, including nulls for rowspan
                        const cells = days.map((day) => renderGridCell(day, slot.time, processedSchedule));
                        
                        // Check if all cells are null (covered by rowspan)
                        const allNull = cells.every(cell => cell === null);
                        if (allNull) return null;
                        
                        const currentCategory = timeCategories[Math.floor(timeSlotIndex / 5)] || '';
                        timeSlotIndex++;
                        
                        return (
                          <tr key={slot.time} className="border-b border-gray-200">
                            <td className="px-4 text-nowrap py-2 text-xs text-gray-600 bg-gray-50 font-medium h-16 time-column-print">
                              <span className="no-print">{slot.display}</span>
                              <span style={{ display: 'none' }} className="print-time-display">
                                {slot.display}
                              </span>
                            </td>
                            {cells}
                          </tr>
                        );
                      }).filter(Boolean);
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Calendar View */
              <div className="p-4">
                <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {selectedFaculty.name} - Weekly Schedule
                  </h3>
                  <div className="flex space-x-2 justify-center sm:justify-end">
                    <button
                      onClick={() => setCalendarView(Views.WEEK)}
                      className={`px-3 py-1 text-sm rounded ${
                        calendarView === Views.WEEK
                          ? 'bg-red-800 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setCalendarView(Views.DAY)}
                      className={`px-3 py-1 text-sm rounded ${
                        calendarView === Views.DAY
                          ? 'bg-red-800 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Day
                    </button>
                  </div>
                </div>
                <div className="h-96 sm:h-[600px]">
                  <BigCalendar
                    localizer={localizer}
                    events={transformToCalendarEvents(selectedFaculty)}
                    startAccessor="start"
                    endAccessor="end"
                    view={calendarView}
                    onView={setCalendarView}
                    views={[Views.WEEK, Views.DAY]}
                    step={60}
                    showMultiDayTimes
                    min={new Date(2024, 0, 1, 7, 0)}
                    max={new Date(2024, 0, 1, 21, 0)}
                    eventPropGetter={(event) => ({
                      style: {
                        backgroundColor: '#991b1b',
                        borderColor: '#7f1d1d',
                        color: 'white',
                        fontSize: '12px'
                      }
                    })}
                    components={{
                      event: ({ event }) => (
                        <div className="text-xs">
                          <div className="font-medium">{event.resource.subject}</div>
                          <div className="opacity-90">{event.resource.code}</div>
                          {event.resource.room && (
                            <div className="opacity-75">{event.resource.room}</div>
                          )}
                        </div>
                      )
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default TeachingLoad;
