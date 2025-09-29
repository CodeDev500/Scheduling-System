import React, { useEffect, useState } from 'react';
import { Calendar, Clock, BookOpen, Users, CheckCircle, AlertCircle } from 'lucide-react';
import StatCard from '../../../components/dashboard/StatCard';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import { useAppSelector } from '../../../hooks/redux';

interface ScheduleItem {
  id: number;
  subject: string;
  time: string;
  room: string;
  day: string;
}

interface DashboardStats {
  totalSubjects: number;
  totalUnits: number;
  todayClasses: number;
  completedClasses: number;
}

const FacultyDashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalUnits: 0,
    todayClasses: 0,
    completedClasses: 0
  });
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalSubjects: 5,
      totalUnits: 18,
      todayClasses: 3,
      completedClasses: 12
    });

    setTodaySchedule([
      { id: 1, subject: 'CS 101 - Introduction to Programming', time: '8:00 AM - 10:00 AM', room: 'LAB 1', day: 'Monday' },
      { id: 2, subject: 'CS 201 - Data Structures', time: '1:00 PM - 3:00 PM', room: 'LAB 2', day: 'Monday' },
      { id: 3, subject: 'CS 301 - Database Systems', time: '3:00 PM - 5:00 PM', room: 'LAB 1', day: 'Monday' }
    ]);

    setUpcomingSchedule([
      { id: 4, subject: 'CS 102 - Programming Fundamentals', time: '8:00 AM - 10:00 AM', room: 'LAB 3', day: 'Tuesday' },
      { id: 5, subject: 'CS 202 - Algorithms', time: '10:00 AM - 12:00 PM', room: 'LAB 2', day: 'Tuesday' }
    ]);
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader 
          title="Faculty Dashboard" 
          subtitle={`${getCurrentDate()} • ${getCurrentTime()}`}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Subjects"
            value={stats.totalSubjects}
            icon={BookOpen}
            bgColor="bg-blue-500"
          />
          <StatCard
            title="Total Units"
            value={stats.totalUnits}
            icon={Users}
            bgColor="bg-green-500"
          />
          <StatCard
            title="Today's Classes"
            value={stats.todayClasses}
            icon={Calendar}
            bgColor="bg-purple-500"
          />
          <StatCard
            title="Completed Classes"
            value={stats.completedClasses}
            icon={CheckCircle}
            bgColor="bg-orange-500"
          />
        </div>

        {/* Schedule Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Today's Schedule
              </h2>
              <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="space-y-3">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((schedule) => (
                  <div key={schedule.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <h3 className="font-semibold text-gray-800">{schedule.subject}</h3>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {schedule.time}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {schedule.room}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Upcoming Classes
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingSchedule.length > 0 ? (
                upcomingSchedule.map((schedule) => (
                  <div key={schedule.id} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                    <h3 className="font-semibold text-gray-800">{schedule.subject}</h3>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {schedule.day} • {schedule.time}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        {schedule.room}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming classes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Teaching Load Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-500" />
            Teaching Load Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUnits}</div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalSubjects}</div>
              <div className="text-sm text-gray-600">Subjects Handled</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">21</div>
              <div className="text-sm text-gray-600">Hours per Week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;