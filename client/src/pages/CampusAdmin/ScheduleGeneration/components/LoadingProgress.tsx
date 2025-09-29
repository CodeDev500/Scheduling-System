import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Users, Calendar, MapPin, CheckCircle, Clock, Zap } from 'lucide-react';

interface LoadingProgressProps {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  completedSteps: string[];
  estimatedTime?: number;
  processingStats?: {
    subjectsProcessed: number;
    totalSubjects: number;
    facultyAssigned: number;
    totalFaculty: number;
    roomsAllocated: number;
    totalRooms: number;
    conflictsResolved: number;
  };
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({
  isGenerating,
  progress,
  currentStep,
  completedSteps,
  estimatedTime,
  processingStats
}) => {
  const steps = [
    { id: 'initialization', label: 'Initializing Algorithm', icon: Brain },
    { id: 'data-loading', label: 'Loading Data', icon: Clock },
    { id: 'constraint-analysis', label: 'Analyzing Constraints', icon: Zap },
    { id: 'faculty-matching', label: 'Matching Faculty', icon: Users },
    { id: 'room-allocation', label: 'Allocating Rooms', icon: MapPin },
    { id: 'schedule-generation', label: 'Generating Schedule', icon: Calendar },
    { id: 'conflict-resolution', label: 'Resolving Conflicts', icon: CheckCircle },
    { id: 'optimization', label: 'Optimizing Results', icon: Zap },
    { id: 'finalization', label: 'Finalizing Schedule', icon: CheckCircle }
  ];

  if (!isGenerating) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Generating Optimized Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">{currentStep}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{progress}%</span>
              {estimatedTime && (
                <Badge variant="outline" className="text-xs">
                  ~{Math.ceil(estimatedTime / 1000)}s remaining
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step Progress */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Processing Steps</h4>
          <div className="grid grid-cols-1 gap-2">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep.toLowerCase().includes(step.label.toLowerCase().split(' ')[0]);
              const Icon = step.icon;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isCompleted
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-muted/50 text-muted-foreground border border-border/50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{step.label}</span>
                  {isCompleted && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Processing Statistics */}
        {processingStats && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Processing Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subjects Processed</span>
                  <span className="font-medium">
                    {processingStats.subjectsProcessed}/{processingStats.totalSubjects}
                  </span>
                </div>
                <Progress 
                  value={(processingStats.subjectsProcessed / processingStats.totalSubjects) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Faculty Assigned</span>
                  <span className="font-medium">
                    {processingStats.facultyAssigned}/{processingStats.totalFaculty}
                  </span>
                </div>
                <Progress 
                  value={(processingStats.facultyAssigned / processingStats.totalFaculty) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rooms Allocated</span>
                  <span className="font-medium">
                    {processingStats.roomsAllocated}/{processingStats.totalRooms}
                  </span>
                </div>
                <Progress 
                  value={(processingStats.roomsAllocated / processingStats.totalRooms) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conflicts Resolved</span>
                  <span className="font-medium text-green-600">
                    {processingStats.conflictsResolved}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 mt-0.5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">OptiSched AI is working...</p>
              <p className="text-muted-foreground mt-1">
                Our advanced algorithms are analyzing constraints, matching faculty expertise, 
                and optimizing room allocations to create the perfect schedule for your program.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingProgress;
