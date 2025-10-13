# Schedule Generation Changes

## Summary
Modified the schedule generation system to:
1. **Change class duration from 3 hours to 1.5 hours per session** for 3-unit lecture courses
2. **Implement 30-minute gap requirement** for instructors between consecutive classes
3. **Limit maximum class start time to 1:30 PM** (no classes can start after 1:30 PM)

## Changes Made

### 1. Class Duration: 1.5 Hours per Session (90 minutes)

**Location**: `scheduleGenerationService.ts` - `findConflictFreeSchedule()` method (line ~720)

**Change**: For 3-unit courses (3 hours per week), the system now schedules:
- **2 sessions per week** (e.g., Monday & Wednesday, or Tuesday & Thursday)
- **1.5 hours (90 minutes) per session**
- **Total: 3 hours per week**

**Before**: 
- 3-unit courses were assigned 3 hours in a single session or split differently

**After**:
```typescript
else if (totalWeeklyHours === 3) {
  console.log(`   📚 3-unit course detected: Scheduling 2 sessions × 1.5 hours (90 min) each`);
  distributionCandidates.push({ duration: 90, sessions: 2 }); // Two 1.5-hour sessions (MW or TTh)
}
```

**Example**:
- **Before**: Class scheduled 7:00-10:00 (3 hours continuous)
- **After**: Class scheduled 7:00-8:30 on Monday, 7:00-8:30 on Wednesday (1.5 hours each)

---

### 2. Maximum Class Start Time: 1:30 PM

**Location**: `scheduleGenerationService.ts` - `isValidTimeSlot()`, `getTimeSlotOptions()`, and `generateTimeSlots()` methods

**Change**: Classes can only start between **7:00 AM and 1:30 PM**. No classes will be scheduled to start after 1:30 PM.

**Time Constraints**:
```
Daily Schedule Window:
┌─────────────────────────────────────────────────────────────┐
│ 7:00 AM ─────────────────────── 12:00 PM │ LUNCH │ 1:00 PM ─ 1:30 PM ──────── 5:00 PM │
│         MORNING SESSIONS          │ BREAK │  AFTERNOON SESSIONS  │
│    (Classes can start here)       │ (No   │ (Classes can start)  │
│                                   │ class)│  Max start: 1:30 PM  │
└─────────────────────────────────────────────────────────────┘
```

- **Earliest start**: 7:00 AM
- **Latest start**: 1:30 PM (13:30) ⚠️ **NEW CONSTRAINT**
- **Latest end**: 5:00 PM (17:00) - allows for longest sessions starting at 1:30 PM
- **Lunch break**: 12:00 PM - 1:00 PM (no classes can cross this period)

**Implementation**:
```typescript
static isValidTimeSlot(startTime: string, endTime: string): boolean {
  const start = this.timeToMinutes(startTime);
  const end = this.timeToMinutes(endTime);
  const dayStart = this.timeToMinutes('07:00');
  const lunchStart = this.timeToMinutes('12:00');
  const lunchEnd = this.timeToMinutes('13:00');
  const morningEnd = this.timeToMinutes('12:00');
  const afternoonStart = this.timeToMinutes('13:00');
  const maxStartTime = this.timeToMinutes('13:30'); // Maximum class start time is 1:30 PM
  const afternoonEnd = this.timeToMinutes('17:00'); // Latest end time

  const inMorning = start >= dayStart && end <= morningEnd;
  const inAfternoon = start >= afternoonStart && start <= maxStartTime && end <= afternoonEnd;
  const crossesLunch = start < lunchEnd && end > lunchStart;

  return (inMorning || inAfternoon) && !crossesLunch && end > start;
}
```

**Example**:
- ✅ **Valid**: 1:00 PM - 2:30 PM (starts at 1:00 PM)
- ✅ **Valid**: 1:30 PM - 3:00 PM (starts at 1:30 PM - maximum allowed)
- ❌ **Invalid**: 2:00 PM - 3:30 PM (starts at 2:00 PM - exceeds 1:30 PM limit)
- ❌ **Invalid**: 3:00 PM - 4:30 PM (starts at 3:00 PM - exceeds 1:30 PM limit)

---

### 3. 30-Minute Instructor Gap Enforcement

**Location**: `scheduleGenerationService.ts` - Added `hasInstructorGap()` method (line ~246)

**Change**: Instructors now require a minimum 30-minute break between consecutive classes on the same day.

**Implementation**:

#### New Method: `hasInstructorGap()`
```typescript
private static hasInstructorGap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const end1Minutes = this.timeToMinutes(end1);
  const start2Minutes = this.timeToMinutes(start2);
  const end2Minutes = this.timeToMinutes(end2);
  const start1Minutes = this.timeToMinutes(start1);
  
  // Check if there's at least 30 minutes gap between the classes
  // Case 1: class1 ends, then class2 starts (need 30 min gap)
  if (end1Minutes <= start2Minutes) {
    return (start2Minutes - end1Minutes) >= 30;
  }
  // Case 2: class2 ends, then class1 starts (need 30 min gap)
  if (end2Minutes <= start1Minutes) {
    return (start1Minutes - end2Minutes) >= 30;
  }
  // Classes overlap - no gap
  return false;
}
```

#### Modified: `findConflictFreeSchedule()` method (line ~828)
Added gap validation when checking faculty availability:
```typescript
// Check for 30-minute gap requirement between instructor's classes
const facultyGapViolation = this.usedTimeSlots.some(slot => {
  if (slot.day === timeSlot.day && slot.facultyId === facultyId) {
    // Only check gap if classes don't overlap (already checked above)
    if (!this.timeRangesOverlap(slot.startTime, slot.endTime, timeSlot.startTime, timeSlot.endTime)) {
      const hasGap = this.hasInstructorGap(slot.startTime, slot.endTime, timeSlot.startTime, timeSlot.endTime);
      if (!hasGap) {
        console.log(`   ⚠️ Faculty gap violation: ${faculty.firstname} ${faculty.lastname} needs 30-min gap between ${slot.startTime}-${slot.endTime} and ${timeSlot.startTime}-${timeSlot.endTime}`);
        return true;
      }
    }
  }
  return false;
});
```

**Example**:
- **Before**: Instructor could be assigned 7:00-8:30, then immediately 8:30-10:00
- **After**: Instructor assigned 7:00-8:30, next class must start at 9:00 or later (30-minute gap)

---

## Console Logging

Enhanced logging to track these changes:

1. **3-unit course detection**:
   ```
   📚 3-unit course detected: Scheduling 2 sessions × 1.5 hours (90 min) each
   ```

2. **Successful scheduling with gap**:
   ```
   ✅ Found conflict-free schedule for CS101:
      Faculty: John Doe (ID: 123)
      Room: Room 1 (ID: 1)
      Time: Monday 07:00-08:30 (90min); Wednesday 07:00-08:30 (90min)
      ✓ 30-minute instructor gap enforced
   ```

3. **Gap violation warning**:
   ```
   ⚠️ Faculty gap violation: John Doe needs 30-min gap between 07:00-08:30 and 08:30-10:00
   ```

---

## Testing

To verify the changes:

1. **Generate a schedule** with 3-unit lecture courses
2. **Check the console logs** for:
   - "📚 3-unit course detected" messages
   - Session durations showing "90min"
   - "✓ 30-minute instructor gap enforced" confirmations
3. **Review the generated schedule table** to confirm:
   - 3-unit courses show 1.5-hour time slots (e.g., 7:00-8:30)
   - Instructors have at least 30 minutes between classes on the same day
   - **No classes start after 1:30 PM** (latest start time should be 1:30 PM)

---

## Impact

### Positive Effects:
- ✅ More realistic class durations (1.5 hours instead of 3 hours)
- ✅ Better instructor work-life balance with mandatory breaks
- ✅ Prevents instructor fatigue from back-to-back classes
- ✅ Allows time for instructors to move between rooms/buildings
- ✅ Provides buffer time for class preparation and student questions
- ✅ Earlier end times (no late afternoon/evening classes) - all classes end by 5:00 PM at the latest
- ✅ More family-friendly schedule for instructors and students

### Considerations:
- ⚠️ May require more time slots to accommodate all courses
- ⚠️ Schedule generation may take slightly longer due to additional constraints
- ⚠️ Some courses may fail to schedule if constraints are too tight (system will log warnings)

---

## Files Modified

1. **scheduleGenerationService.ts**
   - Added `hasInstructorGap()` method (line ~246)
   - Modified `findConflictFreeSchedule()` to enforce 30-minute gaps (line ~828)
   - Updated 3-unit course scheduling logic to use 90-minute sessions (line ~720)
   - Modified `isValidTimeSlot()` to enforce 1:30 PM maximum start time (line ~901)
   - Updated `getTimeSlotOptions()` to limit time slot generation (line ~919)
   - Updated `generateTimeSlots()` to limit candidate start times to 1:30 PM (line ~595)
   - Enhanced console logging for better debugging
   - Removed unused variables to fix lint warnings

---

## Notes

- The 30-minute gap applies **only to the same instructor on the same day**
- Different instructors can have back-to-back classes in the same room
- The gap is checked **between non-overlapping classes** (overlapping classes are already prevented)
- The system will automatically skip faculty assignments that violate the gap requirement
- **Maximum start time of 1:30 PM** means:
  - Morning sessions: 7:00 AM - 12:00 PM
  - Lunch break: 12:00 PM - 1:00 PM (no classes)
  - Afternoon sessions: 1:00 PM - 1:30 PM (start times only)
  - Latest possible end time: 5:00 PM (for a 3.5-hour session starting at 1:30 PM)
- The time constraint helps ensure reasonable work hours for both instructors and students
