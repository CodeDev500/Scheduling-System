import { useState, useEffect } from "react";
import { MdSearch } from "react-icons/md";
import { AiOutlineDownload } from "react-icons/ai";
import Button from "../../../components/buttons/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "@/api/axios";

interface Schedule {
  id: number;
  subjectCode: string;
  subjectDescription: string;
  units: number;
  time: string;
  day: string;
  roomNo: string;
  students: string;
  instructor: string;
  program: string;
  yearLevel: string;
  semester: string;
  academicYear: string;
}

const Schedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>(["1st Year", "2nd Year", "3rd Year", "4th Year"]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch academic years and set active one as default
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const response = await api.get("/academic-years");
        if (response.data.success) {
          setAcademicYears(response.data.data);
          // Set active year as default
          const activeYear = response.data.data.find((year: any) => year.isActive);
          if (activeYear) {
            setSelectedAcademicYear(activeYear.year);
          }
        }
      } catch (error) {
        console.error("Error loading academic years:", error);
      }
    };
    loadAcademicYears();
  }, []);

  // Fetch schedules from server
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/schedules/all");

        const data = response.data;
        if (data.success && data.data) {
          setSchedules(data.data);
          // Extract unique programs
          const uniquePrograms = [...new Set(data.data.map((s: any) => s.program))];
          setPrograms(["All Programs", ...(uniquePrograms as string[])]);
        } else if (Array.isArray(data)) {
          // Handle case where data is directly an array
          setSchedules(data);
          const uniquePrograms = [...new Set(data.map((s: any) => s.program))];
          setPrograms(["All Programs", ...(uniquePrograms as string[])]);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        // Set empty array on error to show "No schedules found"
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Filter schedules based on search and filters
  useEffect(() => {
    let filtered = schedules;

    // Filter by academic year
    if (selectedAcademicYear) {
      filtered = filtered.filter(s => s.semester === selectedAcademicYear || s.academicYear === selectedAcademicYear);
    }

    // Filter by program
    if (selectedProgram !== "All Programs") {
      filtered = filtered.filter(s => s.program === selectedProgram);
    }

    // Filter by year level
    if (selectedYear !== "All Years") {
      filtered = filtered.filter(s => s.yearLevel === selectedYear);
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.subjectCode.toLowerCase().includes(searchLower) ||
        s.subjectDescription.toLowerCase().includes(searchLower) ||
        s.instructor.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSchedules(filtered);
  }, [schedules, selectedAcademicYear, selectedProgram, selectedYear, search]);

  // Helper function to sort days in proper weekly order
  const sortDays = (days: string[]): string[] => {
    const dayOrder: Record<string, number> = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 7
    };
    return days.sort((a, b) => (dayOrder[a] || 8) - (dayOrder[b] || 8));
  };

  // Helper function to convert day names to abbreviations
  const getDayAbbreviation = (day: string): string => {
    const dayMap: Record<string, string> = {
      'Monday': 'M', 'Tuesday': 'T', 'Wednesday': 'W', 'Thursday': 'Th',
      'Friday': 'F', 'Saturday': 'S', 'Sunday': 'Su'
    };
    return dayMap[day] || day;
  };

  // Group schedules by subject and combine days and rooms
  const groupSchedulesBySubject = (schedules: Schedule[]): Schedule[] => {
    const grouped: Record<string, Schedule[]> = {};
    
    schedules.forEach(schedule => {
      const key = `${schedule.subjectCode}-${schedule.program}-${schedule.yearLevel}-${schedule.instructor}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });
    
    return Object.values(grouped).map(group => {
      const first = group[0];
      const uniqueDays = [...new Set(group.map(s => s.day || ''))];
      const sortedDays = sortDays(uniqueDays);
      const combinedDays = sortedDays.map(d => getDayAbbreviation(d)).join(', ');
      const times = [...new Set(group.map(s => s.time))].join(' | ');
      const rooms = [...new Set(group.map(s => s.roomNo))].join(', ');
      
      return {
        ...first,
        day: combinedDays,
        time: times,
        roomNo: rooms
      };
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('Class Schedule', 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);
    
    const groupedSchedules = groupSchedulesBySubject(filteredSchedules);
    const tableData = groupedSchedules.map((item) => [
      item.subjectCode,
      item.subjectDescription,
      item.day,
      item.time,
      item.roomNo,
      item.instructor,
      item.units.toString(),
      item.students,
      item.yearLevel,
      item.program
    ]);
    
    autoTable(doc, {
      startY: 35,
      head: [['Code', 'Subject', 'Day', 'Time', 'Room', 'Instructor', 'Units', 'Students', 'Year', 'Program']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 18 }, 1: { cellWidth: 35 }, 2: { cellWidth: 15 },
        3: { cellWidth: 25 }, 4: { cellWidth: 15 }, 5: { cellWidth: 25 },
        6: { cellWidth: 12 }, 7: { cellWidth: 15 }, 8: { cellWidth: 15 },
        9: { cellWidth: 18 }
      }
    });
    
    doc.save(`schedules_${new Date().getTime()}.pdf`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const groupedSchedules = groupSchedulesBySubject(filteredSchedules);
    const csvData = groupedSchedules.map((item) => ({
      'Subject Code': item.subjectCode,
      'Subject Description': item.subjectDescription,
      'Day': item.day,
      'Time': item.time,
      'Room': item.roomNo,
      'Instructor': item.instructor,
      'Units': item.units,
      'Students': item.students,
      'Year Level': item.yearLevel,
      'Program': item.program
    }));
    
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedules');
    XLSX.writeFile(wb, `schedules_${new Date().getTime()}.csv`, { bookType: 'csv' });
  };

  return (
    <div className="flex w-full justify-between flex-col gap-6">
      {/* Header and Filters */}
      <div className="flex justify-between gap-4 flex-col lg:flex-row items-start lg:items-center">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-lg font-bold whitespace-nowrap">
            Filter Schedule by:
          </h1>

          {/* Academic Year Filter */}
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.year}>
                {year.year} {year.isActive ? '(Active)' : ''}
              </option>
            ))}
          </select>
          
          {/* Program Filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Programs">All Programs</option>
            {programs.filter(p => p !== "All Programs").map((program) => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Years">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Search and Export */}
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none lg:max-w-sm">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="Search by code, subject, or instructor..."
              className="w-full p-2 pr-10 border border-gray-300 rounded-lg text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm"
              title="Export to PDF"
            >
              <AiOutlineDownload /> PDF
            </button>
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm"
              title="Export to CSV"
            >
              <AiOutlineDownload /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading schedules...</div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No schedules found</div>
        ) : (
          <table className="w-full text-sm border-separate border-spacing-0 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {[
                  "Subject Code",
                  "Subject Description",
                  "Units",
                  "Time",
                  "Day",
                  "Room",
                  "Students",
                  "Instructor",
                  "Year Level",
                  "Program"
                ].map((header) => (
                  <th
                    key={header}
                    className="border-y border-gray-200 px-4 py-2 text-left font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {groupSchedulesBySubject(filteredSchedules).map((schedule, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors duration-150 text-gray-600 border-t border-gray-200"
                >
                  <td className="px-4 py-3 font-medium text-blue-600">{schedule.subjectCode}</td>
                  <td className="px-4 py-3">{schedule.subjectDescription}</td>
                  <td className="px-4 py-3 text-center">{schedule.units}</td>
                  <td className="px-4 py-3">{schedule.time}</td>
                  <td className="px-4 py-3 text-center font-semibold">{schedule.day}</td>
                  <td className="px-4 py-3 text-center font-medium">{schedule.roomNo}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      {schedule.students}
                    </span>
                  </td>
                  <td className="px-4 py-3">{schedule.instructor}</td>
                  <td className="px-4 py-3 text-center">{schedule.yearLevel}</td>
                  <td className="px-4 py-3 text-center">{schedule.program}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {!isLoading && (
        <div className="text-sm text-gray-600 text-right">
          Showing {groupSchedulesBySubject(filteredSchedules).length} of {groupSchedulesBySubject(schedules).length} schedules (grouped by subject)
        </div>
      )}
    </div>
  );
};

export default Schedules;
