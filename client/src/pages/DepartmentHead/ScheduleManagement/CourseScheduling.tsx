import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
// Using regular table and modal elements since components don't exist
import { Label } from '../../../components/ui/label';
// Using regular textarea since component doesn't exist
// Using regular navigation since tabs component doesn't exist
import { Plus, Search, Filter, Calendar, Clock, MapPin, Users, Save, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
// Alert, Dialog, Table, and Tabs components not available - using regular HTML elements

interface Schedule {
  id: string;
  courseCode: string;
  courseTitle: string;
  instructor: string;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  yearLevel: number;
  semester: number;
  section: string;
  capacity: number;
  enrolled: number;
  status: 'Draft' | 'Published' | 'Conflict';
  conflicts?: string[];
}

interface TimeSlot {
  time: string;
  monday?: Schedule;
  tuesday?: Schedule;
  wednesday?: Schedule;
  thursday?: Schedule;
  friday?: Schedule;
  saturday?: Schedule;
}

const CourseScheduling: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    courseCode: '',
    courseTitle: '',
    instructor: '',
    room: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    yearLevel: 1,
    semester: 1,
    section: '',
    capacity: 30,
    enrolled: 0,
    status: 'Draft'
  });

  const timeOptions = [
    '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockSchedules: Schedule[] = [
      {
        id: '1',
        courseCode: 'CS 130',
        courseTitle: 'CS THESIS I',
        instructor: 'Dr. Smith',
        room: 'CS Lab 1',
        dayOfWeek: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        yearLevel: 3,
        semester: 1,
        section: 'A',
        capacity: 25,
        enrolled: 18,
        status: 'Published'
      },
      {
        id: '2',
        courseCode: 'CS 130',
        courseTitle: 'CS THESIS I',
        instructor: 'Dr. Smith',
        room: 'CS Lab 1',
        dayOfWeek: 'Wednesday',
        startTime: '10:00',
        endTime: '11:00',
        yearLevel: 3,
        semester: 1,
        section: 'A',
        capacity: 25,
        enrolled: 18,
        status: 'Published'
      },
      {
        id: '3',
        courseCode: 'CS 132',
        courseTitle: 'SOFTWARE ENGINEERING 2',
        instructor: 'Prof. Johnson',
        room: 'CS Lab 2',
        dayOfWeek: 'Tuesday',
        startTime: '14:00',
        endTime: '15:30',
        yearLevel: 3,
        semester: 2,
        section: 'B',
        capacity: 30,
        enrolled: 22,
        status: 'Published'
      },
      {
        id: '4',
        courseCode: 'CS 101',
        courseTitle: 'Introduction to Programming',
        instructor: 'Ms. Davis',
        room: 'CS Lab 3',
        dayOfWeek: 'Monday',
        startTime: '8:00',
        endTime: '9:00',
        yearLevel: 1,
        semester: 1,
        section: 'C',
        capacity: 35,
        enrolled: 35,
        status: 'Published'
      },
      {
        id: '5',
        courseCode: 'MATH 101',
        courseTitle: 'College Algebra',
        instructor: 'TBA',
        room: 'Room 201',
        dayOfWeek: 'Friday',
        startTime: '9:00',
        endTime: '10:00',
        yearLevel: 1,
        semester: 1,
        section: 'D',
        capacity: 40,
        enrolled: 0,
        status: 'Draft'
      }
    ];
    setSchedules(mockSchedules);
    generateTimeSlots(mockSchedules);
  }, []);

  const generateTimeSlots = (scheduleData: Schedule[]) => {
    const slots: TimeSlot[] = [];
    
    for (let hour = 7; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slot: TimeSlot = { time: timeString };
        
        // Find schedules for this time slot
        dayOptions.forEach(day => {
          const dayKey = day.toLowerCase() as keyof Omit<TimeSlot, 'time'>;
          const schedule = scheduleData.find(s => 
            s.dayOfWeek === day && 
            s.startTime <= timeString && 
            s.endTime > timeString
          );
          if (schedule) {
            slot[dayKey] = schedule;
          }
        });
        
        slots.push(slot);
      }
    }
    
    setTimeSlots(slots);
  };

  useEffect(() => {
    let filtered = schedules;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(schedule => 
        schedule.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by year level
    if (selectedYearLevel) {
      filtered = filtered.filter(schedule => schedule.yearLevel === parseInt(selectedYearLevel));
    }
    
    // Filter by semester
    if (selectedSemester) {
      filtered = filtered.filter(schedule => schedule.semester === parseInt(selectedSemester));
    }
    
    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(schedule => schedule.status === selectedStatus);
    }
    
    setFilteredSchedules(filtered);
  }, [schedules, searchTerm, selectedYearLevel, selectedSemester, selectedStatus]);

  const detectConflicts = (newSched: Partial<Schedule>): string[] => {
    const conflicts: string[] = [];
    
    schedules.forEach(existing => {
      if (existing.id === newSched.id) return; // Skip self when editing
      
      // Check room conflict
      if (existing.room === newSched.room && 
          existing.dayOfWeek === newSched.dayOfWeek &&
          existing.startTime === newSched.startTime) {
        conflicts.push(`Room conflict with ${existing.courseCode}`);
      }
      
      // Check instructor conflict
      if (existing.instructor === newSched.instructor && 
          existing.dayOfWeek === newSched.dayOfWeek &&
          existing.startTime === newSched.startTime) {
        conflicts.push(`Instructor conflict with ${existing.courseCode}`);
      }
    });
    
    return conflicts;
  };

  const handleAddSchedule = () => {
    if (newSchedule.courseCode && newSchedule.dayOfWeek && newSchedule.startTime) {
      const conflicts = detectConflicts(newSchedule);
      
      const schedule: Schedule = {
        id: Date.now().toString(),
        courseCode: newSchedule.courseCode!,
        courseTitle: newSchedule.courseTitle || '',
        instructor: newSchedule.instructor || 'TBA',
        room: newSchedule.room || '',
        dayOfWeek: newSchedule.dayOfWeek!,
        startTime: newSchedule.startTime!,
        endTime: newSchedule.endTime || '',
        yearLevel: newSchedule.yearLevel || 1,
        semester: newSchedule.semester || 1,
        section: newSchedule.section || '',
        capacity: newSchedule.capacity || 30,
        enrolled: 0,
        status: conflicts.length > 0 ? 'Conflict' : 'Draft',
        conflicts: conflicts.length > 0 ? conflicts : undefined
      };
      
      const updatedSchedules = [...schedules, schedule];
      setSchedules(updatedSchedules);
      generateTimeSlots(updatedSchedules);
      resetForm();
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setNewSchedule(schedule);
    setShowAddModal(true);
  };

  const handleUpdateSchedule = () => {
    if (editingSchedule && newSchedule.courseCode && newSchedule.dayOfWeek && newSchedule.startTime) {
      const conflicts = detectConflicts(newSchedule);
      
      const updatedSchedules = schedules.map(schedule => 
        schedule.id === editingSchedule.id 
          ? { 
              ...schedule, 
              ...newSchedule,
              status: conflicts.length > 0 ? 'Conflict' : (newSchedule.status || 'Draft'),
              conflicts: conflicts.length > 0 ? conflicts : undefined
            } as Schedule
          : schedule
      );
      setSchedules(updatedSchedules);
      generateTimeSlots(updatedSchedules);
      resetForm();
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
    setSchedules(updatedSchedules);
    generateTimeSlots(updatedSchedules);
  };

  const handlePublishSchedule = (scheduleId: string) => {
    const updatedSchedules = schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, status: 'Published' as const }
        : schedule
    );
    setSchedules(updatedSchedules);
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setNewSchedule({
      courseCode: '',
      courseTitle: '',
      instructor: '',
      room: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      yearLevel: 1,
      semester: 1,
      section: '',
      capacity: 30,
      enrolled: 0,
      status: 'Draft'
    });
    setShowAddModal(false);
  };

  const getStatusBadge = (status: string, conflicts?: string[]) => {
    switch (status) {
      case 'Published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'Draft':
        return <Badge className="bg-blue-100 text-blue-800">Draft</Badge>;
      case 'Conflict':
        return <Badge className="bg-red-100 text-red-800">Conflict</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedStatus('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Scheduling</h1>
          <p className="text-muted-foreground">
            Create and manage course schedules for the academic period
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
                <DialogDescription>
                  {editingSchedule ? 'Update schedule information' : 'Create a new course schedule'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseCode">Course Code</Label>
                    <Input
                      id="courseCode"
                      value={newSchedule.courseCode}
                      onChange={(e) => setNewSchedule({...newSchedule, courseCode: e.target.value})}
                      placeholder="e.g., CS 101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={newSchedule.section}
                      onChange={(e) => setNewSchedule({...newSchedule, section: e.target.value})}
                      placeholder="e.g., A"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseTitle">Course Title</Label>
                  <Input
                    id="courseTitle"
                    value={newSchedule.courseTitle}
                    onChange={(e) => setNewSchedule({...newSchedule, courseTitle: e.target.value})}
                    placeholder="e.g., Introduction to Programming"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={newSchedule.instructor}
                      onChange={(e) => setNewSchedule({...newSchedule, instructor: e.target.value})}
                      placeholder="e.g., Dr. Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      value={newSchedule.room}
                      onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})}
                      placeholder="e.g., CS Lab 1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day</Label>
                    <select 
                      id="dayOfWeek"
                      value={newSchedule.dayOfWeek} 
                      onChange={(e) => setNewSchedule({...newSchedule, dayOfWeek: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select day</option>
                      {dayOptions.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <select 
                      id="startTime"
                      value={newSchedule.startTime} 
                      onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Start time</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <select 
                      id="endTime"
                      value={newSchedule.endTime} 
                      onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">End time</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearLevel">Year Level</Label>
                    <select 
                      id="yearLevel"
                      value={newSchedule.yearLevel?.toString() || ''} 
                      onChange={(e) => setNewSchedule({...newSchedule, yearLevel: parseInt(e.target.value)})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select year level</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <select 
                      id="semester"
                      value={newSchedule.semester?.toString() || ''} 
                      onChange={(e) => setNewSchedule({...newSchedule, semester: parseInt(e.target.value)})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select semester</option>
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newSchedule.capacity}
                      onChange={(e) => setNewSchedule({...newSchedule, capacity: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={editingSchedule ? handleUpdateSchedule : handleAddSchedule}>
                  {editingSchedule ? 'Update' : 'Add'} Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{schedules.filter(s => s.status === 'Published').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-bold">{schedules.filter(s => s.status === 'Conflict').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Save className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{schedules.filter(s => s.status === 'Draft').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Year Level</Label>
              <select 
                value={selectedYearLevel} 
                onChange={(e) => setSelectedYearLevel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Semester</Label>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All semesters</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Conflict">Conflict</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Course Schedules ({filteredSchedules.length})</CardTitle>
              <CardDescription>
                Manage course schedules and resolve conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Year/Semester</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.courseCode} - {schedule.section}</div>
                          <div className="text-sm text-muted-foreground">{schedule.courseTitle}</div>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.instructor}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{schedule.dayOfWeek}</span>
                          <span className="text-sm text-muted-foreground">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.room}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Badge variant="secondary" className="mb-1">
                            {schedule.yearLevel}{schedule.yearLevel === 1 ? 'st' : schedule.yearLevel === 2 ? 'nd' : schedule.yearLevel === 3 ? 'rd' : 'th'} Year
                          </Badge>
                          <Badge variant="outline">
                            {schedule.semester}{schedule.semester === 1 ? 'st' : 'nd'} Sem
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{schedule.enrolled}/{schedule.capacity}</span>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(schedule.enrolled / schedule.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(schedule.status, schedule.conflicts)}
                          {schedule.conflicts && schedule.conflicts.length > 0 && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {schedule.conflicts.join(', ')}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {schedule.status === 'Draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublishSchedule(schedule.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredSchedules.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">No schedules found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule View</CardTitle>
              <CardDescription>
                Visual representation of course schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Time</TableHead>
                      <TableHead>Monday</TableHead>
                      <TableHead>Tuesday</TableHead>
                      <TableHead>Wednesday</TableHead>
                      <TableHead>Thursday</TableHead>
                      <TableHead>Friday</TableHead>
                      <TableHead>Saturday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeSlots.map((slot, index) => (
                      <TableRow key={index} className="h-16">
                        <TableCell className="font-medium text-sm">{slot.time}</TableCell>
                        {dayOptions.map(day => {
                          const dayKey = day.toLowerCase() as keyof Omit<TimeSlot, 'time'>;
                          const schedule = slot[dayKey];
                          return (
                            <TableCell key={day} className="p-1">
                              {schedule && (
                                <div className={`p-2 rounded text-xs ${
                                  schedule.status === 'Published' ? 'bg-green-100 text-green-800' :
                                  schedule.status === 'Conflict' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  <div className="font-medium">{schedule.courseCode}</div>
                                  <div className="text-xs">{schedule.instructor}</div>
                                  <div className="text-xs">{schedule.room}</div>
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseScheduling;