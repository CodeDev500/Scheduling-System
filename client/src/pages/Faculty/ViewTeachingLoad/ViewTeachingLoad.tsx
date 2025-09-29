import React, { useState, useEffect } from "react";
import { Clock, BookOpen, Users, Calendar, Download, Eye, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  hours: number;
  students: number;
  maxStudents: number;
  room: string;
  schedule: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
  section: string;
  status: 'Active' | 'Completed' | 'Cancelled';
}

interface TeachingLoad {
  totalUnits: number;
  totalHours: number;
  totalStudents: number;
  maxUnits: number;
  workloadPercentage: number;
  courses: Course[];
}

const ViewTeachingLoad: React.FC = () => {
  const [teachingLoad, setTeachingLoad] = useState<TeachingLoad | null>(null);
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2024-2025");
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  // Mock data for faculty teaching load
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: "1",
        code: "CS201",
        title: "Data Structures and Algorithms",
        units: 3,
        hours: 6,
        students: 35,
        maxStudents: 40,
        room: "Room 301",
        schedule: "MWF 8:00-10:00 AM",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "2nd Year",
        section: "A",
        status: "Active"
      },
      {
        id: "2",
        code: "CS301",
        title: "Database Management Systems",
        units: 3,
        hours: 6,
        students: 28,
        maxStudents: 35,
        room: "Room 205",
        schedule: "TTH 10:30 AM-12:30 PM",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "3rd Year",
        section: "B",
        status: "Active"
      },
      {
        id: "3",
        code: "CS202",
        title: "Web Development",
        units: 3,
        hours: 9,
        students: 32,
        maxStudents: 40,
        room: "Lab 101",
        schedule: "T 2:00-5:00 PM",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "2nd Year",
        section: "A",
        status: "Active"
      },
      {
        id: "4",
        code: "CS401",
        title: "Software Engineering",
        units: 3,
        hours: 9,
        students: 25,
        maxStudents: 30,
        room: "Room 302",
        schedule: "W 8:00-11:00 AM",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "4th Year",
        section: "A",
        status: "Active"
      },
      {
        id: "5",
        code: "CS302",
        title: "Computer Networks",
        units: 3,
        hours: 9,
        students: 30,
        maxStudents: 35,
        room: "Room 203",
        schedule: "TH 1:00-4:00 PM",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "3rd Year",
        section: "A",
        status: "Active"
      },
      {
        id: "6",
        code: "CS101",
        title: "Programming Fundamentals",
        units: 3,
        hours: 9,
        students: 38,
        maxStudents: 40,
        room: "Lab 102",
        schedule: "F 9:00 AM-12:00 PM",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "Computer Science",
        yearLevel: "1st Year",
        section: "B",
        status: "Active"
      }
    ];

    const totalUnits = mockCourses.reduce((sum, course) => sum + course.units, 0);
    const totalHours = mockCourses.reduce((sum, course) => sum + course.hours, 0);
    const totalStudents = mockCourses.reduce((sum, course) => sum + course.students, 0);
    const maxUnits = 21; // Standard maximum units for faculty
    const workloadPercentage = (totalUnits / maxUnits) * 100;

    setTeachingLoad({
      totalUnits,
      totalHours,
      totalStudents,
      maxUnits,
      workloadPercentage,
      courses: mockCourses
    });
  }, [selectedSemester, selectedAcademicYear]);

  const getWorkloadStatus = (percentage: number) => {
    if (percentage <= 80) return { color: 'text-green-600', bg: 'bg-green-100', status: 'Normal' };
    if (percentage <= 100) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Near Limit' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'Overloaded' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!teachingLoad) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <DashboardHeader 
          title="My Teaching Load" 
          subtitle="View your current teaching workload and assignments"
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading teaching load data...</div>
        </div>
      </div>
    );
  }

  const workloadStatus = getWorkloadStatus(teachingLoad.workloadPercentage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DashboardHeader 
        title="My Teaching Load" 
        subtitle="View your current teaching workload and assignments"
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('summary')}
                className={`flex-1 px-3 py-2 text-sm font-medium ${
                  viewMode === 'summary'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`flex-1 px-3 py-2 text-sm font-medium ${
                  viewMode === 'detailed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">
                {teachingLoad.totalUnits}/{teachingLoad.maxUnits}
              </p>
              <p className="text-xs text-gray-400">units assigned</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{teachingLoad.totalHours}</p>
              <p className="text-xs text-gray-400">hours per week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{teachingLoad.totalStudents}</p>
              <p className="text-xs text-gray-400">across all courses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${workloadStatus.bg}`}>
              <BarChart3 className={`w-6 h-6 ${workloadStatus.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Workload</p>
              <p className={`text-2xl font-bold ${workloadStatus.color}`}>
                {teachingLoad.workloadPercentage.toFixed(1)}%
              </p>
              <p className={`text-xs ${workloadStatus.color}`}>{workloadStatus.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Alert */}
      {teachingLoad.workloadPercentage > 100 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Workload Warning</h3>
              <p className="text-sm text-red-700 mt-1">
                Your current workload exceeds the recommended maximum of {teachingLoad.maxUnits} units. 
                Please consider redistributing some courses or contact your department head.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'summary' ? (
        /* Summary View */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Course Summary</h3>
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachingLoad.courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{course.code}</h4>
                      <p className="text-sm text-gray-600 mt-1">{course.title}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Units:</span>
                      <span className="font-medium">{course.units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours/Week:</span>
                      <span className="font-medium">{course.hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span className="font-medium">{course.students}/{course.maxStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Class:</span>
                      <span className="font-medium">{course.yearLevel}-{course.section}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">{course.schedule}</p>
                    <p className="text-xs text-gray-500">{course.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed View */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Detailed Course List</h3>
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Schedule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Units</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hours</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Students</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachingLoad.courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{course.code}</div>
                        <div className="text-sm text-gray-500">{course.title}</div>
                        <div className="text-xs text-gray-400">{course.program}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.schedule}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.room}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.yearLevel} - {course.section}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.units}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.hours}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.students}/{course.maxStudents}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                        {course.status}
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
        </div>
      )}

      {/* Workload Trend Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Workload Trend</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-sm">Workload trend chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default ViewTeachingLoad;