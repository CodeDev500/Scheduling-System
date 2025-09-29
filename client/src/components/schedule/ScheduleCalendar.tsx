import React from 'react';
import { Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScheduleItem {
  id: string;
  subject: string;
  code: string;
  faculty: string;
  facultyId: string;
  room: string;
  roomId: string;
  startTime: string;
  endTime: string;
  day: string;
  section: string;
  semester: string;
  academicYear: string;
  isPreview?: boolean;
  hasConflict?: boolean;
  conflictType?: 'time' | 'room' | 'faculty';
}

interface ScheduleCalendarProps {
  schedules: ScheduleItem[];
  onScheduleClick?: (schedule: ScheduleItem) => void;
  showConflicts?: boolean;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ 
  schedules, 
  onScheduleClick, 
  showConflicts = true 
}) => {
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbr = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getScheduleForTimeSlot = (day: string, time: string) => {
    return schedules.filter(schedule => {
      const scheduleDay = schedule.day.toLowerCase();
      const dayLower = day.toLowerCase();
      
      // Handle day matching (support both full names and abbreviations)
      const dayMatch = scheduleDay === dayLower || 
                      scheduleDay === dayAbbr[days.findIndex(d => d.toLowerCase() === dayLower)]?.toLowerCase() ||
                      scheduleDay.startsWith(dayLower.substring(0, 3));
      
      if (!dayMatch) return false;
      
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      const slotHour = parseInt(time.split(':')[0]);
      
      return slotHour >= startHour && slotHour < endHour;
    });
  };

  const getScheduleHeight = (schedule: ScheduleItem) => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const duration = endHour - startHour;
    return Math.max(duration * 60, 60); // Minimum 60px height
  };

  const getConflictColor = (schedule: ScheduleItem) => {
    if (schedule.isPreview) {
      return 'bg-gray-400 hover:bg-gray-500 opacity-70 border-2 border-dashed border-gray-600';
    }
    
    if (!showConflicts || !schedule.hasConflict) {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    
    switch (schedule.conflictType) {
      case 'time':
        return 'bg-red-500 hover:bg-red-600';
      case 'room':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'faculty':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Weekly Schedule
        </CardTitle>
        {showConflicts && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Time Conflict</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Room Conflict</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Faculty Conflict</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              <div className="p-3 text-center font-semibold text-gray-700 bg-gray-50 rounded border">
                Time
              </div>
              {days.map((day, index) => (
                <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50 rounded border">
                  <div>{dayAbbr[index]}</div>
                  <div className="text-xs text-gray-500 font-normal">{day}</div>
                </div>
              ))}
            </div>
            
            {/* Time slots */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-7 gap-1 mb-1">
                <div className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50 rounded border min-h-[80px] flex items-center justify-center">
                  {time}
                </div>
                {days.map(day => {
                  const daySchedules = getScheduleForTimeSlot(day, time);
                  
                  return (
                    <div key={`${day}-${time}`} className="border rounded min-h-[80px] p-1 bg-white relative">
                      {daySchedules.map((schedule, index) => {
                        const isFirstSlot = parseInt(schedule.startTime.split(':')[0]) === parseInt(time.split(':')[0]);
                        
                        if (!isFirstSlot) return null;
                        
                        return (
                          <div
                            key={schedule.id}
                            className={`absolute inset-1 rounded p-2 text-white text-xs cursor-pointer transition-colors ${
                              getConflictColor(schedule)
                            } ${schedule.isPreview ? 'animate-pulse' : ''}`}
                            style={{
                              height: `${getScheduleHeight(schedule)}px`,
                              zIndex: 10 + index
                            }}
                            onClick={() => onScheduleClick?.(schedule)}
                          >
                            <div className="font-semibold truncate">
                              {schedule.code}
                              {schedule.isPreview && <span className="ml-1 text-xs">(Preview)</span>}
                            </div>
                            <div className="truncate text-xs opacity-90">
                              {schedule.subject}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{schedule.room}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-80">
                              <User className="w-3 h-3" />
                              <span className="truncate">{schedule.faculty}</span>
                            </div>
                            <div className="text-xs opacity-80">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            {schedule.section && (
                              <div className="text-xs opacity-80 font-medium">
                                {schedule.section}
                              </div>
                            )}
                            {showConflicts && schedule.hasConflict && (
                              <div className="absolute top-1 right-1">
                                <AlertTriangle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;