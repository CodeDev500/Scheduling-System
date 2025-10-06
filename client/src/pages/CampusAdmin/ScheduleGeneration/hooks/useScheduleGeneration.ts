import { useState, useRef } from 'react';
import { toast } from 'sonner';
import type { GeneratedSchedule } from '../../../../types';
import type { ScheduleItem, GenerationStep, OptimizationConstraints } from '../../../../types';
import { detectConflicts, createSchedule } from '../utils/scheduleUtils';
import { ScheduleGenerationService } from '../services/scheduleGenerationService';
import { useAppSelector } from '../../../../hooks/redux';

export const useScheduleGeneration = (instructors: any[] = []) => {
  // Redux selectors to get curriculum data
  const curriculumData = useAppSelector((state) => state.curriculum.curriculums);
  // Use passed instructors instead of Redux faculty data
  const facultyData = instructors;

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

  // Mock schedule generation function
  const handleGenerateSchedule = async () => {
    console.log('Starting auto-generation for all programs...');
    console.log('Target Students:', targetStudents);
    console.log('Optimization Constraints:', optimizationConstraints);

    // Check if curriculum data is available
    if (!curriculumData || curriculumData.length === 0) {
      toast.error('No curriculum data available. Please ensure curriculum data is loaded.');
      return;
    }

    // Check if faculty data is available
    if (!facultyData || facultyData.length === 0) {
      toast.error('No faculty data available. Please ensure faculty data is loaded.');
      return;
    }

    // Define all available programs, year levels, and semesters for auto-generation
    const programs = ['BSCS', 'BSIT', 'BSIS', 'BSED', 'BSCRIM', 'BSSW'];
    const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    // Include Summer term in auto-generation
    const semesters = ['1st Semester', '2nd Semester', 'Summer'];

    // Helper: normalize period field to consistently match strings or numeric codes
    const normalizePeriod = (period: any): string => {
      if (typeof period === 'number') {
        return period === 1 ? '1st Semester' : period === 2 ? '2nd Semester' : period === 3 ? 'Summer' : String(period);
      }
      const s = String(period).trim().toLowerCase();
      if (s.includes('summer')) return 'Summer';
      if (s.includes('1') || s.includes('first')) return '1st Semester';
      if (s.includes('2') || s.includes('second')) return '2nd Semester';
      return period;
    };
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setCompletedSteps([]);
    setCurrentStep('Initializing schedule generation...');
    setEstimatedTime('30-45 seconds');
    
    // Small delay to ensure UI updates before starting heavy processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const steps: GenerationStep[] = [
      { name: 'evaluating', message: 'Loading curriculum data...', duration: 2000 },
      { name: 'optimizing', message: 'Matching faculty with course specializations...', duration: 3000 },
      { name: 'finalizing', message: 'Generating optimized schedule...', duration: 1500 }
    ];

    let progress = 0;

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setCurrentStep(step.message);
        
        // Simulate progress for this step
        const stepProgress = 100 / steps.length;
        const startProgress = progress;
        
        for (let j = 0; j <= 10; j++) {
          await new Promise(resolve => setTimeout(resolve, step.duration / 10));
          setGenerationProgress(startProgress + (stepProgress * j / 10));
        }
        
        progress += stepProgress;
        setCompletedSteps(prev => [...prev, step.name]);
      }

      // Generate schedules for all program/year/semester combinations
      console.log('Using curriculum data:', curriculumData);
      console.log('Using faculty data:', facultyData);
      
      let totalCombinations = 0;
      let processedCombinations = 0;
      const allScheduleItems: any[] = [];
      
      // Count total combinations for progress tracking
      for (const program of programs) {
        for (const yearLevel of yearLevels) {
          for (const semester of semesters) {
            // Check if curriculum data exists for this combination
            const hasData = curriculumData.some(course => 
              course.programCode === program && 
              course.yearLevel === yearLevel && 
              normalizePeriod(course.period) === semester
            );
            if (hasData) {
              totalCombinations++;
            }
          }
        }
      }
      
      console.log(`Found ${totalCombinations} valid program/year/semester combinations`);
      
      // Generate schedules for each valid combination
      for (const program of programs) {
        for (const yearLevel of yearLevels) {
          for (const semester of semesters) {
            // Check if curriculum data exists for this combination
            const hasData = curriculumData.some(course => 
              course.programCode === program && 
              course.yearLevel === yearLevel && 
              normalizePeriod(course.period) === semester
            );
            
            if (hasData) {
              setCurrentStep(`Generating schedule for ${program} ${yearLevel} ${semester}...`);
              
              console.log(`Calling generateScheduleDataFromCurriculum for ${program} ${yearLevel} ${semester}`);
              const scheduleItems = await ScheduleGenerationService.generateScheduleDataFromCurriculum(
                curriculumData,
                facultyData,
                program,
                yearLevel,
                semester,
                selectedDepartment
              );
              
              console.log(`Service returned ${scheduleItems.length} schedule items:`, scheduleItems);
              
              // Add program/year/semester info to each schedule item
              const enhancedScheduleItems = scheduleItems.map(item => ({
                ...item,
                program,
                yearLevel,
                semester
              }));
              
              console.log(`Enhanced schedule items:`, enhancedScheduleItems);
              
              allScheduleItems.push(...enhancedScheduleItems);
              
              processedCombinations++;
              const progressPercent = (processedCombinations / totalCombinations) * 100;
              setGenerationProgress(progressPercent);
              
              console.log(`Generated ${scheduleItems.length} items for ${program} ${yearLevel} ${semester}`);
            }
          }
        }
      }
      
      // Apply conflict detection to all schedule items
      const { enhancedItems, conflicts } = detectConflicts(allScheduleItems);
      // Create new schedule
      const newSchedule = createSchedule(enhancedItems, conflicts, generatedSchedules.length);


      
      setGeneratedSchedules(prev => {
        const updated = [...prev, newSchedule];
        console.log('Updated generatedSchedules:', updated);
        return updated;
      });
      
      setSelectedSchedule(newSchedule);
      setIsGenerating(false);
      setGenerationProgress(100);
      setCurrentStep('Schedule generated successfully!');
    
      
      if (conflicts.length > 0) {
        toast.warning(`Schedule generated with ${conflicts.length} conflicts detected`);
      } else {
        toast.success('Schedule generated successfully with no conflicts!');
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      setIsGenerating(false);
      setCurrentStep('Error occurred during generation');
      toast.error('Failed to generate schedule. Please try again.');
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
