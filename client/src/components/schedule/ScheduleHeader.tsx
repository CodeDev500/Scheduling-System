import { Calendar, Users, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ScheduleHeaderProps {
  onGenerateSchedule: () => void;
  isGenerating: boolean;
  stats: {
    totalSubjects: number;
    totalFaculty: number;
    totalSections: number;
    conflictsCount: number;
  };
}

export function ScheduleHeader({ onGenerateSchedule, isGenerating, stats }: ScheduleHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">OptiSched</h1>
          <p className="text-muted-foreground mt-1">
            Automated Schedule Generation & Faculty Optimization
          </p>
        </div>
        <Button 
          onClick={onGenerateSchedule}
          disabled={isGenerating}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transition-all duration-300"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Generate Schedule
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-accent/5 border-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Subjects</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalSubjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-accent/5 border-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faculty Members</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalFaculty}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-accent/5 border-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sections</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalSections}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-accent/5 border-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conflicts</p>
              <p className="text-2xl font-bold text-foreground">{stats.conflictsCount}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}