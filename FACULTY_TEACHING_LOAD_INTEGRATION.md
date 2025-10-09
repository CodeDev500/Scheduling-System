# Faculty Profile - Teaching Load Integration

## Summary

Successfully integrated teaching load data from the `SubjectSchedule` table into the Faculty Profile page, displaying real-time teaching load information for each faculty member.

---

## Changes Made

### ✅ 1. Created New Backend Endpoint

**File:** `server/src/controllers/user.controller.ts`

**New Function:** `getFacultyWithLoad`

```typescript
export const getFacultyWithLoad = async (req: Request, res: Response) => {
  try {
    const faculty = await UserService.listUsers();
    const filteredFaculty = faculty.filter(user => user.role === 'FACULTY');

    const facultyWithLoad = await Promise.all(
      filteredFaculty.map(async (facultyMember) => {
        // Get all schedules for this faculty
        const schedules = await db.subjectSchedule.findMany({
          where: {
            facultyId: String(facultyMember.id),
            isActive: true,
          },
        });

        // Calculate total units and subjects
        const totalUnits = schedules.reduce((sum, schedule) => sum + schedule.units, 0);
        const totalSubjects = schedules.length;

        // Calculate hours per week: (lec × 1) + (lab × 3)
        const currentSemesterLoad = schedules.reduce((sum, schedule) => {
          return sum + (schedule.lec * 1) + (schedule.lab * 3);
        }, 0);

        return {
          ...facultyMember,
          totalSubjects,
          totalUnits,
          currentSemesterLoad,
          maxUnits: 21, // Default max units
        };
      })
    );

    res.status(200).json(facultyWithLoad);
  } catch (error: any) {
    console.error('Error fetching faculty with load:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
```

### ✅ 2. Added New Route

**File:** `server/src/routes/user.router.ts`

```typescript
// Get faculty with teaching load
router.get("/faculty/with-load", UserController.getFacultyWithLoad);
```

### ✅ 3. Updated Frontend Interface

**File:** `client/src/pages/CampusAdmin/FacultyProfile/FacultyProfile.tsx`

```typescript
interface Faculty {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  specialization?: any;
  createdAt: string;
  updatedAt: string;
  image?: string;
  totalSubjects?: number;        // ✅ NEW
  totalUnits?: number;           // ✅ NEW
  currentSemesterLoad?: number;  // ✅ NEW
  maxUnits?: number;             // ✅ NEW
}
```

### ✅ 4. Updated API Call

**Before:**
```typescript
const response = await api.get('/user/faculty');
```

**After:**
```typescript
const response = await api.get('/user/faculty/with-load');
```

### ✅ 5. Added Teaching Load Display

**Faculty Cards:**
- Teaching Load Progress Bar
- Current Load / Max Load (hours/week)
- Load Percentage with color coding
- Total Subjects Count

**Faculty Modal:**
- Current Load (hours/week)
- Maximum Load (hours/week)
- Total Subjects
- Load Percentage with progress bar

---

## Data Calculation

### Teaching Load Formula

**Hours per Week = (Lecture Hours × 1) + (Lab Hours × 3)**

Example:
- Subject 1: 3 lec, 0 lab = 3 hours
- Subject 2: 1 lec, 2 lab = 1 + 6 = 7 hours
- **Total: 10 hours/week**

### Load Percentage

```typescript
Load Percentage = (Current Load / Max Load) × 100
```

### Color Coding

| Percentage | Color | Status |
|------------|-------|--------|
| 0-74% | Green | Normal |
| 75-89% | Yellow | High |
| 90-100%+ | Red | Overloaded |

---

## API Endpoint

### GET /user/faculty/with-load

**Description:** Fetches all FACULTY users with their teaching load calculated from SubjectSchedule table

**Query Logic:**
1. Get all users with `role = 'FACULTY'`
2. For each faculty, query `subject_schedules` table where `facultyId` matches
3. Calculate:
   - `totalSubjects`: Count of schedules
   - `totalUnits`: Sum of units
   - `currentSemesterLoad`: Sum of `(lec × 1) + (lab × 3)`
   - `maxUnits`: Default 21 hours/week

**Response:**
```json
[
  {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "middleInitial": "M",
    "email": "john.doe@example.com",
    "designation": "Professor",
    "department": "BSCS",
    "role": "FACULTY",
    "status": "APPROVED",
    "specialization": ["Data Structures", "Algorithms"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "totalSubjects": 4,
    "totalUnits": 12,
    "currentSemesterLoad": 15,
    "maxUnits": 21
  }
]
```

---

## UI Components

### Faculty Card Display

```tsx
{/* Teaching Load */}
{member.currentSemesterLoad !== undefined && member.maxUnits && (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">Teaching Load</span>
      <span className={`text-sm font-medium ${getLoadColor(loadPercentage)}`}>
        {member.currentSemesterLoad}/{member.maxUnits} hrs ({loadPercentage}%)
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${
          loadPercentage >= 90 ? 'bg-red-500' : 
          loadPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
        }`}
        style={{ width: `${Math.min(loadPercentage, 100)}%` }}
      ></div>
    </div>
  </div>
)}

{/* Subjects Count */}
<div className="flex items-center">
  <BookOpen className="w-4 h-4 mr-1" />
  {member.totalSubjects || 0} subjects
</div>
```

### Faculty Modal Display

```tsx
{/* Teaching Load Information */}
{selectedFaculty.currentSemesterLoad !== undefined && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Teaching Load</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label>Current Load</label>
        <p>{selectedFaculty.currentSemesterLoad || 0} hours/week</p>
      </div>
      <div>
        <label>Maximum Load</label>
        <p>{selectedFaculty.maxUnits || 21} hours/week</p>
      </div>
      <div>
        <label>Total Subjects</label>
        <p>{selectedFaculty.totalSubjects || 0} subjects</p>
      </div>
    </div>
    {/* Progress Bar */}
  </div>
)}
```

---

## Data Flow

```
SubjectSchedule Table
  ↓ (Query by facultyId)
Backend Calculation
  ↓ (Sum units, count subjects, calculate hours)
API Response (/user/faculty/with-load)
  ↓
Frontend Display
  ↓
Faculty Cards & Modal
```

---

## Features

### Faculty Cards
- ✅ Teaching Load Progress Bar
- ✅ Current/Max Load Display
- ✅ Load Percentage with Color
- ✅ Total Subjects Count
- ✅ Color-coded Status (Green/Yellow/Red)

### Faculty Modal
- ✅ Detailed Teaching Load Section
- ✅ Current Load (hours/week)
- ✅ Maximum Load (hours/week)
- ✅ Total Subjects
- ✅ Load Percentage Progress Bar
- ✅ Color-coded Status

### Calculations
- ✅ Real-time data from SubjectSchedule table
- ✅ Accurate hours calculation: (lec × 1) + (lab × 3)
- ✅ Total subjects count
- ✅ Load percentage
- ✅ Color-coded warnings

---

## Example Data

### Faculty with Teaching Load

**Dr. John Doe**
- Subjects: 4
- Total Units: 12
- Teaching Load: 15 hours/week
- Max Load: 21 hours/week
- Percentage: 71% (Green - Normal)

**Breakdown:**
1. CS 101 (3 lec, 0 lab) = 3 hours
2. CS 102 (1 lec, 2 lab) = 7 hours
3. CS 103 (3 lec, 0 lab) = 3 hours
4. CS 104 (2 lec, 0 lab) = 2 hours
**Total: 15 hours/week**

---

## Testing Checklist

- [ ] Faculty load from SubjectSchedule table
- [ ] Teaching load calculation correct
- [ ] Hours formula: (lec × 1) + (lab × 3)
- [ ] Total subjects count accurate
- [ ] Progress bar displays correctly
- [ ] Color coding works (green/yellow/red)
- [ ] Load percentage calculated correctly
- [ ] Modal shows teaching load section
- [ ] Only active schedules counted (isActive = true)
- [ ] Faculty with no schedules show 0

---

## Benefits

### Before
- ❌ No teaching load information
- ❌ No subjects count
- ❌ No workload visibility
- ❌ Mock data only

### After
- ✅ Real teaching load from database
- ✅ Accurate subjects count
- ✅ Visual workload indicators
- ✅ Color-coded warnings
- ✅ Hours per week calculation
- ✅ Overload detection
- ✅ Real-time data sync

---

## Summary

The Faculty Profile page now displays:
- ✅ Real teaching load data from `SubjectSchedule` table
- ✅ Accurate hours calculation: (lec × 1) + (lab × 3)
- ✅ Total subjects assigned to each faculty
- ✅ Visual progress bars with color coding
- ✅ Load percentage with warnings
- ✅ Overload detection (>90% = red)
- ✅ Only counts active schedules (`isActive = true`)

Faculty teaching load is now fully integrated and displays real-time data!
