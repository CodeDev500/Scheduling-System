# Frontend Sort Error Fix

## Date: November 3, 2025

## Issue Description

**Problem:** After saving schedules, the frontend was crashing with a TypeError when trying to display the saved schedules.

**Error Message:**
```
Uncaught TypeError: Cannot read properties of undefined (reading 'localeCompare')
    at ScheduleGeneration.tsx:871:53
    at Array.sort (<anonymous>)
```

---

## Root Cause

The sorting logic was trying to call `localeCompare()` on `startTime` and `type` properties that could be `undefined` in some schedule entries. This happened when:

1. Saved schedules were loaded from the database
2. Some fields might be missing or null
3. The sort function tried to compare undefined values

**Problematic Code:**
```typescript
// ❌ WRONG: No safety checks
const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
  if (a.startTime !== b.startTime) {
    return a.startTime.localeCompare(b.startTime);  // ❌ Crashes if undefined
  }
  return a.type.localeCompare(b.type);  // ❌ Crashes if undefined
});
```

---

## The Fix

### Added Safety Checks Before Sorting

**File:** `client/src/pages/CampusAdmin/ScheduleGeneration/ScheduleGeneration.tsx`

**Before:**
```typescript
const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
  // First sort by start time
  if (a.startTime !== b.startTime) {
    return a.startTime.localeCompare(b.startTime);  // ❌ Crashes if undefined
  }
  // Then by type (Lecture before Laboratory)
  return a.type.localeCompare(b.type);  // ❌ Crashes if undefined
});
```

**After:**
```typescript
const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
  // First sort by start time (with safety checks)
  const timeA = a.startTime || '';  // ✅ Default to empty string
  const timeB = b.startTime || '';  // ✅ Default to empty string
  if (timeA !== timeB) {
    return timeA.localeCompare(timeB);  // ✅ Safe
  }
  // Then by type (Lecture before Laboratory)
  const typeA = a.type || '';  // ✅ Default to empty string
  const typeB = b.type || '';  // ✅ Default to empty string
  return typeA.localeCompare(typeB);  // ✅ Safe
});
```

---

## Locations Fixed

### 1. Main Schedule Table (Line 865)
**Context:** Displaying schedules in the main table view

**Fixed:**
```typescript
// Convert to array and sort by start time, then by type (Lecture before Lab)
const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
  const timeA = a.startTime || '';
  const timeB = b.startTime || '';
  if (timeA !== timeB) {
    return timeA.localeCompare(timeB);
  }
  const typeA = a.type || '';
  const typeB = b.type || '';
  return typeA.localeCompare(typeB);
});
```

### 2. View Modal (Line 1250)
**Context:** Displaying schedule details in the view modal

**Fixed:**
```typescript
// Sort groups by start time, then by type
const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
  const timeA = a.startTime || '';
  const timeB = b.startTime || '';
  if (timeA !== timeB) {
    return timeA.localeCompare(timeB);
  }
  const typeA = a.type || '';
  const typeB = b.type || '';
  return typeA.localeCompare(typeB);
});
```

---

## How It Works

### Scenario 1: Normal Data (All Fields Present)

```typescript
const scheduleA = { startTime: '07:00', type: 'Lecture' };
const scheduleB = { startTime: '08:00', type: 'Laboratory' };

// Sorting
const timeA = scheduleA.startTime || '';  // '07:00'
const timeB = scheduleB.startTime || '';  // '08:00'
timeA.localeCompare(timeB);  // -1 (A comes before B) ✅
```

### Scenario 2: Missing startTime

```typescript
const scheduleA = { startTime: undefined, type: 'Lecture' };
const scheduleB = { startTime: '08:00', type: 'Laboratory' };

// Before fix
scheduleA.startTime.localeCompare(scheduleB.startTime);  // ❌ TypeError!

// After fix
const timeA = scheduleA.startTime || '';  // ''
const timeB = scheduleB.startTime || '';  // '08:00'
timeA.localeCompare(timeB);  // -1 (empty string comes first) ✅
```

### Scenario 3: Missing type

```typescript
const scheduleA = { startTime: '07:00', type: undefined };
const scheduleB = { startTime: '07:00', type: 'Laboratory' };

// Before fix
scheduleA.type.localeCompare(scheduleB.type);  // ❌ TypeError!

// After fix
const typeA = scheduleA.type || '';  // ''
const typeB = scheduleB.type || '';  // 'Laboratory'
typeA.localeCompare(typeB);  // -1 (empty string comes first) ✅
```

---

## Impact

### Before Fix

```
❌ Save schedule: SUCCESS
❌ View saved schedule: CRASHES
   Error: "Cannot read properties of undefined (reading 'localeCompare')"
   
❌ Cannot view saved schedules
❌ Page becomes unusable
❌ Must refresh to recover
```

### After Fix

```
✅ Save schedule: SUCCESS
✅ View saved schedule: SUCCESS
   
✅ Can view saved schedules
✅ Sorting works correctly
✅ No crashes
✅ Handles missing data gracefully
```

---

## Testing Scenarios

### Test 1: Complete Data
```typescript
Input: { startTime: '07:00', type: 'Lecture' }
Expected: ✅ Sorts correctly
Actual: ✅ Sorts correctly
```

### Test 2: Missing startTime
```typescript
Input: { startTime: undefined, type: 'Lecture' }
Expected: ✅ Defaults to '', sorts to beginning
Actual: ✅ Works as expected
```

### Test 3: Missing type
```typescript
Input: { startTime: '07:00', type: undefined }
Expected: ✅ Defaults to '', sorts to beginning
Actual: ✅ Works as expected
```

### Test 4: Both Missing
```typescript
Input: { startTime: undefined, type: undefined }
Expected: ✅ Defaults to '', maintains order
Actual: ✅ Works as expected
```

---

## Best Practices Applied

### 1. Defensive Programming
```typescript
// Always provide defaults for potentially undefined values
const value = possiblyUndefined || defaultValue;
```

### 2. Null Coalescing
```typescript
// Use || operator for fallback values
const timeA = a.startTime || '';
const typeA = a.type || '';
```

### 3. Type Safety
```typescript
// Consider using TypeScript's optional chaining in the future
const timeA = a?.startTime ?? '';
const typeA = a?.type ?? '';
```

---

## Future Improvements

### 1. TypeScript Strict Mode
```typescript
interface ScheduleGroup {
  startTime?: string;
  endTime?: string;
  type?: string;
  days: string[];
  roomName?: string;
}

const sortedGroups = Object.values(grouped).sort((a: ScheduleGroup, b: ScheduleGroup) => {
  const timeA = a.startTime ?? '';
  const timeB = b.startTime ?? '';
  // TypeScript will enforce type safety
});
```

### 2. Validation at Data Source
```typescript
// Validate data when loading from database
const schedules = await fetchSchedules();
const validatedSchedules = schedules.map(schedule => ({
  ...schedule,
  startTime: schedule.startTime || 'TBA',
  type: schedule.type || 'Unknown'
}));
```

### 3. Error Boundaries
```typescript
// Wrap components in error boundaries
<ErrorBoundary fallback={<ErrorMessage />}>
  <ScheduleTable schedules={schedules} />
</ErrorBoundary>
```

---

## Summary

### Changes Made
- ✅ Added safety checks before `localeCompare()` calls
- ✅ Default to empty string for undefined values
- ✅ Fixed in 2 locations (main table and view modal)

### Results
- ✅ No more TypeError crashes
- ✅ Graceful handling of missing data
- ✅ Schedules display correctly
- ✅ Sorting works as expected

### Impact
- **Before:** Crash when viewing saved schedules
- **After:** Smooth display of all schedules

---

**Last Updated:** November 3, 2025  
**Fix Version:** 2.8 (Frontend Sort Error Fix)
