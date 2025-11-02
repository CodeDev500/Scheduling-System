import { useState, useRef } from 'react';
import { toast } from 'sonner';
import type { GeneratedSchedule } from '../../../../types';
import type { ScheduleItem, OptimizationConstraints } from '../../../../types';
import api from '@/api/axios';

export const useScheduleGeneration = (instructors: any[] = [], curriculumYear: string = '') => {

  // Form state
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [targetStudents, setTargetStudents] = useState(30);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [currentStep, setCurrentStep] = useState('');

  // Schedule state
  const [generatedSchedules, setGeneratedSchedules] = useState<GeneratedSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<GeneratedSchedule | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('generation');
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);

  // Optimization constraints
  const [optimizationConstraints] = useState<OptimizationConstraints>({
    maxConsecutiveHours: 4,
    minBreakBetweenClasses: 30,
    preferredStartTime: '08:00',
    preferredEndTime: '17:00',
    avoidBackToBackLabs: true,
    facultyMaxHoursPerDay: 8,
    roomUtilizationTarget: 80
  });

  // Ref for scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch schedule from server
  const handleGenerateSchedule = async (year?: string, semester?: string) => {
    const yearToUse = year || curriculumYear;
    const semesterToUse = semester || selectedSemester;
    
    // Validate curriculum year and semester are selected
    if (!yearToUse) {
      toast.error('Please select a curriculum year before generating schedule');
      return;
    }
    
    if (!semesterToUse) {
      toast.error('Please select a semester before generating schedule');
      return;
    }

    console.log('Starting schedule generation from server...');
    console.log('Curriculum Year:', yearToUse);
    console.log('Semester:', semesterToUse);
    console.log('Target Students:', targetStudents);
    console.log('Optimization Constraints:', optimizationConstraints);

    setIsGenerating(true);
    setGenerationProgress(0);
    setCompletedSteps([]);
    setCurrentStep('Fetching schedule from server...');
    setEstimatedTime('5-10 seconds');

    try {
      // Call server API to generate schedule
      setCurrentStep('Requesting schedule generation...');
      setGenerationProgress(20);

      const response = await api.get('/schedules/generation/generate', {
        params: {
          curriculumYear: yearToUse,
          semester: semesterToUse
        }
      });

      setGenerationProgress(60);
      setCurrentStep('Processing server response...');

      if (response.data.success && response.data.data) {
        const serverSchedules = response.data.data;
        console.log('Received schedules from server:', serverSchedules);

        setGenerationProgress(80);
        setCurrentStep('Finalizing schedule...');

        // Set the generated schedules from server
        setGeneratedSchedules(serverSchedules);
        setSelectedSchedule(serverSchedules[0] || null);
        
        setIsGenerating(false);
        setGenerationProgress(100);
        setCurrentStep('Schedule generated successfully!');
        setCompletedSteps(['evaluating', 'optimizing', 'finalizing']);

        const totalConflicts = serverSchedules.reduce((sum: number, schedule: any) => 
          sum + (schedule.conflicts?.length || 0), 0
        );

        // Check for overload warning from server
        if (response.data.warning) {
          const warning = response.data.warning;
          toast.warning(warning.message, {
            duration: 8000,
            description: `${warning.scheduledUnits}/${warning.maxUnits} units scheduled. Overload courses must be assigned by Program Head.`
          });
        } else if (totalConflicts > 0) {
          toast.warning(`Schedule generated with ${totalConflicts} conflicts detected`);
        } else {
          toast.success('Schedule generated successfully with no conflicts!');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error generating schedule:', error);
      setIsGenerating(false);
      setCurrentStep('Error occurred during generation');
      
      // Show specific error message from server if available
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate schedule from server. Please try again.';
      toast.error(errorMessage, {
        duration: 5000,
        description: error?.response?.data?.success === false ? 'Please check the curriculum year selection' : undefined
      });
    }
  };

  return {
    // Form state
    selectedDepartment,
    setSelectedDepartment,
    selectedProgram,
    setSelectedProgram,
    selectedYearLevel,
    setSelectedYearLevel,
    selectedSemester,
    setSelectedSemester,
    targetStudents,
    setTargetStudents,

    // Generation state
    isGenerating,
    generationProgress,
    completedSteps,
    estimatedTime,
    currentStep,

    // Schedule state
    generatedSchedules,
    setGeneratedSchedules,
    selectedSchedule,
    setSelectedSchedule,

    // UI state
    activeTab,
    setActiveTab,
    showScheduleDetails,
    setShowScheduleDetails,
    showScheduleDetail,
    setShowScheduleDetail,
    selectedScheduleItem,
    setSelectedScheduleItem,

    // Optimization constraints
    optimizationConstraints,

    // Refs
    resultsRef,

    // Functions
    handleGenerateSchedule
  };
};
