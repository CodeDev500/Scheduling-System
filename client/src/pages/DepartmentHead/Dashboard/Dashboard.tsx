import React, { useEffect, useState } from 'react';
import { Users, Calendar, BookOpen, TrendingUp, UserCheck, UserPlus, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/redux';
import api from '../../../api/axios';

interface DashboardStats {
  totalFaculty: number;
  regularFaculty: number;
  visitingLecturers: number;
  totalSubjects: number;
  activeSchedules: number;
  totalUnits: number;
  hoursPerWeek: number;
}

interface ScheduleItem {
  id: number;
  subjectCode: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  roomName: string;
  day: string;
  type: string;
  yearLevel: string;
  semester: string;
  facultyName: string;
}

interface FacultyMember {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial: string;
  department: string;
  designation: string;
  status: string;
  subjects?: any[];
  currentLoad?: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.auth.user);
  const userDepartment = userData?.department;

  const [stats, setStats] = useState<DashboardStats>({
    totalFaculty: 0,
    regularFaculty: 0,
    visitingLecturers: 0,
    totalSubjects: 0,
    activeSchedules: 0,
    totalUnits: 0,
    hoursPerWeek: 0
  });

  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('1st Semester');

  // Fetch academic years on mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await api.get('/academic-years');
        if (response.data.success) {
          const years = response.data.data;
          setAcademicYears(years);
          const activeYear = years.find((year: any) => year.isActive);
          if (activeYear) {
            setSelectedYear(activeYear.year);
          }
        }
      } catch (error) {
        console.error('Error loading academic years:', error);
      }
    };
    fetchAcademicYears();
  }, []);

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userDepartment || !selectedYear) return;

      try {
        setIsLoading(true);

        // Fetch faculty by department - FIXED ENDPOINT
        const facultyResponse = await api.get(`/user/faculty/department/${userDepartment}`);
        const facultyData = facultyResponse.data || [];

        // Fetch schedules with filters
        const schedulesResponse = await api.get(`/schedules/generation/items?academicYear=${selectedYear}`);
        const allSchedulesData = schedulesResponse.data?.data || [];

        // Filter schedules by department and semester
        const departmentSchedules = allSchedulesData.filter(
          (schedule: any) => 
            schedule.program?.includes(userDepartment || '') &&
            schedule.semester === selectedSemester
        );

        // Filter schedules for the logged-in department head (if they teach)
        const mySchedules = allSchedulesData.filter(
          (s: any) => 
            (s.facultyId === userData?.id.toString() || s.faculty === userData?.id.toString()) &&
            s.semester === selectedSemester
        );
        setSchedules(mySchedules);

        // Use facultyData instead of facultyMembers state
        const regularFaculty = facultyData.filter((f: any) => 
          f.designation?.toLowerCase().includes('regular faculty') 
        );
        const visitingLecturers = facultyData.filter((f: any) => 
          f.designation?.toLowerCase().includes('visiting lecturer') 
        );
        
        const uniqueSubjects = new Set(departmentSchedules.map((s: any) => s.subjectCode));
        
        // Calculate total units from unique subjects
        const subjectUnits = new Map<string, number>();
        departmentSchedules.forEach((s: any) => {
          if (!subjectUnits.has(s.subjectCode)) {
            subjectUnits.set(s.subjectCode, s.units || 0);
          }
        });
        const totalUnits = Array.from(subjectUnits.values()).reduce((sum, units) => sum + units, 0);

        // Calculate subject count and units for each faculty member
        const facultyWithLoads = facultyData.map((faculty: any) => {
          const facultySchedules = departmentSchedules.filter(
            (s: any) => s.facultyId === faculty.id.toString() || s.faculty === faculty.id.toString()
          );
          
          const facultySubjects = new Set(facultySchedules.map((s: any) => s.subjectCode));
          const facultyUnitsMap = new Map<string, number>();
          facultySchedules.forEach((s: any) => {
            if (!facultyUnitsMap.has(s.subjectCode)) {
              facultyUnitsMap.set(s.subjectCode, s.units || 0);
            }
          });
          const facultyUnits = Array.from(facultyUnitsMap.values()).reduce((sum, units) => sum + units, 0);
          
          return {
            ...faculty,
            subjects: Array.from(facultySubjects),
            currentLoad: facultyUnits
          };
        });
        
        setFacultyMembers(facultyWithLoads);

        // Calculate hours per week for department head's teaching load
        let hoursPerWeek = 0;
        mySchedules.forEach((schedule: any) => {
          const start = new Date(`2000-01-01 ${schedule.startTime}`);
          const end = new Date(`2000-01-01 ${schedule.endTime}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          hoursPerWeek += hours;
        });

        setStats({
          totalFaculty: facultyData.length,
          regularFaculty: regularFaculty.length,
          visitingLecturers: visitingLecturers.length,
          totalSubjects: uniqueSubjects.size,
          activeSchedules: departmentSchedules.length,
          totalUnits,
          hoursPerWeek
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userDepartment && selectedYear) {
      fetchDashboardData();
    }
  }, [userDepartment, selectedYear, selectedSemester]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Head Dashboard</h1>
              <p className="text-gray-600 mt-1">{userDepartment} - Manage faculty, schedules, and activities</p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Academic Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {academicYears.map(year => (
                    <option key={year.id} value={year.year}>{year.year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Total Faculty</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalFaculty}</p>
            <p className="text-sm text-blue-100 mt-1">Active faculty members</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Regular Faculty</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.regularFaculty}</p>
            <p className="text-sm text-green-100 mt-1">Full-time instructors</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <UserPlus className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Visiting Lecturers</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.visitingLecturers}</p>
            <p className="text-sm text-purple-100 mt-1">Part-time faculty</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Total Subjects</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalSubjects}</p>
            <p className="text-sm text-orange-100 mt-1">Department subjects</p>
          </div>

        </div>


        {/* Faculty Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Faculty Overview
            </h2>
            <button
              onClick={() => navigate('/department-head-faculty')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading faculty data...</div>
          ) : facultyMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No faculty members found in your department</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facultyMembers.slice(0, 6).map((faculty) => {
                const fullName = `${faculty.firstname} ${faculty.lastname}`;
                const subjectCount = faculty.subjects?.length || 0;
                const currentLoad = faculty.currentLoad || 0;
                const isRegular = faculty.designation?.toLowerCase().includes('professor') || 
                                 faculty.designation?.toLowerCase().includes('instructor') ||
                                 faculty.designation?.toLowerCase() === 'faculty';
                const statusColor = faculty.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : faculty.status === 'On Leave'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800';

                return (
                  <div key={faculty.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {isRegular ? (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <UserPlus className="w-4 h-4 text-purple-600" />
                        )}
                        <h3 className="font-semibold text-gray-800">{fullName}</h3>
                      </div>
                      <span className={`${statusColor} px-2 py-1 rounded-full text-xs`}>
                        {faculty.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{faculty.designation || 'Instructor'}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="flex items-center text-gray-600">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {currentLoad} units
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Teaching Schedule (if Department Head teaches) */}
        {schedules.length > 0 && (
          <>
            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                My Today's Schedule
              </h2>
              {(() => {
                const formatTime = (time: string) => {
                  if (!time) return 'N/A';
                  const [hours, minutes] = time.split(':');
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                  return `${displayHour}:${minutes} ${ampm}`;
                };

                const getCurrentDay = () => {
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  return days[new Date().getDay()];
                };

                const schedulesByDay = schedules.reduce((acc: any, schedule) => {
                  if (!acc[schedule.day]) acc[schedule.day] = [];
                  acc[schedule.day].push(schedule);
                  return acc;
                }, {});

                const todaySchedules = schedulesByDay[getCurrentDay()] || [];

                return todaySchedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No classes scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaySchedules.map((schedule: ScheduleItem) => (
                      <div key={schedule.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{schedule.subjectCode} - {schedule.subjectName}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                {schedule.roomName}
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {schedule.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Weekly Schedule Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-500" />
                My Weekly Schedule Overview
              </h2>
              {(() => {
                const schedulesByDay = schedules.reduce((acc: any, schedule) => {
                  if (!acc[schedule.day]) acc[schedule.day] = [];
                  acc[schedule.day].push(schedule);
                  return acc;
                }, {});

                const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daysOfWeek.map(day => (
                      <div key={day} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {day}
                        </h3>
                        {schedulesByDay[day] && schedulesByDay[day].length > 0 ? (
                          <div className="space-y-2">
                            {schedulesByDay[day].map((schedule: ScheduleItem) => (
                              <div key={schedule.id} className="bg-gray-50 p-2 rounded text-sm">
                                <div className="font-medium text-gray-800">{schedule.subjectCode}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                <div className="text-xs text-gray-500">{schedule.roomName}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No classes</p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* My Teaching Load Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                My Teaching Load Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {new Set(schedules.map(s => s.subjectCode)).size}
                  </div>
                  <div className="text-sm text-gray-700 font-medium mt-1">My Subjects</div>
                  <div className="text-xs text-gray-500 mt-1">Unique courses</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{schedules.length}</div>
                  <div className="text-sm text-gray-700 font-medium mt-1">My Schedules</div>
                  <div className="text-xs text-gray-500 mt-1">Class sessions</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{stats.hoursPerWeek.toFixed(1)}</div>
                  <div className="text-sm text-gray-700 font-medium mt-1">Hours/Week</div>
                  <div className="text-xs text-gray-500 mt-1">Contact hours</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Department Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
            Department Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.totalUnits}</div>
              <div className="text-sm text-gray-700 font-medium mt-1">Total Units</div>
              <div className="text-xs text-gray-500 mt-1">Department load</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.totalSubjects}</div>
              <div className="text-sm text-gray-700 font-medium mt-1">Subjects Offered</div>
              <div className="text-xs text-gray-500 mt-1">Unique subjects</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{stats.activeSchedules}</div>
              <div className="text-sm text-gray-700 font-medium mt-1">Class Sessions</div>
              <div className="text-xs text-gray-500 mt-1">Total schedules</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;