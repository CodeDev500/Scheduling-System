import type { ScheduleItem, Conflict, ConflictDetectionResult, GeneratedSchedule } from '../../../../types';

// Advanced conflict detection system
export const detectConflicts = (scheduleItems: ScheduleItem[]): ConflictDetectionResult => {
  const conflicts: Conflict[] = [];
  const enhancedItems = scheduleItems.map(item => ({ ...item, hasConflict: false, status: 'conflict-free', conflictType: 'none' as 'faculty' | 'room' | 'section' | 'none' }));

  // Check for conflicts between all schedule items
  for (let i = 0; i < enhancedItems.length; i++) {
    const currentItem = enhancedItems[i];
    let hasConflict = false;
    let conflictTypes: string[] = [];

    for (let j = i + 1; j < enhancedItems.length; j++) {
      const compareItem = enhancedItems[j];
      // Check if items are on the same day
      const sameDay = currentItem.day === compareItem.day;

      if (sameDay) {
        // Check time overlap with proper time format handling
        const formatTimeForDate = (timeStr: string): string => {
          // If time already has seconds (HH:MM:SS), use as is
          if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
            return timeStr;
          }
          // If time is HH:MM format, add seconds
          if (timeStr.match(/^\d{2}:\d{2}$/)) {
            return timeStr + ':00';
          }
          // If time is just HH, add minutes and seconds
          if (timeStr.match(/^\d{1,2}$/)) {
            return timeStr.padStart(2, '0') + ':00:00';
          }
          // Default fallback
          return timeStr + ':00';
        };

        const currentStartTime = formatTimeForDate(currentItem.startTime);
        const currentEndTime = formatTimeForDate(currentItem.endTime);
        const compareStartTime = formatTimeForDate(compareItem.startTime);
        const compareEndTime = formatTimeForDate(compareItem.endTime);

        const currentStart = new Date(`2000-01-01T${currentStartTime}`);
        const currentEnd = new Date(`2000-01-01T${currentEndTime}`);
        const compareStart = new Date(`2000-01-01T${compareStartTime}`);
        const compareEnd = new Date(`2000-01-01T${compareEndTime}`);

        const hasTimeOverlap = (currentStart < compareEnd && currentEnd > compareStart);

        if (hasTimeOverlap) {
          // Faculty conflict
          const sameFaculty = currentItem.facultyId === compareItem.facultyId;
 
          if (sameFaculty) {
            hasConflict = true;
            conflictTypes.push('faculty');
            conflicts.push({
              id: `conflict-faculty-${Date.now()}-${i}-${j}`,
              type: 'Faculty',
              severity: 'High',
              description: `Faculty ${currentItem.facultyName} is double-booked on ${currentItem.day}`,
              affectedSubjects: [currentItem.subjectCode, compareItem.subjectCode],
              suggestedResolution: 'Reassign one of the classes to a different faculty member',
              autoResolvable: false,
              details: `${currentItem.subjectCode} and ${compareItem.subjectCode} both assigned to ${currentItem.facultyName}`,
              suggestions: ['Find alternative faculty', 'Adjust time slots']
            });
          }

          // Room conflict
          const sameRoom = currentItem.roomId === compareItem.roomId; 
          if (sameRoom) {
            hasConflict = true;
            conflictTypes.push('room');
            conflicts.push({
              id: `conflict-room-${Date.now()}-${i}-${j}`,
              type: 'Room',
              severity: 'High',
              description: `Room ${currentItem.roomName} is double-booked on ${currentItem.day}`,
              affectedSubjects: [currentItem.subjectCode, compareItem.subjectCode],
              suggestedResolution: 'Reassign one of the classes to a different room',
              autoResolvable: true,
              details: `${currentItem.subjectCode} and ${compareItem.subjectCode} both use ${currentItem.roomName}`,
              suggestions: ['Find alternative room', 'Adjust time slots']
            });
          }

          // Section conflict (same program and year level)
          const sameSection = currentItem.yearLevel === compareItem.yearLevel && 
              currentItem.semester === compareItem.semester;
    
          if (sameSection) {
            hasConflict = true;
            conflictTypes.push('section');
            conflicts.push({
              id: `conflict-section-${Date.now()}-${i}-${j}`,
              type: 'Time',
              severity: 'Medium',
              description: `Year ${currentItem.yearLevel} has overlapping classes on ${currentItem.day}`,
              affectedSubjects: [currentItem.subjectCode, compareItem.subjectCode],
              suggestedResolution: 'Adjust time slots to avoid overlap',
              autoResolvable: true,
              details: `${currentItem.subjectCode} and ${compareItem.subjectCode} overlap for ${currentItem.yearLevel}`,
              suggestions: ['Change day pattern', 'Adjust time slots']
            });
          }
        }
      }
    }

    if (hasConflict) {
      currentItem.hasConflict = true;
      currentItem.status = 'conflict';
      currentItem.conflictType = conflictTypes[0] as 'faculty' | 'room' | 'section';
    } else {
      // Check for warnings (potential issues)
      const facultyLoad = enhancedItems.filter(item => 
        item.facultyId === currentItem.facultyId && item.day === currentItem.day
      ).length;

      if (facultyLoad > 3) {
        currentItem.status = 'warning';
        currentItem.conflictType = 'none';
        conflicts.push({
          id: `conflict-warning-${Date.now()}-${i}`,
          type: 'Faculty',
          severity: 'Low',
          description: `Faculty ${currentItem.facultyName} has heavy load on ${currentItem.day} (${facultyLoad} classes)`,
          affectedSubjects: [currentItem.subjectCode],
          suggestedResolution: 'Consider redistributing faculty workload',
          autoResolvable: false,
          details: `${currentItem.facultyName} teaches ${facultyLoad} classes on ${currentItem.day}`,
          suggestions: ['Redistribute workload', 'Add more faculty']
        });
      } else {
        currentItem.hasConflict = false;
        currentItem.status = 'conflict-free';
        currentItem.conflictType = 'none';
      }
    }
  }


  return { 
    enhancedItems,
    conflicts, 
    severity: conflicts.length === 0 ? 'none' : conflicts.some(c => c.severity === 'High') ? 'high' : conflicts.some(c => c.severity === 'Medium') ? 'medium' : 'low', 
    resolvable: true, 
    suggestions: [] 
  };
};

// Calculate optimization score
export const calculateOptimizationScore = (conflicts: Conflict[]): number => {
  return Math.max(
    60, 
    100 - 
    (conflicts.filter(c => c.severity === 'High').length * 15) - 
    (conflicts.filter(c => c.severity === 'Medium').length * 8) - 
    (conflicts.filter(c => c.severity === 'Low').length * 3)
  );
};

// Create a new schedule from schedule items
export const createSchedule = (
  scheduleItems: ScheduleItem[], 
  conflicts: Conflict[], 
  existingSchedulesCount: number
): GeneratedSchedule => {
  
  const schedule = {
    id: Date.now().toString(),
    name: `Schedule ${existingSchedulesCount + 1}`,
    createdAt: new Date(),
    conflicts: conflicts,
    subjects: scheduleItems,
    faculty: [...new Set(scheduleItems.map(item => item.facultyName))],
    totalSubjects: scheduleItems.length,
    totalFaculty: [...new Set(scheduleItems.map(item => item.facultyId))].length,
    optimizationScore: calculateOptimizationScore(conflicts)
  };
  return schedule;
};
