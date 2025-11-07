import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  BookOpen, 
  Download, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Grid,
  List,
  User
} from 'lucide-react';
import type { GeneratedSchedule } from '../../../../types';
import { formatDayTimeSlot, getDayAbbreviation } from '../../../../utils/timeFormat';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: GeneratedSchedule | null;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onExport
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  if (!schedule) return null;

  // Group subjects by day and time for grid view
  const scheduleGrid = schedule.subjects.reduce((grid, subject) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Preview
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Preview and export the generated schedule for {schedule.department} - {schedule.program} (Year {schedule.yearLevel})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Schedule Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-lg font-bold text-foreground">{schedule.subjects.length}</div>
                <div className="text-xs text-muted-foreground">Subjects</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {schedule.subjects.reduce((sum, subject) => sum + (subject.enrolledStudents || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
              <CardContent className="p-4 text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {new Set(schedule.subjects.map(s => s.assignedRoom?.id).filter(Boolean)).size}
                </div>
                <div className="text-xs text-muted-foreground">Rooms Used</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {schedule.subjects.reduce((sum, subject) => sum + (subject.timeSlots?.length || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Time Slots</div>
              </CardContent>
            </Card>
          </div>

          {/* View Mode Toggle */}
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
          </div>

          {/* Schedule Content */}
          {viewMode === 'table' ? (
            <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Detailed Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-foreground font-semibold">Subject Code</TableHead>
                        <TableHead className="text-foreground font-semibold">Subject Description</TableHead>
                        <TableHead className="text-foreground font-semibold">Faculty</TableHead>
                        <TableHead className="text-foreground font-semibold">Room</TableHead>
                        <TableHead className="text-foreground font-semibold">Schedule</TableHead>
                        <TableHead className="text-foreground font-semibold">Type</TableHead>
                        <TableHead className="text-foreground font-semibold">Units</TableHead>
                        <TableHead className="text-foreground font-semibold">Students</TableHead>
                        <TableHead className="text-foreground font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.subjects.map(subject => (
                        <TableRow key={subject.id} className="border-border/30 hover:bg-muted/30">
                          <TableCell className="font-medium text-foreground">{subject.subjectCode}</TableCell>
                          <TableCell className="text-foreground">{subject.subjectDescription}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <div>
                                <div className="font-medium text-foreground">
                                  {subject.assignedFaculty?.name || 'Unassigned'}
                                </div>
                                {subject.assignedFaculty && (
                                  <Badge 
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                                  >
                                    {subject.assignedFaculty.matchScore || 0}% match
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <div>
                                <div className="font-medium text-foreground">
                                  {subject.assignedRoom?.roomNumber || 'TBA'}
                                </div>
                                {subject.assignedRoom && (
                                  <div className="text-xs text-muted-foreground">
                                    Cap: {subject.assignedRoom.capacity}
                                  </div>
                                )}
                              </div>
                            </div>
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
                            <Badge variant="secondary" className="bg-muted/50 text-foreground">{subject.type}</Badge>
                          </TableCell>
                          <TableCell className="text-foreground font-medium">{subject.units}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-foreground font-medium">
                              <Users className="h-4 w-4" />
                              {subject.enrolledStudents || 0}
                            </div>
                          </TableCell>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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


          {/* Export Options */}
          <Card className="bg-gradient-to-br from-muted/30 to-muted/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    Generated using: <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary/30">{schedule.algorithm}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Processing time: {schedule.processingTime}ms
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onExport('csv')} className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onExport('excel')} className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950">
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button size="sm" onClick={() => onExport('pdf')} className="bg-red-600 hover:bg-red-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
