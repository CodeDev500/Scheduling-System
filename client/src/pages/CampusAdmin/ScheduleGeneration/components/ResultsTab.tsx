import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Eye,
  Grid,
  List,
  Brain,
  Target,
  TrendingUp,
  Award,
  Edit,
  RefreshCw
} from 'lucide-react';
import FacultyRecommendations from './FacultyRecommendations';
import ManualAdjustments from './ManualAdjustments';
import type { GeneratedSchedule, Subject, TimeSlot, FacultyRecommendation, Faculty } from '../../../../types';
import { formatDayTimeSlot } from '../../../../utils/timeFormat';

interface ResultsTabProps {
  selectedSchedule: GeneratedSchedule | null;
  facultyRecommendations: FacultyRecommendation[];
  onPreviewSchedule: (schedule: GeneratedSchedule) => void;
  onExportSchedule: (schedule: GeneratedSchedule) => void;
  onAssignFaculty: (subjectId: string, facultyId: string) => void;
  onViewConflicts: (facultyId: string) => void;
  onResolveConflict: (conflictId: string, resolution: any) => void;
}

const ResultsTab: React.FC<ResultsTabProps> = ({ 
  selectedSchedule, 
  facultyRecommendations,
  onPreviewSchedule,
  onExportSchedule,
  onAssignFaculty,
  onViewConflicts,
  onResolveConflict
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedConflicts, setSelectedConflicts] = useState<string[]>([]);

  // Mock data for demonstration - in real app, this would come from props or API
  const mockFaculty: Faculty[] = [
    { id: 'fac-1', name: 'Dr. Sarah Johnson', specializations: ['Programming', 'Software Development'], experienceYears: 8 },
    { id: 'fac-2', name: 'Prof. Michael Chen', specializations: ['Data Structures', 'Algorithms'], experienceYears: 12 },
    { id: 'fac-3', name: 'Ms. Emily Rodriguez', specializations: ['Web Development', 'Frontend'], experienceYears: 5 }
  ];

  const mockRooms = [
    { id: 'room-1', name: 'A101', capacity: 30, type: 'Lecture Hall' },
    { id: 'room-2', name: 'B205', capacity: 25, type: 'Computer Lab' }
  ];

  const mockTimeSlots = [
    { id: 'slot-1', day: 'Monday', startTime: '09:00', endTime: '10:30', duration: 90 },
    { id: 'slot-2', day: 'Tuesday', startTime: '11:00', endTime: '12:30', duration: 90 }
  ];

  const mockSubjects = selectedSchedule?.subjects || [];

  if (!selectedSchedule) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Schedule Selected</h3>
          <p className="text-muted-foreground mb-4">
            Generate a schedule first to view the results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate schedule statistics
  const totalSubjects = selectedSchedule.subjects.length;
  const totalConflicts = selectedSchedule.conflicts?.length || 0;
  const assignedSubjects = selectedSchedule.subjects.filter(s => s.assignedFaculty).length;
  const unassignedSubjects = totalSubjects - assignedSubjects;
  
  // Group subjects by day and time for grid view
  const scheduleGrid = selectedSchedule.subjects.reduce((grid, subject) => {
    subject.timeSlots?.forEach(slot => {
      const key = `${slot.day}-${slot.startTime}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push({ ...subject, currentTimeSlot: slot });
    });
    return grid;
  }, {} as Record<string, any[]>);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="space-y-6">
      {/* Schedule Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold text-foreground">{totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimization Score</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{selectedSchedule.optimizationScore?.overall || 0}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing Time</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{selectedSchedule.processingTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${totalConflicts > 0 
          ? 'from-red-50 to-red-100 border-red-200 dark:from-red-950 dark:to-red-900 dark:border-red-800' 
          : 'from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conflicts</p>
                <p className={`text-2xl font-bold ${totalConflicts > 0 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
                }`}>
                  {totalConflicts}
                </p>
              </div>
              {totalConflicts > 0 ? (
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4 mr-2" />
            Table View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid View
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onPreviewSchedule(selectedSchedule)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => onExportSchedule(selectedSchedule)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Schedule Details</TabsTrigger>
          <TabsTrigger value="recommendations">Faculty Recommendations</TabsTrigger>
          <TabsTrigger value="conflicts">Conflict Management</TabsTrigger>
          <TabsTrigger value="adjustments">Manual Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {viewMode === 'table' ? (
            <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Schedule Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-foreground font-semibold">Subject</TableHead>
                      <TableHead className="text-foreground font-semibold">Faculty</TableHead>
                      <TableHead className="text-foreground font-semibold">Room</TableHead>
                      <TableHead className="text-foreground font-semibold">Time Slots</TableHead>
                      <TableHead className="text-foreground font-semibold">Type</TableHead>
                      <TableHead className="text-foreground font-semibold">Units</TableHead>
                      <TableHead className="text-foreground font-semibold">Students</TableHead>
                      <TableHead className="text-foreground font-semibold">Status</TableHead>
                      <TableHead className="text-foreground font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSchedule.subjects.map((subject) => (
                      <TableRow key={subject.id} className="border-border/30 hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{subject.subjectCode}</div>
                            <div className="text-sm text-muted-foreground">{subject.subjectDescription}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {subject.assignedFaculty ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                                {subject.assignedFaculty.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {subject.assignedFaculty.matchScore}% match
                              </span>
                            </div>
                          ) : (
                            <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subject.assignedRoom ? (
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              {subject.assignedRoom.roomNumber}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              TBA
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {subject.timeSlots?.map((slot, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                {formatDayTimeSlot(slot.day, slot.startTime, slot.endTime)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted/50 text-foreground">
                            {subject.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground font-medium">{subject.units}</TableCell>
                        <TableCell className="text-foreground font-medium">{subject.enrolledStudents || 0}</TableCell>
                        <TableCell>
                          {subject.hasConflicts ? (
                            <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Conflict
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Scheduled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-primary/20 hover:bg-primary/10">
                              <Edit className="h-3 w-3 text-primary" />
                            </Button>
                            {subject.hasConflicts && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 w-8 p-0 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
                                onClick={() => onResolveConflict(subject.id, {})}
                              >
                                <RefreshCw className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid className="h-5 w-5 text-primary" />
                  Weekly Schedule Grid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-6 gap-2 min-w-[800px]">
                    <div className="font-semibold p-2 text-foreground">Time</div>
                    {days.map(day => (
                      <div key={day} className="font-semibold p-2 text-center text-foreground">{day}</div>
                    ))}
                    
                    {timeSlots.map(time => (
                      <React.Fragment key={time}>
                        <div className="p-2 text-sm font-medium bg-muted/50 text-foreground rounded border border-border/30">{time}</div>
                        {days.map(day => {
                          const key = `${day}-${time}`;
                          const subjects = scheduleGrid[key] || [];
                          
                          return (
                            <div key={key} className="p-1 min-h-[60px] border border-border/30 rounded bg-background/50 hover:bg-muted/20 transition-colors">
                              {subjects.map((subject, index) => (
                                <div
                                  key={`${subject.id}-${index}`}
                                  className={`text-xs p-2 mb-1 rounded border transition-all hover:shadow-sm ${
                                    subject.hasConflicts 
                                      ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200' 
                                      : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
                                  }`}
                                >
                                  <div className="font-medium">{subject.subjectCode}</div>
                                  <div className="text-xs opacity-75">
                                    {subject.assignedRoom?.roomNumber || 'TBA'}
                                  </div>
                                  {subject.assignedFaculty && (
                                    <div className="text-xs opacity-75 truncate">
                                      {subject.assignedFaculty.name}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          <FacultyRecommendations
            subjects={selectedSchedule.subjects}
            facultyRecommendations={facultyRecommendations}
            onAssignFaculty={onAssignFaculty}
            onViewConflicts={onViewConflicts}
          />
        </TabsContent>

        <TabsContent value="conflicts">
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Conflict management tools will be available here.</p>
            <p className="text-sm">View and resolve scheduling conflicts, overlapping assignments, and constraint violations.</p>
          </div>
        </TabsContent>

        <TabsContent value="adjustments">
          <ManualAdjustments
            schedule={selectedSchedule}
            faculty={mockFaculty}
            rooms={mockRooms}
            timeSlots={mockTimeSlots}
            subjects={mockSubjects}
            onUpdateSchedule={(updatedSchedule) => {
              console.log('Schedule updated:', updatedSchedule);
              // In real app, this would update the parent component's state
            }}
            onResolveConflict={onResolveConflict}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsTab;
