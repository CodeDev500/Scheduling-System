import React from 'react';
import { Calendar, Users, BookOpen, Clock, CheckCircle, BarChart3, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';

const CampusAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data for charts
  const weeklyScheduleData = [
    { day: 'Mon', schedules: 45 },
    { day: 'Tue', schedules: 52 },
    { day: 'Wed', schedules: 48 },
    { day: 'Thu', schedules: 61 },
    { day: 'Fri', schedules: 55 },
    { day: 'Sat', schedules: 23 },
    { day: 'Sun', schedules: 12 }
  ];

  const departmentData = [
    { name: 'Computer Science', faculty: 15, schedules: 42 },
    { name: 'Mathematics', faculty: 12, schedules: 38 },
    { name: 'Engineering', faculty: 18, schedules: 51 },
    { name: 'Business', faculty: 10, schedules: 29 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">No. Completed Schedule</h3>
                </div>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total Faculty</h3>
                </div>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-300 to-red-400 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Total VL</h3>
                </div>
                <p className="text-3xl font-bold">0</p>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Schedule Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule Activity</h3>
              <BarChart3 className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {weeklyScheduleData.map((item, index) => {
                const maxValue = Math.max(...weeklyScheduleData.map(d => d.schedules));
                const percentage = (item.schedules / maxValue) * 100;
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{item.day}</div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm font-semibold text-gray-900">{item.schedules}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Department Overview</h3>
              <Users className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{dept.faculty}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{dept.schedules}</span>
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${(dept.schedules / 60) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* Welcome Section */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to OptiSched</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Efficiently manage your institution's scheduling system. Use the navigation menu or quick actions above to access different modules.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CampusAdminDashboard;
