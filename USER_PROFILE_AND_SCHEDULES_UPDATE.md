# User Profile and Faculty Schedules Update

## Date: November 3, 2025

## Summary of Changes

### 1. Made Faculty Profile Fields Editable in UserProfile
### 2. Fixed Layout Spacing Issues
### 3. Updated Faculty ViewSchedules to Fetch Real Data
### 4. Added Curriculum Year and Semester Filters

---

## Part 1: UserProfile.tsx - Editable Faculty Fields

### Changes Made

#### **1. Improved Grid Layout**
Changed from `md:grid-cols-2` to `lg:grid-cols-2` with increased gap:
```tsx
// Before
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

// After
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
```
**Result:** Better spacing on larger screens, more breathing room between columns.

#### **2. Made Preferred Time Slots Editable**
Added time range picker in edit mode:
```tsx
{isEditing ? (
  <div className="flex gap-2 items-center">
    <div className="flex-1">
      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
      <input
        type="time"
        min="07:00"
        max="19:00"
        value={/* extract from preferredTimeSlots */}
        onChange={/* update preferredTimeSlots array */}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg..."
      />
    </div>
    <span className="text-gray-500 mt-6">to</span>
    <div className="flex-1">
      <label className="block text-xs text-gray-500 mb-1">End Time</label>
      <input type="time" ... />
    </div>
  </div>
) : (
  /* Display mode - shows time range badge */
)}
```

#### **3. Made Available Days Editable**
Used MultiSelectField component:
```tsx
{isEditing ? (
  <MultiSelectField
    label="Available Days"
    id="availableDays"
    name="availableDays"
    value={editedData.availableDays || []}
    onChange={handleMultiSelectChange}
    placeholder="Select days you are available to teach..."
    options={[
      { value: "Monday", label: "Monday" },
      { value: "Tuesday", label: "Tuesday" },
      // ... all days
    ]}
  />
) : (
  /* Display mode - shows day badges */
)}
```

#### **4. Made Previous Subjects Editable**
Used MultiSelectField with subject options:
```tsx
{isEditing ? (
  <MultiSelectField
    label="Previous Subjects Taught"
    id="previousSubjects"
    name="previousSubjects"
    value={editedData.previousSubjects || []}
    onChange={handleMultiSelectChange}
    placeholder="Select subjects you have previously taught..."
    options={[
      { value: "Programming", label: "Programming" },
      { value: "Database Systems", label: "Database Systems" },
      { value: "Algorithms", label: "Algorithms" },
      { value: "Artificial Intelligence", label: "Artificial Intelligence" },
      // ... 14 subject options total
    ]}
  />
) : (
  /* Display mode - shows subject badges */
)}
```

#### **5. Added Missing Icons**
```tsx
import { 
  // ... existing imports
  Clock,      // For Preferred Time Slots
  BookOpen    // For Previous Subjects
} from 'lucide-react';
```

---

## Part 2: ViewSchedules.tsx - Real Data Integration

### Changes Made

#### **1. Added API Integration**
```tsx
import { useAppSelector } from "../../../hooks/redux";
import api from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";

const user = useAppSelector((state) => state.auth.user);
const toast = useToast();
```

#### **2. Fetch Faculty-Specific Schedules**
```tsx
useEffect(() => {
  const fetchSchedules = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await api.get('/schedule-generation/items');
      
      if (response.data.success) {
        // Filter schedules for this faculty only
        const facultySchedules = response.data.data.filter(
          (schedule: any) => schedule.facultyId === user.id.toString()
        );
        
        // Transform to match Schedule interface
        const transformedSchedules = facultySchedules.map((schedule: any) => ({
          id: schedule.id.toString(),
          subject: schedule.subjectName || schedule.subject,
          code: schedule.subjectCode,
          room: schedule.roomName || schedule.room,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          day: schedule.day,
          semester: schedule.semester,
          academicYear: schedule.academicYear,
          program: schedule.program,
          yearLevel: schedule.yearLevel,
          section: 'A',
          status: 'Active' as const,
          students: 0,
          maxStudents: 0
        }));
        
        setSchedules(transformedSchedules);
        
        // Extract unique curriculum years
        const years = Array.from(new Set(transformedSchedules.map((s: Schedule) => s.academicYear)))
          .filter((y): y is string => !!y);
        setCurriculumYears(years.sort());
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchSchedules();
}, [user?.id, toast]);
```

#### **3. Added Curriculum Year Filter**
```tsx
// State
const [filterCurriculumYear, setFilterCurriculumYear] = useState("all");
const [curriculumYears, setCurriculumYears] = useState<string[]>([]);

// Filter logic
const matchesCurriculumYear = filterCurriculumYear === "all" || schedule.academicYear === filterCurriculumYear;

// UI
<div>
  <select
    className="w-full px-3 py-2 border border-gray-300 rounded-lg..."
    value={filterCurriculumYear}
    onChange={(e) => setFilterCurriculumYear(e.target.value)}
  >
    <option value="all">All Years</option>
    {curriculumYears.map(year => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>
</div>
```

#### **4. Updated Grid Layout**
Changed from 6 columns to 7 to accommodate new filter:
```tsx
// Before
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

// After
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
```

#### **5. Added Loading State**
```tsx
{isLoading ? (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    <p className="mt-4 text-sm text-gray-500">Loading schedules...</p>
  </div>
) : filteredSchedules.length === 0 ? (
  <div className="text-center py-12">
    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
    <p className="mt-1 text-sm text-gray-500">
      {searchTerm || filterCurriculumYear !== 'all' || filterSemester !== 'all' || filterDay !== 'all' || filterStatus !== 'all'
        ? 'Try adjusting your search or filters.'
        : 'No schedules available.'}
    </p>
  </div>
) : null}
```

---

## Features Overview

### UserProfile - Faculty Fields

| Field | View Mode | Edit Mode | Component |
|-------|-----------|-----------|-----------|
| **Years of Experience** | Shows "{value} years" | Number input | `<input type="number">` |
| **Preferred Time Slots** | Purple badge "07:00 - 19:00" | Two time inputs (start/end) | `<input type="time">` |
| **Available Days** | Green badges | Multi-select dropdown | `<MultiSelectField>` |
| **Previous Subjects** | Blue badges | Multi-select dropdown | `<MultiSelectField>` |

### ViewSchedules - Filters

| Filter | Options | Purpose |
|--------|---------|---------|
| **Search** | Free text | Search by subject, code, room |
| **Curriculum Year** | Dynamic (from data) | Filter by academic year (e.g., "2024-2025") |
| **Semester** | 1st, 2nd, Summer | Filter by semester |
| **Day** | Mon-Sun | Filter by day of week |
| **Status** | Active, Completed, Cancelled | Filter by status |
| **View Mode** | List / Calendar | Toggle display mode |

---

## Data Flow

### UserProfile Edit Flow
```
1. User clicks "Edit Profile"
   → isEditing = true
   → Shows editable fields

2. User modifies faculty fields
   → Preferred Time Slots: Select start/end times
   → Available Days: Select from dropdown
   → Previous Subjects: Select from dropdown

3. User clicks "Save"
   → Data sent to API: PUT /users/:id
   → Backend parses JSON fields
   → Database updated

4. Profile refreshes
   → Fresh data fetched
   → UI updates with new values
   → isEditing = false
```

### ViewSchedules Data Flow
```
1. Component mounts
   → Fetch user from Redux store
   → Call API: GET /schedule-generation/items

2. Filter schedules
   → Keep only schedules where facultyId === user.id
   → Transform to Schedule interface

3. Extract curriculum years
   → Get unique academicYear values
   → Sort and store in state

4. User applies filters
   → Filter schedules by:
     - Curriculum Year
     - Semester
     - Day
     - Search term

5. Display results
   → List view: Table with schedule details
   → Calendar view: Weekly grid
```

---

## API Endpoints Used

### UserProfile
- **GET** `/users/me` - Fetch current user profile
- **PUT** `/users/:id` - Update user profile

### ViewSchedules
- **GET** `/schedule-generation/items` - Fetch all schedules (filtered client-side by facultyId)

---

## UI/UX Improvements

### Layout
- ✅ Increased grid gap from 6 to 8 for better spacing
- ✅ Changed breakpoint from `md` to `lg` for 2-column layout
- ✅ Better visual hierarchy with consistent spacing

### Faculty Fields
- ✅ All fields now editable (not just Years of Experience)
- ✅ Time range picker with min/max validation (07:00-19:00)
- ✅ Multi-select dropdowns for days and subjects
- ✅ Consistent badge colors (Purple, Green, Blue)

### ViewSchedules
- ✅ Real data from database (not mock data)
- ✅ Faculty-specific filtering by user ID
- ✅ Curriculum year filter for multi-year schedules
- ✅ Loading state with spinner
- ✅ Empty state with helpful message
- ✅ Responsive grid layout (1 → 2 → 7 columns)

---

## Testing Checklist

### UserProfile
- [ ] Years of Experience editable
- [ ] Preferred Time Slots editable (start/end time)
- [ ] Available Days editable (multi-select)
- [ ] Previous Subjects editable (multi-select)
- [ ] Save updates all fields correctly
- [ ] Display mode shows badges correctly
- [ ] Layout has proper spacing

### ViewSchedules
- [ ] Fetches schedules for logged-in faculty only
- [ ] Curriculum year filter populated dynamically
- [ ] Semester filter works correctly
- [ ] Day filter works correctly
- [ ] Search works for subject, code, room
- [ ] List view displays all schedule details
- [ ] Calendar view shows weekly grid
- [ ] Loading state shows spinner
- [ ] Empty state shows helpful message
- [ ] No schedules from other faculty shown

---

## Known Limitations

### UserProfile
- Time slots stored as array of strings (e.g., `["start:07:00", "end:19:00"]`)
- Could be improved to single time range object in future

### ViewSchedules
- Students count not available (shows 0/0)
- Section hardcoded to 'A' (not in current schema)
- Status hardcoded to 'Active' (not in current schema)
- Could add these fields to database schema in future

---

## Future Enhancements

### UserProfile
1. **Validation**
   - Ensure end time is after start time
   - Require at least one available day
   - Validate years of experience range

2. **UI Improvements**
   - Add time range slider
   - Show selected days count
   - Add subject search/filter

### ViewSchedules
1. **Additional Filters**
   - Filter by program
   - Filter by year level
   - Filter by room type

2. **Export Features**
   - Export to PDF
   - Export to Excel
   - Print schedule

3. **Calendar Enhancements**
   - Month view
   - Day view
   - Color-code by subject type

---

## Summary

### Files Modified
1. ✅ `UserProfile.tsx` - Made faculty fields editable, improved layout
2. ✅ `ViewSchedules.tsx` - Integrated real data, added filters

### Results
- ✅ Faculty can edit all profile fields
- ✅ Better spacing and layout
- ✅ Real schedule data from database
- ✅ Faculty-specific filtering
- ✅ Curriculum year and semester filters
- ✅ Professional UI matching TeachingLoad design

---

**Last Updated:** November 3, 2025  
**Version:** 3.1 (User Profile and Schedules Update)
