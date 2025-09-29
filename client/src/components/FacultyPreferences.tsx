import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';

import { Clock, Save, RotateCcw } from 'lucide-react';
import { useFacultyPreferences, type TimeSlot } from '../contexts/FacultyPreferencesContext';

interface FacultyPreferencesProps {
  onSave?: (preferences: TimeSlot[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  { start: '07:00', end: '08:00', label: '7:00 AM - 8:00 AM' },
  { start: '08:00', end: '09:00', label: '8:00 AM - 9:00 AM' },
  { start: '09:00', end: '10:00', label: '9:00 AM - 10:00 AM' },
  { start: '10:00', end: '11:00', label: '10:00 AM - 11:00 AM' },
  { start: '11:00', end: '12:00', label: '11:00 AM - 12:00 PM' },
  { start: '12:00', end: '13:00', label: '12:00 PM - 1:00 PM' },
  { start: '13:00', end: '14:00', label: '1:00 PM - 2:00 PM' },
  { start: '14:00', end: '15:00', label: '2:00 PM - 3:00 PM' },
  { start: '15:00', end: '16:00', label: '3:00 PM - 4:00 PM' },
  { start: '16:00', end: '17:00', label: '4:00 PM - 5:00 PM' },
  { start: '17:00', end: '18:00', label: '5:00 PM - 6:00 PM' },
];

export function FacultyPreferences({ onSave }: FacultyPreferencesProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const getSlotId = (day: string, timeSlot: { start: string; end: string }) => {
    return `${day}-${timeSlot.start}-${timeSlot.end}`;
  };

  const handleSlotToggle = (day: string, timeSlot: { start: string; end: string }) => {
    const slotId = getSlotId(day, timeSlot);
    const newSelectedSlots = new Set(selectedSlots);
    
    if (newSelectedSlots.has(slotId)) {
      newSelectedSlots.delete(slotId);
    } else {
      newSelectedSlots.add(slotId);
    }
    
    setSelectedSlots(newSelectedSlots);
    setHasChanges(true);
  };

  const handleSave = () => {
    const preferences: TimeSlot[] = Array.from(selectedSlots).map(slotId => {
      const [day, startTime, endTime] = slotId.split('-');
      return { day, startTime, endTime };
    });
    
    onSave?.(preferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSelectedSlots(new Set());
    setHasChanges(true);
  };

  const isSlotSelected = (day: string, timeSlot: { start: string; end: string }) => {
    return selectedSlots.has(getSlotId(day, timeSlot));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Faculty Teaching Preferences</CardTitle>
        </div>
        <CardDescription>
          Select your preferred teaching time slots. These preferences will be used to optimize your schedule and reduce conflicts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {DAYS.map((day) => (
            <div key={day} className="space-y-3">
              <h3 className="font-semibold text-lg">{day}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {TIME_SLOTS.map((timeSlot) => {
                  const slotId = getSlotId(day, timeSlot);
                  const isSelected = isSlotSelected(day, timeSlot);
                  
                  return (
                    <Button
                      key={slotId}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-start ${
                        isSelected 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSlotToggle(day, timeSlot)}
                    >
                      {timeSlot.label}
                    </Button>
                  );
                })}
              </div>
              {day !== DAYS[DAYS.length - 1] && <div className="border-t my-4" />}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedSlots.size} time slot{selectedSlots.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={selectedSlots.size === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}