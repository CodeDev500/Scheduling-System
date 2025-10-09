import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronDown, Printer, Grid, CalendarDays } from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer, Views, type View } from 'react-big-calendar';
import moment from 'moment';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import api from '../../../api/axios';
import { useToast } from '../../../hooks/useToast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// import './TeachingLoad.css';

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
  const toast = useToast();

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
    fetchFacultySchedules();
  }, []);

  const fetchFacultySchedules = async () => {
    try {
      setIsLoading(true);
      
      // Fetch faculty with teaching load
      const facultyResponse = await api.get('/user/faculty/with-load');
      const facultyData = facultyResponse.data.filter((f: any) => f.status === 'APPROVED');

      // Fetch all subject schedules
      const schedulesResponse = await api.get('/schedules/latest');
      const schedules = schedulesResponse.data?.scheduleItems || [];

      // Group schedules by faculty
      const facultySchedules: FacultySchedule[] = facultyData.map((faculty: any) => {
        const facultyScheduleItems = schedules.filter(
          (s: any) => String(s.facultyId) === String(faculty.id)
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
      
      // Fallback to mock data
      const mockFacultySchedules: FacultySchedule[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        department: 'Computer Science',
        employmentType: 'Full Time',
        totalUnits: 6,
        schedule: {
          MON: {
            '7:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '8:00 AM' },
            '8:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '8:30 AM', endTime: '9:45 AM' },
            '9:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '8:00 AM' },
            '11:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '12:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '13:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '15:00': { subject: 'CAPSTONE PROJECT', code: 'CS 499', room: 'LAB 3', startTime: '3:00 PM', endTime: '5:00 PM' },
            '16:00': { subject: 'CAPSTONE PROJECT', code: 'CS 499', room: 'LAB 3', startTime: '3:00 PM', endTime: '5:00 PM' },
            '17:00': { subject: 'CAPSTONE PROJECT', code: 'CS 499', room: 'LAB 3', startTime: '3:00 PM', endTime: '5:00 PM' },
          },
          TUE: {
            '9:00': { subject: 'SOFTWARE ENGINEERING', code: 'CS 350', room: 'ROOM 301', startTime: '9:00 AM', endTime: '11:00 AM' },
            '10:00': { subject: 'SOFTWARE ENGINEERING', code: 'CS 350', room: 'ROOM 301', startTime: '9:00 AM', endTime: '11:00 AM' },
            '11:00': { subject: 'SOFTWARE ENGINEERING', code: 'CS 350', room: 'ROOM 301', startTime: '9:00 AM', endTime: '11:00 AM' },
            '13:00': { subject: 'DATABASE SYSTEMS', code: 'CS 320', room: 'LAB 2', startTime: '1:00 PM', endTime: '3:00 PM' },
            '14:00': { subject: 'DATABASE SYSTEMS', code: 'CS 320', room: 'LAB 2', startTime: '1:00 PM', endTime: '3:00 PM' },
            '15:00': { subject: 'DATABASE SYSTEMS', code: 'CS 320', room: 'LAB 2', startTime: '1:00 PM', endTime: '3:00 PM' },
          },
          WED: {
            '7:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '9:00 AM' },
            '8:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '9:00 AM' },
            '9:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '9:00 AM' },
            '11:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '12:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '13:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '15:00': { subject: 'CAPSTONE PROJECT', code: 'CS 499', room: 'LAB 3', startTime: '3:00 PM', endTime: '5:00 PM' },
            '16:00': { subject: 'CAPSTONE PROJECT', code: 'CS 499', room: 'LAB 3', startTime: '3:00 PM', endTime: '5:00 PM' },
            '17:00': { subject: 'CAPSTONE PROJECT', code: 'CS 499', room: 'LAB 3', startTime: '3:00 PM', endTime: '5:00 PM' },
          },
          THU: {
            '9:00': { subject: 'SOFTWARE ENGINEERING', code: 'CS 350', room: 'ROOM 301', startTime: '9:00 AM', endTime: '11:00 AM' },
            '10:00': { subject: 'SOFTWARE ENGINEERING', code: 'CS 350', room: 'ROOM 301', startTime: '9:00 AM', endTime: '11:00 AM' },
            '11:00': { subject: 'SOFTWARE ENGINEERING', code: 'CS 350', room: 'ROOM 301', startTime: '9:00 AM', endTime: '11:00 AM' },
            '13:00': { subject: 'DATABASE SYSTEMS', code: 'CS 320', room: 'LAB 2', startTime: '1:00 PM', endTime: '3:00 PM' },
            '14:00': { subject: 'DATABASE SYSTEMS', code: 'CS 320', room: 'LAB 2', startTime: '1:00 PM', endTime: '3:00 PM' },
            '15:00': { subject: 'DATABASE SYSTEMS', code: 'CS 320', room: 'LAB 2', startTime: '1:00 PM', endTime: '3:00 PM' },
          },
          FRI: {
            '7:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '9:00 AM' },
            '8:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '9:00 AM' },
            '9:00': { subject: 'DATA STRUCTURES', code: 'CS 201', room: 'LAB 1', startTime: '7:00 AM', endTime: '9:00 AM' },
            '11:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '12:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
            '13:00': { subject: 'ALGORITHMS', code: 'CS 301', room: 'ROOM 205', startTime: '11:00 AM', endTime: '1:00 PM' },
          },
          SAT: {},
          SUN: {}
        }
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        department: 'Mathematics',
        employmentType: 'Full Time',
        totalUnits: 9,
        schedule: {
          MON: {
            '7:00': { subject: 'STATISTICS', code: 'MATH 150', room: 'ROOM 101', startTime: '7:00 AM', endTime: '9:00 AM' },
            '8:00': { subject: 'STATISTICS', code: 'MATH 150', room: 'ROOM 101', startTime: '7:00 AM', endTime: '9:00 AM' },
            '9:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '10:30 AM' }, // 1.5 hour class
            '10:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '10:30 AM' },
            '11:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
            '12:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
            '13:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
            '14:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
            '15:00': { subject: 'ALGEBRA', code: 'MATH 101', room: 'ROOM 103', startTime: '3:00 PM', endTime: '6:00 PM' }, // 3 hour class
            '16:00': { subject: 'ALGEBRA', code: 'MATH 101', room: 'ROOM 103', startTime: '3:00 PM', endTime: '6:00 PM' },
            '17:00': { subject: 'ALGEBRA', code: 'MATH 101', room: 'ROOM 103', startTime: '3:00 PM', endTime: '6:00 PM' },
            '18:00': { subject: 'ALGEBRA', code: 'MATH 101', room: 'ROOM 103', startTime: '3:00 PM', endTime: '6:00 PM' },
          },
          TUE: {
            '9:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '10:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '11:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '13:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
            '14:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
            '15:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
          },
          WED: {
            '7:00': { subject: 'STATISTICS', code: 'MATH 150', room: 'ROOM 101', startTime: '7:00 AM', endTime: '9:00 AM' },
            '8:00': { subject: 'STATISTICS', code: 'MATH 150', room: 'ROOM 101', startTime: '7:00 AM', endTime: '9:00 AM' },
            '9:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '10:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '11:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
            '12:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
            '13:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
            '15:00': { subject: 'ALGEBRA', code: 'MATH 101', room: 'ROOM 103', startTime: '3:00 PM', endTime: '5:00 PM' },
            '16:00': { subject: 'ALGEBRA', code: 'MATH 101', room: 'ROOM 103', startTime: '3:00 PM', endTime: '5:00 PM' },
            '17:00': { subject: 'ALGEBRA', code: 'MATH 101', room: 'ROOM 103', startTime: '3:00 PM', endTime: '5:00 PM' },
          },
          THU: {
            '9:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '10:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '11:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '13:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
            '14:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
            '15:00': { subject: 'GEOMETRY', code: 'MATH 110', room: 'ROOM 105', startTime: '1:00 PM', endTime: '3:00 PM' },
          },
          FRI: {
            '7:00': { subject: 'STATISTICS', code: 'MATH 150', room: 'ROOM 101', startTime: '7:00 AM', endTime: '9:00 AM' },
            '8:00': { subject: 'STATISTICS', code: 'MATH 150', room: 'ROOM 101', startTime: '7:00 AM', endTime: '9:00 AM' },
            '9:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '10:00': { subject: 'TRIGONOMETRY', code: 'MATH 120', room: 'ROOM 104', startTime: '9:00 AM', endTime: '11:00 AM' },
            '11:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
            '12:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
            '13:00': { subject: 'CALCULUS I', code: 'MATH 201', room: 'ROOM 102', startTime: '11:00 AM', endTime: '1:00 PM' },
          },
          SAT: {},
          SUN: {}
        }
      }
    ];

      setFacultyList(mockFacultySchedules);
      setSelectedFaculty(mockFacultySchedules[0]);
    } finally {
      setIsLoading(false);
    }
  };

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
        <td key={`${day}-${time}`} className="p-0 border border-gray-200">
          <div className="schedule-grid-cell"></div>
        </td>
      );
    }
    
    // Calculate precise height based on exact start and end times
    const baseSlotHeight = window.innerWidth <= 640 ? 48 : 64; // Same as calculateCellHeight base
    const dynamicHeight = Math.round((cellData.exactHeightDuration || cellData.exactDuration || cellData.duration) * baseSlotHeight);
    
    // Calculate precise vertical offset based on exact start time
    const offsetPixels = Math.round((cellData.offsetMinutes / 60) * baseSlotHeight);
    

    
    return (
      <td 
        key={`${day}-${time}`} 
        className="p-0 border border-gray-200 relative" 
        rowSpan={cellData.duration}
        // style={{ height: `${dynamicHeight}px` }}
      >
        <div 
          className={`schedule-subject-card text-white text-xs`}
          style={{ 
            height: `${dynamicHeight - 2}px`, // Subtract 2px for border
            minHeight: `${dynamicHeight - 2}px`,
            top: `${offsetPixels}px`, // Apply precise vertical positioning
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
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
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
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Faculty Selection */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Faculty Loading ({selectedFaculty?.employmentType})</span>
          </div>
          
          <div className="mt-4 relative">
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
          </div>
          
          {selectedFaculty && (
            <div className="mt-4 text-sm text-gray-600">
              Total No. of Units Loaded: {selectedFaculty.totalUnits}
            </div>
          )}
        </div>

        {/* Schedule Views */}
        {selectedFaculty && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === 'grid' ? (
              /* Grid View */
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-red-800 text-white">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-20">
                        Time
                      </th>
                      {days.map((day) => (
                        <th key={day} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const processedSchedule = processScheduleForGrid(selectedFaculty);
                      return timeSlots.map((slot) => {
                        const cells = days.map((day) => renderGridCell(day, slot.time, processedSchedule)).filter(Boolean);
                        
                        if (cells.length === 0) return null;
                        
                        return (
                          <tr key={slot.time} className="border-b border-gray-200">
                            <td className="px-4 py-2 text-xs text-gray-600 bg-gray-50 font-medium">
                              {slot.display}
                            </td>
                            {cells}
                          </tr>
                        );
                      }).filter(Boolean);
                    })()
                    }
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
