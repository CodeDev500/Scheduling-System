# Time Slot System Implementation

## Overview
This document describes the flexible 1-hour and 1.5-hour time slot system implemented in the schedule generation algorithm.

## Time Slot Rules

### Lecture Sessions
- **1 unit = 1 hour**
- **2 lec units** = 2 sessions × 1 hour each
- **3 lec units** = 2 sessions × 1.5 hours each
- **Other cases** (1 unit, 4+ units) = 1 hour sessions

### Laboratory Sessions
- **1 unit = 3 hours total**
- Divided into **2 sessions × 1.5 hours each**

### Time Range
- **Start**: 7:00 AM
- **End**: 8:00 PM (20:00)
- **Lunch Break**: 12:00 PM - 1:00 PM (excluded)

### Days
- **Priority**: Monday - Friday
- **Fallback**: Saturday - Sunday
- Days are assigned in pairs (MW, TTh, etc.) for better scheduling

## Generated Time Slots

### Morning Slots (7:00 AM - 12:00 PM)
```
07:00, 08:00, 09:00, 10:00, 11:00
```

### Afternoon/Evening Slots (1:00 PM - 8:00 PM)
```
13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00
```

**Total**: 13 time slots per day

## Session Duration Examples

### Example 1: 2 Lecture Units
- **Total Hours**: 2 hours
- **Sessions**: 2 sessions × 1 hour each
- **Possible Schedule**:
  - Monday: 7:00 AM - 8:00 AM
  - Wednesday: 7:00 AM - 8:00 AM

### Example 2: 3 Lecture Units
- **Total Hours**: 3 hours
- **Sessions**: 2 sessions × 1.5 hours each
- **Possible Schedule**:
  - Monday: 7:00 AM - 8:30 AM
  - Wednesday: 7:00 AM - 8:30 AM

### Example 3: 1 Lab Unit
- **Total Hours**: 3 hours
- **Sessions**: 2 sessions × 1.5 hours each
- **Possible Schedule**:
  - Tuesday: 1:00 PM - 2:30 PM
  - Thursday: 1:00 PM - 2:30 PM

### Example 4: Subject with 3 Lec + 1 Lab
- **Lecture**: 2 sessions × 1.5 hours = 3 hours
  - Monday: 7:00 AM - 8:30 AM
  - Wednesday: 7:00 AM - 8:30 AM
- **Lab**: 2 sessions × 1.5 hours = 3 hours
  - Tuesday: 1:00 PM - 2:30 PM
  - Thursday: 1:00 PM - 2:30 PM
- **Total**: 6 hours per week

## Algorithm Features

### 1. Flexible Time Slot Generation
The system generates 1-hour interval slots from 7:00 AM to 8:00 PM, allowing both 1-hour and 1.5-hour sessions to be scheduled flexibly.

```typescript
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  // Morning slots: 7:00 AM - 12:00 PM
  for (let hour = 7; hour < 12; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  // Afternoon/Evening slots: 1:00 PM - 8:00 PM
  for (let hour = 13; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};
```

### 2. Dynamic Session Calculation
Based on lecture and lab units, the system calculates the appropriate number of sessions and duration:

```typescript
let lecDurationMinutes = 60; // Default: 1 hour per session
let lecSessionsNeeded = 0;

if (lecUnits === 2) {
  lecDurationMinutes = 60;
  lecSessionsNeeded = 2;
} else if (lecUnits === 3) {
  lecDurationMinutes = 90;
  lecSessionsNeeded = 2;
} else if (lecUnits > 0) {
  lecDurationMinutes = 60;
  lecSessionsNeeded = lecUnits;
}

// Lab: 1 unit = 3 hours total, divided into 2 sessions × 1.5 hours
const labDurationMinutes = 90;
const labSessionsNeeded = labUnits * 2;
```

### 3. Conflict Detection
The system checks for:
- ✅ Faculty time conflicts
- ✅ Room availability conflicts
- ✅ Program/Year/Section conflicts
- ✅ 30-minute break requirement between classes
- ✅ Lunch break exclusion (12:00 PM - 1:00 PM)
- ✅ Same-day prevention (no multiple sessions of same subject on same day)

### 4. Day Pairing Strategy
Sessions are assigned using preferred day pairs:
```typescript
const dayPairs = [
  ['Monday', 'Wednesday'],
  ['Tuesday', 'Thursday'],
  ['Monday', 'Friday'],
  ['Tuesday', 'Friday'],
  ['Wednesday', 'Friday'],
  ['Monday', 'Saturday'],
  ['Tuesday', 'Saturday'],
  // ... more pairs
];
```

### 5. Faculty Workload Tracking
- Units are counted **once per subject**, not per session
- Maximum units per faculty (default: 18 units)
- Prevents overloading faculty members

## Benefits

| Benefit | Description |
|---------|-------------|
| 🎯 **Flexible** | Handles 1 hr, 1.5 hr, 2 hr, 3 hr sessions easily |
| 🚀 **Efficient** | No unused gaps between lectures/labs |
| ✅ **Consistent** | Easy to map subject hours directly to slot count |
| ⚖️ **Fair Load Balancing** | Faculty loads measured in total slot hours |
| 🔍 **Simpler Conflict Logic** | Just check overlapping slot IDs per day |
| 📅 **Extended Hours** | Supports scheduling up to 8:00 PM |

## Implementation Files

### Backend
- **File**: `server/src/controllers/scheduleGeneration.controller.ts`
- **Key Functions**:
  - `generateTimeSlots()` - Generates 1-hour interval time slots
  - `scheduleSessionType()` - Schedules individual lecture/lab sessions
  - `isValidTimeSlot()` - Validates time slots (excludes lunch, checks range)

### Frontend
- **File**: `client/src/pages/CampusAdmin/ScheduleGeneration/ScheduleGeneration.tsx`
- **Features**:
  - Displays grouped sessions by time and room
  - Shows lec/lab breakdown
  - Calculates total hours per week
  - Conflict detection and display

## Usage Example

### Generating a Schedule

1. **Select Curriculum Year**: Choose the academic year (e.g., "2024-2025")
2. **Select Semester**: Choose semester (1st, 2nd, or Summer)
3. **Click Generate**: The system will:
   - Fetch all subjects for the selected year/semester
   - Calculate session requirements based on lec/lab units
   - Assign time slots avoiding conflicts
   - Assign faculty based on specialization match
   - Assign appropriate rooms (lab rooms for lab sessions)

### Viewing Results

The generated schedule displays:
- **Subject Code & Name**
- **Schedule**: Grouped by time, room, and type (Lecture/Lab)
- **Faculty**: With current workload
- **Program & Year Level**
- **Semester**
- **Units**: Total, Lec, Lab breakdown

## Validation Rules

### Time Slot Validation
```typescript
const isValidTimeSlot = (startTime: string, endTime: string): boolean => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const lunchStart = timeToMinutes('12:00');
  const lunchEnd = timeToMinutes('13:00');
  
  // Check if time slot overlaps with lunch break
  const overlapsLunch = startMin < lunchEnd && endMin > lunchStart;
  
  // Check if within valid hours (7:00 AM - 8:00 PM)
  const validStart = startMin >= timeToMinutes('07:00');
  const validEnd = endMin <= timeToMinutes('20:00');
  
  return !overlapsLunch && validStart && validEnd && endMin > startMin;
};
```

### Conflict Prevention
- Same subject cannot have multiple sessions on the same day
- Faculty must have 30-minute break between classes
- Room cannot be double-booked
- Program/Year/Section cannot have overlapping classes

## Future Enhancements

Potential improvements for the system:
1. **Custom Time Slots**: Allow administrators to define custom time slot durations
2. **Break Preferences**: Configurable break times and durations
3. **Room Preferences**: Subject-specific room type requirements
4. **Faculty Preferences**: Consider faculty preferred teaching times
5. **Optimization Scoring**: Multi-criteria optimization (minimize gaps, balance loads, etc.)

## Troubleshooting

### Issue: Schedule generation fails
**Solution**: Check if:
- Curriculum courses exist for the selected year/semester
- Sufficient rooms are available
- Faculty members are registered in the system
- Unit limits are not exceeded

### Issue: Too many conflicts
**Solution**:
- Increase available time slots (extend hours)
- Add more rooms to the system
- Reduce number of subjects per semester
- Adjust faculty max units setting

### Issue: Faculty overloaded
**Solution**:
- Add more faculty members
- Increase faculty max units setting
- Distribute subjects across multiple semesters

## Summary

The new time slot system provides a flexible, efficient, and conflict-free scheduling solution that handles both 1-hour and 1.5-hour sessions seamlessly. It prioritizes weekday scheduling, prevents conflicts, and ensures fair faculty workload distribution while extending scheduling hours to 8:00 PM for maximum flexibility.
