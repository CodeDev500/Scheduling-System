import React, { useEffect, useState } from 'react';
import { Calendar, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../../../hooks/redux';
import api from '../../../api/axios';

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
}

interface DashboardStats {
  totalSubjects: number;
  totalUnits: number;
  totalSchedules: number;
  hoursPerWeek: number;
}

const FacultyDashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalUnits: 0,
    totalSchedules: 0,
    hoursPerWeek: 0
  });
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
          // Set active year as default
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
    const fetchFacultySchedules = async () => {
      if (!user?.id || !selectedYear) return;

      try {
        setIsLoading(true);

        // Fetch schedules for this faculty with filters
        const response = await api.get(`/schedules/generation/items?academicYear=${selectedYear}`);
        const allSchedules = response.data?.data || [];

        // Filter schedules for this faculty and semester
        const facultySchedules = allSchedules.filter(
          (s: any) => 
            (s.facultyId === user.id.toString() || s.faculty === user.id.toString()) &&
            s.semester === selectedSemester
        );

        setSchedules(facultySchedules);

        // Calculate unique subjects
        const uniqueSubjects = new Set(facultySchedules.map((s: any) => s.subjectCode));

        // Calculate total units (count each subject once)
        const subjectUnits = new Map<string, number>();
        facultySchedules.forEach((s: any) => {
          if (!subjectUnits.has(s.subjectCode)) {
            subjectUnits.set(s.subjectCode, s.units || 0);
          }
        });
        const totalUnits = Array.from(subjectUnits.values()).reduce((sum, units) => sum + units, 0);

        // Calculate hours per week (lec * 1 + lab * 3 for each subject)
        const subjectHours = new Map<string, number>();
        facultySchedules.forEach((s: any) => {
          if (!subjectHours.has(s.subjectCode)) {
            const hours = (s.lec || 0) * 1 + (s.lab || 0) * 3;
            subjectHours.set(s.subjectCode, hours);
          }
        });
        const hoursPerWeek = Array.from(subjectHours.values()).reduce((sum, hours) => sum + hours, 0);

        setStats({
          totalSubjects: uniqueSubjects.size,
          totalUnits,
          totalSchedules: facultySchedules.length,
          hoursPerWeek
        });
      } catch (error) {
        console.error('Error fetching faculty schedules:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultySchedules();
  }, [user, selectedYear, selectedSemester]);

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

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc: any, schedule) => {
    const day = schedule.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  const todaySchedules = schedulesByDay[getCurrentDay()] || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.firstname} {user?.lastname}</p>
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
              <BookOpen className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Total Subjects</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalSubjects}</p>
            <p className="text-sm text-blue-100 mt-1">Assigned subjects</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Total Units</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalUnits}</p>
            <p className="text-sm text-green-100 mt-1">Teaching load</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Total Schedules</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalSchedules}</p>
            <p className="text-sm text-purple-100 mt-1">Class sessions</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-8 w-8" />
              <h3 className="text-lg font-semibold">Hours/Week</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.hoursPerWeek}</p>
            <p className="text-sm text-orange-100 mt-1">Contact hours</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Today's Schedule ({getCurrentDay()})
            </h2>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading schedule...</div>
          ) : todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map((schedule: any) => (
                <div key={schedule.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{schedule.subjectCode} - {schedule.subjectName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{schedule.yearLevel} • {schedule.semester}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {schedule.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {schedule.roomName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No classes scheduled for today</p>
            </div>
          )}
        </div>

        {/* Weekly Schedule Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-500" />
            Weekly Schedule Overview
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading schedule...</div>
          ) : schedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                const daySchedules = schedulesByDay[day] || [];
                return (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>
                    {daySchedules.length > 0 ? (
                      <div className="space-y-2">
                        {daySchedules.map((s: any) => (
                          <div key={s.id} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-800">{s.subjectCode}</div>
                            <div className="text-gray-600 text-xs">
                              {formatTime(s.startTime)} - {formatTime(s.endTime)}
                            </div>
                            <div className="text-gray-500 text-xs">{s.roomName}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No classes</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No schedules assigned yet</p>
            </div>
          )}
        </div>

        {/* Teaching Load Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-500" />
            Teaching Load Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.totalUnits}</div>
              <div className="text-sm text-gray-700 font-medium mt-1">Total Units</div>
              <div className="text-xs text-gray-500 mt-1">Teaching load</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.totalSubjects}</div>
              <div className="text-sm text-gray-700 font-medium mt-1">Subjects Handled</div>
              <div className="text-xs text-gray-500 mt-1">Unique subjects</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{stats.hoursPerWeek}</div>
              <div className="text-sm text-gray-700 font-medium mt-1">Hours per Week</div>
              <div className="text-xs text-gray-500 mt-1">Contact hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;