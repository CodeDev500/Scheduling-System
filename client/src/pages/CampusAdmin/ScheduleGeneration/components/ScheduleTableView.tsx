import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen,
  Star,
  Clock,
  Building,
  User,
  Award,
  MapPin,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Eye,
  Edit,
  X,
  Info,
  Table
} from 'lucide-react';
import type { GeneratedSchedule, ScheduleItem } from '../../../../types';
import { convertTo12Hour } from '../utils/timeUtils';

interface ScheduleTableViewProps {
  selectedSchedule: GeneratedSchedule;
  editingItem: string | null;
  editFormData: any;
  bulkEditMode: boolean;
  selectedItems: string[];
  mockData: any;
  onStartEdit: (item: ScheduleItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onScheduleItemClick: (item: ScheduleItem) => void;
  onBulkEditToggle: () => void;
  onBulkSelect: (id: string) => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  onBulkAssignFaculty: (facultyId: string) => void;
  onDragStart: (e: React.DragEvent, item: ScheduleItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, day: string, time: string) => void;
  setEditFormData: (data: any) => void;
  getFacultyRecommendations: (subject: any, excludeFacultyId?: string) => any[];
}

export const ScheduleTableView: React.FC<ScheduleTableViewProps> = ({
  selectedSchedule,
  editingItem,
  editFormData,
  bulkEditMode,
  selectedItems,
  mockData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onScheduleItemClick,
  onBulkEditToggle,
  onBulkSelect,
  onSelectAll,
  onBulkDelete,
  onBulkAssignFaculty,
  onDragStart,
  onDragOver,
  onDrop,
  setEditFormData,
  getFacultyRecommendations
}) => {
  // Debug logging
  console.log("🔍 ScheduleTableView - selectedSchedule:", selectedSchedule);
  console.log("🔍 ScheduleTableView - subjects:", selectedSchedule?.subjects);
  console.log("🔍 ScheduleTableView - subjects length:", selectedSchedule?.subjects?.length);
  
  if (!selectedSchedule || !selectedSchedule.subjects || selectedSchedule.subjects.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Table className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Schedule Data</h3>
            <p className="text-sm">No schedule items to display in table view.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Table className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">Schedule Overview</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              <Info className="h-4 w-4 mr-1 text-blue-500" />
              {selectedSchedule.subjects.length} Total Subjects
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={bulkEditMode ? "default" : "outline"}
                onClick={onBulkEditToggle}
                className={bulkEditMode ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {bulkEditMode ? "Exit Bulk Mode" : "Bulk Edit"}
              </Button>
              {bulkEditMode && selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onBulkDelete}
                  >
                    Delete ({selectedItems.length})
                  </Button>
                  <Select onValueChange={onBulkAssignFaculty}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.faculty.map((faculty: any) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-slate-200">
              <tr>
                {bulkEditMode && (
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === selectedSchedule.subjects.length && selectedSchedule.subjects.length > 0}
                      onChange={onSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                  Subject Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                  Units → Hours
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                  Program / Section
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                  Assigned Faculty
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                  Room Assignment
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                  Schedule
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-slate-200">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {selectedSchedule.subjects.map((scheduledSubject, index) => {
                // Create a flattened structure for each time slot
                return scheduledSubject.timeSlots.map((timeSlot, timeIndex) => (
                <tr 
                  key={`${scheduledSubject.subjectId}-${timeIndex}`} 
                  className="hover:bg-slate-50 transition-colors duration-200 border-l-4 border-blue-400"
                  draggable={true}
                  onDragStart={(e) => {
                    // Create a compatible object for drag operations
                    const compatibleItem = {
                      id: `${scheduledSubject.subjectId}-${timeIndex}`,
                      subjectId: scheduledSubject.subjectId,
                      subjectCode: scheduledSubject.subjectCode,
                      subjectName: scheduledSubject.subjectName,
                      day: timeSlot.day,
                      startTime: timeSlot.startTime,
                      endTime: timeSlot.endTime
                    };
                    onDragStart(e, compatibleItem as any);
                  }}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, timeSlot.day, timeSlot.startTime)}
                >
                  {bulkEditMode && (
                    <td className="px-6 py-5 border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(`${scheduledSubject.subjectId}-${timeIndex}`)}
                        onChange={() => onBulkSelect(`${scheduledSubject.subjectId}-${timeIndex}`)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  
                  {/* Subject Details */}
                  <td className="px-6 py-5 border-r border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{scheduledSubject.subjectCode}</div>
                          <div className="text-sm text-gray-600 font-medium">{scheduledSubject.subjectName}</div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Units → Hours */}
                  <td className="px-6 py-5 border-r border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-gray-800">{scheduledSubject.units} Units</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>Lecture: {scheduledSubject.lectureHours || 0}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-green-500" />
                          <span>Lab: {scheduledSubject.labHours || 0}h</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Program / Section */}
                  <td className="px-6 py-5 border-r border-slate-200">
                    <div className="space-y-2">
                      <Badge className="bg-purple-100 text-purple-800 font-semibold">
                        {scheduledSubject.program || 'BSIT'}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        Section: {scheduledSubject.section || 'A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Year: {scheduledSubject.yearLevel || '1st'}
                      </div>
                    </div>
                  </td>

                  {/* Assigned Faculty */}
                  <td className="px-6 py-5 border-r border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                          <Award className="h-2 w-2 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{scheduledSubject.faculty?.name || 'TBA'}</div>
                        <div className="text-sm text-gray-600">{scheduledSubject.faculty?.department || 'N/A'}</div>
                        <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                          Assigned
                        </Badge>
                      </div>
                    </div>
                  </td>

                  {/* Room Assignment */}
                  <td className="px-6 py-5 border-r border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <span className="font-semibold text-gray-800">{scheduledSubject.room?.name || 'TBA'}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Type: {scheduledSubject.room?.type || 'N/A'}</div>
                        <div>Capacity: {scheduledSubject.room?.capacity || 'N/A'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className="px-6 py-5 border-r border-slate-200">
                    <div className="space-y-2">
                      <Badge variant="outline" className="border-purple-300 text-purple-700 font-semibold">
                        {timeSlot.day}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-800 text-sm">
                          {convertTo12Hour(timeSlot.startTime)} - {convertTo12Hour(timeSlot.endTime)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Duration: {Math.round((new Date(`2000-01-01T${timeSlot.endTime}`).getTime() - new Date(`2000-01-01T${timeSlot.startTime}`).getTime()) / (1000 * 60 * 60 * 100)) / 10}h
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 border-r border-slate-200">
                    <div className="space-y-2">
                      <Badge className="bg-blue-100 text-blue-800 font-semibold">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Scheduled ✅
                      </Badge>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => {
                          const compatibleItem = {
                            id: `${scheduledSubject.subjectId}-${timeIndex}`,
                            subjectId: scheduledSubject.subjectId,
                            subjectCode: scheduledSubject.subjectCode,
                            subjectName: scheduledSubject.subjectName,
                            faculty: scheduledSubject.faculty,
                            room: scheduledSubject.room,
                            day: timeSlot.day,
                            startTime: timeSlot.startTime,
                            endTime: timeSlot.endTime,
                            units: scheduledSubject.units
                          };
                          onScheduleItemClick(compatibleItem as any);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
