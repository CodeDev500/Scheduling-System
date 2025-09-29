import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface ScheduleSlot {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  section: string;
  time: string;
  day: string;
  hasConflict: boolean;
  isRecommended?: boolean;
  units: number;
}

interface ScheduleGridProps {
  schedules: ScheduleSlot[];
  viewMode: 'grid' | 'table';
}

export function ScheduleGrid({ schedules, viewMode }: ScheduleGridProps) {
  const timeSlots = [
    '7:00-8:30', '8:30-10:00', '10:00-11:30', '11:30-13:00',
    '13:00-14:30', '14:30-16:00', '16:00-17:30', '17:30-19:00', '19:00-20:30'
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (viewMode === 'table') {
    return (
      <Card className="p-6 bg-card border shadow-sm">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Schedule Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Subject</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Faculty</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Room</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Section</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Day</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr 
                    key={schedule.id} 
                    className={`border-b border-border hover:bg-accent/50 transition-colors ${
                      schedule.hasConflict ? 'bg-destructive-light/50' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-medium text-foreground">{schedule.subject}</div>
                      <div className="text-sm text-muted-foreground">{schedule.units} units</div>
                    </td>
                    <td className="p-3 text-foreground">{schedule.faculty}</td>
                    <td className="p-3 text-foreground">{schedule.room}</td>
                    <td className="p-3 text-foreground">{schedule.section}</td>
                    <td className="p-3 text-foreground">{schedule.time}</td>
                    <td className="p-3 text-foreground">{schedule.day}</td>
                    <td className="p-3">
                      {schedule.hasConflict ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertCircle className="h-3 w-3" />
                          Conflict
                        </Badge>
                      ) : schedule.isRecommended ? (
                        <Badge className="bg-primary text-primary-foreground flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Recommended
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3" />
                          Scheduled
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-schedule-grid border shadow-sm">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Weekly Schedule Grid</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-2 min-w-[800px]">
            {/* Header */}
            <div className="p-3 bg-schedule-time rounded-lg font-medium text-center text-sm text-muted-foreground">
              Time
            </div>
            {days.map((day) => (
              <div key={day} className="p-3 bg-schedule-time rounded-lg font-medium text-center text-sm text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Time slots */}
            {timeSlots.map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <div className="p-3 bg-schedule-time rounded-lg font-medium text-center text-sm text-muted-foreground">
                  {timeSlot}
                </div>
                {days.map((day) => {
                  const daySchedules = schedules.filter(
                    (schedule) => schedule.day === day && schedule.time === timeSlot
                  );
                  
                  return (
                    <div key={`${day}-${timeSlot}`} className="min-h-[80px] p-2 bg-card rounded-lg border border-border">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`p-2 rounded-md text-xs mb-1 border transition-all hover:shadow-sm ${
                            schedule.hasConflict
                              ? 'bg-destructive-light border-destructive text-destructive-foreground'
                              : schedule.isRecommended
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-success-light border-success text-success-foreground'
                          }`}
                        >
                          <div className="font-medium truncate">{schedule.subject}</div>
                          <div className="truncate opacity-80">{schedule.faculty}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="truncate">{schedule.room}</span>
                            {schedule.hasConflict && (
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Import React for Fragment
import React from 'react';