import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, Clock, MapPin, User, Download, Eye } from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";

interface Schedule {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  time: string;
  day: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
  section: string;
  status: 'Active' | 'Pending' | 'Completed';
}

const ViewSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");

  useEffect(() => {
    // Mock data for schedules
    const mockSchedules: Schedule[] = [
      {
        id: "SCH001",
        subject: "Data Structures and Algorithms",
        faculty: "Dr. Maria Santos",
        room: "Room 101",
        time: "08:00 - 09:30",
        day: "Monday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "BSIT",
        yearLevel: "2nd Year",
        section: "A",
        status: "Active"
      },
      {
        id: "SCH002",
        subject: "Database Management Systems",
        faculty: "Prof. John Dela Cruz",
        room: "Room 102",
        time: "10:00 - 11:30",
        day: "Tuesday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "BSCS",
        yearLevel: "3rd Year",
        section: "B",
        status: "Active"
      },
      {
        id: "SCH003",
        subject: "Web Development",
        faculty: "Ms. Ana Rodriguez",
        room: "Room 103",
        time: "13:00 - 14:30",
        day: "Wednesday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "BSIT",
        yearLevel: "3rd Year",
        section: "A",
        status: "Pending"
      },
      {
        id: "SCH004",
        subject: "Software Engineering",
        faculty: "Dr. Robert Garcia",
        room: "Room 104",
        time: "15:00 - 16:30",
        day: "Thursday",
        semester: "2nd Semester",
        academicYear: "2023-2024",
        program: "BSCS",
        yearLevel: "4th Year",
        section: "A",
        status: "Completed"
      },
      {
        id: "SCH005",
        subject: "Mobile Application Development",
        faculty: "Prof. Lisa Chen",
        room: "Room 105",
        time: "09:00 - 10:30",
        day: "Friday",
        semester: "1st Semester",
        academicYear: "2024-2025",
        program: "BSIT",
        yearLevel: "4th Year",
        section: "B",
        status: "Active"
      }
    ];
    setSchedules(mockSchedules);
  }, []);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === "all" || schedule.semester === filterSemester;
    const matchesStatus = filterStatus === "all" || schedule.status === filterStatus;
    const matchesProgram = filterProgram === "all" || schedule.program === filterProgram;
    
    return matchesSearch && matchesSemester && matchesStatus && matchesProgram;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "Active":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DashboardHeader 
        title="View Schedules" 
        subtitle="Manage and monitor all academic schedules"
      />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by subject, faculty, or program..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <option value="all">All Semesters</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
            >
              <option value="all">All Programs</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Schedules
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calendar className="w-4 h-4" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Schedules ({filteredSchedules.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{schedule.subject}</div>
                      <div className="text-sm text-gray-500">{schedule.yearLevel} - Section {schedule.section}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{schedule.faculty}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {schedule.time}
                      </div>
                      <div className="text-sm text-gray-500">{schedule.day}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {schedule.room}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{schedule.program}</div>
                      <div className="text-sm text-gray-500">{schedule.semester}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(schedule.status)}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSchedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSchedules;
