import { useState, useRef } from 'react';
import { toast } from 'sonner';
import type { GeneratedSchedule } from '../../../../types';
import type { ScheduleItem, GenerationStep, OptimizationConstraints } from '../../../../types';
import { generateMockScheduleData, detectConflicts, createSchedule } from '../utils/scheduleUtils';
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
    const semesters = ['1st Semester', '2nd Semester'];
    
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
              course.period === semester
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
              course.period === semester
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
      
      console.log('Generated all schedule items:', allScheduleItems);
      console.log('Total schedule items generated:', allScheduleItems.length);
      
      // Apply conflict detection to all schedule items
      const { enhancedItems, conflicts } = detectConflicts(allScheduleItems);
      console.log('Enhanced items after conflict detection:', enhancedItems);
      console.log('Enhanced items count:', enhancedItems.length);
      console.log('Detected conflicts:', conflicts);
      console.log('Conflicts count:', conflicts.length);
      
      // Create new schedule
      const newSchedule = createSchedule(enhancedItems, conflicts, generatedSchedules.length);

      console.log('Created new schedule:', newSchedule);
      console.log('New schedule subjects count:', newSchedule.subjects?.length || 0);
      console.log('Current generatedSchedules before update:', generatedSchedules);
      
      setGeneratedSchedules(prev => {
        const updated = [...prev, newSchedule];
        console.log('Updated generatedSchedules:', updated);
        return updated;
      });
      
      setSelectedSchedule(newSchedule);
      console.log('Set selectedSchedule to:', newSchedule);

      setIsGenerating(false);
      setGenerationProgress(100);
      setCurrentStep('Schedule generated successfully!');
      
      // Scroll to results section after generation
      setTimeout(() => {
        console.log('Attempting to scroll to results...');
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
      
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
