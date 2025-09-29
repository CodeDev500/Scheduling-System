import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, Clock, MapPin, User, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";

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
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Mock data for faculty schedules
  useEffect(() => {
    const mockSchedules: Schedule[] = [
      {
        id: "1",
        subject: "Data Structures and Algorithms",
        code: "CS201",
        room: "Room 301",
        startTime: "08:00",
        endTime: "10:00",
        day: "Monday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "2nd Year",
        section: "A",
        status: "Active",
        students: 35,
        maxStudents: 40
      },
      {
        id: "2",
        subject: "Database Management Systems",
        code: "CS301",
        room: "Room 205",
        startTime: "10:30",
        endTime: "12:30",
        day: "Monday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "3rd Year",
        section: "B",
        status: "Active",
        students: 28,
        maxStudents: 35
      },
      {
        id: "3",
        subject: "Web Development",
        code: "CS202",
        room: "Lab 101",
        startTime: "14:00",
        endTime: "17:00",
        day: "Tuesday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "2nd Year",
        section: "A",
        status: "Active",
        students: 32,
        maxStudents: 40
      },
      {
        id: "4",
        subject: "Software Engineering",
        code: "CS401",
        room: "Room 302",
        startTime: "08:00",
        endTime: "11:00",
        day: "Wednesday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "4th Year",
        section: "A",
        status: "Active",
        students: 25,
        maxStudents: 30
      },
      {
        id: "5",
        subject: "Computer Networks",
        code: "CS302",
        room: "Room 203",
        startTime: "13:00",
        endTime: "16:00",
        day: "Thursday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "3rd Year",
        section: "A",
        status: "Active",
        students: 30,
        maxStudents: 35
      },
      {
        id: "6",
        subject: "Programming Fundamentals",
        code: "CS101",
        room: "Lab 102",
        startTime: "09:00",
        endTime: "12:00",
        day: "Friday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "1st Year",
        section: "B",
        status: "Active",
        students: 38,
        maxStudents: 40
      }
    ];
    setSchedules(mockSchedules);
  }, []);

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.section.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = filterSemester === "all" || schedule.semester === filterSemester;
    const matchesDay = filterDay === "all" || schedule.day === filterDay;
    const matchesStatus = filterStatus === "all" || schedule.status === filterStatus;
    
    return matchesSearch && matchesSemester && matchesDay && matchesStatus;
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
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by subject, code, or room..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Schedule List</h3>
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
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
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterSemester !== 'all' || filterDay !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No schedules available.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-20">Time</th>
                  {dayNames.map((day) => (
                    <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      <div>{day}</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {weekDates[dayNames.indexOf(day)]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                      {time}
                    </td>
                    {dayNames.map((day) => {
                      const schedule = getScheduleForDayAndTime(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-2 py-3 border-l border-gray-200">
                          {schedule && (
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-2 text-xs">
                              <div className="font-semibold text-blue-900 truncate">
                                {schedule.code}
                              </div>
                              <div className="text-blue-700 truncate">
                                {schedule.subject}
                              </div>
                              <div className="text-blue-600 mt-1">
                                {schedule.room}
                              </div>
                              <div className="text-blue-600">
                                {schedule.yearLevel}-{schedule.section}
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