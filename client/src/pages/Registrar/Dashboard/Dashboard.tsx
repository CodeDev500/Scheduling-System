import React, { useEffect, useState } from 'react';
import { Calendar, Users, BookOpen, FileText, TrendingUp, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

interface DashboardStats {
  totalPrograms: number;
  totalSubjects: number;
  totalCurriculumCourses: number;
  totalSchedules: number;
  totalFaculty: number;
}

interface ProgramData {
  programCode: string;
  programName: string;
  subjectCount: number;
}

const RegistrarDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalSubjects: 0,
    totalCurriculumCourses: 0,
    totalSchedules: 0,
    totalFaculty: 0
  });
  const [programData, setProgramData] = useState<ProgramData[]>([]);
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
        const [curriculumRes, schedulesRes, facultyRes] = await Promise.all([
          api.get('/curriculum').catch(() => ({ data: [] })),
          api.get(`/schedules/generation/items?academicYear=${selectedYear}`).catch(() => ({ data: { data: [] } })),
          api.get('/user/instructor').catch(() => ({ data: [] }))
        ]);

        const allCurriculum = curriculumRes.data || [];
        const allSchedules = schedulesRes.data?.data || [];
        const faculty = facultyRes.data || [];

        // Filter schedules by semester
        const schedules = allSchedules.filter((s: any) => s.semester === selectedSemester);

        // Filter curriculum by academic year
        const curriculum = allCurriculum.filter((c: any) => c.academicYear === selectedYear);

        // Calculate program statistics from filtered schedules
        const progMap = new Map<string, { programName: string; subjectCount: Set<string> }>();
        
        schedules.forEach((s: any) => {
          const code = s.program || 'Unknown';
          if (!progMap.has(code)) {
            progMap.set(code, { programName: code, subjectCount: new Set() });
          }
          // Add unique subject codes to the set
          if (s.subjectCode) {
            progMap.get(code)!.subjectCount.add(s.subjectCode);
          }
        });

        const progData = Array.from(progMap.entries()).map(([programCode, data]) => ({
          programCode,
          programName: data.programName,
          subjectCount: data.subjectCount.size
        }));

        // Get unique subjects from filtered schedules
        const uniqueSubjects = new Set(schedules.map((s: any) => s.subjectCode).filter(Boolean));

        setStats({
          totalPrograms: progData.length,
          totalSubjects: uniqueSubjects.size,
          totalCurriculumCourses: curriculum.length,
          totalSchedules: schedules.length,
          totalFaculty: faculty.length
        });

        setProgramData(progData);
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
              <h1 className="text-2xl font-bold text-gray-900">Registrar Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage academic programs, curriculum, and schedules</p>
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
                  <BookOpen className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Subjects</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalSubjects}</p>
                <p className="text-sm text-green-100 mt-1">In subject pool</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Curriculum Courses</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalCurriculumCourses}</p>
                <p className="text-sm text-purple-100 mt-1">Across all programs</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Schedules</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalSchedules}</p>
                <p className="text-sm text-orange-100 mt-1">Generated schedules</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Faculty</h3>
                </div>
                <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalFaculty}</p>
                <p className="text-sm text-indigo-100 mt-1">All instructors</p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/academic-programs')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Programs</h3>
                <p className="text-sm text-gray-500">Manage programs</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/curriculum')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Curriculum</h3>
                <p className="text-sm text-gray-500">Manage curriculum</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/subjects')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Subjects</h3>
                <p className="text-sm text-gray-500">Manage subjects</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/view-schedules')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Schedules</h3>
                <p className="text-sm text-gray-500">Review schedules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Program Overview - Kept original design */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
              Program Overview
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading program data...</div>
          ) : programData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No program data available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programData.map((prog, index) => {
                const maxSubjects = Math.max(...programData.map(p => p.subjectCount), 1);
                const percentage = (prog.subjectCount / maxSubjects) * 100;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{prog.programCode}</h4>
                        {/* <p className="text-sm text-gray-600">{prog.programName}</p> */}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{prog.subjectCount}</div>
                        <div className="text-xs text-gray-500">Subjects</div>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrarDashboard;
