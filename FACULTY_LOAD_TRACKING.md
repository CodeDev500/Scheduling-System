# Faculty Load Tracking Feature

## Overview
Added a **Faculty Load** column to the schedule generation table that displays the total units assigned to each faculty member compared to the maximum allowed units from settings.

## Features

### 1. Dynamic Max Units from Settings
- Fetches the maximum faculty units from the Settings page (`/total-units` API)
- Default fallback: 18 units if API fails
- Updates automatically when settings are changed

### 2. Faculty Load Display
Shows assigned units vs. max units in format: **`assigned/max`**

**Example:**
- `9/18` - Faculty has 9 units assigned out of 18 max
- `18/18` - Faculty is at full capacity
- `20/18` - Faculty is overloaded (2 units over limit)

### 3. Color-Coded Status

| Status | Color | Condition | Example |
|--------|-------|-----------|---------|
| **Normal** | Green | `assigned < max` | `9/18` |
| **At Capacity** | Yellow | `assigned = max` | `18/18` |
| **Overloaded** | Red | `assigned > max` | `20/18` ⚠️ |

### 4. Visual Indicators
- **Green Badge**: Faculty has available capacity
- **Yellow Badge**: Faculty is at full capacity
- **Red Badge + Warning Icon**: Faculty is overloaded (⚠️ AlertTriangle icon)

---

## Implementation Details

### Files Modified

#### 1. **ScheduleGeneration.tsx**

**Added State:**
```typescript
const [facultyMaxUnits, setFacultyMaxUnits] = useState<number>(18);
```

**Added API Call to Fetch Max Units:**
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
      console.error('Error fetching faculty max units:', error);
      setFacultyMaxUnits(18); // Default fallback
    }
  };
  getFacultyMaxUnits();
}, []);
```

**Calculate Faculty Loads:**
```typescript
const facultyLoads = useMemo(() => {
  const loads: Record<string, number> = {};
  
  schedules?.forEach((schedule) => {
    const facultyId = schedule.facultyId || schedule.faculty;
    if (facultyId && facultyId !== 'unassigned') {
      const units = schedule.units || 0;
      loads[facultyId] = (loads[facultyId] || 0) + units;
    }
  });
  
  return loads;
}, [schedules]);
```

**Added Table Column Header:**
```tsx
<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
  <div className="flex items-center space-x-2">
    <Users className="h-4 w-4 text-indigo-600" />
    <span>Faculty Load</span>
  </div>
</th>
```

**Added Table Cell with Dynamic Coloring:**
```tsx
<td className="px-6 py-5 whitespace-nowrap">
  {(() => {
    const facultyId = subject.facultyId || subject.faculty;
    const assignedUnits = facultyLoads[facultyId] || 0;
    const isOverloaded = assignedUnits > facultyMaxUnits;
    
    return (
      <div className="flex items-center space-x-2">
        <Badge 
          variant="outline" 
          className={`font-bold text-sm px-3 py-1 ${
            isOverloaded 
              ? 'bg-red-50 text-red-700 border-red-300' 
              : assignedUnits === facultyMaxUnits
              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
              : 'bg-green-50 text-green-700 border-green-300'
          }`}
        >
          {assignedUnits}/{facultyMaxUnits}
        </Badge>
        {isOverloaded && (
          <div title="Overloaded">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
    );
  })()}
</td>
```

**Updated Schedule Interface:**
```typescript
interface Schedule {
  // ... existing fields
  facultyId?: string; // Added this field
  // ... rest of fields
}
```

---

## Usage Example

### Scenario 1: Normal Load (Green)
```
Faculty: John Doe
Assigned Subjects:
- CS 101 (3 units)
- CS 102 (3 units)
- CS 103 (3 units)
Total: 9 units

Display: 9/18 (Green Badge)
Status: ✅ Normal - Faculty has 9 units available
```

### Scenario 2: At Capacity (Yellow)
```
Faculty: Jane Smith
Assigned Subjects:
- MATH 101 (3 units)
- MATH 102 (3 units)
- MATH 103 (3 units)
- MATH 104 (3 units)
- MATH 105 (3 units)
- MATH 106 (3 units)
Total: 18 units

Display: 18/18 (Yellow Badge)
Status: ⚠️ At Capacity - Faculty is at maximum load
```

### Scenario 3: Overloaded (Red)
```
Faculty: Bob Johnson
Assigned Subjects:
- ENG 101 (3 units)
- ENG 102 (3 units)
- ENG 103 (3 units)
- ENG 104 (3 units)
- ENG 105 (3 units)
- ENG 106 (3 units)
- ENG 107 (2 units)
Total: 20 units

Display: 20/18 ⚠️ (Red Badge + Warning Icon)
Status: ❌ OVERLOADED - Faculty exceeds maximum by 2 units
```

---

## Table Layout

The schedule table now includes the following columns:

| Column | Description |
|--------|-------------|
| Subject Code | Course code (e.g., CS 101) |
| Subject Name | Full course name |
| Time | Class time |
| Day | Days of the week |
| Room | Classroom assignment |
| **Faculty** | Faculty member name |
| **Faculty Load** | **NEW: Assigned/Max units with color coding** |
| Program | Academic program |
| Lec | Lecture hours |
| Lab | Laboratory hours |
| Total Units | Total course units |
| Hours/Week | Total hours per week |

---

## Benefits

✅ **Real-time Load Monitoring**: Instantly see which faculty members are overloaded  
✅ **Visual Alerts**: Red badges and warning icons highlight overloaded faculty  
✅ **Dynamic Configuration**: Max units can be changed in Settings and updates automatically  
✅ **Prevents Overloading**: Helps administrators avoid assigning too many units to faculty  
✅ **Easy to Read**: Color-coded badges make it easy to scan for issues  

---

## Settings Integration

The feature integrates with the **Settings** page where administrators can:

1. View current maximum faculty units
2. Edit the maximum units (1-30 units)
3. Save changes that apply globally to all faculty

**Settings Page Location:**
`/campus-admin/settings`

**API Endpoints Used:**
- `GET /total-units` - Fetch current max units
- `PUT /total-units` - Update max units

---

## Testing Checklist

- [x] Faculty load displays correctly for each faculty member
- [x] Green badge shows when load < max units
- [x] Yellow badge shows when load = max units
- [x] Red badge + warning icon shows when load > max units
- [x] Max units fetched from Settings API
- [x] Defaults to 18 units if API fails
- [x] Load calculation sums all units per faculty
- [x] Unassigned faculty not included in calculations
- [x] Updates when new schedules are generated
- [x] Column header displays properly

---

## Future Enhancements

Potential improvements for future versions:

1. **Faculty Load Summary Card**: Add a summary card showing:
   - Total faculty count
   - Number of overloaded faculty
   - Average load percentage
   
2. **Load Distribution Chart**: Visual chart showing load distribution across all faculty

3. **Load Warnings During Generation**: Alert when generating schedules that would overload faculty

4. **Faculty Filter**: Filter schedules by overloaded/at-capacity/normal faculty

5. **Export Overload Report**: Generate report of all overloaded faculty members

---

## Summary

The Faculty Load Tracking feature provides administrators with immediate visibility into faculty workload distribution. The color-coded display makes it easy to identify overloaded faculty members at a glance, helping ensure fair distribution of teaching assignments and compliance with institutional policies.

**Key Features:**
- ✅ Dynamic max units from Settings
- ✅ Real-time load calculation
- ✅ Color-coded status (Green/Yellow/Red)
- ✅ Visual warning icons for overloaded faculty
- ✅ Integrated with existing schedule table
