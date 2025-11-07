import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Search, Filter, Eye, Edit, Trash2, MapPin, BookOpen, Users, Grid, List, Download, MoreHorizontal, Settings, CheckCircle, Building, UserX, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import DashboardHeader from '../../../components/dashboard/DashboardHeader';

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  units: number;
  lecture: number;
  lab: number;
  prerequisites?: string[];
  level: string;
  section: string;
}

interface Schedule {
  id: string;
  courseId: string;
  course: Course;
  faculty?: {
    id: string;
    name: string;
    email: string;
  };
  room?: {
    id: string;
    name: string;
    type: 'Lecture' | 'Laboratory' | 'Computer Lab';
    capacity: number;
  };
  day: string;
  startTime: string;
  endTime: string;
  semester: string;
  academicYear: string;
  status: 'Draft' | 'Published' | 'Cancelled';
}

interface Room {
  id: string;
  name: string;
  type: 'Lecture' | 'Laboratory' | 'Computer Lab';
  capacity: number;
  building: string;
  floor: number;
  equipment: string[];
  availability: boolean;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string[];
  maxUnits: number;
  currentUnits: number;
}

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [formData, setFormData] = useState<{
    courseId: string;
    facultyId: string;
    roomId: string;
    day: string;
    startTime: string;
    endTime: string;
    semester: string;
    academicYear: string;
    status: 'Draft' | 'Published' | 'Cancelled';
  }>({
    courseId: '',
    facultyId: '',
    roomId: '',
    day: '',
    startTime: '',
    endTime: '',
    semester: '1st Semester',
    academicYear: '2024-2025',
    status: 'Draft'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    // Mock data initialization
    const mockCourses: Course[] = [
      {
        id: 'CS130',
        code: 'CS 130',
        title: 'CS THESIS I',
        description: 'Computer Science Thesis I',
        units: 3,
        lecture: 3,
        lab: 0,
        level: '3rd Year',
        section: 'BSCS-III'
      },
      {
        id: 'CS132',
        code: 'CS 132',
        title: 'SOFTWARE ENGINEERING 2',
        description: 'Advanced Software Engineering Concepts',
        units: 3,
        lecture: 2,
        lab: 3,
        level: '3rd Year',
        section: 'BSCS-III'
      },
      {
        id: 'IT101',
        code: 'IT 101',
        title: 'PROGRAMMING FUNDAMENTALS',
        description: 'Introduction to Programming',
        units: 3,
        lecture: 2,
        lab: 3,
        level: '1st Year',
        section: 'BSIT-I'
      },
      {
        id: 'IT201',
        code: 'IT 201',
        title: 'DATA STRUCTURES',
        description: 'Data Structures and Algorithms',
        units: 3,
        lecture: 2,
        lab: 3,
        level: '2nd Year',
        section: 'BSIT-II'
      }
    ];

    const mockRooms: Room[] = [
      {
        id: 'LAB1',
        name: 'LAB 1',
        type: 'Computer Lab',
        capacity: 40,
        building: 'IT Building',
        floor: 1,
        equipment: ['Computers', 'Projector', 'Whiteboard'],
        availability: true
      },
      {
        id: 'LAB2',
        name: 'LAB 2',
        type: 'Computer Lab',
        capacity: 35,
        building: 'IT Building',
        floor: 2,
        equipment: ['Computers', 'Projector', 'Smart Board'],
        availability: true
      },
      {
        id: 'ROOM102',
        name: 'ROOM 102',
        type: 'Lecture',
        capacity: 50,
        building: 'Main Building',
        floor: 1,
        equipment: ['Projector', 'Sound System', 'Whiteboard'],
        availability: true
      },
      {
        id: 'ROOM103',
        name: 'ROOM 103',
        type: 'Lecture',
        capacity: 45,
        building: 'Main Building',
        floor: 1,
        equipment: ['Projector', 'Whiteboard'],
        availability: true
      }
    ];

    const mockFaculty: Faculty[] = [
      {
        id: 'FAC001',
        name: 'Dr. Maria Santos',
        email: 'maria.santos@university.edu',
        department: 'Computer Science',
        specialization: ['Data Structures', 'Algorithms', 'Software Engineering'],
        maxUnits: 21,
        currentUnits: 15
      },
      {
        id: 'FAC002',
        name: 'Prof. John Dela Cruz',
        email: 'john.delacruz@university.edu',
        department: 'Information Technology',
        specialization: ['Database Systems', 'Web Development', 'Programming'],
        maxUnits: 21,
        currentUnits: 18
      },
      {
        id: 'FAC003',
        name: 'Ms. Ana Rodriguez',
        email: 'ana.rodriguez@university.edu',
        department: 'Information Technology',
        specialization: ['Mobile Development', 'UI/UX', 'Programming'],
        maxUnits: 12,
        currentUnits: 9
      }
    ];

    const mockSchedules: Schedule[] = [
      {
        id: 'SCH001',
        courseId: 'CS130',
        course: mockCourses[0],
        faculty: mockFaculty[0],
        room: mockRooms[2],
        day: 'Monday',
        startTime: '08:00',
        endTime: '11:00',
        semester: '1st Semester',
        academicYear: '2024-2025',
        status: 'Published'
      },
      {
        id: 'SCH002',
        courseId: 'CS132',
        course: mockCourses[1],
        faculty: mockFaculty[0],
        room: mockRooms[0],
        day: 'Tuesday',
        startTime: '13:00',
        endTime: '16:00',
        semester: '1st Semester',
        academicYear: '2024-2025',
        status: 'Published'
      },
      {
        id: 'SCH003',
        courseId: 'IT101',
        course: mockCourses[2],
        faculty: mockFaculty[1],
        room: mockRooms[1],
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '12:00',
        semester: '1st Semester',
        academicYear: '2024-2025',
        status: 'Draft'
      }
    ];

    setCourses(mockCourses);
    setRooms(mockRooms);
    setFaculty(mockFaculty);
    setSchedules(mockSchedules);
  }, []);

  const handleCreateSchedule = () => {
    navigate('/schedule-management/add');
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setModalType('edit');
    setSelectedSchedule(schedule);
    setFormData({
      courseId: schedule.courseId,
      facultyId: schedule.faculty?.id || '',
      roomId: schedule.room?.id || '',
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      semester: schedule.semester,
      academicYear: schedule.academicYear,
      status: schedule.status
    });
    setShowModal(true);
  };

  const handleViewSchedule = (schedule: Schedule) => {
    setModalType('view');
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const course = courses.find(c => c.id === formData.courseId);
    const facultyMember = faculty.find(f => f.id === formData.facultyId);
    const room = rooms.find(r => r.id === formData.roomId);

    if (!course) return;

    const newSchedule: Schedule = {
      id: modalType === 'create' ? `SCH${Date.now()}` : selectedSchedule!.id,
      courseId: formData.courseId,
      course,
      faculty: facultyMember,
      room,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      semester: formData.semester,
      academicYear: formData.academicYear,
      status: formData.status 
    };

    if (modalType === 'create') {
      setSchedules([...schedules, newSchedule]);
    } else {
      setSchedules(schedules.map(s => s.id === newSchedule.id ? newSchedule : s));
    }

    setShowModal(false);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.faculty?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.room?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = filterDay === 'all' || schedule.day === filterDay;
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
    const matchesSemester = filterSemester === 'all' || schedule.semester === filterSemester;
    const matchesLevel = filterLevel === 'all' || schedule.course.level === filterLevel;
    
    return matchesSearch && matchesDay && matchesStatus && matchesSemester && matchesLevel;
  });

  const getScheduleStats = () => {
    const total = schedules.length;
    const published = schedules.filter(s => s.status === 'Published').length;
    const draft = schedules.filter(s => s.status === 'Draft').length;
    const cancelled = schedules.filter(s => s.status === 'Cancelled').length;
    
    return { total, published, draft, cancelled };
  };

  const stats = getScheduleStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Schedule Management" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-green-600">{stats.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
                </div>
                <Edit className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Header Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search courses, faculty, rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80"
                  />
                </div>
                
                {/* Quick Filters */}
                <div className="flex gap-2">
                  <select 
                    value={filterDay} 
                    onChange={(e) => setFilterDay(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Days</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-r-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button variant="outline" className="flex items-center gap-2">
                   <Download className="w-4 h-4" />
                   Export
                 </Button>
                 
                 <Button
                   onClick={handleCreateSchedule}
                   className="flex items-center gap-2"
                 >
                   <Plus className="w-4 h-4" />
                   Add Schedule
                 </Button>
               </div>
             </div>
             
             {/* Advanced Filters */}
             {showAdvancedFilters && (
               <div className="mt-4 pt-4 border-t border-gray-200">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <Label htmlFor="semester-filter">Semester</Label>
                     <select
                       id="semester-filter"
                       value={filterSemester}
                       onChange={(e) => setFilterSemester(e.target.value)}
                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                       <option value="all">All Semesters</option>
                       <option value="1st">1st Semester</option>
                       <option value="2nd">2nd Semester</option>
                       <option value="Summer">Summer</option>
                     </select>
                   </div>
                   
                   <div>
                     <Label htmlFor="level-filter">Level</Label>
                     <select
                       id="level-filter"
                       value={filterLevel}
                       onChange={(e) => setFilterLevel(e.target.value)}
                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                       <option value="all">All Levels</option>
                       <option value="1st Year">1st Year</option>
                       <option value="2nd Year">2nd Year</option>
                       <option value="3rd Year">3rd Year</option>
                       <option value="4th Year">4th Year</option>
                     </select>
                   </div>
                   
                   <div className="flex items-end">
                     <Button
                       variant="outline"
                       onClick={() => {
                         setSearchTerm('');
                         setFilterDay('all');
                         setFilterStatus('all');
                         setFilterSemester('all');
                         setFilterLevel('all');
                       }}
                       className="w-full"
                     >
                       Clear Filters
                     </Button>
                   </div>
                 </div>
               </div>
             )}

           </CardContent>
         </Card>

         {/* Schedule Content */}
          {viewMode === 'table' ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Faculty
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Schedule
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Calendar className="w-12 h-12 mb-4 text-gray-300" />
                              <p className="text-lg font-medium">No schedules found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredSchedules.map((schedule) => (
                          <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {schedule.course.code}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {schedule.course.title}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {schedule.course.units} units • Section {schedule.course.section}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {schedule.faculty ? (
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {schedule.faculty.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {schedule.faculty.email}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <UserX className="w-4 h-4 mr-2" />
                                  <span className="text-sm">Not assigned</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {schedule.day}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                     {schedule.startTime} - {schedule.endTime}
                                   </div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-6 py-4">
                               {schedule.room ? (
                                 <div className="flex items-center">
                                   <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                     <MapPin className="w-4 h-4 text-orange-600" />
                                   </div>
                                   <div className="ml-3">
                                     <div className="text-sm font-medium text-gray-900">
                                       {schedule.room.name}
                                     </div>
                                     <div className="text-sm text-gray-500">
                                       {schedule.room.type} • {schedule.room.capacity} seats
                                     </div>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="flex items-center text-gray-400">
                                   <Building className="w-4 h-4 mr-2" />
                                   <span className="text-sm">Not assigned</span>
                                 </div>
                               )}
                             </td>
                             <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                                 {schedule.status === 'Published' && <CheckCircle className="w-3 h-3 mr-1" />}
                                 {schedule.status === 'Draft' && <Edit className="w-3 h-3 mr-1" />}
                                 {schedule.status === 'Cancelled' && <X className="w-3 h-3 mr-1" />}
                                 {schedule.status}
                               </span>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-1">
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleViewSchedule(schedule)}
                                   className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                 >
                                   <Eye className="w-4 h-4" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleEditSchedule(schedule)}
                                   className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                 >
                                   <Edit className="w-4 h-4" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleDeleteSchedule(schedule.id)}
                                   className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </Button>
                               </div>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
               </CardContent>
             </Card>
           ) : (
             // Grid View
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredSchedules.length === 0 ? (
                 <div className="col-span-full">
                   <Card>
                     <CardContent className="p-12 text-center">
                       <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                       <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
                       <p className="text-gray-500 mb-4">
                         {searchTerm || filterDay !== 'all' || filterStatus !== 'all'
                           ? 'Try adjusting your search or filters.'
                           : 'Get started by creating a new schedule.'}
                       </p>
                       <Button
                         onClick={() => {
                           setModalType('create');
                           setShowModal(true);
                         }}
                         className="flex items-center gap-2"
                       >
                         <Plus className="w-4 h-4" />
                         Add Schedule
                       </Button>
                     </CardContent>
                   </Card>
                 </div>
               ) : (
                 filteredSchedules.map((schedule) => (
                   <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                     <CardContent className="p-6">
                       <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center">
                           <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                             <BookOpen className="w-6 h-6 text-blue-600" />
                           </div>
                           <div className="ml-3">
                             <h3 className="font-semibold text-gray-900">{schedule.course.code}</h3>
                             <p className="text-sm text-gray-600">{schedule.course.title}</p>
                           </div>
                         </div>
                         <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                           {schedule.status}
                         </span>
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex items-center text-sm">
                           <User className="w-4 h-4 text-gray-400 mr-2" />
                           <span className="text-gray-600">
                             {schedule.faculty ? schedule.faculty.name : 'Not assigned'}
                           </span>
                         </div>
                         
                         <div className="flex items-center text-sm">
                           <Clock className="w-4 h-4 text-gray-400 mr-2" />
                           <span className="text-gray-600">
                             {schedule.day} • {schedule.startTime} - {schedule.endTime}
                           </span>
                         </div>
                         
                         <div className="flex items-center text-sm">
                           <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                           <span className="text-gray-600">
                             {schedule.room ? schedule.room.name : 'Not assigned'}
                           </span>
                         </div>
                         
                         <div className="flex items-center text-sm">
                           <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                           <span className="text-gray-600">
                             {schedule.course.units} units • Section {schedule.course.section}
                           </span>
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                         <div className="flex items-center gap-2">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleViewSchedule(schedule)}
                             className="text-blue-600 hover:text-blue-700"
                           >
                             <Eye className="w-4 h-4 mr-1" />
                             View
                           </Button>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleEditSchedule(schedule)}
                             className="text-green-600 hover:text-green-700"
                           >
                             <Edit className="w-4 h-4 mr-1" />
                             Edit
                           </Button>
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleDeleteSchedule(schedule.id)}
                           className="text-red-600 hover:text-red-700"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 ))
               )}
             </div>
           )}
        </div>
        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'create' ? 'Create New Schedule' :
                   modalType === 'edit' ? 'Edit Schedule' : 'Schedule Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {modalType === 'view' && selectedSchedule ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{selectedSchedule.course.code}</div>
                      <div className="text-sm text-gray-600">{selectedSchedule.course.title}</div>
                      <div className="text-xs text-gray-500">{selectedSchedule.course.units} units</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {selectedSchedule.faculty ? (
                        <>
                          <div className="font-medium">{selectedSchedule.faculty.name}</div>
                          <div className="text-sm text-gray-600">{selectedSchedule.faculty.email}</div>
                        </>
                      ) : (
                        <div className="text-gray-500">Not assigned</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{selectedSchedule.day}</div>
                      <div className="text-sm text-gray-600">
                        {selectedSchedule.startTime} - {selectedSchedule.endTime}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {selectedSchedule.room ? (
                        <>
                          <div className="font-medium">{selectedSchedule.room.name}</div>
                          <div className="text-sm text-gray-600">
                            {selectedSchedule.room.type} • {selectedSchedule.room.capacity} seats
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">Not assigned</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Period</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{selectedSchedule.semester}</div>
                      <div className="text-sm text-gray-600">{selectedSchedule.academicYear}</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSchedule.status)}`}>
                        {selectedSchedule.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                    <select
                      value={formData.facultyId}
                      onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Faculty</option>
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.currentUnits}/{f.maxUnits} units)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day *</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({...formData, day: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Day</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} - {room.type} ({room.capacity} seats)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Start Time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select End Time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Draft' | 'Published' | 'Cancelled'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {modalType === 'create' ? 'Create Schedule' : 'Update Schedule'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;