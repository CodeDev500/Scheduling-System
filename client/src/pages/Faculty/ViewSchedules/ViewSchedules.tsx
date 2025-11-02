import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, Clock, MapPin, User, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import { useAppSelector } from "../../../hooks/redux";
import api from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";

interface Schedule {
  id: string;
  subject: string;
  code: string;
  room: string;
  startTime: string;
  endTime: string;
  day: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
  section: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  students: number;
  maxStudents: number;
}

const ViewSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCurriculumYear, setFilterCurriculumYear] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [curriculumYears, setCurriculumYears] = useState<string[]>([]);
  
  const user = useAppSelector((state) => state.auth.user);
  const toast = useToast();

  // Fetch faculty schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Get faculty with teaching load
        const response = await api.get(`/user/faculty/${user.id}`);
        const facultyData = response.data;

        // Fetch all schedules
        const schedulesResponse = await api.get('/schedules/latest');
        const allSchedules = schedulesResponse.data?.scheduleItems || [];

        // Filter schedules for this faculty only
        const facultySchedules = allSchedules.filter(
          (schedule: any) => String(schedule.facultyId) === String(user.id)
        );
        
        // Transform to match Schedule interface
        const transformedSchedules = facultySchedules.map((schedule: any) => ({
          id: schedule.id.toString(),
          subject: schedule.subjectName || schedule.subject,
          code: schedule.subjectCode,
          room: schedule.roomName || schedule.room,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          day: schedule.day,
          semester: schedule.semester,
          academicYear: schedule.academicYear,
          program: schedule.program,
          yearLevel: schedule.yearLevel,
          section: schedule.section || 'A',
          status: 'Active' as const,
          students: schedule.enrolledStudents || 0,
          maxStudents: schedule.maxStudents || 30
        }));
        
        setSchedules(transformedSchedules);
        
        // Extract unique curriculum years
        const years = Array.from(new Set(transformedSchedules.map((s: Schedule) => s.academicYear))).filter((y): y is string => !!y);
        setCurriculumYears(years.sort().reverse());
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('Failed to load schedules');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, [user?.id, toast]);

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.section.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCurriculumYear = filterCurriculumYear === "all" || schedule.academicYear === filterCurriculumYear;
    const matchesSemester = filterSemester === "all" || schedule.semester === filterSemester;
    const matchesDay = filterDay === "all" || schedule.day === filterDay;
    const matchesStatus = filterStatus === "all" || schedule.status === filterStatus;
    
    return matchesSearch && matchesCurriculumYear && matchesSemester && matchesDay && matchesStatus;
  });

  // Get current week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getScheduleForDayAndTime = (day: string, time: string) => {
    return filteredSchedules.find(schedule => {
      const scheduleTime = parseInt(schedule.startTime.split(':')[0]);
      const slotTime = parseInt(time.split(':')[0]);
      const endTime = parseInt(schedule.endTime.split(':')[0]);
      
      return schedule.day === day && scheduleTime <= slotTime && slotTime < endTime;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DashboardHeader 
        title="My Schedules" 
        subtitle="View and manage your teaching schedules"
      />
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by subject, code, or room..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Curriculum Year Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              value={filterCurriculumYear}
              onChange={(e) => setFilterCurriculumYear(e.target.value)}
            >
              <option value="all">All Years</option>
              {curriculumYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* Semester Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <option value="all">All Semesters</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          {/* Day Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="all">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-red-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${viewMode === 'calendar' ? 'bg-red-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>
      {/* Content */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Schedule List</h3>
              <button className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Schedule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Students</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{schedule.subject}</div>
                        <div className="text-sm text-gray-500">{schedule.program}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.code}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {schedule.day}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {schedule.room}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.yearLevel} - {schedule.section}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.students}/{schedule.maxStudents}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-red-800 hover:text-red-900 text-sm font-medium">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading schedules...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCurriculumYear !== 'all' || filterSemester !== 'all' || filterDay !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No schedules available.'}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Weekly Schedule</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <colgroup>
                <col className="w-20" />
                {dayNames.map((day) => (
                  <col key={day} style={{ width: `${100 / dayNames.length}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-red-800 text-white">
                  <th className="px-4 text-nowrap py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Time
                  </th>
                  {dayNames.map((day) => (
                    <th key={day} className="px-4 text-nowrap py-3 text-center text-xs font-medium uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b border-gray-200">
                    <td className="px-4 text-nowrap py-2 text-xs text-gray-600 bg-gray-50 font-medium h-16">
                      {time}
                    </td>
                    {dayNames.map((day) => {
                      const schedule = getScheduleForDayAndTime(day, time);
                      return (
                        <td key={`${day}-${time}`} className="p-0 border text-nowrap border-gray-200 relative h-16">
                          {schedule && (
                            <div
                              className="schedule-subject-card text-white text-xs absolute left-0 right-0 top-0 h-16 flex flex-col justify-center items-center rounded"
                              style={{ backgroundColor: '#991b1b' }}
                            >
                              <div className="font-medium text-center">
                                {schedule.code} - {schedule.subject}
                              </div>
                              <div className="opacity-75 text-center">{schedule.room}</div>
                              <div className="opacity-60 mt-1 text-center text-xs">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSchedules;