import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

import { Badge } from '../../../components/ui/badge';
// Using regular table and modal elements since components don't exist
import { Label } from '../../../components/ui/label';
// Using regular textarea since component doesn't exist
import { Plus, Search, Filter, BookOpen, Users, Calendar, Eye, Edit, Trash2 } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  yearLevel: number;
  semester: number;
  prerequisites: string[];
  description: string;
  status: 'Active' | 'Inactive' | 'Pending';
  capacity: number;
  enrolled: number;
  instructor?: string;
  schedule?: string;
  room?: string;
}

const CourseOffering: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    code: '',
    title: '',
    units: 3,
    yearLevel: 1,
    semester: 1,
    prerequisites: [],
    description: '',
    status: 'Active',
    capacity: 30,
    enrolled: 0
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockCourses: Course[] = [
      {
        id: '1',
        code: 'CS 130',
        title: 'CS THESIS I',
        units: 3,
        yearLevel: 3,
        semester: 1,
        prerequisites: ['CS 120', 'CS 125'],
        description: 'First part of computer science thesis project',
        status: 'Active',
        capacity: 25,
        enrolled: 18,
        instructor: 'Dr. Smith',
        schedule: 'MWF 10:00-11:00',
        room: 'CS Lab 1'
      },
      {
        id: '2',
        code: 'CS 132',
        title: 'SOFTWARE ENGINEERING 2',
        units: 3,
        yearLevel: 3,
        semester: 2,
        prerequisites: ['CS 131'],
        description: 'Advanced software engineering concepts and practices',
        status: 'Active',
        capacity: 30,
        enrolled: 22,
        instructor: 'Prof. Johnson',
        schedule: 'TTH 2:00-3:30',
        room: 'CS Lab 2'
      },
      {
        id: '3',
        code: 'CS 101',
        title: 'Introduction to Programming',
        units: 3,
        yearLevel: 1,
        semester: 1,
        prerequisites: [],
        description: 'Basic programming concepts using Python',
        status: 'Active',
        capacity: 35,
        enrolled: 35,
        instructor: 'Ms. Davis',
        schedule: 'MWF 8:00-9:00',
        room: 'CS Lab 3'
      },
      {
        id: '4',
        code: 'MATH 101',
        title: 'College Algebra',
        units: 3,
        yearLevel: 1,
        semester: 1,
        prerequisites: [],
        description: 'Fundamental algebraic concepts',
        status: 'Pending',
        capacity: 40,
        enrolled: 0
      }
    ];
    setCourses(mockCourses);
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by year level
    if (selectedYearLevel) {
      filtered = filtered.filter(course => course.yearLevel === parseInt(selectedYearLevel));
    }
    
    // Filter by semester
    if (selectedSemester) {
      filtered = filtered.filter(course => course.semester === parseInt(selectedSemester));
    }
    
    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(course => course.status === selectedStatus);
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedYearLevel, selectedSemester, selectedStatus]);

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.title) {
      const course: Course = {
        id: Date.now().toString(),
        code: newCourse.code!,
        title: newCourse.title!,
        units: newCourse.units || 3,
        yearLevel: newCourse.yearLevel || 1,
        semester: newCourse.semester || 1,
        prerequisites: newCourse.prerequisites || [],
        description: newCourse.description || '',
        status: newCourse.status as 'Active' | 'Inactive' | 'Pending' || 'Active',
        capacity: newCourse.capacity || 30,
        enrolled: 0
      };
      
      setCourses([...courses, course]);
      setNewCourse({
        code: '',
        title: '',
        units: 3,
        yearLevel: 1,
        semester: 1,
        prerequisites: [],
        description: '',
        status: 'Active',
        capacity: 30,
        enrolled: 0
      });
      setShowAddModal(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse(course);
    setShowAddModal(true);
  };

  const handleUpdateCourse = () => {
    if (editingCourse && newCourse.code && newCourse.title) {
      const updatedCourses = courses.map(course => 
        course.id === editingCourse.id 
          ? { ...course, ...newCourse } as Course
          : course
      );
      setCourses(updatedCourses);
      setEditingCourse(null);
      setNewCourse({
        code: '',
        title: '',
        units: 3,
        yearLevel: 1,
        semester: 1,
        prerequisites: [],
        description: '',
        status: 'Active',
        capacity: 30,
        enrolled: 0
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
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
          <h1 className="text-3xl font-bold tracking-tight">Course Offering</h1>
          <p className="text-muted-foreground">
            Manage course offerings for the current academic period
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
        
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                <p className="text-sm text-gray-600">
                  {editingCourse ? 'Update course information' : 'Create a new course offering'}
                </p>
              </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    placeholder="e.g., CS 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Input
                    id="units"
                    type="number"
                    value={newCourse.units}
                    onChange={(e) => setNewCourse({...newCourse, units: parseInt(e.target.value)})}
                    min="1"
                    max="6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearLevel">Year Level</Label>
                  <select 
                    id="yearLevel"
                    value={newCourse.yearLevel?.toString() || ''} 
                    onChange={(e) => setNewCourse({...newCourse, yearLevel: parseInt(e.target.value)})}
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
                    value={newCourse.semester?.toString() || ''} 
                    onChange={(e) => setNewCourse({...newCourse, semester: parseInt(e.target.value)})}
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
                    value={newCourse.capacity}
                    onChange={(e) => setNewCourse({...newCourse, capacity: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="Course description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status"
                  value={newCourse.status} 
                  onChange={(e) => setNewCourse({...newCourse, status: e.target.value as 'Active' | 'Inactive' | 'Pending'})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={editingCourse ? handleUpdateCourse : handleAddCourse}>
                  {editingCourse ? 'Update' : 'Add'} Course
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.status === 'Active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Courses</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.status === 'Pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Enrollment</p>
                <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.enrolled, 0)}</p>
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
                  placeholder="Search courses..."
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
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

      {/* Course Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Offerings ({filteredCourses.length})</CardTitle>
          <CardDescription>
            Manage and monitor course offerings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Course Code</th>
                <th className="text-left p-2">Course Title</th>
                <th className="text-left p-2">Units</th>
                <th className="text-left p-2">Year/Semester</th>
                <th className="text-left p-2">Enrollment</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Instructor</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b">
                  <td className="font-medium p-2">{course.code}</td>
                  <td className="p-2">{course.title}</td>
                  <td className="p-2">{course.units}</td>
                  <td className="p-2">
                    <div className="flex flex-col">
                      <Badge variant="secondary" className="mb-1">
                        {course.yearLevel}{course.yearLevel === 1 ? 'st' : course.yearLevel === 2 ? 'nd' : course.yearLevel === 3 ? 'rd' : 'th'} Year
                      </Badge>
                      <Badge variant="outline">
                        {course.semester}{course.semester === 1 ? 'st' : 'nd'} Sem
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{course.enrolled}/{course.capacity}</span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{getStatusBadge(course.status)}</td>
                  <td className="p-2">{course.instructor || 'Not assigned'}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">No courses found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseOffering;