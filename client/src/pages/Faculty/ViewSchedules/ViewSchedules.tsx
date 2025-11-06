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

    return matchesSearch && matchesCurriculumYear && matchesSemester && matchesDay ;
  });




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
        </div>
      </div>

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
                  {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Students</th> */}
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
                        <div className="flex items-center mt-1 whitespace-nowrap">
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
                    {/* <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.students}/{schedule.maxStudents}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      
        </div>
     
    </div>
  );
};

export default ViewSchedules;