import type { ScheduleItem, Conflict, ConflictDetectionResult, GeneratedSchedule } from '../../../../types';
import { mockData } from '../mockData';
import { formatDaysCombination, getCommonDayPatterns } from './dayUtils';

// Generate realistic schedule data with combined sessions for same subject
export const generateMockScheduleData = (): ScheduleItem[] => {
  const scheduleItems: ScheduleItem[] = [];
  const usedTimeSlots = new Set<string>();
  const subjectTimeSlots = new Map<string, { startTime: string; endTime: string; duration: number }>(); // Track assigned time slots per subject
  
  // Select a subset of subjects for this schedule
  const selectedSubjects = mockData.subjects.slice(0, 10);
  
  selectedSubjects.forEach((subject, index) => {
    // Find suitable faculty for this subject
    const suitableFaculty = mockData.faculty.find(faculty => 
      faculty.subjectExperience.some(exp => exp.subjectId === subject.id)
    ) || mockData.faculty[index % mockData.faculty.length];
    
    // Get day patterns based on units
    const dayPatterns = getCommonDayPatterns(subject.units);
    let selectedPattern: string | null = null;
    let assignedTimeSlot: { startTime: string; endTime: string; duration: number } | null = null;
    
    // Try each pattern until we find one that works
    for (const pattern of dayPatterns) {
      const days = pattern.split('').map(dayAbbr => {
        switch (dayAbbr) {
          case 'M': return 'Monday';
          case 'T': return 'Tuesday';
          case 'W': return 'Wednesday';
          case 'h': return 'Thursday'; // Handle 'Th' case
          case 'F': return 'Friday';
          case 'S': return 'Saturday';
          default: return null;
        }
      }).filter(Boolean) as string[];
      
      // Handle special case for 'Th' (Thursday)
      if (pattern.includes('Th')) {
        const thIndex = pattern.indexOf('Th');
        const beforeTh = pattern.substring(0, thIndex);
        const afterTh = pattern.substring(thIndex + 2);
        
        const parsedDays: string[] = [];
        
        // Parse before 'Th'
        for (const char of beforeTh) {
          switch (char) {
            case 'M': parsedDays.push('Monday'); break;
            case 'T': parsedDays.push('Tuesday'); break;
            case 'W': parsedDays.push('Wednesday'); break;
            case 'F': parsedDays.push('Friday'); break;
            case 'S': parsedDays.push('Saturday'); break;
          }
        }
        
        // Add Thursday
        parsedDays.push('Thursday');
        
        // Parse after 'Th'
        for (const char of afterTh) {
          switch (char) {
            case 'M': parsedDays.push('Monday'); break;
            case 'T': parsedDays.push('Tuesday'); break;
            case 'W': parsedDays.push('Wednesday'); break;
            case 'F': parsedDays.push('Friday'); break;
            case 'S': parsedDays.push('Saturday'); break;
          }
        }
        
        days.length = 0;
        days.push(...parsedDays);
      }
      
      // Check if all days in this pattern have available time slots
      let patternWorks = true;
      let tempTimeSlot: { startTime: string; endTime: string; duration: number } | null = null;
      
      for (const day of days) {
        const daySlots = mockData.timeSlots.filter(slot => 
          slot.day === day && 
          !usedTimeSlots.has(`${slot.day}-${slot.startTime}`)
        );
        
        if (daySlots.length === 0) {
          patternWorks = false;
          break;
        }
        
        // For the first day, select a time slot
        if (!tempTimeSlot) {
          const timeSlot = daySlots[Math.floor(Math.random() * daySlots.length)];
          tempTimeSlot = {
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            duration: timeSlot.duration
          };
        } else {
          // For subsequent days, check if the same time slot is available
          const sameTimeSlot = daySlots.find(slot => 
            slot.startTime === tempTimeSlot!.startTime && 
            slot.endTime === tempTimeSlot!.endTime
          );
          
          if (!sameTimeSlot) {
            patternWorks = false;
            break;
          }
        }
      }
      
      if (patternWorks && tempTimeSlot) {
        selectedPattern = pattern;
        assignedTimeSlot = tempTimeSlot;
        subjectTimeSlots.set(subject.id, assignedTimeSlot);
        break;
      }
    }
    
    // If we found a valid pattern, create the combined schedule item
    if (selectedPattern && assignedTimeSlot) {
      const days = selectedPattern.includes('Th') ? 
        parseDaysFromPattern(selectedPattern) : 
        selectedPattern.split('').map(dayAbbr => {
          switch (dayAbbr) {
            case 'M': return 'Monday';
            case 'T': return 'Tuesday';
            case 'W': return 'Wednesday';
            case 'F': return 'Friday';
            case 'S': return 'Saturday';
            default: return null;
          }
        }).filter(Boolean) as string[];
      
      // Mark all time slots as used
      days.forEach(day => {
        usedTimeSlots.add(`${day}-${assignedTimeSlot!.startTime}`);
      });
      
      const room = mockData.rooms[Math.floor(Math.random() * mockData.rooms.length)];
      
      // Create a single schedule item with combined days
      scheduleItems.push({
        id: `schedule-item-${index}`,
        subject: subject,
        faculty: suitableFaculty,
        timeSlot: {
          id: `${selectedPattern}-${assignedTimeSlot.startTime}`,
          day: formatDaysCombination(days), // This will be the combined format like "MW", "MWF", "TTh"
          startTime: assignedTimeSlot.startTime,
          endTime: assignedTimeSlot.endTime,
          duration: assignedTimeSlot.duration
        },
        room,
        day: formatDaysCombination(days), // Combined day format
        startTime: assignedTimeSlot.startTime,
        endTime: assignedTimeSlot.endTime
      });
    }
  });
  
  return scheduleItems;
};

// Helper function to parse days from pattern including 'Th'
const parseDaysFromPattern = (pattern: string): string[] => {
  const days: string[] = [];
  let i = 0;
  
  while (i < pattern.length) {
    if (i < pattern.length - 1 && pattern.substring(i, i + 2) === 'Th') {
      days.push('Thursday');
      i += 2;
    } else {
      const char = pattern[i];
      switch (char) {
        case 'M': days.push('Monday'); break;
        case 'T': days.push('Tuesday'); break;
        case 'W': days.push('Wednesday'); break;
        case 'F': days.push('Friday'); break;
        case 'S': days.push('Saturday'); break;
      }
      i += 1;
    }
  }
  
  return days;
};

// Advanced conflict detection system
export const detectConflicts = (scheduleItems: ScheduleItem[]): ConflictDetectionResult => {
  console.log('🔍 CONFLICT DETECTION: Starting with', scheduleItems.length, 'items');
  const conflicts: Conflict[] = [];
  const enhancedItems = scheduleItems.map(item => ({ ...item }));

  // Check for conflicts between all schedule items
  for (let i = 0; i < enhancedItems.length; i++) {
    const currentItem = enhancedItems[i];
    let hasConflict = false;
    let conflictTypes: string[] = [];

    console.log(`🔍 Checking item ${i}:`, {
      id: currentItem.id,
      subject: currentItem.subjectCode,
      faculty: currentItem.facultyName,
      facultyId: currentItem.facultyId,
      room: currentItem.roomName,
      roomId: currentItem.roomId,
      day: currentItem.day,
      time: `${currentItem.startTime}-${currentItem.endTime}`,
      yearLevel: currentItem.yearLevel,
      semester: currentItem.semester
    });

    for (let j = i + 1; j < enhancedItems.length; j++) {
      const compareItem = enhancedItems[j];

      console.log(`  🔍 Comparing with item ${j}:`, {
        id: compareItem.id,
        subject: compareItem.subjectCode,
        faculty: compareItem.facultyName,
        facultyId: compareItem.facultyId,
        room: compareItem.roomName,
        roomId: compareItem.roomId,
        day: compareItem.day,
        time: `${compareItem.startTime}-${compareItem.endTime}`,
        yearLevel: compareItem.yearLevel,
        semester: compareItem.semester
      });

      // Check if items are on the same day
      const sameDay = currentItem.day === compareItem.day;
      console.log(`    📅 Same day check: ${sameDay} (${currentItem.day} vs ${compareItem.day})`);

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

        console.log(`    ⏰ Time parsing:`, {
          originalTimes: {
            currentStart: currentItem.startTime,
            currentEnd: currentItem.endTime,
            compareStart: compareItem.startTime,
            compareEnd: compareItem.endTime
          },
          formattedTimes: {
            currentStart: currentStartTime,
            currentEnd: currentEndTime,
            compareStart: compareStartTime,
            compareEnd: compareEndTime
          },
          dateObjects: {
            currentStart: currentStart.toISOString(),
            currentEnd: currentEnd.toISOString(),
            compareStart: compareStart.toISOString(),
            compareEnd: compareEnd.toISOString()
          }
        });

        const hasTimeOverlap = (currentStart < compareEnd && currentEnd > compareStart);
        console.log(`    ⏰ Time overlap check: ${hasTimeOverlap}`);

        if (hasTimeOverlap) {
          // Faculty conflict
          const sameFaculty = currentItem.facultyId === compareItem.facultyId;
          console.log(`    👨‍🏫 Faculty conflict check: ${sameFaculty} (${currentItem.facultyId} vs ${compareItem.facultyId})`);
          
          if (sameFaculty) {
            hasConflict = true;
            conflictTypes.push('faculty');
            conflicts.push({
              type: 'faculty',
              items: [currentItem.id, compareItem.id],
              message: `Faculty ${currentItem.facultyName} is double-booked on ${currentItem.day}`,
              severity: 'high'
            });
            console.log(`    ❌ FACULTY CONFLICT DETECTED!`);
          }

          // Room conflict
          const sameRoom = currentItem.roomId === compareItem.roomId;
          console.log(`    🏢 Room conflict check: ${sameRoom} (${currentItem.roomId} vs ${compareItem.roomId})`);
          
          if (sameRoom) {
            hasConflict = true;
            conflictTypes.push('room');
            conflicts.push({
              type: 'room',
              items: [currentItem.id, compareItem.id],
              message: `Room ${currentItem.roomName} is double-booked on ${currentItem.day}`,
              severity: 'high'
            });
            console.log(`    ❌ ROOM CONFLICT DETECTED!`);
          }

          // Section conflict (same program and year level)
          const sameSection = currentItem.yearLevel === compareItem.yearLevel && 
              currentItem.semester === compareItem.semester;
          console.log(`    🎓 Section conflict check: ${sameSection} (YL: ${currentItem.yearLevel} vs ${compareItem.yearLevel}, Sem: ${currentItem.semester} vs ${compareItem.semester})`);
          
          if (sameSection) {
            hasConflict = true;
            conflictTypes.push('section');
            conflicts.push({
              type: 'section',
              items: [currentItem.id, compareItem.id],
              message: `Year ${currentItem.yearLevel} has overlapping classes on ${currentItem.day}`,
              severity: 'medium'
            });
            console.log(`    ❌ SECTION CONFLICT DETECTED!`);
          }
        }
      }
    }

    // Update item status based on conflicts
    console.log(`  📊 Final status for item ${i}:`, {
      hasConflict,
      conflictTypes,
      id: currentItem.id,
      subject: currentItem.subjectCode
    });

    if (hasConflict) {
      currentItem.hasConflict = true;
      currentItem.status = 'conflict';
      currentItem.conflictType = conflictTypes[0] as 'faculty' | 'room' | 'section';
      console.log(`  ❌ MARKED AS CONFLICT: ${currentItem.subjectCode}`);
    } else {
      // Check for warnings (potential issues)
      const facultyLoad = enhancedItems.filter(item => 
        item.facultyId === currentItem.facultyId && item.day === currentItem.day
      ).length;

      if (facultyLoad > 3) {
        currentItem.status = 'warning';
        currentItem.conflictType = 'none';
        conflicts.push({
          type: 'warning',
          items: [currentItem.id],
          message: `Faculty ${currentItem.facultyName} has heavy load on ${currentItem.day} (${facultyLoad} classes)`,
          severity: 'low'
        });
      } else {
        currentItem.hasConflict = false;
        currentItem.status = 'conflict-free';
        currentItem.conflictType = 'none';
      }
      console.log(`  ✅ MARKED AS CONFLICT-FREE: ${currentItem.subjectCode}`);
    }
  }

  console.log('🔍 CONFLICT DETECTION SUMMARY:', {
    totalItems: enhancedItems.length,
    conflictsFound: conflicts.length,
    conflictTypes: conflicts.map(c => c.type),
    itemsWithConflicts: enhancedItems.filter(item => item.hasConflict).length
  });

  return { enhancedItems, conflicts };
};

// Calculate optimization score
export const calculateOptimizationScore = (conflicts: Conflict[]): number => {
  return Math.max(
    60, 
    100 - 
    (conflicts.filter(c => c.severity === 'high').length * 15) - 
    (conflicts.filter(c => c.severity === 'medium').length * 8) - 
    (conflicts.filter(c => c.severity === 'low').length * 3)
  );
};

// Create a new schedule from schedule items
export const createSchedule = (
  scheduleItems: ScheduleItem[], 
  conflicts: Conflict[], 
  existingSchedulesCount: number
): GeneratedSchedule => {
  console.log('📋 CREATE SCHEDULE: Starting with', scheduleItems.length, 'items and', conflicts.length, 'conflicts');
  
  // Log each item's conflict status
  scheduleItems.forEach((item, index) => {
    console.log(`📋 Item ${index}:`, {
      id: item.id,
      subject: item.subject?.code,
      hasConflict: item.hasConflict,
      status: item.status,
      conflictType: item.conflictType
    });
  });
  
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
  
  console.log('📋 CREATE SCHEDULE RESULT:', {
    totalItems: schedule.subjects.length,
    totalConflicts: schedule.conflicts.length,
    conflictFreeCount: scheduleItems.filter(item => !item.hasConflict).length,
    conflictCount: conflicts.length
  });
  
  return schedule;
};
