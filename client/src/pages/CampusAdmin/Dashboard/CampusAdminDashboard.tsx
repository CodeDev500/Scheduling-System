import React, { useEffect, useState } from 'react';
import { Calendar, Users, BookOpen, Building, TrendingUp, GraduationCap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/redux';
import api from '../../../api/axios';


interface DashboardStats {
  totalPrograms: number;
  totalFaculty: number;
  totalSubjects: number;
  totalRooms: number;
  totalSchedules: number;
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

interface DepartmentData {
  department: string;
  facultyCount: number;
  scheduleCount: number;
}

const CampusAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    totalRooms: 0,
    totalSchedules: 0,
    hoursPerWeek: 0
  });
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedYear) return;

      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [programsRes, facultyRes, subjectsRes, roomsRes, schedulesRes] = await Promise.all([
          api.get('/program').catch(() => ({ data: [] })),
          api.get('/user/instructor').catch(() => ({ data: [] })),
          api.get('/subject').catch(() => ({ data: [] })),
          api.get('/rooms').catch(() => ({ data: { data: [] } })),
          api.get(`/schedules/generation/items?academicYear=${selectedYear}`).catch(() => ({ data: { data: [] } }))
        ]);

        const programs = programsRes.data || [];
        const faculty = facultyRes.data || [];
        const subjects = subjectsRes.data || [];
        const rooms = roomsRes.data?.data || [];
        const allSchedules = schedulesRes.data?.data || [];

        // Filter schedules by semester
        const schedules = allSchedules.filter((s: any) => s.semester === selectedSemester);

        // Filter schedules for the logged-in campus admin (if they teach)
        const mySchedules = allSchedules.filter(
          (s: any) => 
            (s.facultyId === userData?.id.toString() || s.faculty === userData?.id.toString()) &&
            s.semester === selectedSemester
        );
        setSchedules(mySchedules);

        // Calculate hours per week for campus admin's teaching load
        let hoursPerWeek = 0;
        mySchedules.forEach((schedule: any) => {
          const start = new Date(`2000-01-01 ${schedule.startTime}`);
          const end = new Date(`2000-01-01 ${schedule.endTime}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          hoursPerWeek += hours;
        });

        // Calculate department statistics
        const deptMap = new Map<string, { facultyCount: number; scheduleCount: number }>();
        
        faculty.forEach((f: any) => {
          const dept = f.department || 'Unknown';
          if (!deptMap.has(dept)) {
            deptMap.set(dept, { facultyCount: 0, scheduleCount: 0 });
          }
          deptMap.get(dept)!.facultyCount++;
        });

        schedules.forEach((s: any) => {
          const dept = s.program || 'Unknown';
          if (deptMap.has(dept)) {
            deptMap.get(dept)!.scheduleCount++;
          }
        });

        const deptData = Array.from(deptMap.entries()).map(([department, data]) => ({
          department,
          ...data
        }));

        setStats({
          totalPrograms: programs.length,
          totalFaculty: faculty.length,
          totalSubjects: subjects.length,
          totalRooms: rooms.length,
          totalSchedules: schedules.length,
          hoursPerWeek
        });

        setDepartmentData(deptData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear, selectedSemester]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campus Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System-wide overview and analytics</p>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <GraduationCap className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Academic Programs</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalPrograms}</p>
                <p className="text-sm text-blue-100 mt-1">Active programs</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Faculty</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalFaculty}</p>
                <p className="text-sm text-green-100 mt-1">Across all departments</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Subjects</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalSubjects}</p>
                <p className="text-sm text-purple-100 mt-1">In curriculum</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Rooms</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalRooms}</p>
                <p className="text-sm text-orange-100 mt-1">Available facilities</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Schedules</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalSchedules}</p>
                <p className="text-sm text-indigo-100 mt-1">Generated schedules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/view-schedules')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Schedules</h3>
                <p className="text-sm text-gray-500">Manage academic schedules</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/faculty-profile')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Faculty Profile</h3>
                <p className="text-sm text-gray-500">Manage faculty information</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/teaching-load')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Teaching Load</h3>
                <p className="text-sm text-gray-500">View faculty schedules</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/manage-user')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500">User administration</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/room-management')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Building className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Room Management</h3>
                <p className="text-sm text-gray-500">Manage rooms and facilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Teaching Schedule (if Campus Admin teaches) */}
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

    


      </div>
    </div>
  );
};

export default CampusAdminDashboard;
