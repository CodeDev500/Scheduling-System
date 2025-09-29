import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { FacultyRecommendations } from "@/components/schedule/FacultyRecommendations";
import { LoadingOverlay } from "@/components/schedule/LoadingOverlay";
import { useToast } from "@/hooks/use-toast";
import { Grid, Table, Filter } from "lucide-react";

// Mock data - in real app this would come from backend
const mockStats = {
  totalSubjects: 42,
  totalFaculty: 28,
  totalSections: 15,
  conflictsCount: 3
};

const mockSchedules = [
  {
    id: "1",
    subject: "Computer Programming I",
    faculty: "Dr. Sarah Johnson",
    room: "CS-101",
    section: "BSCS-1A",
    time: "7:00-8:30",
    day: "Monday",
    hasConflict: false,
    isRecommended: true,
    units: 3
  },
  {
    id: "2", 
    subject: "Database Systems",
    faculty: "Prof. Michael Chen",
    room: "CS-205",
    section: "BSCS-2B",
    time: "10:00-11:30",
    day: "Tuesday",
    hasConflict: true,
    units: 3
  },
  {
    id: "3",
    subject: "Web Development",
    faculty: "Dr. Emily Rodriguez",
    room: "CS-Lab1",
    section: "BSCS-3A",
    time: "13:00-14:30",
    day: "Wednesday",
    hasConflict: false,
    units: 3
  },
  {
    id: "4",
    subject: "Software Engineering",
    faculty: "Prof. David Kim",
    room: "CS-302",
    section: "BSCS-4A",
    time: "8:30-10:00",
    day: "Thursday",
    hasConflict: false,
    isRecommended: true,
    units: 3
  }
];

const mockFacultyRecommendations = [
  {
    id: "f1",
    name: "Dr. Sarah Johnson",
    specialization: ["Programming", "Software Development", "Algorithms"],
    experience: 8,
    currentLoad: 18,
    maxLoad: 24,
    matchScore: 95,
    hasConflict: false,
    recommendationRank: 1,
    availability: ["Mon 7:00-12:00", "Wed 7:00-15:00", "Fri 7:00-12:00"]
  },
  {
    id: "f2", 
    name: "Prof. Michael Chen",
    specialization: ["Database Systems", "Data Mining", "Big Data"],
    experience: 12,
    currentLoad: 20,
    maxLoad: 24,
    matchScore: 88,
    hasConflict: true,
    recommendationRank: 2,
    availability: ["Tue 8:00-17:00", "Thu 8:00-17:00"]
  },
  {
    id: "f3",
    name: "Dr. Emily Rodriguez", 
    specialization: ["Web Development", "UI/UX", "Mobile Development"],
    experience: 6,
    currentLoad: 15,
    maxLoad: 24,
    matchScore: 82,
    hasConflict: false,
    recommendationRank: 3,
    availability: ["Mon 13:00-18:00", "Wed 13:00-18:00", "Fri 13:00-18:00"]
  }
];

export default function Dashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState('schedule');
  const { toast } = useToast();

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate schedule generation process
    const steps = [
      { progress: 25, step: "Analyzing subject requirements and constraints..." },
      { progress: 50, step: "Evaluating faculty expertise and availability..." },
      { progress: 75, step: "Optimizing schedule and resolving conflicts..." },
      { progress: 100, step: "Finalizing recommendations and results..." }
    ];

    for (const { progress, step } of steps) {
      setCurrentStep(step);
      setGenerationProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsGenerating(false);
    toast({
      title: "Schedule Generated Successfully!",
      description: "Review the generated schedule and faculty recommendations below.",
    });
  };

  const handleSelectFaculty = (facultyId: string) => {
    const faculty = mockFacultyRecommendations.find(f => f.id === facultyId);
    toast({
      title: "Faculty Assigned",
      description: `${faculty?.name} has been assigned to this subject.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <LoadingOverlay 
        isVisible={isGenerating}
        progress={generationProgress}
        currentStep={currentStep}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <ScheduleHeader 
          onGenerateSchedule={handleGenerateSchedule}
          isGenerating={isGenerating}
          stats={mockStats}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted">
              <TabsTrigger value="schedule" className="data-[state=active]:bg-card">
                Schedule View
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-card">
                Faculty Recommendations
              </TabsTrigger>
            </TabsList>

            {activeTab === 'schedule' && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="schedule" className="space-y-6">
            <ScheduleGrid 
              schedules={mockSchedules}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <FacultyRecommendations
              recommendations={mockFacultyRecommendations}
              subjectName="Computer Programming I"
              onSelectFaculty={handleSelectFaculty}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}