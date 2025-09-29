import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { programDescription } from '../../../utils/getProgramDescription';
import { fetchCurriculumByProgramAndYear } from '../../../services/curriculumSlice';
import api from '../../../api/axios';
import { Calendar, Clock, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';

interface Semester {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'upcoming' | 'completed';
  subjectCount: number;
}

const ViewProspectusSemesters: React.FC = () => {
  const { programCode, yearLevel } = useParams<{ programCode: string; yearLevel: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.user);
  const { academicPrograms } = useAppSelector((state) => state.academicProgram);
  const { curriculums, isLoading } = useAppSelector((state) => state.curriculum);
  
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  // Fetch subjects data when component mounts
  useEffect(() => {
    if (programCode && yearLevel) {
      fetchSubjectsData();
    }
  }, [programCode, yearLevel]);
  
  // Fetch subjects with schedules
  const fetchSubjectsData = async () => {
    if (!programCode || !yearLevel) return;
    
    setLoadingSubjects(true);
    try {
      const response = await api.get(
        `/schedules/subjects/${programCode}/${encodeURIComponent(yearLevel)}`
      );
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };
  
  // Convert subjects data to semesters format
  useEffect(() => {
    if (subjects && subjects.length > 0) {
      const semesterCounts = {
        '1st Semester': 0,
        '2nd Semester': 0,
        'Summer': 0
      };
      
      // Count subjects by their period
      subjects.forEach((subject: any) => {
        if (subject.period && semesterCounts.hasOwnProperty(subject.period)) {
          semesterCounts[subject.period as keyof typeof semesterCounts]++;
        }
      });
      
      const dynamicSemesters: Semester[] = [
        {
          id: '1',
          name: '1st Semester',
          description: 'First semester of the academic year',
          status: 'active',
          subjectCount: semesterCounts['1st Semester']
        },
        {
          id: '2',
          name: '2nd Semester',
          description: 'Second semester of the academic year',
          status: 'upcoming',
          subjectCount: semesterCounts['2nd Semester']
        },
        {
          id: '3',
          name: 'Summer',
          description: 'Summer semester',
          status: 'completed',
          subjectCount: semesterCounts['Summer']
        }
      ];
      
      setSemesters(dynamicSemesters);
    } else {
      // If no subjects data, show default semesters with 0 subjects
      setSemesters([
        {
          id: '1',
          name: '1st Semester',
          description: 'First semester of the academic year',
          status: 'active',
          subjectCount: 0
        },
        {
          id: '2',
          name: '2nd Semester',
          description: 'Second semester of the academic year',
          status: 'upcoming',
          subjectCount: 0
        },
        {
          id: '3',
          name: 'Summer',
          description: 'Summer semester',
          status: 'completed',
          subjectCount: 0
        }
      ]);
    }
  }, [subjects]);

  const handleSemesterSelect = (semester: Semester) => {
    // Navigate to the scheduling page with year level and semester
    navigate(`/schedule-management/view-prospectus-scheduling?programCode=${programCode}&yearLevel=${yearLevel}&semester=${encodeURIComponent(semester.name)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className=" space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/schedule-management/view-prospectus')}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {programDescription(programCode ?? "", academicPrograms ?? [])} - {yearLevel}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose a semester to manage your course schedules</p>
        </div>
      </div>

      {/* Semesters Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(isLoading || loadingSubjects) ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse h-48">
                <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </CardContent>
              </Card>
            ))
          ) : semesters.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-16">
              <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Curriculum Found</h3>
              <p className="text-gray-500">Create a curriculum to get started with scheduling</p>
            </div>
          ) : semesters.map((semester, index) => {
            const colors = [
              'from-blue-500 to-blue-600',
              'from-purple-500 to-purple-600', 
              'from-green-500 to-green-600'
            ];
            const bgColors = [
              'bg-blue-50 hover:bg-blue-100',
              'bg-purple-50 hover:bg-purple-100',
              'bg-green-50 hover:bg-green-100'
            ];
            return (
              <Card 
                key={semester.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 ${bgColors[index]} group`}
                onClick={() => handleSemesterSelect(semester)}
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${colors[index]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-800">{semester.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{semester.subjectCount} Subjects</span>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${colors[index]} hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all duration-200 group-hover:shadow-lg`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSemesterSelect(semester);
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Manage Schedule
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>


    </div>
  );
};

export default ViewProspectusSemesters;