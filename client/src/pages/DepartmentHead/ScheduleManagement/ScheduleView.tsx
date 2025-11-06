import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Filter, 
  RefreshCw, 
  Users, 
  Clock,
  BookOpen,
  GraduationCap,
  MapPin,
  Award,
  User,
  Search,
  Save,
  Calendar,
  Table,
  Eye,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '../../../hooks/redux';
import api from '@/api/axios';

interface Schedule {
  id: string;
  subject: string;
  subjectCode?: string;
  subjectName?: string;
  units?: number;
  lec?: number;
  lab?: number;
  startTime?: string;
  endTime?: string;
  faculty: string;
  facultyId?: string;
  facultyName: string;
  room: string;
  roomName?: string;
  time: string;
  day: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
}

const ScheduleView = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterYearLevel, setFilterYearLevel] = useState('all');
  const [curriculumYear, setCurriculumYear] = useState('2025-2026');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Schedule>>({});
  
  const userData = useAppSelector((state) => state.auth.user);
  const userDepartment = userData?.department;
  const toast = useToast();

  // Fetch academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await api.get('/academic-years');
        if (response.data.success) {
          setAcademicYears(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };
    fetchAcademicYears();
  }, []);

  // Fetch schedules
  useEffect(() => {
    fetchSchedules();
  }, [curriculumYear]);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/schedules/latest');
      
      if (response.data && response.data.scheduleItems) {
        const items = response.data.scheduleItems;
        
        // Filter by department and academic year
        const departmentSchedules = items.filter((item: any) => 
          item.program === userDepartment && item.academicYear === curriculumYear
        );
        
        const formattedSchedules: Schedule[] = departmentSchedules.map((item: any) => ({
          id: item.id?.toString() || '',
          subject: item.subjectCode || '',
          subjectCode: item.subjectCode,
          subjectName: item.subjectName,
          units: item.units,
          lec: item.lec,
          lab: item.lab,
          startTime: item.startTime,
          endTime: item.endTime,
          faculty: item.facultyName || 'TBA',
          facultyId: item.facultyId?.toString(),
          facultyName: item.facultyName || 'TBA',
          room: item.roomName || item.room || 'TBA',
          roomName: item.roomName,
          time: `${item.startTime} - ${item.endTime}`,
          day: item.day,
          semester: item.semester,
          academicYear: item.academicYear,
          program: item.program,
          yearLevel: item.yearLevel
        }));
        
        setSchedules(formattedSchedules);
        
        // Extract unique programs
        const uniquePrograms = Array.from(new Set(formattedSchedules.map(s => s.program)));
        setPrograms(uniquePrograms);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to fetch schedules');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter schedules
  useEffect(() => {
    let filtered = schedules;

    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.facultyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSemester !== 'all') {
      filtered = filtered.filter(schedule => schedule.semester === filterSemester);
    }

    if (filterProgram !== 'all') {
      filtered = filtered.filter(schedule => schedule.program === filterProgram);
    }

    if (filterYearLevel !== 'all') {
      filtered = filtered.filter(schedule => schedule.yearLevel === filterYearLevel);
    }

    setFilteredSchedules(filtered);
  }, [schedules, searchTerm, filterSemester, filterProgram, filterYearLevel]);

  // Group schedules by subject code
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    const key = schedule.subjectCode || schedule.subject;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const handleViewDetails = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailsModal(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setEditFormData({
      room: schedule.room,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      day: schedule.day
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSchedule) return;

    try {
      const response = await api.put(`/schedules/${selectedSchedule.id}`, editFormData);
      
      if (response.data.success) {
        toast.success('Schedule updated successfully');
        setShowEditModal(false);
        fetchSchedules(); // Refresh schedules
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.info(`Exporting as ${format.toUpperCase()}...`);
    // Export functionality can be implemented here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-2">View and manage department schedules</p>
        </div>

        {/* Schedules Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Table className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Generated Schedules</h2>
                    <p className="text-blue-100 text-sm">View and update schedule details</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className="flex items-center space-x-3">
                    Curriculum Year:
                  </div>
                  <Select value={curriculumYear} onValueChange={setCurriculumYear}>
                    <SelectTrigger className="w-48 bg-white text-gray-900 border-white/50 hover:bg-white/95 focus:ring-2 focus:ring-white/50 font-semibold shadow-md">
                      <SelectValue placeholder="Select Curriculum Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.year}>
                          {year.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select onValueChange={(value) => handleExport(value as 'pdf' | 'excel' | 'csv')}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Export as..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all" className="text-gray-900">All Semesters</option>
                  <option value="1st Semester" className="text-gray-900">1st Semester</option>
                  <option value="2nd Semester" className="text-gray-900">2nd Semester</option>
                  <option value="Summer" className="text-gray-900">Summer</option>
                </select>
                
                <select
                  value="all"
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled
                >
                  <option value="all" className="text-gray-900">{userDepartment}</option>
                </select>
                
                <select
                  value={filterYearLevel}
                  onChange={(e) => setFilterYearLevel(e.target.value)}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all" className="text-gray-900">All Year Levels</option>
                  <option value="1st Year" className="text-gray-900">1st Year</option>
                  <option value="2nd Year" className="text-gray-900">2nd Year</option>
                  <option value="3rd Year" className="text-gray-900">3rd Year</option>
                  <option value="4th Year" className="text-gray-900">4th Year</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-4 text-gray-600">Loading schedules...</p>
              </div>
            ) : filteredSchedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span>Subject</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>Schedule & Room</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span>Faculty</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          <span>Program</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <span>Semester</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>Units</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(groupedSchedules).map(([subjectCode, subjectSchedules], groupIndex) => {
                      const firstSubject = subjectSchedules[0];
                      
                      return (
                        <tr key={subjectCode} className={`hover:bg-blue-50/50 transition-colors ${
                          groupIndex % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
                        }`}>
                          <td className="px-6 py-5 truncate max-w-xs">
                            <div>
                              <div className="text-sm font-bold text-gray-900">{firstSubject?.subjectCode || 'N/A'}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">{firstSubject.subjectName}</div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5">
                            <div className="space-y-2">
                              {subjectSchedules.map((schedule, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    {schedule.day}
                                  </Badge>
                                  <span className="text-sm text-gray-700">{schedule.time}</span>
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                    {schedule.room}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </td>
                          
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{firstSubject.facultyName}</div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{firstSubject.program}</div>
                              <div className="text-xs text-gray-500">{firstSubject.yearLevel}</div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5 whitespace-nowrap">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                              {firstSubject.semester || 'N/A'}
                            </Badge>
                          </td>
                          
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="space-y-1">
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                {firstSubject.units || 0} units
                              </Badge>
                              <div className="text-xs text-gray-500">
                                Lec: {firstSubject.lec || 0} | Lab: {firstSubject.lab || 0}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(firstSubject)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSchedule(firstSubject)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Table className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No schedules found</h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm || filterSemester !== 'all' || filterYearLevel !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No schedules have been generated yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Details Modal */}
        {showDetailsModal && selectedSchedule && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Details</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Subject Code</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.subjectCode}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Subject Name</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.subjectName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Faculty</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.facultyName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Room</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.room}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Day</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.day}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Time</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.time}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Program</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.program}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Year Level</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.yearLevel}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Semester</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.semester}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Units</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedSchedule.units} (Lec: {selectedSchedule.lec} | Lab: {selectedSchedule.lab})</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => setShowDetailsModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSchedule && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Schedule</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <input
                    type="text"
                    value={editFormData.room || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={editFormData.day || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="M">Monday</option>
                    <option value="T">Tuesday</option>
                    <option value="W">Wednesday</option>
                    <option value="Th">Thursday</option>
                    <option value="F">Friday</option>
                    <option value="S">Saturday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={editFormData.startTime || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={editFormData.endTime || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
