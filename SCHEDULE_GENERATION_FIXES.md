# Schedule Generation System - Unit to Hour Conversion Fix

## Summary of Changes

This document outlines the fixes implemented to correctly handle unit-to-hour conversion and room assignment rules in the schedule generation system.

## 1. Unit to Hour Conversion Rules

### New Formula
- **1 Lecture unit = 1 hour per week**
- **1 Lab unit = 3 hours per week**
- **Total weekly hours = (lec × 1) + (lab × 3)**

### Example Calculations
- 1 lec, 2 lab → (1 × 1) + (2 × 3) = **7 hours/week**
- 3 lec, 0 lab → (3 × 1) + (0 × 3) = **3 hours/week**
- 0 lec, 1 lab → (0 × 1) + (1 × 3) = **3 hours/week**
- 2 lec, 1 lab → (2 × 1) + (1 × 3) = **5 hours/week**

## 2. Room Assignment Rules

### Lab Room Restrictions
- **Subjects with lab units > 0**: MUST be assigned to lab rooms (rooms with "Lab" in name)
- **Subjects with lab units = 0**: MUST NOT be assigned to lab rooms (only regular rooms)

### Implementation Location
File: `client/src/pages/CampusAdmin/ScheduleGeneration/services/scheduleGenerationService.ts`

Lines 759-773:
```typescript
// ROOM TYPE VALIDATION: Enforce lab/non-lab room assignment rules
// If course has lab units, it MUST be assigned to a lab room
if (labHours > 0 && !isLabRoom) {
  continue; // Skip non-lab rooms for courses with lab component
}
// If course has NO lab units, it must NOT be assigned to a lab room
if (labHours === 0 && isLabRoom) {
  continue; // Skip lab rooms for lecture-only courses
}
```

## 3. Code Changes

### A. scheduleGenerationService.ts

#### Line 677: Updated totalWeeklyHours calculation
```typescript
// Old: const totalWeeklyHours = totalUnits;
// New:
const totalWeeklyHours = (lecHours * 1) + (labHours * 3);
```

#### Line 350: Updated expected minutes validation
```typescript
// Old: const expectedMinutes = (course.units || 3) * 60;
// New:
const expectedMinutes = ((course.lec || 0) * 60) + ((course.lab || 0) * 180);
```

#### Lines 765-773: Added room type validation
- Checks if room name contains "lab" (case-insensitive)
- Enforces lab room assignment for courses with lab units
- Prevents lab room assignment for lecture-only courses

### B. ScheduleGeneration.tsx

#### Added "Hours/Week" column to display
- Shows calculated total hours: `(lec × 1) + (lab × 3)`
- Color-coded badges:
  - **Blue**: Lecture units
  - **Purple**: Lab units
  - **Yellow**: Total units
  - **Green**: Calculated hours per week

#### Updated Schedule interface (Lines 71-72)
```typescript
lec?: number;
lab?: number;
```

### C. types/schedule-types.ts

#### Updated ScheduleItem interface (Lines 40-41)
```typescript
lec: number;
lab: number;
```

## 4. Validation & Testing

### Test Cases to Verify

1. **Pure Lecture Course** (e.g., 3 lec, 0 lab)
   - ✅ Should show 3 hours/week
   - ✅ Should NOT be assigned to Lab 1 or Lab 2
   - ✅ Should be assigned to Room 1, Room 2, or Room 3

2. **Pure Lab Course** (e.g., 0 lec, 2 lab)
   - ✅ Should show 6 hours/week
   - ✅ MUST be assigned to Lab 1 or Lab 2
   - ✅ Should NOT be assigned to regular rooms

3. **Mixed Course** (e.g., 1 lec, 2 lab)
   - ✅ Should show 7 hours/week (1 + 6)
   - ✅ MUST be assigned to Lab 1 or Lab 2
   - ✅ Time slots should total 7 hours across the week

4. **From Screenshot Example**
   - CS 102: 1 lec, 1 lab → Should show **4 hours/week** (1 + 3)
   - CRIM 101: 0 lec, 3 lab → Should show **9 hours/week** (0 + 9)
   - PE 101: 0 lec, 2 lab → Should show **6 hours/week** (0 + 6)

## 5. Benefits

1. **Accurate Hour Calculation**: Total hours now correctly reflect the workload
2. **Proper Room Utilization**: Lab rooms reserved for lab courses only
3. **Clear Display**: UI shows both units and calculated hours
4. **Conflict Prevention**: Room type validation prevents scheduling errors
5. **Scalability**: Formula works for any combination of lec/lab units

## 6. Files Modified

1. `client/src/pages/CampusAdmin/ScheduleGeneration/services/scheduleGenerationService.ts`
   - Room type validation logic
   - Hour calculation updates

2. `client/src/pages/CampusAdmin/ScheduleGeneration/ScheduleGeneration.tsx`
   - Added Hours/Week column
   - Updated Schedule interface

3. `client/src/types/schedule-types.ts`
   - Updated ScheduleItem interface

4. `client/src/pages/CampusAdmin/ScheduleGeneration/utils/scheduleUtils.ts`
   - Cleaned up and removed mock data dependencies

5. `client/src/pages/CampusAdmin/ScheduleGeneration/hooks/useScheduleEditing.ts`
   - Removed mock data dependencies

## 7. Next Steps

1. Test schedule generation with various course configurations
2. Verify room assignments match the rules
3. Check that total hours display correctly in the UI
4. Ensure no conflicts arise from the new validation logic
5. Monitor for any edge cases with unusual unit combinations

## 8. Notes

- The system now properly distinguishes between units (for grading) and hours (for scheduling)
- Lab rooms are identified by checking if "lab" appears in the room name (case-insensitive)
- All existing schedules should be regenerated to apply the new rules
- The formula is consistent across the entire codebase
