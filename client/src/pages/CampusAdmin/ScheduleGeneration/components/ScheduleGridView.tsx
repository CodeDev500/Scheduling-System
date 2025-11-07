import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock,
  User,
  MapPin,
  Star,
  AlertTriangle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { GeneratedSchedule, ScheduleItem, FacultyRecommendation } from '../../../../types';
import { convertTo12Hour } from '../utils/timeUtils';
import { parseDaysCombination, getDayDisplayText } from '../utils/dayUtils';

interface ScheduleGridViewProps {
  selectedSchedule: GeneratedSchedule;
  onScheduleItemClick: (item: ScheduleItem) => void;
  getFacultyRecommendations: (subject: any, excludeFacultyId?: string) => FacultyRecommendation[];
}

export const ScheduleGridView: React.FC<ScheduleGridViewProps> = ({
  selectedSchedule,
  onScheduleItemClick,
  getFacultyRecommendations
}) => {
  // Debug logging
  console.log("🔍 ScheduleGridView - selectedSchedule:", selectedSchedule);
  console.log("🔍 ScheduleGridView - subjects:", selectedSchedule?.subjects);
  console.log("🔍 ScheduleGridView - subjects length:", selectedSchedule?.subjects?.length);
  
  if (!selectedSchedule || !selectedSchedule.subjects || selectedSchedule.subjects.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Schedule Data</h3>
            <p className="text-sm">No schedule items to display in grid view.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert time to minutes for calculation
  const convertTo24Hour = (time: string) => {
    const [timePart, period] = time.split(' ');
    const [hour, minute] = timePart.split(':').map(Number);
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 += 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    return hour24 * 60 + minute;
  };

  // Format time consistently
  const formatTime = (time: string): string => {
    if (time.includes('AM') || time.includes('PM')) {
      return time;
    }
    return convertTo12Hour(time);
  };

  // Get color scheme for schedule blocks
  const getColorScheme = (scheduleItem: any, index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600',
      'bg-gradient-to-br from-green-500 to-green-700 border-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-700 border-orange-600',
      'bg-gradient-to-br from-teal-500 to-teal-700 border-teal-600',
      'bg-gradient-to-br from-pink-500 to-pink-700 border-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-700 border-indigo-600',
      'bg-gradient-to-br from-red-500 to-red-700 border-red-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="flex border-2 border-slate-300 rounded-xl overflow-hidden shadow-xl bg-white">
            {/* Time Column */}
            <div className="flex flex-col min-w-[140px] border-r-2 border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200">
              {/* Time Header */}
              <div className="h-[60px] font-bold text-center bg-gradient-to-r from-slate-800 to-blue-800 text-white border-b-2 border-slate-400 text-lg flex items-center justify-center shadow-md">
                <Clock className="h-5 w-5 mr-2" />
                TIME
              </div>
              {/* Time Slots */}
              {Array.from({ length: 14 }, (_, i) => {
                const hour = i + 7; // 7 AM to 8 PM
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour;
                const timeSlot = `${displayHour}:00 ${period}`;
                return (
                  <div key={timeSlot} className="h-[100px] text-sm text-center bg-gradient-to-r from-slate-700 to-slate-800 text-white border-b-2 border-slate-400 flex flex-col items-center justify-center font-semibold shadow-sm">
                    <div className="text-lg font-bold">{timeSlot}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {displayHour}:00 - {displayHour + 1 > 12 ? displayHour + 1 - 12 : displayHour + 1}:00 {hour + 1 >= 12 ? 'PM' : 'AM'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Days Grid */}
            <div className="flex-1">
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b-2 border-slate-300">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="h-[60px] font-bold text-center bg-gradient-to-r from-slate-800 to-blue-800 text-white border-r-2 border-slate-400 last:border-r-0 text-lg flex flex-col items-center justify-center shadow-md">
                    <Calendar className="h-5 w-5 mb-1" />
                    <span>{day.substring(0, 3).toUpperCase()}</span>
                  </div>
                ))}
              </div>
              
              {/* Schedule Grid */}
              <div className="relative bg-gradient-to-br from-gray-50 to-slate-100">
                {/* Background grid for time slots */}
                {Array.from({ length: 14 }, (_, i) => {
                  const hour = i + 7;
                  const period = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour > 12 ? hour - 12 : hour;
                  const timeSlot = `${displayHour}:00 ${period}`;
                  return (
                    <div key={timeSlot} className="grid grid-cols-7">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div 
                          key={`${day}-${timeSlot}`} 
                          className="h-[100px] text-xs border-r-2 border-b-2 border-slate-200 hover:bg-blue-50 transition-all duration-300 hover:shadow-inner"
                        />
                      ))}
                    </div>
                  );
                })}
                
                {/* Schedule blocks positioned absolutely */}
                {selectedSchedule.subjects.map((scheduledSubject, index) => {
                  // Handle ScheduledSubject structure
                  if (!scheduledSubject.timeSlots || scheduledSubject.timeSlots.length === 0) {
                    return null;
                  }
                  
                  return scheduledSubject.timeSlots.map((timeSlot, timeIndex) => {
                    const startTime12 = formatTime(timeSlot.startTime);
                    const endTime12 = formatTime(timeSlot.endTime);
                    
                    const startTimeMinutes = convertTo24Hour(startTime12);
                    const endTimeMinutes = convertTo24Hour(endTime12);
                    
                    // Parse combined days (e.g., "MW" -> ["Monday", "Wednesday"])
                    const daysInSlot = parseDaysCombination(timeSlot.day);
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    
                    // Create blocks for each day in the combination
                    return daysInSlot.map((dayName, dayIdx) => {
                      const dayIndex = days.indexOf(dayName);
                      
                      // Only show blocks within 7 AM to 8 PM range
                      const startHour = Math.floor(startTimeMinutes / 60);
                      if (dayIndex < 0 || startHour < 7 || startHour > 20) return null;
                      
                      // Calculate precise positioning
                      const cellHeight = 100; // Height of each time slot cell
                      const gridStartTime = 7 * 60; // 7 AM in minutes
                      const pixelsPerMinute = cellHeight / 60; // pixels per minute
                      
                      // Calculate top position and block height
                      const topPosition = (startTimeMinutes - gridStartTime) * pixelsPerMinute;
                      const durationMinutes = endTimeMinutes - startTimeMinutes;
                      const blockHeight = Math.max(durationMinutes * pixelsPerMinute, 80); // Minimum height 80px
                      
                      const colorClass = getColorScheme(scheduledSubject, index);
                      
                      return (
                        <div
                          key={`${scheduledSubject.subjectId}-${dayName}-${index}-${timeIndex}-${dayIdx}`}
                          className={`absolute ${colorClass} text-white rounded-2xl shadow-2xl z-10 border-3 cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300 transform hover:z-20`}
                          style={{
                            top: `${topPosition}px`,
                            left: `${(dayIndex * (100 / 7)) + 0.8}%`,
                            width: `${(100 / 7) - 1.6}%`,
                            height: `${blockHeight}px`,
                            minHeight: '80px'
                          }}
                          onClick={() => {
                            const enhancedScheduleItem = {
                              id: `${scheduledSubject.subjectId}-${timeSlot.id}`,
                              subjectId: scheduledSubject.subjectId,
                              subjectCode: scheduledSubject.subjectCode,
                              subjectName: scheduledSubject.subjectName,
                              facultyId: scheduledSubject.faculty?.id || '',
                              facultyName: scheduledSubject.faculty?.name || 'TBA',
                              roomId: scheduledSubject.room?.id || '',
                              roomName: scheduledSubject.room?.name || 'TBA',
                              day: timeSlot.day, // Keep the combined day format
                              startTime: timeSlot.startTime,
                              endTime: timeSlot.endTime,
                              type: ((scheduledSubject.lectureHours || 0) > 0 ? 'Lec' : 'Lab') as 'Lec' | 'Lab' | 'Lec/Lab',
                              units: scheduledSubject.units,
                              lec: scheduledSubject.lec || 0,
                              lab: scheduledSubject.lab || 0,
                              yearLevel: 1,
                              semester: 1,
                              recommendedFaculty: getFacultyRecommendations(scheduledSubject, scheduledSubject.faculty?.id)
                                .slice(0, 5)
                             };
                             onScheduleItemClick(enhancedScheduleItem);
                           }}
                         >
                           <div className="p-4 h-full flex flex-col justify-between">
                             {/* Header */}
                             <div className="space-y-2">
                               <div className="flex items-center justify-between">
                                 <div className="font-bold text-xl truncate">
                                   {scheduledSubject.subjectCode}
                                 </div>
                               </div>
                               <div className="text-sm opacity-90 truncate font-semibold">
                                 {scheduledSubject.subjectName}
                               </div>
                               {/* Show combined days indicator for multi-day sessions */}
                               {daysInSlot.length > 1 && (
                                 <div className="text-xs opacity-80 font-medium">
                                   {getDayDisplayText(timeSlot.day, 'short')}
                                 </div>
                               )}
                             </div>

                             {/* Content */}
                             <div className="space-y-2 flex-1 flex flex-col justify-center">
                               <div className="flex items-center gap-2 text-sm opacity-90">
                                 <Clock className="h-4 w-4 flex-shrink-0" />
                                 <span className="font-semibold truncate">
                                   {startTime12} - {endTime12}
                                 </span>
                               </div>
                               <div className="flex items-center gap-2 text-sm opacity-90">
                                 <User className="h-4 w-4 flex-shrink-0" />
                                 <span className="truncate font-semibold">{scheduledSubject.faculty?.name || 'TBA'}</span>
                               </div>
                               {scheduledSubject.room && (
                                 <div className="flex items-center gap-2 text-sm opacity-90">
                                   <MapPin className="h-4 w-4 flex-shrink-0" />
                                   <span className="font-semibold">{scheduledSubject.room.name}</span>
                                 </div>
                               )}
                               <div className="flex items-center gap-2 text-xs opacity-80">
                                 <Star className="h-4 w-4 flex-shrink-0" />
                                 <span className="font-medium">{scheduledSubject.units} Units</span>
                               </div>
                             </div>

                             {/* Footer Status */}
                             <div className="mt-3">
                               <Badge className="bg-blue-200 text-blue-900 text-xs font-bold shadow-md">
                                 <CheckCircle className="h-3 w-3 mr-1" />
                                 Scheduled
                               </Badge>
                             </div>
                           </div>
                         </div>
                       );
                     });
                   });
                 })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
