import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import api from '../../../api/axios';
import { ArrowLeft, Download, Printer } from 'lucide-react';

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

const ViewProspectusSemesters: React.FC = () => {
  const { programCode } = useParams<{ programCode: string }>();
  const navigate = useNavigate();

  const [prospectusData, setProspectusData] = useState<ProspectusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('');

  // Fetch active academic year and prospectus data
  useEffect(() => {
    fetchActiveAcademicYear();
  }, []);

  useEffect(() => {
    if (programCode && activeAcademicYear) {
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
        }
      }
    } catch (error) {
      console.error('Error fetching active academic year:', error);
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Trigger print dialog which can save as PDF
    window.print();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prospectus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
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
      
      <div className="max-w-[1200px] mx-auto">
        {/* Action Buttons - Hidden when printing */}
        <div className="no-print flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/schedule-management/view-prospectus')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-sm italic mb-2">Effective SY {activeAcademicYear}</p>
          <h1 className="text-2xl font-bold mb-4">PROGRAM CURRICULAR PROSPECTUS</h1>
        </div>

        {/* Year Levels */}
        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yearLevel) => (
          <div key={yearLevel} className="mb-12">
            <h2 className="text-xl font-bold text-center mb-4">{yearLevel.toUpperCase()}</h2>
            
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
      </div>
    </div>
  );
};

export default ViewProspectusSemesters;