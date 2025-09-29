import React, { useEffect, useState } from 'react';
import { Users, Calendar, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../../components/dashboard/StatCard';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';

interface DashboardStats {
  totalFaculty: number;
  totalSubjects: number;
  activeSchedules: number;
  pendingRequests: number;
  completedEvaluations: number;
  upcomingMeetings: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalFaculty: 0,
    totalSubjects: 0,
    activeSchedules: 0,
    pendingRequests: 0,
    completedEvaluations: 0,
    upcomingMeetings: 0
  });

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalFaculty: 18,
      totalSubjects: 25,
      activeSchedules: 32,
      pendingRequests: 7,
      completedEvaluations: 12,
      upcomingMeetings: 3
    });
  }, []);

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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Faculty Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Dr. John Smith</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <p className="text-sm text-gray-600">Computer Science</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">5 subjects</span>
                <span className="text-xs text-gray-500">18 units</span>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Prof. Maria Garcia</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <p className="text-sm text-gray-600">Mathematics</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">4 subjects</span>
                <span className="text-xs text-gray-500">15 units</span>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Dr. Robert Johnson</h3>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">On Leave</span>
              </div>
              <p className="text-sm text-gray-600">Physics</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">0 subjects</span>
                <span className="text-xs text-gray-500">0 units</span>
              </div>
            </div>
          </div>
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