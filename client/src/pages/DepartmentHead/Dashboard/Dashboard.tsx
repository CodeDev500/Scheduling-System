import React, { useEffect, useState } from 'react';
import { Users, Calendar, BookOpen, Clock, CheckCircle, AlertCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../../components/dashboard/StatCard';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import { useAppSelector } from '../../../hooks/redux';
import api from '../../../api/axios';

interface DashboardStats {
  totalFaculty: number;
  totalSubjects: number;
  activeSchedules: number;
  pendingRequests: number;
  completedEvaluations: number;
  upcomingMeetings: number;
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
    totalSubjects: 0,
    activeSchedules: 0,
    pendingRequests: 0,
    completedEvaluations: 0,
    upcomingMeetings: 0
  });

  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch faculty by department
        const facultyResponse = await api.get(`/user/instructor/department/${userDepartment}`);
        const facultyData = facultyResponse.data || [];
        setFacultyMembers(facultyData);

        // Fetch schedules
        const schedulesResponse = await api.get('/schedule-generation/items');
        const schedulesData = schedulesResponse.data?.data || [];

        // Filter schedules by department
        const departmentSchedules = schedulesData.filter(
          (schedule: any) => schedule.program?.includes(userDepartment || '')
        );

        // Calculate stats
        const activeFaculty = facultyData.filter((f: any) => f.status === 'Active');
        const uniqueSubjects = new Set(departmentSchedules.map((s: any) => s.subjectCode));

        setStats({
          totalFaculty: activeFaculty.length,
          totalSubjects: uniqueSubjects.size,
          activeSchedules: departmentSchedules.length,
          pendingRequests: 0, // Can be fetched from a pending requests endpoint
          completedEvaluations: 0, // Can be fetched from evaluations endpoint
          upcomingMeetings: 0 // Can be fetched from meetings endpoint
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userDepartment) {
      fetchDashboardData();
    }
  }, [userDepartment]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Department Head Dashboard"
          subtitle="Manage department faculty, schedules, and academic activities"
        />

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Department Faculty"
            value={stats.totalFaculty}
            icon={Users}
            bgColor="bg-blue-500"
          />
          <StatCard
            title="Department Subjects"
            value={stats.totalSubjects}
            icon={BookOpen}
            bgColor="bg-green-500"
          />
          <StatCard
            title="Active Schedules"
            value={stats.activeSchedules}
            icon={Calendar}
            bgColor="bg-purple-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={AlertCircle}
            bgColor="bg-orange-500"
          />
          <StatCard
            title="Completed Evaluations"
            value={stats.completedEvaluations}
            icon={CheckCircle}
            bgColor="bg-emerald-500"
          />
          <StatCard
            title="Upcoming Meetings"
            value={stats.upcomingMeetings}
            icon={Clock}
            bgColor="bg-indigo-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/department-head-faculty')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
            >
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-800">Faculty Profiles</h3>
              <p className="text-sm text-gray-600">View and manage faculty information</p>
            </button>
            <button
              onClick={() => navigate('/schedule-management')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors"
            >
              <Calendar className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-gray-800">Schedule Management</h3>
              <p className="text-sm text-gray-600">Create and manage class schedules</p>
            </button>
            <button
              onClick={() => navigate('/department-head-teaching-load')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
            >
              <Clock className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold text-gray-800">Teaching Load</h3>
              <p className="text-sm text-gray-600">Monitor faculty workload and assignments</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <CheckCircle className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold text-gray-800">Evaluations</h3>
              <p className="text-sm text-gray-600">Faculty evaluations</p>
            </button>
          </div>
        </div>

        {/* Faculty Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Faculty Overview</h2>
            <Building className="h-5 w-5 text-gray-500" />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading faculty data...</div>
          ) : facultyMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No faculty members found in your department</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facultyMembers.slice(0, 6).map((faculty) => {
                const fullName = `${faculty.firstname} ${faculty.lastname}`;
                const subjectCount = faculty.subjects?.length || 0;
                const currentLoad = faculty.currentLoad || 0;
                const statusColor = faculty.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : faculty.status === 'On Leave'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800';

                return (
                  <div key={faculty.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 truncate">{fullName}</h3>
                      <span className={`${statusColor} px-2 py-1 rounded-full text-xs whitespace-nowrap`}>
                        {faculty.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{faculty.designation || 'Instructor'}</p>
                    <p className="text-xs text-gray-500 mb-2">{faculty.department}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</span>
                      <span className="text-xs text-gray-500">{currentLoad} units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && facultyMembers.length > 6 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/department-head-faculty')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all {facultyMembers.length} faculty members →
              </button>
            </div>
          )}
        </div>

        {/* Recent Activities & Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Schedule approved for CS101</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Faculty evaluation completed</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">New faculty member assigned</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Review schedule conflicts</p>
                  <p className="text-xs text-gray-500">Due: Today</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Faculty meeting preparation</p>
                  <p className="text-xs text-gray-500">Due: Tomorrow</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Approve subject assignments</p>
                  <p className="text-xs text-gray-500">Due: This week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;