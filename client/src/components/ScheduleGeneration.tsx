import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Calendar, Clock, Users, BookOpen, AlertTriangle, CheckCircle, Download, Save, Settings, Zap, Target, BarChart3 } from 'lucide-react';

// Interfaces
interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'lecture' | 'laboratory' | 'seminar';
  equipment: string[];
  availability: TimeSlot[];
}

interface Faculty {
  id: string;
  name: string;
  department: string;
  specializations: string[];
  maxHours: number;
  currentLoad: number;
  availability: TimeSlot[];
  preferences: {
    preferredDays: string[];
    preferredTimes: string[];
    maxConsecutiveHours: number;
  };
  experience: number;
  rating: number;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'lecture' | 'laboratory' | 'seminar';
  duration: number;
  requiredEquipment: string[];
  prerequisites: string[];
  yearLevel: number;
  semester: number;
  department: string;
  program: string;
}

interface ScheduleItem {
  id: string;
  subject: Subject;
  faculty: Faculty;
  room: Room;
  timeSlot: TimeSlot;
  students: number;
  conflicts: string[];
  score: number;
}

interface Constraint {
  id: string;
  type: 'hard' | 'soft';
  description: string;
  weight: number;
  check: (schedule: ScheduleItem[], item: ScheduleItem) => boolean;
}

interface GenerationParameters {
  algorithm: 'backtracking' | 'genetic' | 'simulated_annealing';
  maxIterations: number;
  populationSize?: number;
  mutationRate?: number;
  temperature?: number;
  coolingRate?: number;
  constraints: Constraint[];
  optimization: {
    roomUtilization: number;
    facultyBalance: number;
    timeDistribution: number;
    conflictMinimization: number;
  };
}

const ScheduleGeneration: React.FC = () => {
  // State management
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedYearLevels, setSelectedYearLevels] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [generationParams, setGenerationParams] = useState<GenerationParameters>({
    algorithm: 'backtracking',
    maxIterations: 1000,
    constraints: [],
    optimization: {
      roomUtilization: 0.8,
      facultyBalance: 0.7,
      timeDistribution: 0.6,
      conflictMinimization: 1.0
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleItem[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Mock data
  const departments = ['Computer Science', 'Information Technology', 'Engineering', 'Business'];
  const programs = {
    'Computer Science': ['BSCS', 'MSCS'],
    'Information Technology': ['BSIT', 'MSIT'],
    'Engineering': ['BSCE', 'BSEE', 'BSME'],
    'Business': ['BSBA', 'MBA']
  };

  // Constraint definitions
  const defaultConstraints: Constraint[] = [
    {
      id: 'no-faculty-conflict',
      type: 'hard',
      description: 'Faculty cannot teach multiple subjects at the same time',
      weight: 1.0,
      check: (schedule, item) => {
        return !schedule.some(s => 
          s.faculty.id === item.faculty.id && 
          s.timeSlot.id === item.timeSlot.id &&
          s.id !== item.id
        );
      }
    },
    {
      id: 'no-room-conflict',
      type: 'hard',
      description: 'Room cannot be used by multiple subjects at the same time',
      weight: 1.0,
      check: (schedule, item) => {
        return !schedule.some(s => 
          s.room.id === item.room.id && 
          s.timeSlot.id === item.timeSlot.id &&
          s.id !== item.id
        );
      }
    },
    {
      id: 'faculty-availability',
      type: 'hard',
      description: 'Faculty must be available during assigned time slots',
      weight: 1.0,
      check: (schedule, item) => {
        return item.faculty.availability.some(slot => 
          slot.day === item.timeSlot.day &&
          slot.startTime <= item.timeSlot.startTime &&
          slot.endTime >= item.timeSlot.endTime
        );
      }
    },
    {
      id: 'room-capacity',
      type: 'hard',
      description: 'Room capacity must accommodate expected students',
      weight: 1.0,
      check: (schedule, item) => {
        return item.room.capacity >= item.students;
      }
    },
    {
      id: 'faculty-workload',
      type: 'soft',
      description: 'Faculty workload should not exceed maximum hours',
      weight: 0.8,
      check: (schedule, item) => {
        const facultyHours = schedule
          .filter(s => s.faculty.id === item.faculty.id)
          .reduce((total, s) => total + s.subject.duration, 0);
        return facultyHours <= item.faculty.maxHours;
      }
    }
  ];

  // Algorithm implementations
  const backtrackingAlgorithm = async (
    subjects: Subject[],
    faculties: Faculty[],
    rooms: Room[],
    timeSlots: TimeSlot[],
    constraints: Constraint[]
  ): Promise<ScheduleItem[]> => {
    const schedule: ScheduleItem[] = [];
    let progress = 0;

    const isValid = (item: ScheduleItem): boolean => {
      return constraints.every(constraint => {
        if (constraint.type === 'hard') {
          return constraint.check(schedule, item);
        }
        return true;
      });
    };

    const backtrack = async (subjectIndex: number): Promise<boolean> => {
      if (subjectIndex >= subjects.length) {
        return true;
      }

      const subject = subjects[subjectIndex];
      progress = (subjectIndex / subjects.length) * 100;
      setGenerationProgress(progress);

      // Try each combination of faculty, room, and time slot
      for (const faculty of faculties) {
        if (!faculty.specializations.includes(subject.department)) continue;

        for (const room of rooms) {
          if (room.type !== subject.type) continue;

          for (const timeSlot of timeSlots) {
            const scheduleItem: ScheduleItem = {
              id: `${subject.id}-${faculty.id}-${room.id}-${timeSlot.id}`,
              subject,
              faculty,
              room,
              timeSlot,
              students: Math.floor(Math.random() * room.capacity * 0.8) + 10,
              conflicts: [],
              score: 0
            };

            if (isValid(scheduleItem)) {
              schedule.push(scheduleItem);
              
              if (await backtrack(subjectIndex + 1)) {
                return true;
              }
              
              schedule.pop();
            }
          }
        }
      }

      return false;
    };

    const success = await backtrack(0);
    return success ? schedule : [];
  };

  const geneticAlgorithm = async (
    subjects: Subject[],
    faculties: Faculty[],
    rooms: Room[],
    timeSlots: TimeSlot[],
    constraints: Constraint[]
  ): Promise<ScheduleItem[]> => {
    const populationSize = generationParams.populationSize || 50;
    const mutationRate = generationParams.mutationRate || 0.1;
    let population: ScheduleItem[][] = [];

    // Initialize population
    for (let i = 0; i < populationSize; i++) {
      const individual: ScheduleItem[] = [];
      for (const subject of subjects) {
        const faculty = faculties[Math.floor(Math.random() * faculties.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        
        individual.push({
          id: `${subject.id}-${faculty.id}-${room.id}-${timeSlot.id}`,
          subject,
          faculty,
          room,
          timeSlot,
          students: Math.floor(Math.random() * room.capacity * 0.8) + 10,
          conflicts: [],
          score: 0
        });
      }
      population.push(individual);
    }

    // Evolution loop
    for (let generation = 0; generation < generationParams.maxIterations; generation++) {
      setGenerationProgress((generation / generationParams.maxIterations) * 100);
      
      // Evaluate fitness
      population.forEach(individual => {
        individual.forEach(item => {
          item.score = calculateFitness(individual, item, constraints);
        });
      });

      // Selection and crossover (simplified)
      const newPopulation: ScheduleItem[][] = [];
      for (let i = 0; i < populationSize; i++) {
        const parent1 = population[Math.floor(Math.random() * population.length)];
        const parent2 = population[Math.floor(Math.random() * population.length)];
        const child = crossover(parent1, parent2);
        
        if (Math.random() < mutationRate) {
          mutate(child, faculties, rooms, timeSlots);
        }
        
        newPopulation.push(child);
      }
      
      population = newPopulation;
      await new Promise(resolve => setTimeout(resolve, 10)); // Allow UI updates
    }

    // Return best individual
    const best = population.reduce((best, current) => {
      const bestScore = best.reduce((sum, item) => sum + item.score, 0);
      const currentScore = current.reduce((sum, item) => sum + item.score, 0);
      return currentScore > bestScore ? current : best;
    });

    return best;
  };

  const simulatedAnnealingAlgorithm = async (
    subjects: Subject[],
    faculties: Faculty[],
    rooms: Room[],
    timeSlots: TimeSlot[],
    constraints: Constraint[]
  ): Promise<ScheduleItem[]> => {
    let temperature = generationParams.temperature || 1000;
    const coolingRate = generationParams.coolingRate || 0.95;
    
    // Generate initial solution
    let currentSolution: ScheduleItem[] = [];
    for (const subject of subjects) {
      const faculty = faculties[Math.floor(Math.random() * faculties.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      
      currentSolution.push({
        id: `${subject.id}-${faculty.id}-${room.id}-${timeSlot.id}`,
        subject,
        faculty,
        room,
        timeSlot,
        students: Math.floor(Math.random() * room.capacity * 0.8) + 10,
        conflicts: [],
        score: 0
      });
    }

    let bestSolution = [...currentSolution];
    let currentScore = calculateSolutionScore(currentSolution, constraints);
    let bestScore = currentScore;

    for (let iteration = 0; iteration < generationParams.maxIterations; iteration++) {
      setGenerationProgress((iteration / generationParams.maxIterations) * 100);
      
      // Generate neighbor solution
      const neighbor = [...currentSolution];
      const randomIndex = Math.floor(Math.random() * neighbor.length);
      const item = neighbor[randomIndex];
      
      // Modify random assignment
      item.faculty = faculties[Math.floor(Math.random() * faculties.length)];
      item.room = rooms[Math.floor(Math.random() * rooms.length)];
      item.timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      
      const neighborScore = calculateSolutionScore(neighbor, constraints);
      const delta = neighborScore - currentScore;
      
      // Accept or reject neighbor
      if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
        currentSolution = neighbor;
        currentScore = neighborScore;
        
        if (currentScore > bestScore) {
          bestSolution = [...currentSolution];
          bestScore = currentScore;
        }
      }
      
      temperature *= coolingRate;
      await new Promise(resolve => setTimeout(resolve, 5)); // Allow UI updates
    }

    return bestSolution;
  };

  // Helper functions
  const calculateFitness = (schedule: ScheduleItem[], item: ScheduleItem, constraints: Constraint[]): number => {
    let score = 0;
    
    constraints.forEach(constraint => {
      if (constraint.check(schedule, item)) {
        score += constraint.weight;
      } else if (constraint.type === 'hard') {
        score -= 10; // Heavy penalty for hard constraint violations
      }
    });
    
    return score;
  };

  const calculateSolutionScore = (solution: ScheduleItem[], constraints: Constraint[]): number => {
    return solution.reduce((total, item) => total + calculateFitness(solution, item, constraints), 0);
  };

  const crossover = (parent1: ScheduleItem[], parent2: ScheduleItem[]): ScheduleItem[] => {
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    return [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ];
  };

  const mutate = (individual: ScheduleItem[], faculties: Faculty[], rooms: Room[], timeSlots: TimeSlot[]) => {
    const mutationIndex = Math.floor(Math.random() * individual.length);
    const item = individual[mutationIndex];
    
    const mutationType = Math.floor(Math.random() * 3);
    switch (mutationType) {
      case 0:
        item.faculty = faculties[Math.floor(Math.random() * faculties.length)];
        break;
      case 1:
        item.room = rooms[Math.floor(Math.random() * rooms.length)];
        break;
      case 2:
        item.timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        break;
    }
  };

  const detectConflicts = (schedule: ScheduleItem[]): string[] => {
    const conflicts: string[] = [];
    
    // Faculty conflicts
    const facultySchedule = new Map<string, ScheduleItem[]>();
    schedule.forEach(item => {
      const key = `${item.faculty.id}-${item.timeSlot.day}-${item.timeSlot.startTime}`;
      if (!facultySchedule.has(key)) {
        facultySchedule.set(key, []);
      }
      facultySchedule.get(key)!.push(item);
    });
    
    facultySchedule.forEach((items, key) => {
      if (items.length > 1) {
        conflicts.push(`Faculty conflict: ${items[0].faculty.name} assigned to multiple subjects at ${key}`);
      }
    });
    
    // Room conflicts
    const roomSchedule = new Map<string, ScheduleItem[]>();
    schedule.forEach(item => {
      const key = `${item.room.id}-${item.timeSlot.day}-${item.timeSlot.startTime}`;
      if (!roomSchedule.has(key)) {
        roomSchedule.set(key, []);
      }
      roomSchedule.get(key)!.push(item);
    });
    
    roomSchedule.forEach((items, key) => {
      if (items.length > 1) {
        conflicts.push(`Room conflict: ${items[0].room.name} assigned to multiple subjects at ${key}`);
      }
    });
    
    return conflicts;
  };

  const generateSchedule = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setConflicts([]);
    
    try {
      // Mock data for generation
      const mockSubjects: Subject[] = [
        {
          id: '1',
          code: 'CS101',
          name: 'Introduction to Programming',
          credits: 3,
          type: 'lecture',
          duration: 3,
          requiredEquipment: ['projector'],
          prerequisites: [],
          yearLevel: 1,
          semester: selectedSemester,
          department: 'Computer Science',
          program: 'BSCS'
        }
      ];
      
      const mockFaculties: Faculty[] = [
        {
          id: '1',
          name: 'Dr. John Smith',
          department: 'Computer Science',
          specializations: ['Programming', 'Software Engineering'],
          maxHours: 40,
          currentLoad: 20,
          availability: [
            {
              id: '1',
              day: 'Monday',
              startTime: '08:00',
              endTime: '17:00',
              duration: 9
            }
          ],
          preferences: {
            preferredDays: ['Monday', 'Wednesday', 'Friday'],
            preferredTimes: ['08:00', '10:00'],
            maxConsecutiveHours: 4
          },
          experience: 10,
          rating: 4.5
        }
      ];
      
      const mockRooms: Room[] = [
        {
          id: '1',
          name: 'Room 101',
          capacity: 40,
          type: 'lecture',
          equipment: ['projector', 'whiteboard'],
          availability: [
            {
              id: '1',
              day: 'Monday',
              startTime: '08:00',
              endTime: '17:00',
              duration: 9
            }
          ]
        }
      ];
      
      const mockTimeSlots: TimeSlot[] = [
        {
          id: '1',
          day: 'Monday',
          startTime: '08:00',
          endTime: '11:00',
          duration: 3
        }
      ];

      let schedule: ScheduleItem[] = [];
      
      switch (generationParams.algorithm) {
        case 'backtracking':
          schedule = await backtrackingAlgorithm(mockSubjects, mockFaculties, mockRooms, mockTimeSlots, defaultConstraints);
          break;
        case 'genetic':
          schedule = await geneticAlgorithm(mockSubjects, mockFaculties, mockRooms, mockTimeSlots, defaultConstraints);
          break;
        case 'simulated_annealing':
          schedule = await simulatedAnnealingAlgorithm(mockSubjects, mockFaculties, mockRooms, mockTimeSlots, defaultConstraints);
          break;
      }
      
      setGeneratedSchedule(schedule);
      const detectedConflicts = detectConflicts(schedule);
      setConflicts(detectedConflicts);
      
      const score = calculateSolutionScore(schedule, defaultConstraints);
      setOptimizationScore(score);
      
      toast.success(`Schedule generated successfully with ${detectedConflicts.length} conflicts`);
      
    } catch (error) {
      console.error('Schedule generation failed:', error);
      toast.error('Failed to generate schedule');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const saveSchedule = async () => {
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Schedule saved successfully');
    } catch (error) {
      toast.error('Failed to save schedule');
    }
  };

  const exportSchedule = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Mock export operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Schedule exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export schedule');
    }
  };

  const selectedDeptPrograms = selectedDepartments.flatMap(dept => 
    programs[dept as keyof typeof programs] || []
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Generation</h1>
          <p className="text-muted-foreground">
            Generate optimized class schedules using advanced algorithms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="parameters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Academic Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="departments">Departments</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select departments" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={selectedSemester.toString()} onValueChange={(value) => setSelectedSemester(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Semester</SelectItem>
                      <SelectItem value="2">Second Semester</SelectItem>
                      <SelectItem value="3">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="yearLevels">Year Levels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[1, 2, 3, 4].map(year => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`year-${year}`}
                          checked={selectedYearLevels.includes(year)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedYearLevels([...selectedYearLevels, year]);
                            } else {
                              setSelectedYearLevels(selectedYearLevels.filter(y => y !== year));
                            }
                          }}
                        />
                        <Label htmlFor={`year-${year}`}>Year {year}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Algorithm Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="algorithm">Algorithm</Label>
                  <Select 
                    value={generationParams.algorithm} 
                    onValueChange={(value: any) => setGenerationParams({...generationParams, algorithm: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backtracking">Backtracking</SelectItem>
                      <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                      <SelectItem value="simulated_annealing">Simulated Annealing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="maxIterations">Max Iterations</Label>
                  <Input
                    type="number"
                    value={generationParams.maxIterations}
                    onChange={(e) => setGenerationParams({
                      ...generationParams,
                      maxIterations: parseInt(e.target.value)
                    })}
                  />
                </div>

                {generationParams.algorithm === 'genetic' && (
                  <>
                    <div>
                      <Label htmlFor="populationSize">Population Size</Label>
                      <Input
                        type="number"
                        value={generationParams.populationSize || 50}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          populationSize: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mutationRate">Mutation Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={generationParams.mutationRate || 0.1}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          mutationRate: parseFloat(e.target.value)
                        })}
                      />
                    </div>
                  </>
                )}

                {generationParams.algorithm === 'simulated_annealing' && (
                  <>
                    <div>
                      <Label htmlFor="temperature">Initial Temperature</Label>
                      <Input
                        type="number"
                        value={generationParams.temperature || 1000}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          temperature: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="coolingRate">Cooling Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={generationParams.coolingRate || 0.95}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          coolingRate: parseFloat(e.target.value)
                        })}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Generation Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateSchedule}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Generate Schedule
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} />
                  </div>
                )}

                {generatedSchedule.length > 0 && (
                  <div className="flex space-x-2">
                    <Button onClick={saveSchedule} variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Export Schedule</DialogTitle>
                          <DialogDescription>
                            Choose the format for exporting the generated schedule.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex space-x-2">
                          <Button onClick={() => exportSchedule('pdf')}>PDF</Button>
                          <Button onClick={() => exportSchedule('excel')}>Excel</Button>
                          <Button onClick={() => exportSchedule('csv')}>CSV</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="constraints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Constraint Management</CardTitle>
              <CardDescription>
                Configure hard and soft constraints for schedule generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defaultConstraints.map(constraint => (
                  <div key={constraint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={constraint.type === 'hard' ? 'destructive' : 'secondary'}>
                          {constraint.type}
                        </Badge>
                        <h4 className="font-medium">{constraint.description}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Weight: {constraint.weight}
                      </p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {generatedSchedule.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Generated Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {generatedSchedule.map(item => (
                          <div key={item.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{item.subject.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.subject.code} • {item.faculty.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.room.name} • {item.timeSlot.day} {item.timeSlot.startTime}-{item.timeSlot.endTime}
                                </p>
                              </div>
                              <Badge variant={item.conflicts.length > 0 ? 'destructive' : 'default'}>
                                Score: {item.score.toFixed(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Classes:</span>
                      <span className="font-medium">{generatedSchedule.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conflicts:</span>
                      <span className={`font-medium ${conflicts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {conflicts.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimization Score:</span>
                      <span className="font-medium">{optimizationScore.toFixed(1)}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Room Utilization:</span>
                        <span>{(generationParams.optimization.roomUtilization * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Faculty Balance:</span>
                        <span>{(generationParams.optimization.facultyBalance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {conflicts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-600">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Conflicts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {conflicts.map((conflict, index) => (
                            <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                              {conflict}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Schedule Generated</h3>
                <p className="text-muted-foreground text-center">
                  Configure your parameters and click "Generate Schedule" to create a new schedule.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
              <CardDescription>
                Fine-tune the optimization parameters for better schedule quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomUtilization">Room Utilization Weight</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={generationParams.optimization.roomUtilization}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          optimization: {
                            ...generationParams.optimization,
                            roomUtilization: parseFloat(e.target.value)
                          }
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">
                        {(generationParams.optimization.roomUtilization * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="facultyBalance">Faculty Balance Weight</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={generationParams.optimization.facultyBalance}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          optimization: {
                            ...generationParams.optimization,
                            facultyBalance: parseFloat(e.target.value)
                          }
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">
                        {(generationParams.optimization.facultyBalance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeDistribution">Time Distribution Weight</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={generationParams.optimization.timeDistribution}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          optimization: {
                            ...generationParams.optimization,
                            timeDistribution: parseFloat(e.target.value)
                          }
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">
                        {(generationParams.optimization.timeDistribution * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="conflictMinimization">Conflict Minimization Weight</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={generationParams.optimization.conflictMinimization}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          optimization: {
                            ...generationParams.optimization,
                            conflictMinimization: parseFloat(e.target.value)
                          }
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">
                        {(generationParams.optimization.conflictMinimization * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleGeneration;