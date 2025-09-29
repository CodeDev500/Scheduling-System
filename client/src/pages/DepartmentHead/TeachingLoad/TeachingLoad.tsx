import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, Filter, Eye, Download, Users, BookOpen, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string[];
  maxUnits: number;
  currentUnits: number;
  status: 'Active' | 'On Leave' | 'Part-time';
  employmentType: 'Full-time' | 'Part-time' | 'Adjunct';
}

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  section: string;
  students: number;
  type: 'Lecture' | 'Laboratory' | 'Both';
}

interface Schedule {
  id: string;
  course: Course;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  academicYear: string;
}

interface FacultyLoad {
  faculty: Faculty;
  schedules: Schedule[];
  totalUnits: number;
  totalHours: number;
  workloadPercentage: number;
}

const TeachingLoad = () => {
  const [facultyLoads, setFacultyLoads] = useState<FacultyLoad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('1st Semester');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  const [expandedFaculty, setExpandedFaculty] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    // Mock data initialization
    const mockFaculty: Faculty[] = [
      {
        id: 'FAC001',
        name: 'Dr. Maria Santos',
        email: 'maria.santos@university.edu',
        department: 'Computer Science',
        specialization: ['Data Structures', 'Algorithms', 'Software Engineering'],
        maxUnits: 21,
        currentUnits: 18,
        status: 'Active',
        employmentType: 'Full-time'
      },
      {
        id: 'FAC002',
        name: 'Prof. John Dela Cruz',
        email: 'john.delacruz@university.edu',
        department: 'Information Technology',
        specialization: ['Database Systems', 'Web Development', 'Programming'],
        maxUnits: 21,
        currentUnits: 21,
        status: 'Active',
        employmentType: 'Full-time'
      },
      {
        id: 'FAC003',
        name: 'Ms. Ana Rodriguez',
        email: 'ana.rodriguez@university.edu',
        department: 'Information Technology',
        specialization: ['Mobile Development', 'UI/UX', 'Programming'],
        maxUnits: 12,
        currentUnits: 9,
        status: 'Active',
        employmentType: 'Part-time'
      },
      {
        id: 'FAC004',
        name: 'Dr. Robert Kim',
        email: 'robert.kim@university.edu',
        department: 'Computer Science',
        specialization: ['Machine Learning', 'AI', 'Data Science'],
        maxUnits: 21,
        currentUnits: 15,
        status: 'Active',
        employmentType: 'Full-time'
      },
      {
        id: 'FAC005',
        name: 'Prof. Lisa Chen',
        email: 'lisa.chen@university.edu',
        department: 'Information Technology',
        specialization: ['Network Security', 'Cybersecurity'],
        maxUnits: 18,
        currentUnits: 12,
        status: 'On Leave',
        employmentType: 'Full-time'
      }
    ];

    const mockCourses: Course[] = [
      {
        id: 'CS130',
        code: 'CS 130',
        title: 'CS THESIS I',
        units: 3,
        section: 'BSCS-III',
        students: 25,
        type: 'Lecture'
      },
      {
        id: 'CS132',
        code: 'CS 132',
        title: 'SOFTWARE ENGINEERING 2',
        units: 3,
        section: 'BSCS-III',
        students: 30,
        type: 'Both'
      },
      {
        id: 'IT101',
        code: 'IT 101',
        title: 'PROGRAMMING FUNDAMENTALS',
        units: 3,
        section: 'BSIT-I',
        students: 35,
        type: 'Both'
      },
      {
        id: 'IT201',
        code: 'IT 201',
        title: 'DATA STRUCTURES',
        units: 3,
        section: 'BSIT-II',
        students: 28,
        type: 'Both'
      },
      {
        id: 'CS201',
        code: 'CS 201',
        title: 'ALGORITHMS',
        units: 3,
        section: 'BSCS-II',
        students: 32,
        type: 'Lecture'
      },
      {
        id: 'IT301',
        code: 'IT 301',
        title: 'WEB DEVELOPMENT',
        units: 3,
        section: 'BSIT-III',
        students: 26,
        type: 'Both'
      }
    ];

    const mockSchedules: Schedule[] = [
      // Dr. Maria Santos schedules
      {
        id: 'SCH001',
        course: mockCourses[0], // CS THESIS I
        day: 'Monday',
        startTime: '08:00',
        endTime: '11:00',
        room: 'ROOM 102',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      {
        id: 'SCH002',
        course: mockCourses[1], // SOFTWARE ENGINEERING 2
        day: 'Tuesday',
        startTime: '13:00',
        endTime: '16:00',
        room: 'LAB 1',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      {
        id: 'SCH003',
        course: mockCourses[4], // ALGORITHMS
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '12:00',
        room: 'ROOM 103',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      // Prof. John Dela Cruz schedules
      {
        id: 'SCH004',
        course: mockCourses[2], // PROGRAMMING FUNDAMENTALS
        day: 'Monday',
        startTime: '09:00',
        endTime: '12:00',
        room: 'LAB 2',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      {
        id: 'SCH005',
        course: mockCourses[3], // DATA STRUCTURES
        day: 'Wednesday',
        startTime: '13:00',
        endTime: '16:00',
        room: 'LAB 1',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      {
        id: 'SCH006',
        course: mockCourses[5], // WEB DEVELOPMENT
        day: 'Friday',
        startTime: '08:00',
        endTime: '11:00',
        room: 'LAB 2',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      // Ms. Ana Rodriguez schedules
      {
        id: 'SCH007',
        course: {
          id: 'IT102',
          code: 'IT 102',
          title: 'MOBILE DEVELOPMENT',
          units: 3,
          section: 'BSIT-I',
          students: 24,
          type: 'Both'
        },
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '17:00',
        room: 'LAB 3',
        semester: '1st Semester',
        academicYear: '2024-2025'
      },
      // Dr. Robert Kim schedules
      {
        id: 'SCH008',
        course: {
          id: 'CS301',
          code: 'CS 301',
          title: 'MACHINE LEARNING',
          units: 3,
          section: 'BSCS-III',
          students: 22,
          type: 'Lecture'
        },
        day: 'Thursday',
        startTime: '10:00',
        endTime: '13:00',
        room: 'ROOM 104',
        semester: '1st Semester',
        academicYear: '2024-2025'
      }
    ];

    // Group schedules by faculty
    const facultyScheduleMap = new Map<string, Schedule[]>();
    mockSchedules.forEach(schedule => {
      // Assign schedules to faculty based on course specialization
      let facultyId = '';
      if (schedule.course.code.startsWith('CS')) {
        if (schedule.course.title.includes('THESIS') || schedule.course.title.includes('SOFTWARE')) {
          facultyId = 'FAC001'; // Dr. Maria Santos
        } else if (schedule.course.title.includes('MACHINE LEARNING')) {
          facultyId = 'FAC004'; // Dr. Robert Kim
        } else {
          facultyId = 'FAC001'; // Default to Dr. Maria Santos for CS courses
        }
      } else if (schedule.course.code.startsWith('IT')) {
        if (schedule.course.title.includes('MOBILE')) {
          facultyId = 'FAC003'; // Ms. Ana Rodriguez
        } else {
          facultyId = 'FAC002'; // Prof. John Dela Cruz
        }
      }
      
      if (!facultyScheduleMap.has(facultyId)) {
        facultyScheduleMap.set(facultyId, []);
      }
      facultyScheduleMap.get(facultyId)!.push(schedule);
    });

    // Create faculty loads
    const loads: FacultyLoad[] = mockFaculty.map(faculty => {
      const schedules = facultyScheduleMap.get(faculty.id) || [];
      const totalUnits = schedules.reduce((sum, schedule) => sum + schedule.course.units, 0);
      const totalHours = schedules.reduce((sum, schedule) => {
        const start = parseInt(schedule.startTime.split(':')[0]);
        const end = parseInt(schedule.endTime.split(':')[0]);
        return sum + (end - start);
      }, 0);
      const workloadPercentage = (totalUnits / faculty.maxUnits) * 100;

      return {
        faculty,
        schedules,
        totalUnits,
        totalHours,
        workloadPercentage
      };
    });

    setFacultyLoads(loads);
  }, []);

  const toggleFacultyExpansion = (facultyId: string) => {
    setExpandedFaculty(prev => 
      prev.includes(facultyId) 
        ? prev.filter(id => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  const filteredFacultyLoads = facultyLoads.filter(load => {
    const matchesSearch = load.faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.schedules.some(schedule => 
                           schedule.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           schedule.course.title.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesDepartment = filterDepartment === 'all' || load.faculty.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || load.faculty.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100 text-red-800';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Part-time': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTimeConflicts = (schedules: Schedule[]) => {
    const conflicts: string[] = [];
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const schedule1 = schedules[i];
        const schedule2 = schedules[j];
        
        if (schedule1.day === schedule2.day) {
          const start1 = parseInt(schedule1.startTime.split(':')[0]);
          const end1 = parseInt(schedule1.endTime.split(':')[0]);
          const start2 = parseInt(schedule2.startTime.split(':')[0]);
          const end2 = parseInt(schedule2.endTime.split(':')[0]);
          
          if ((start1 < end2 && end1 > start2)) {
            conflicts.push(`${schedule1.course.code} and ${schedule2.course.code} on ${schedule1.day}`);
          }
        }
      }
    }
    return conflicts;
  };

  const exportToCSV = () => {
    const headers = ['Faculty Name', 'Department', 'Status', 'Current Units', 'Max Units', 'Workload %', 'Total Hours', 'Courses'];
    const csvData = filteredFacultyLoads.map(load => [
      load.faculty.name,
      load.faculty.department,
      load.faculty.status,
      load.totalUnits,
      load.faculty.maxUnits,
      `${load.workloadPercentage.toFixed(1)}%`,
      load.totalHours,
      load.schedules.map(s => s.course.code).join('; ')
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teaching-load-${selectedSemester}-${selectedAcademicYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Teaching Load Management" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search faculty, courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'detailed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed
              </button>
            </div>
            
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Academic Period Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{filteredFacultyLoads.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredFacultyLoads.reduce((sum, load) => sum + load.schedules.length, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Workload</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredFacultyLoads.length > 0 
                    ? (filteredFacultyLoads.reduce((sum, load) => sum + load.workloadPercentage, 0) / filteredFacultyLoads.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overloaded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredFacultyLoads.filter(load => load.workloadPercentage > 100).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Load Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours/Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFacultyLoads.map((load) => {
                  const conflicts = calculateTimeConflicts(load.schedules);
                  const isExpanded = expandedFaculty.includes(load.faculty.id);
                  
                  return (
                    <React.Fragment key={load.faculty.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {load.faculty.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {load.faculty.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {load.faculty.employmentType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{load.faculty.department}</div>
                          <div className="text-xs text-gray-500">
                            {load.faculty.specialization.slice(0, 2).join(', ')}
                            {load.faculty.specialization.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(load.faculty.status)}`}>
                            {load.faculty.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {load.totalUnits} / {load.faculty.maxUnits}
                          </div>
                          <div className="text-xs text-gray-500">
                            {load.schedules.length} courses
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getWorkloadColor(load.workloadPercentage)}`}>
                                  {load.workloadPercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    load.workloadPercentage >= 100 ? 'bg-red-500' :
                                    load.workloadPercentage >= 80 ? 'bg-yellow-500' :
                                    load.workloadPercentage >= 60 ? 'bg-blue-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(load.workloadPercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{load.totalHours}</div>
                          {conflicts.length > 0 && (
                            <div className="text-xs text-red-500">⚠ {conflicts.length} conflicts</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleFacultyExpansion(load.faculty.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded flex items-center gap-1"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? 'Hide' : 'Show'} Details
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Schedule Details */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Course Schedule</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {load.schedules.map((schedule) => (
                                    <div key={schedule.id} className="bg-white rounded-lg border p-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium text-gray-900">{schedule.course.code}</span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                              {schedule.course.units} units
                                            </span>
                                          </div>
                                          <div className="text-sm text-gray-600 mb-2">{schedule.course.title}</div>
                                          <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              {schedule.day}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {schedule.startTime} - {schedule.endTime}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {schedule.room}
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {schedule.course.section} • {schedule.course.students} students • {schedule.course.type}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Conflicts Warning */}
                              {conflicts.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                  <h4 className="text-sm font-medium text-red-800 mb-2">⚠ Schedule Conflicts</h4>
                                  <ul className="text-sm text-red-700 space-y-1">
                                    {conflicts.map((conflict, index) => (
                                      <li key={index}>• {conflict}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Specialization */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Specialization</h4>
                                <div className="flex flex-wrap gap-2">
                                  {load.faculty.specialization.map((spec, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredFacultyLoads.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No faculty found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterDepartment !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No faculty data available for the selected period.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachingLoad;