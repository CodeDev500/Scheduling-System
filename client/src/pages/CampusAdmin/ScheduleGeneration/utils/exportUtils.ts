import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ScheduleItem {
  subjectCode?: string;
  subjectName?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  roomName?: string;
  facultyName?: string;
  units?: number;
  lec?: number;
  lab?: number;
  yearLevel?: string;
  semester?: string;
  program?: string;
}

interface GeneratedSchedule {
  subjects: ScheduleItem[];
  name?: string;
  createdAt?: Date;
}

export const exportToPDF = (schedule: GeneratedSchedule, curriculumYear?: string, semester?: string) => {
  const doc = new jsPDF('landscape');
  
  // Add title
  doc.setFontSize(18);
  doc.text('Class Schedule', 14, 15);
  
  // Add metadata
  doc.setFontSize(11);
  if (curriculumYear) {
    doc.text(`Curriculum Year: ${curriculumYear}`, 14, 25);
  }
  if (semester) {
    doc.text(`Semester: ${semester}`, 14, 32);
  }
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 39);
  
  // Prepare table data
  const tableData = schedule.subjects.map((item: ScheduleItem) => [
    item.subjectCode || '',
    item.subjectName || '',
    item.day || '',
    `${item.startTime || ''} - ${item.endTime || ''}`,
    item.roomName || '',
    item.facultyName || '',
    `${item.units || 0}`,
    `${item.lec || 0} | ${item.lab || 0}`,
    item.yearLevel || '',
    item.program || ''
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 45,
    head: [['Code', 'Subject', 'Days', 'Time', 'Room', 'Faculty', 'Units', 'Lec|Lab', 'Year', 'Program']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 45 },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 45 },
      2: { cellWidth: 20 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
      5: { cellWidth: 35 },
      6: { cellWidth: 15 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
      9: { cellWidth: 25 }
    }
  });
  
  // Save PDF
  const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

export const exportToExcel = (schedule: GeneratedSchedule, curriculumYear?: string, semester?: string) => {
  // Prepare data for Excel
  const excelData = schedule.subjects.map((item: ScheduleItem) => ({
    'Subject Code': item.subjectCode || '',
    'Subject Name': item.subjectName || '',
    'Days': item.day || '',
    'Start Time': item.startTime || '',
    'End Time': item.endTime || '',
    'Room': item.roomName || '',
    'Faculty': item.facultyName || '',
    'Units': item.units || 0,
    'Lecture': item.lec || 0,
    'Lab': item.lab || 0,
    'Year Level': item.yearLevel || '',
    'Semester': item.semester || '',
    'Program': item.program || ''
  }));
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Subject Code
    { wch: 35 },  // Subject Name
    { wch: 10 },  // Days
    { wch: 12 },  // Start Time
    { wch: 12 },  // End Time
    { wch: 20 },  // Room
    { wch: 25 },  // Faculty
    { wch: 8 },   // Units
    { wch: 8 },   // Lecture
    { wch: 8 },   // Lab
    { wch: 12 },  // Year Level
    { wch: 15 },  // Semester
    { wch: 15 }   // Program
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
  
  // Save Excel file
  const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToCSV = (schedule: GeneratedSchedule, curriculumYear?: string, semester?: string) => {
  // Prepare CSV data
  const csvData = schedule.subjects.map((item: ScheduleItem) => ({
    'Subject Code': item.subjectCode || '',
    'Subject Name': item.subjectName || '',
    'Days': item.day || '',
    'Start Time': item.startTime || '',
    'End Time': item.endTime || '',
    'Room': item.roomName || '',
    'Faculty': item.facultyName || '',
    'Units': item.units || 0,
    'Lecture': item.lec || 0,
    'Lab': item.lab || 0,
    'Year Level': item.yearLevel || '',
    'Semester': item.semester || '',
    'Program': item.program || ''
  }));
  
  // Create workbook and convert to CSV
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(csvData);
  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
  
  // Save CSV file
  const fileName = `schedule_${curriculumYear || 'export'}_${semester || ''}_${new Date().getTime()}.csv`;
  XLSX.writeFile(wb, fileName, { bookType: 'csv' });
};
