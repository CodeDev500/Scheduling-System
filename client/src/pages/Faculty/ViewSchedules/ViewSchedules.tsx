import React, { useState, useEffect } from "react";
import { Search, Calendar, Clock, MapPin, Download } from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import { useAppSelector } from "../../../hooks/redux";
import api from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Schedule {
  id: string;
  subject: string;
  code: string;
  room: string;
  startTime: string;
  endTime: string;
  day: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
  section: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  students: number;
  maxStudents: number;
  totalStudents?: number;
}

const ViewSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCurriculumYear, setFilterCurriculumYear] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [curriculumYears, setCurriculumYears] = useState<any[]>([]);
  
  const user = useAppSelector((state) => state.auth.user);
  const toast = useToast();

  // Fetch faculty schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch all schedules
        const schedulesResponse = await api.get('/schedules/latest');
        const allSchedules = schedulesResponse.data?.scheduleItems || [];

        // Filter schedules for this faculty only
        const facultySchedules = allSchedules.filter(
          (schedule: any) => String(schedule.facultyId) === String(user.id)
        );
        
        // Transform to match Schedule interface
        const transformedSchedules = facultySchedules.map((schedule: any) => ({
          id: schedule.id.toString(),
          subject: schedule.subjectName || schedule.subject,
          code: schedule.subjectCode,
          room: schedule.roomName || schedule.room,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          day: schedule.day,
          semester: schedule.semester,
          academicYear: schedule.academicYear,
          program: schedule.program,
          yearLevel: schedule.yearLevel,
          section: schedule.section || 'A',
          status: 'Active' as const,
          students: schedule.enrolledStudents || 0,
          maxStudents: schedule.maxStudents || 30,
          totalStudents: schedule.totalStudents || (schedule.students ? parseInt(schedule.students) : 0)
        }));
        
        setSchedules(transformedSchedules);
        
      
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('Failed to load schedules');
      }
    };
    
    fetchSchedules();
  }, [user?.id, toast]);

    // Fetch academic years on mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await api.get('/academic-years');
        if (response.data.success) {
          const years = response.data.data;
          setCurriculumYears(years);
          // Set active year as default filter
          const activeYear = years.find((year: any) => year.isActive);
          if (activeYear) {
            setFilterCurriculumYear(activeYear.year);
          }
        }
      } catch (error) {
        console.error('Error loading academic years:', error);
      }
    };
    fetchAcademicYears();
  }, []);

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.section.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCurriculumYear = filterCurriculumYear === "all" || schedule.academicYear === filterCurriculumYear;
    const matchesSemester = filterSemester === "all" || schedule.semester === filterSemester;
    const matchesDay = filterDay === "all" || schedule.day === filterDay;

    return matchesSearch && matchesCurriculumYear && matchesSemester && matchesDay;
  });

  // Export to PDF function
  const handleExportToPDF = () => {
    if (!filteredSchedules || filteredSchedules.length === 0) {
      toast.error('No schedules to export');
      return;
    }

    try {
      const doc = new jsPDF('landscape');
      
      // Add title
      doc.setFontSize(18);
      doc.text('My Teaching Schedules', 14, 15);
      
      // Add faculty info
      doc.setFontSize(11);
      if (user?.firstname && user?.lastname) {
        doc.text(`Faculty: ${user.firstname} ${user.lastname}`, 14, 25);
      }
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
      
      // Prepare table data
      const tableData = filteredSchedules.map((schedule) => [
        schedule.code,
        schedule.subject,
        schedule.day,
        `${schedule.startTime} - ${schedule.endTime}`,
        schedule.room,
        `${schedule.yearLevel} - ${schedule.section}`,
        schedule.totalStudents || 0,
        schedule.semester,
        schedule.program
      ]);
      
      // Add table
      autoTable(doc, {
        startY: 38,
        head: [['Code', 'Subject', 'Day', 'Time', 'Room', 'Class', 'Students', 'Semester', 'Program']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [127, 29, 29], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 38 },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 20 },
          7: { cellWidth: 30 },
          8: { cellWidth: 30 }
        }
      });
      
      const fileName = `my_schedules_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      toast.success('Schedule exported as PDF successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export schedule as PDF');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DashboardHeader 
        title="My Schedules" 
        subtitle="View and manage your teaching schedules"
      />
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by subject, code, or room..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Curriculum Year Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              value={filterCurriculumYear}
              onChange={(e) => setFilterCurriculumYear(e.target.value)}
            >
              <option value="all">All Years</option>
              {curriculumYears?.map(year => (
                <option key={year.id} value={year.year}>{year.year}</option>
              ))}
            </select>
          </div>
          {/* Semester Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <option value="all">All Semesters</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          {/* Day Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="all">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        </div>
      </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Schedule List</h3>
              <button 
                onClick={handleExportToPDF}
                className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Schedule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                  {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Students</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{schedule.subject}</div>
                        <div className="text-sm text-gray-500">{schedule.program}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.code}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {schedule.day}
                        </div>
                        <div className="flex items-center mt-1 whitespace-nowrap">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {schedule.room}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.yearLevel} - {schedule.section}
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.totalStudents || 0}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      
        </div>
     
    </div>
  );
};

export default ViewSchedules;