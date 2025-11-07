import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Edit3,
  Save,
  Undo,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import type { GeneratedSchedule, Room, TimeSlot, Subject, Faculty, ScheduleItem } from '../../../../types';

interface ManualAdjustmentsProps {
  schedule: GeneratedSchedule;
  faculty: Faculty[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  subjects: Subject[];
  onUpdateSchedule: (updatedSchedule: GeneratedSchedule) => void;
  onResolveConflict: (conflictId: string, resolution: any) => void;
}

interface ConflictResolution {
  id: string;
  type: 'faculty_conflict' | 'room_conflict' | 'time_conflict';
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedItems: string[];
  suggestedActions: string[];
  status: 'pending' | 'resolved' | 'ignored';
}

interface FacultyAssignment {
  subjectId: string;
  currentFacultyId?: string;
  newFacultyId: string;
  reason: string;
}

const ManualAdjustments: React.FC<ManualAdjustmentsProps> = ({
  schedule,
  faculty,
  rooms,
  timeSlots,
  subjects,
  onUpdateSchedule,
  onResolveConflict
}) => {
  const [activeTab, setActiveTab] = useState('faculty');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedConflict, setSelectedConflict] = useState<ConflictResolution | null>(null);
  const [pendingAssignments, setPendingAssignments] = useState<FacultyAssignment[]>([]);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<FacultyAssignment>>({});

  // Mock conflicts for demonstration
  const mockConflicts: ConflictResolution[] = [
    {
      id: 'conflict-1',
      type: 'faculty_conflict',
      description: 'Prof. Michael Chen is assigned to overlapping time slots',
      severity: 'high',
      affectedItems: ['CS-201', 'CS-301'],
      suggestedActions: ['Reassign one subject to another faculty', 'Change time slot'],
      status: 'pending'
    },
    {
      id: 'conflict-2',
      type: 'room_conflict',
      description: 'Room A101 is double-booked for Monday 9:00 AM',
      severity: 'high',
      affectedItems: ['CS-101', 'IT-201'],
      suggestedActions: ['Move one class to another room', 'Change time slot'],
      status: 'pending'
    },
    {
      id: 'conflict-3',
      type: 'time_conflict',
      description: 'Insufficient break time between consecutive classes',
      severity: 'medium',
      affectedItems: ['CS-201', 'CS-302'],
      suggestedActions: ['Add buffer time', 'Reschedule one class'],
      status: 'pending'
    }
  ];

  const handleFacultyAssignment = (subjectId: string, facultyId: string, reason: string) => {
    const assignment: FacultyAssignment = {
      subjectId,
      newFacultyId: facultyId,
      reason
    };
    
    setPendingAssignments(prev => [...prev, assignment]);
    setShowAssignmentDialog(false);
    setCurrentAssignment({});
  };

  const applyPendingAssignments = () => {
    // Apply all pending assignments to the schedule
    const updatedSchedule = { ...schedule };
    
    pendingAssignments.forEach(assignment => {
      // Update schedule with new faculty assignments
      // This would modify the schedule data structure
      console.log('Applying assignment:', assignment);
    });
    
    onUpdateSchedule(updatedSchedule);
    setPendingAssignments([]);
  };

  const handleConflictResolution = (conflictId: string, action: string) => {
    const resolution = {
      conflictId,
      action,
      timestamp: new Date().toISOString(),
      resolvedBy: 'admin' // In real app, this would be the current user
    };
    
    onResolveConflict(conflictId, resolution);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConflicts = mockConflicts.filter(conflict => {
    if (filterType === 'all') return true;
    return conflict.type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manual Adjustments</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={applyPendingAssignments}
            disabled={pendingAssignments.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Apply Changes ({pendingAssignments.length})
          </Button>
          <Button variant="outline" onClick={() => setPendingAssignments([])}>
            <Undo className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {pendingAssignments.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingAssignments.length} pending assignment(s). Click "Apply Changes" to save them.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faculty">Faculty Assignments</TabsTrigger>
          <TabsTrigger value="conflicts">Conflict Resolution</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Assign Faculty
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Faculty to Subject</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={currentAssignment.subjectId}
                      onValueChange={(value) => setCurrentAssignment(prev => ({ ...prev, subjectId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.code} - {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="faculty">Faculty</Label>
                    <Select
                      value={currentAssignment.newFacultyId}
                      onValueChange={(value) => setCurrentAssignment(prev => ({ ...prev, newFacultyId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map(f => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name} - {f.specializations.join(', ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Assignment</Label>
                    <Textarea
                      placeholder="Enter reason for this assignment..."
                      value={currentAssignment.reason || ''}
                      onChange={(e) => setCurrentAssignment(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (currentAssignment.subjectId && currentAssignment.newFacultyId && currentAssignment.reason) {
                        handleFacultyAssignment(
                          currentAssignment.subjectId,
                          currentAssignment.newFacultyId,
                          currentAssignment.reason
                        );
                      }
                    }}
                    disabled={!currentAssignment.subjectId || !currentAssignment.newFacultyId || !currentAssignment.reason}
                    className="w-full"
                  >
                    Assign Faculty
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredSubjects.map(subject => {
              // Find the scheduled subject in the generated schedule
              const scheduledSubject = schedule.subjects?.find(s => s.subjectId === subject.id);
              const currentFaculty = scheduledSubject?.faculty ? 
                faculty.find(f => f.id === scheduledSubject.faculty?.id) : 
                null;
              const pendingAssignment = pendingAssignments.find(a => a.subjectId === subject.id);
              
              return (
                <Card key={subject.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{subject.code} - {subject.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {currentFaculty ? currentFaculty.name : 'Unassigned'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {subject.units} units
                          </div>
                        </div>
                        {pendingAssignment && (
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending: {faculty.find(f => f.id === pendingAssignment.newFacultyId)?.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentAssignment({ subjectId: subject.id });
                          setShowAssignmentDialog(true);
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Reassign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conflicts</SelectItem>
                <SelectItem value="faculty_conflict">Faculty Conflicts</SelectItem>
                <SelectItem value="room_conflict">Room Conflicts</SelectItem>
                <SelectItem value="time_conflict">Time Conflicts</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Conflicts
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredConflicts.map(conflict => (
              <Card key={conflict.id} className={`border-l-4 ${
                conflict.severity === 'high' ? 'border-l-red-500' :
                conflict.severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          conflict.severity === 'high' ? 'text-red-500' :
                          conflict.severity === 'medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <Badge variant={
                          conflict.severity === 'high' ? 'destructive' :
                          conflict.severity === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {conflict.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {conflict.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="font-medium mb-2">{conflict.description}</p>
                      <div className="text-sm text-gray-600 mb-3">
                        <p><strong>Affected:</strong> {conflict.affectedItems.join(', ')}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggested Actions:</p>
                        {conflict.suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleConflictResolution(conflict.id, action)}
                            className="mr-2 mb-2"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConflictResolution(conflict.id, 'ignore')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Ignore
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConflictResolution(conflict.id, 'resolve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Schedule adjustment tools will be available here.</p>
                <p className="text-sm">Drag and drop functionality, time slot modifications, and room changes.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualAdjustments;
