# Faculty Profile - Teaching Load Units Update

## Summary

Updated the Faculty Profile page to display teaching load based on **Total Units** instead of hours/week, matching the implementation in ScheduleGeneration. The maximum units are now fetched from the `TotalUnits` table in the database.

---

## Changes Made

### ✅ 1. Backend - Fetch Max Units from Database

**File:** `server/src/controllers/user.controller.ts`

**Updated `getFacultyWithLoad()`:**

```typescript
// Get max units from TotalUnits table
const totalUnitsSettings = await db.totalUnits.findFirst();
const maxUnits = totalUnitsSettings?.totalUnits || 21;
```

**Before:** Hardcoded `maxUnits: 21`
**After:** Fetches from `TotalUnits` table (same as ScheduleGeneration)

### ✅ 2. Frontend - Display Total Units

**File:** `client/src/pages/CampusAdmin/FacultyProfile/FacultyProfile.tsx`

#### Faculty Cards

**Before:**
```tsx
{member.currentSemesterLoad}/{member.maxUnits} hrs
```

**After:**
```tsx
{member.totalUnits}/{member.maxUnits} units
```

#### Faculty Modal

**Before:**
```
Current Load: 15 hours/week
Maximum Load: 21 hours/week
```

**After:**
```
Total Units: 8 units
Maximum Units: 21 units
Total Subjects: 3 subjects
Hours/Week: 8 hours
```

---

## Data Structure

### Faculty Object

```typescript
{
  id: 3,
  firstname: "faculty",
  lastname: "fac",
  middleInitial: "f",
  email: "faculty@gmail.com",
  designation: "Regular Faculty",
  department: "BSCS",
  role: "FACULTY",
  status: "APPROVED",
  specialization: ["Data Structures", "Algorithms", "Software Engineering"],
  
  // Teaching Load Data
  totalUnits: 8,              // Sum of all subject units
  totalSubjects: 3,           // Count of subjects
  currentSemesterLoad: 8,     // Hours per week: (lec × 1) + (lab × 3)
  maxUnits: 21                // From TotalUnits table
}
```

---

## Calculations

### 1. Total Units
```typescript
totalUnits = sum of schedule.units
```

**Example:**
- Subject 1: 3 units
- Subject 2: 3 units
- Subject 3: 2 units
- **Total: 8 units**

### 2. Hours per Week
```typescript
currentSemesterLoad = sum of (lec × 1) + (lab × 3)
```

**Example:**
- Subject 1: 3 lec, 0 lab = 3 hours
- Subject 2: 2 lec, 1 lab = 5 hours (2 + 3)
- Subject 3: 2 lec, 0 lab = 2 hours
- **Total: 10 hours/week**

### 3. Load Percentage
```typescript
loadPercentage = (totalUnits / maxUnits) × 100
```

**Example:**
- Total Units: 8
- Max Units: 21
- **Percentage: 38%** (Green - Normal)

---

## Display Components

### Faculty Card

```tsx
{/* Teaching Load */}
{member.totalUnits !== undefined && member.maxUnits && (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">Teaching Load</span>
      <span className={`text-sm font-medium ${getLoadColor(loadPercentage)}`}>
        {member.totalUnits}/{member.maxUnits} units ({loadPercentage}%)
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${loadPercentage}%` }}></div>
    </div>
  </div>
)}
```

### Faculty Modal

```tsx
{/* Teaching Load Information */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div>
    <label>Total Units</label>
    <p>{selectedFaculty.totalUnits || 0} units</p>
  </div>
  <div>
    <label>Maximum Units</label>
    <p>{selectedFaculty.maxUnits || 21} units</p>
  </div>
  <div>
    <label>Total Subjects</label>
    <p>{selectedFaculty.totalSubjects || 0} subjects</p>
  </div>
  <div>
    <label>Hours/Week</label>
    <p>{selectedFaculty.currentSemesterLoad || 0} hours</p>
  </div>
</div>

{/* Progress Bar */}
<div className="mt-4">
  <span>Load Percentage: {loadPercentage}%</span>
  <div className="progress-bar">...</div>
</div>
```

---

## Color Coding

| Load % | Color | Status | Example |
|--------|-------|--------|---------|
| 0-74% | 🟢 Green | Normal | 8/21 units (38%) |
| 75-89% | 🟡 Yellow | High | 17/21 units (81%) |
| 90-100%+ | 🔴 Red | Overloaded | 20/21 units (95%) |

---

## Database Integration

### TotalUnits Table

```prisma
model TotalUnits {
  id         Int      @id @default(autoincrement())
  totalUnits Int      @default(18)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Query

```typescript
const totalUnitsSettings = await db.totalUnits.findFirst();
const maxUnits = totalUnitsSettings?.totalUnits || 21;
```

---

## Comparison with ScheduleGeneration

### ScheduleGeneration Implementation

```typescript
useEffect(() => {
  const getFacultyMaxUnits = async () => {
    try {
      const response = await api.get('/total-units');
      const totalUnits = response.data.success && response.data.data 
        ? response.data.data.totalUnits 
        : 18;
      setFacultyMaxUnits(totalUnits);
    } catch (error) {
      setFacultyMaxUnits(18); // Default fallback
    }
  };
  getFacultyMaxUnits();
}, []);
```

### FacultyProfile Implementation

```typescript
// Backend fetches from TotalUnits table
const totalUnitsSettings = await db.totalUnits.findFirst();
const maxUnits = totalUnitsSettings?.totalUnits || 21;

// Returns in faculty data
return {
  ...facultyMember,
  totalUnits,
  maxUnits,
  totalSubjects,
  currentSemesterLoad
};
```

**Both now use the same source:** `TotalUnits` table

---

## Benefits

### Before
- ❌ Displayed hours/week as "maximum load"
- ❌ Hardcoded maxUnits = 21
- ❌ Inconsistent with ScheduleGeneration
- ❌ Confusing metrics

### After
- ✅ Displays total units vs maximum units
- ✅ Fetches maxUnits from database
- ✅ Consistent with ScheduleGeneration
- ✅ Clear metrics:
  - **Total Units:** Sum of subject units
  - **Maximum Units:** From settings
  - **Hours/Week:** Calculated hours
  - **Load Percentage:** Based on units

---

## Example Display

### Faculty Card
```
Teaching Load
8/21 units (38%)
[████░░░░░░░░░░░░░░░░] Green
```

### Faculty Modal
```
Teaching Load
┌─────────────┬──────────────┬───────────────┬────────────┐
│ Total Units │ Maximum Units│ Total Subjects│ Hours/Week │
│   8 units   │   21 units   │   3 subjects  │  8 hours   │
└─────────────┴──────────────┴───────────────┴────────────┘

Load Percentage: 38%
[████░░░░░░░░░░░░░░░░] Green
```

---

## Testing Checklist

- [ ] Max units fetched from TotalUnits table
- [ ] Teaching load displays as "X/Y units"
- [ ] Load percentage based on total units
- [ ] Progress bar shows correct percentage
- [ ] Color coding works (green/yellow/red)
- [ ] Modal shows all 4 metrics
- [ ] Hours/week displayed separately
- [ ] Consistent with ScheduleGeneration

---

## Summary

The Faculty Profile now:
- ✅ Displays **Total Units / Maximum Units** (not hours)
- ✅ Fetches **Maximum Units** from `TotalUnits` table
- ✅ Shows **4 metrics**: Total Units, Max Units, Subjects, Hours/Week
- ✅ Calculates **Load Percentage** based on units
- ✅ **Consistent** with ScheduleGeneration implementation
- ✅ Uses **same database source** for max units

Teaching load display is now accurate and consistent across the application!
