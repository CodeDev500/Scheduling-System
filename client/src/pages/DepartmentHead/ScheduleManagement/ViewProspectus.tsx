import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useAppSelector } from '../../../hooks/redux';
import { programDescription } from "../../../utils/getProgramDescription";
import { Eye, GraduationCap, Calendar, BookOpen, Download, Printer } from 'lucide-react';
import api from '../../../api/axios';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Subject {
  code: string;
  title: string;
  prereq: string;
  lec: number;
  lab: number;
  total: number;
}

interface ProspectusData {
  [yearLevel: string]: {
    [semester: string]: Subject[];
  };
}

const ViewProspectus: React.FC = () => {
  const userData = useAppSelector((state) => state.auth.user);
  const programCode = userData?.department ?? '';
  const { academicPrograms } = useAppSelector((state) => state.academicProgram);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('Loading...');
  const [prospectusData, setProspectusData] = useState<ProspectusData | null>(null);
  const [loading, setLoading] = useState(false);
  const prospectusRef = useRef<HTMLDivElement>(null);

  const programName = programDescription(programCode ?? "", academicPrograms ?? []);

  // Fetch active academic year
  useEffect(() => {
    fetchActiveAcademicYear();
  }, []);

  useEffect(() => {
    if (programCode && activeAcademicYear && activeAcademicYear !== 'Loading...') {
      fetchProspectusData();
    }
  }, [programCode, activeAcademicYear]);

  const fetchActiveAcademicYear = async () => {
    try {
      const response = await api.get('/academic-years');
      if (response.data.success) {
        const activeYear = response.data.data.find((year: any) => year.isActive);
        if (activeYear) {
          setActiveAcademicYear(activeYear.year);
        } else {
          setActiveAcademicYear('No active year');
        }
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
      setActiveAcademicYear('N/A');
    }
  };

  const fetchProspectusData = async () => {
    if (!programCode || !activeAcademicYear) return;
    
    setLoading(true);
    try {
      const response = await api.get('/schedules/generation/prospectus', {
        params: {
          academicYear: activeAcademicYear,
          program: programCode
        }
      });
      if (response.data.success) {
        setProspectusData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching prospectus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: prospectusRef,
    documentTitle: `Prospectus_${programCode}_${activeAcademicYear.replace(/\//g, '-')}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `
  });

  const handleDownloadPDF = async () => {
    try {
      // Hide buttons before capture
      const buttons = document.querySelectorAll('.no-print');
      buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

      // Get the prospectus content
      const element = document.querySelector('.prospectus-content') as HTMLElement;
      if (!element) return;

      // Capture the content as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Show buttons again
      buttons.forEach(btn => (btn as HTMLElement).style.display = '');

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `Prospectus_${programCode}_${activeAcademicYear.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try using the Print button instead.');
    }
  };

  const renderSemesterTable = (yearLevel: string, semester: string) => {
    const subjects = prospectusData?.[yearLevel]?.[semester] || [];
    const totalLec = subjects.reduce((sum, s) => sum + s.lec, 0);
    const totalLab = subjects.reduce((sum, s) => sum + s.lab, 0);
    const totalUnits = subjects.reduce((sum, s) => sum + s.total, 0);

    return (
      <div className="flex-1">
        <h3 className="text-lg font-bold text-center mb-3">{semester}</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-2 text-left font-bold">Code</th>
              <th className="border border-black px-2 py-2 text-left font-bold">Descriptive Title</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Prereq</th>
              <th className="border border-black px-2 py-2 text-center font-bold" colSpan={3}>Units</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1"></th>
              <th className="border border-black px-2 py-1"></th>
              <th className="border border-black px-2 py-1"></th>
              <th className="border border-black px-2 py-1 text-center font-bold">Lec</th>
              <th className="border border-black px-2 py-1 text-center font-bold">Lab</th>
              <th className="border border-black px-2 py-1 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((subject, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-black px-2 py-2">{subject.code}</td>
                  <td className="border border-black px-2 py-2">{subject.title}</td>
                  <td className="border border-black px-2 py-2 text-center">{subject.prereq}</td>
                  <td className="border border-black px-2 py-2 text-center">{subject.lec}</td>
                  <td className="border border-black px-2 py-2 text-center">{subject.lab}</td>
                  <td className="border border-black px-2 py-2 text-center font-bold">{subject.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border border-black px-2 py-8 text-center text-gray-500">
                  No subjects available
                </td>
              </tr>
            )}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={3} className="border border-black px-2 py-2 text-right">TOTAL</td>
              <td className="border border-black px-2 py-2 text-center">{totalLec}</td>
              <td className="border border-black px-2 py-2 text-center">{totalLab}</td>
              <td className="border border-black px-2 py-2 text-center">{totalUnits}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs mt-1 text-gray-600">*NOTE: 1 Laboratory Unit = _3_ number of contact hours</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen  from-slate-50 via-blue-50 to-indigo-50 ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="border-0 shadow-lg bg-blue-500 from-blue-600 via-purple-600 to-indigo-600 text-white">
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-full">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl lg:text-4xl font-bold tracking-tight">
                  Academic Prospectus
                </CardTitle>
                <p className="text-blue-100 text-lg mt-2">
                  {programName}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-200" />
                  <span className="text-sm font-medium text-blue-100">Program Code</span>
                </div>
                <p className="text-xl font-bold mt-1">{programCode}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-200" />
                  <span className="text-sm font-medium text-blue-100">Academic Year</span>
                </div>
                <p className="text-xl font-bold mt-1">{activeAcademicYear}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-200" />
                  <span className="text-sm font-medium text-blue-100">Department</span>
                </div>
                <p className="text-xl font-bold mt-1">{userData?.department}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Print/Download Buttons */}
        <div className="no-print flex justify-end gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            disabled={loading}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          {/* <Button 
            variant="default" 
            size="sm" 
            onClick={handleDownloadPDF}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-1" />
            Download PDF
          </Button> */}
        </div>

        {/* Prospectus Content */}
        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading prospectus...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-8 prospectus-content" ref={prospectusRef}>
              <style>{`
                @media print {
                  .no-print {
                    display: none !important;
                  }
                  body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                  }
                  @page {
                    size: A4;
                    margin: 1cm;
                  }
                }
              `}</style>

              {/* Prospectus Header */}
              <div className="text-center mb-8">
                <p className="text-sm italic mb-2">Effective SY {activeAcademicYear}</p>
                <h2 className="text-2xl font-bold mb-2">PROGRAM CURRICULAR PROSPECTUS</h2>
                <p className="text-lg font-semibold text-gray-700">{programName}</p>
              </div>

              {/* Year Levels */}
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yearLevel) => (
                <div key={yearLevel} className="mb-12">
                  <h3 className="text-xl font-bold text-center mb-4">{yearLevel.toUpperCase()}</h3>
                  
                  {/* First and Second Semester Side by Side */}
                  <div className="flex gap-6 mb-6">
                    {renderSemesterTable(yearLevel, '1st Semester')}
                    {renderSemesterTable(yearLevel, '2nd Semester')}
                  </div>

                  {/* Summer Semester (if exists) */}
                  {prospectusData?.[yearLevel]?.['Summer'] && prospectusData[yearLevel]['Summer'].length > 0 && (
                    <div className="mt-6">
                      {renderSemesterTable(yearLevel, 'Summer')}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewProspectus;