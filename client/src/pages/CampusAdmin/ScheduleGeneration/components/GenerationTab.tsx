import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, RotateCcw, Loader2, Brain, Zap, Target, TrendingUp, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import type { GeneratedSchedule, GenerationStep } from '../../../../types';
import LoadingProgress from './LoadingProgress';

interface GenerationTabProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (value: string) => void;
  isGenerating: boolean;
  generationProgress: number;
  currentStep: string;
  completedSteps: string[];
  estimatedTime?: number;
  processingStats: {
    subjectsProcessed: number;
    totalSubjects: number;
    facultyAssigned: number;
    totalFaculty: number;
    roomsAllocated: number;
    totalRooms: number;
    conflictsResolved: number;
  };
  generatedSchedules: GeneratedSchedule[];
  onGenerate: () => void;
  onPreview: (schedule: GeneratedSchedule) => void;
  onDelete: (scheduleId: string) => void;
  onSelect: (schedule: GeneratedSchedule) => void;
}

const GenerationTab: React.FC<GenerationTabProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  isGenerating,
  generationProgress,
  currentStep,
  completedSteps,
  estimatedTime,
  processingStats,
  generatedSchedules,
  onGenerate,
  onPreview,
  onDelete,
  onSelect
}) => {
  return (
    <div className="space-y-6">
      {/* Loading Progress Component */}
      <LoadingProgress
        isGenerating={isGenerating}
        progress={generationProgress}
        currentStep={currentStep}
        completedSteps={completedSteps}
        estimatedTime={estimatedTime}
        processingStats={processingStats}
      />

      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            One-Click Schedule Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-primary/5 border-primary/20">
            <Brain className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Generate schedules for all departments, programs, and year levels automatically. 
              The system will assign subjects based on their units: 3 units = MWF, 2 units = TH, 1 unit = Saturday.
            </AlertDescription>
          </Alert>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">Optimization Algorithm</label>
            <Select value={selectedAlgorithm} onValueChange={onAlgorithmChange}>
              <SelectTrigger className="border-border/50 bg-background/50">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="constraint-satisfaction">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Constraint Satisfaction
                  </div>
                </SelectItem>
                <SelectItem value="backtracking">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-warning" />
                    Backtracking
                  </div>
                </SelectItem>
                <SelectItem value="genetic">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-success" />
                    Genetic Algorithm
                  </div>
                </SelectItem>
                <SelectItem value="simulated-annealing">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    Simulated Annealing
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transition-all duration-300"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Schedules for All Departments...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Schedules for All Departments
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-accent/5 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Generated Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedSchedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No schedules generated yet.</p>
              <Button 
                variant="outline" 
                className="mt-4 border-primary/20 hover:bg-primary/5" 
                onClick={onGenerate} 
                disabled={isGenerating}
              >
                <Play className="h-4 w-4 mr-2" />
                Generate Your First Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedSchedules.map(schedule => (
                <Card key={schedule.id} className="bg-gradient-to-r from-background to-accent/5 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium mb-1 text-foreground">{schedule.algorithm}</div>
                        <div className="text-sm text-muted-foreground">
                          Generated on {schedule.generatedAt ? new Date(schedule.generatedAt).toLocaleString() : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.subjects.length} subjects scheduled • {schedule.processingTime}ms processing time
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={
                              (schedule.optimizationScore?.overall || 0) >= 80 ? 'default' : 
                              (schedule.optimizationScore?.overall || 0) >= 60 ? 'secondary' : 'destructive'
                            }
                            className="text-lg px-3 py-1 font-semibold"
                          >
                            {schedule.optimizationScore?.overall || 0}% Overall Score
                          </Badge>
                        </div>
                        {schedule.conflicts.length > 0 && (
                          <Badge variant="destructive" className="mr-2">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {schedule.conflicts.length} conflicts
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                        onClick={() => onPreview(schedule)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-success/20 hover:bg-success/5 hover:border-success/40"
                        onClick={() => onSelect(schedule)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/20 hover:bg-destructive/5 hover:border-destructive/40"
                        onClick={() => onDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerationTab;