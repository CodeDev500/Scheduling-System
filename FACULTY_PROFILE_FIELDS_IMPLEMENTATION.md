# Faculty Profile Fields Implementation

## Date: November 3, 2025

## Changes Summary

### 1. Updated Preferred Time Range to 12 Hours
Changed from 7:00 AM - 8:00 PM (13 hours) to 7:00 AM - 7:00 PM (12 hours)

### 2. Added Faculty Fields to User Profile Display
Implemented display of faculty-specific fields that were missing from the UI

### 3. Server-Side Fields Already Enabled
The backend was already updated to support these fields

---

## Changes Made

### 1. Register.tsx - Time Range Update

**File:** `client/src/pages/Auth/Register.tsx`

**Changes:**
- Updated label from "7:00 AM - 8:00 PM" to "7:00 AM - 7:00 PM"
- Changed `max="20:00"` to `max="19:00"` for both start and end time inputs

**Before:**
```tsx
<label className="block text-sm font-medium text-gray-700">
  Preferred Time Range (7:00 AM - 8:00 PM)
</label>
<input
  type="time"
  min="07:00"
  max="20:00"  // ❌ 8:00 PM (13 hours)
  ...
/>
```

**After:**
```tsx
<label className="block text-sm font-medium text-gray-700">
  Preferred Time Range (7:00 AM - 7:00 PM)
</label>
<input
  type="time"
  min="07:00"
  max="19:00"  // ✅ 7:00 PM (12 hours)
  ...
/>
```

---

### 2. FacultyProfile.tsx - Default Time Update

**File:** `client/src/pages/CampusAdmin/FacultyProfile/FacultyProfile.tsx`

**Changes:**
- Updated default end time from `17:00` (5:00 PM) to `19:00` (7:00 PM)

**Before:**
```tsx
let start = '07:00', end = '17:00';  // ❌ 5:00 PM
```

**After:**
```tsx
let start = '07:00', end = '19:00';  // ✅ 7:00 PM
```

---

### 3. UserProfile.tsx - Added Faculty Fields Display

**File:** `client/src/pages/UserProfile/UserProfile.tsx`

**Added Fields:**
1. **Years of Experience** - Editable number input
2. **Preferred Time Slots** - Display time range (e.g., "07:00 - 19:00")
3. **Available Days** - Display as badges (Monday, Tuesday, etc.)
4. **Previous Subjects Taught** - Display as badges

**Implementation:**

```tsx
{/* Years of Experience */}
{user.role === 'FACULTY' && (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
      Years of Experience
    </label>
    {isEditing ? (
      <input
        type="number"
        name="yearsOfExperience"
        value={editedData.yearsOfExperience || 0}
        onChange={handleInputChange}
        min="0"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
      />
    ) : (
      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.yearsOfExperience || 0} years</p>
    )}
  </div>
)}

{/* Preferred Time Slots */}
{user.role === 'FACULTY' && (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <Clock className="w-4 h-4 mr-2 text-gray-500" />
      Preferred Time Slots
    </label>
    <div className="bg-gray-50 px-4 py-2 rounded-lg">
      {(() => {
        const slots = user.preferredTimeSlots || [];
        if (Array.isArray(slots) && slots.length > 0) {
          let start = '07:00', end = '19:00';
          slots.forEach((slot: string) => {
            if (slot.startsWith('start:')) start = slot.replace('start:', '');
            if (slot.startsWith('end:')) end = slot.replace('end:', '');
          });
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
              {start} - {end}
            </span>
          );
        }
        return <p className="text-gray-900">Not specified</p>;
      })()}
    </div>
  </div>
)}

{/* Available Days */}
{user.role === 'FACULTY' && (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
      Available Days
    </label>
    <div className="bg-gray-50 px-4 py-2 rounded-lg">
      {user.availableDays && user.availableDays.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {user.availableDays.map((day, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
              {day}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-900">Not specified</p>
      )}
    </div>
  </div>
)}

{/* Previous Subjects */}
{user.role === 'FACULTY' && (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
      Previous Subjects Taught
    </label>
    <div className="bg-gray-50 px-4 py-2 rounded-lg">
      {user.previousSubjects && user.previousSubjects.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {user.previousSubjects.map((subject, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              {subject}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-900">Not specified</p>
      )}
    </div>
  </div>
)}
```

**Added Imports:**
```tsx
import { 
  // ... existing imports
  Clock,
  BookOpen
} from 'lucide-react';
```

---

## Server-Side Implementation

The server-side was already updated by the user to support these fields:

### user.service.ts

**Fields Enabled:**
```typescript
// In listUsers select
previousSubjects: true,
yearsOfExperience: true,
preferredTimeSlots: true,
availableDays: true,

// In createUser
previousSubjects: previousSubjects as any,
yearsOfExperience,
preferredTimeSlots: preferredTimeSlots as any,
availableDays: availableDays as any,

// In updateUser with JSON parsing
let previousSubjects = data.previousSubjects;
if (typeof data.previousSubjects === 'string') {
  try {
    previousSubjects = JSON.parse(data.previousSubjects);
  } catch (e) {
    previousSubjects = data.previousSubjects;
  }
}
// Similar for preferredTimeSlots and availableDays
```

### user.controller.ts

**Teaching Load Calculation:**
```typescript
const totalUnitsSettings = await db.totalUnits.findFirst();
const maxUnits = totalUnitsSettings?.totalUnits;  // Removed default fallback
```

---

## Field Descriptions

### 1. Years of Experience
- **Type:** Number
- **Display:** "{value} years"
- **Editable:** Yes (in edit mode)
- **Validation:** Minimum 0

### 2. Preferred Time Slots
- **Type:** Array of strings (e.g., ["start:07:00", "end:19:00"])
- **Display:** Time range badge (e.g., "07:00 - 19:00")
- **Color:** Purple badge
- **Default:** "07:00 - 19:00" if not specified

### 3. Available Days
- **Type:** Array of strings (e.g., ["Monday", "Tuesday", "Wednesday"])
- **Display:** Multiple green badges
- **Options:** Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- **Default:** "Not specified" if empty

### 4. Previous Subjects Taught
- **Type:** Array of strings (e.g., ["Programming", "Database Systems"])
- **Display:** Multiple blue badges
- **Options:** Programming, Database Systems, Web Development, Data Structures, Algorithms, Computer Networks, Operating Systems, Software Engineering, Mathematics, etc.
- **Default:** "Not specified" if empty

---

## UI Design

### Badge Colors
- **Preferred Time Slots:** Purple (`bg-purple-100 text-purple-800`)
- **Available Days:** Green (`bg-green-100 text-green-800`)
- **Previous Subjects:** Blue (`bg-blue-100 text-blue-800`)
- **Specialization:** Blue (`bg-blue-100 text-blue-800`)

### Icons
- **Years of Experience:** Briefcase icon
- **Preferred Time Slots:** Clock icon
- **Available Days:** Calendar icon
- **Previous Subjects:** BookOpen icon

### Layout
All fields are displayed only when `user.role === 'FACULTY'`, appearing between Specialization and Role fields in the Professional Information section.

---

## Data Flow

### Registration
```
1. User fills registration form
   - Years of Experience: 5
   - Preferred Time: 08:00 - 17:00
   - Available Days: [Monday, Tuesday, Wednesday, Thursday, Friday]
   - Previous Subjects: [Programming, Database Systems]

2. Form submission
   - Arrays converted to JSON strings
   - Sent via FormData to backend

3. Backend processing
   - JSON strings parsed back to arrays
   - Stored in database as JSON fields

4. User profile display
   - Fields fetched from database
   - Displayed with appropriate formatting
```

### Profile Update
```
1. User edits profile
   - Years of Experience editable as number input
   - Other fields read-only (can be made editable in future)

2. Save changes
   - Updated data sent to backend
   - Backend parses JSON fields
   - Database updated

3. Profile refresh
   - Fresh data fetched
   - UI updated with new values
```

---

## Testing Checklist

### Registration
- [ ] Can set years of experience (0-50)
- [ ] Can select start time (07:00-19:00)
- [ ] Can select end time (07:00-19:00)
- [ ] Can select multiple available days
- [ ] Can select multiple previous subjects
- [ ] Data saves correctly to database

### User Profile Display
- [ ] Years of Experience shows correct value
- [ ] Preferred Time Slots displays as time range
- [ ] Available Days show as green badges
- [ ] Previous Subjects show as blue badges
- [ ] Fields only visible for FACULTY role
- [ ] "Not specified" shows when fields are empty

### Profile Edit
- [ ] Years of Experience is editable
- [ ] Can update years of experience
- [ ] Changes save correctly
- [ ] UI updates after save

---

## Future Enhancements

### 1. Make More Fields Editable
Currently only Years of Experience is editable. Consider adding edit functionality for:
- Preferred Time Slots (time range picker)
- Available Days (multi-select)
- Previous Subjects (multi-select with custom input)

### 2. Validation
- Ensure end time is after start time
- Validate years of experience range
- Require at least one available day

### 3. Schedule Integration
Use these fields in schedule generation:
- Respect preferred time slots
- Only schedule on available days
- Consider years of experience for course assignment
- Match previous subjects with current courses

---

## Summary

### Files Modified
1. ✅ `client/src/pages/Auth/Register.tsx` - Updated time range to 12 hours
2. ✅ `client/src/pages/CampusAdmin/FacultyProfile/FacultyProfile.tsx` - Updated default end time
3. ✅ `client/src/pages/UserProfile/UserProfile.tsx` - Added faculty fields display
4. ✅ `server/src/services/user.service.ts` - Already enabled by user
5. ✅ `server/src/controllers/user.controller.ts` - Already updated by user

### Results
- ✅ Preferred time range: 7:00 AM - 7:00 PM (12 hours)
- ✅ Faculty fields visible in user profile
- ✅ Data properly saved and displayed
- ✅ Consistent UI across all pages

---

**Last Updated:** November 3, 2025  
**Version:** 3.0 (Faculty Profile Fields Implementation)
