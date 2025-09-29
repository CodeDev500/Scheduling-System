import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, BookOpen, Clock } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  progress: number;
  currentStep: string;
}

export function LoadingOverlay({ isVisible, progress, currentStep }: LoadingOverlayProps) {
  if (!isVisible) return null;

  const steps = [
    { 
      icon: BookOpen, 
      title: "Analyzing Subjects", 
      description: "Processing subject requirements and constraints" 
    },
    { 
      icon: Users, 
      title: "Evaluating Faculty", 
      description: "Matching faculty expertise with subject needs" 
    },
    { 
      icon: Calendar, 
      title: "Optimizing Schedule", 
      description: "Generating conflict-free time slots" 
    },
    { 
      icon: Clock, 
      title: "Finalizing Results", 
      description: "Preparing recommendations and conflict analysis" 
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full mx-4 bg-card border shadow-lg">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="animate-pulse">
              <Calendar className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Generating Schedule
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we optimize your schedule...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div className="p-4 bg-accent/30 rounded-lg">
              <p className="text-sm font-medium text-foreground">{currentStep}</p>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 gap-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = progress > (index + 1) * 25;
                const isCurrent = progress >= index * 25 && progress < (index + 1) * 25;
                
                return (
                  <div
                    key={step.title}
                    className={`p-3 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-success-light border-success text-success-foreground'
                        : isCurrent
                        ? 'bg-primary/10 border-primary text-primary animate-pulse'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <StepIcon className="h-4 w-4" />
                      <div className="text-left">
                        <p className="text-xs font-medium">{step.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="text-xs text-muted-foreground">
            Estimated time: 30-60 seconds
          </div>
        </div>
      </Card>
    </div>
  );
}