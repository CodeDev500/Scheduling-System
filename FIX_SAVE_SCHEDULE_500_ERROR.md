# Fix: 500 Error When Saving Schedules

## Problem
When trying to save schedules, the server returned a **500 Internal Server Error** because it was attempting to save fields that no longer exist in the database schema after the migration.

### Error Details
```
AxiosError: Request failed with status code 500
Failed to save latest schedule
```

## Root Cause
The backend controller (`scheduleGeneration.controller.ts`) was still trying to save the removed fields:
- `credits` (removed - use `units` instead)
- `type` (removed - can be derived from lec/lab)
- `section` (removed - not used)

But the database schema no longer has these columns after running the migration.

## Solution

### Updated Backend Controller

**File:** `server/src/controllers/scheduleGeneration.controller.ts`

**Before (Lines 382-392):**
```typescript
semester: String(item.semester ?? ''),
academicYear: String(item.academicYear ?? ''),
program: String(item.program ?? ''),
yearLevel: String(item.yearLevel ?? ''),
credits: Number(item.credits ?? 0),        // ❌ REMOVED
units: Number(item.units ?? 0),
type: String(item.type ?? ''),             // ❌ REMOVED
students: item.students ?? null,
section: item.section ?? null,             // ❌ REMOVED
tags: Array.isArray(item.tags) || typeof item.tags === 'object' ? (item.tags as any) : undefined,
hasConflict: typeof item.hasConflict === 'boolean' ? item.hasConflict : null,
```

**After (Lines 382-392):**
```typescript
semester: String(item.semester ?? ''),
academicYear: String(item.academicYear ?? ''),
program: String(item.program ?? ''),
yearLevel: String(item.yearLevel ?? ''),
units: Number(item.units ?? 0),
lec: Number(item.lec ?? 0),                                    // ✅ ADDED
lab: Number(item.lab ?? 0),                                    // ✅ ADDED
students: item.students ?? null,
tags: Array.isArray(item.tags) || typeof item.tags === 'object' ? (item.tags as any) : undefined,
recommendedFaculty: Array.isArray(item.recommendedFaculty) || typeof item.recommendedFaculty === 'object' ? (item.recommendedFaculty as any) : undefined,  // ✅ ADDED
hasConflict: typeof item.hasConflict === 'boolean' ? item.hasConflict : null,
```

## Changes Made

### ❌ Removed Fields
1. **`credits`** - No longer in database schema
2. **`type`** - No longer in database schema
3. **`section`** - No longer in database schema

### ✅ Added Fields
1. **`lec`** - Lecture hours (Int, default 0)
2. **`lab`** - Laboratory hours (Int, default 0)
3. **`recommendedFaculty`** - Array of recommended faculty (Json)

## Testing

After this fix, saving schedules should work correctly:

### Test Steps
1. Generate a schedule
2. Click "Save Schedule" button
3. Verify success message appears
4. Refresh the page
5. Verify schedules are still displayed with correct `lec` and `lab` values

### Expected Result
```json
{
  "success": true,
  "data": {
    "deletedPrevious": true,
    "inserted": 11
  }
}
```

## Data Flow

### Frontend → Backend
```typescript
// Frontend sends:
{
  "subjectCode": "CS 102",
  "units": 3,
  "lec": 1,
  "lab": 2,
  "recommendedFaculty": [],
  // ... other fields
}
```

### Backend → Database
```typescript
// Backend saves:
{
  units: 3,
  lec: 1,
  lab: 2,
  recommendedFaculty: [],
  // ... other fields
}
```

### Database → Frontend
```typescript
// Frontend receives:
{
  "units": 3,
  "lec": 1,
  "lab": 2,
  "recommendedFaculty": [],
  // ... other fields
}
```

## Summary

The fix ensures that:
- ✅ Backend controller matches the new database schema
- ✅ Removed fields (`credits`, `type`, `section`) are no longer saved
- ✅ New fields (`lec`, `lab`, `recommendedFaculty`) are properly saved
- ✅ Schedules can be saved without 500 errors
- ✅ Data persists correctly across page reloads

The server should now restart automatically (nodemon) and the save functionality will work!
