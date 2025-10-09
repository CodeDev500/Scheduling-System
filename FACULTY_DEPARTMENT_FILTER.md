# Faculty Profile - Dynamic Department Filter

## Summary

Implemented dynamic department filtering in the Faculty Profile page that automatically extracts and displays all unique departments from the fetched faculty data.

---

## Changes Made

### ✅ 1. Added Department State

```typescript
const [departments, setDepartments] = useState<string[]>([]);
```

### ✅ 2. Extract Unique Departments

Updated `fetchFaculty()` to extract unique departments from the faculty data:

```typescript
const fetchFaculty = async () => {
  try {
    setIsLoading(true);
    const response = await api.get('/user/faculty/with-load');
    const approvedFaculty = response.data.filter(
      (user: Faculty) => user.status === 'APPROVED'
    );
    setFaculty(approvedFaculty);
    
    // Extract unique departments
    const uniqueDepartments = Array.from(
      new Set(approvedFaculty.map((f: Faculty) => f.department).filter(Boolean))
    ) as string[];
    setDepartments(uniqueDepartments.sort());
  } catch (error) {
    toast.error('Failed to fetch faculty');
  } finally {
    setIsLoading(false);
  }
};
```

### ✅ 3. Updated Department Filter Dropdown

**Before:**
```tsx
<select>
  <option value="all">All Departments</option>
  <option value="Computer Science">Computer Science</option>
  <option value="Information Technology">Information Technology</option>
</select>
```

**After:**
```tsx
<select
  value={filterDepartment}
  onChange={(e) => setFilterDepartment(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="all">All Departments</option>
  {departments.map(department => (
    <option key={department} value={department}>{department}</option>
  ))}
</select>
```

### ✅ 4. Cleaned Up Unused Imports

Removed unused icons:
- `Phone`
- `Edit`
- `Plus`
- `Award`

---

## How It Works

### Data Flow

```
1. Fetch faculty from API
   ↓
2. Filter only APPROVED faculty
   ↓
3. Extract unique departments
   ↓
4. Sort departments alphabetically
   ↓
5. Display in dropdown
   ↓
6. Filter faculty by selected department
```

### Department Extraction Logic

```typescript
// Get all departments from faculty
const allDepartments = approvedFaculty.map((f: Faculty) => f.department);

// Remove duplicates using Set
const uniqueDepartments = Array.from(new Set(allDepartments));

// Filter out null/undefined values
const validDepartments = uniqueDepartments.filter(Boolean);

// Sort alphabetically
const sortedDepartments = validDepartments.sort();
```

### Filtering Logic

```typescript
const filteredFaculty = faculty.filter(member => {
  const fullName = `${member.firstname} ${member.lastname}`.toLowerCase();
  const specializationStr = Array.isArray(member.specialization) 
    ? member.specialization.join(', ') 
    : '';
  
  const matchesSearch = 
    fullName.includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specializationStr.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesDepartment = 
    filterDepartment === "all" || 
    member.department === filterDepartment;
  
  return matchesSearch && matchesDepartment;
});
```

---

## Example Data

### Faculty Data
```json
[
  {
    "id": 3,
    "firstname": "faculty",
    "lastname": "fac",
    "middleInitial": "f",
    "email": "faculty@gmail.com",
    "designation": "Regular Faculty",
    "department": "BSCS",
    "role": "FACULTY",
    "status": "APPROVED",
    "specialization": ["Data Structures", "Algorithms", "Software Engineering"],
    "currentSemesterLoad": 8,
    "totalSubjects": 3,
    "totalUnits": 8,
    "maxUnits": 21
  },
  {
    "id": 5,
    "firstname": "John",
    "lastname": "Doe",
    "department": "BSIT",
    "status": "APPROVED"
  }
]
```

### Extracted Departments
```javascript
["BSCS", "BSIT"]
```

### Dropdown Display
```
All Departments
BSCS
BSIT
```

---

## Features

### Dynamic Department List
- ✅ Automatically extracts departments from faculty data
- ✅ No hardcoded department values
- ✅ Updates when faculty data changes
- ✅ Sorted alphabetically
- ✅ Filters out null/undefined values

### Filter Functionality
- ✅ "All Departments" shows all faculty
- ✅ Selecting a department filters faculty by that department
- ✅ Works with search filter
- ✅ Real-time filtering

### UI Improvements
- ✅ Clean dropdown design
- ✅ Focus ring on selection
- ✅ Consistent styling with search bar
- ✅ Responsive layout

---

## Benefits

### Before
- ❌ Hardcoded department options
- ❌ Manual updates needed for new departments
- ❌ Could show departments with no faculty
- ❌ Static list

### After
- ✅ Dynamic department extraction
- ✅ Automatic updates with data
- ✅ Only shows departments with faculty
- ✅ Sorted alphabetically
- ✅ Scales with data

---

## Testing Checklist

- [ ] Departments load from faculty data
- [ ] Dropdown shows unique departments only
- [ ] Departments are sorted alphabetically
- [ ] "All Departments" shows all faculty
- [ ] Selecting a department filters correctly
- [ ] Filter works with search
- [ ] No duplicate departments in dropdown
- [ ] Null/undefined departments excluded
- [ ] Updates when faculty data changes

---

## Example Usage

### Scenario 1: View All Faculty
1. Page loads with all APPROVED faculty
2. Dropdown shows "All Departments" + unique departments
3. Default: "All Departments" selected
4. All faculty displayed

### Scenario 2: Filter by Department
1. User selects "BSCS" from dropdown
2. Faculty list filters to show only BSCS faculty
3. Count updates to show filtered results
4. Search still works within filtered results

### Scenario 3: Combined Filters
1. User selects "BSIT" department
2. User searches for "john"
3. Shows only BSIT faculty with "john" in name/email
4. Both filters applied simultaneously

---

## Code Structure

### State Management
```typescript
const [faculty, setFaculty] = useState<Faculty[]>([]);
const [departments, setDepartments] = useState<string[]>([]);
const [filterDepartment, setFilterDepartment] = useState("all");
const [searchTerm, setSearchTerm] = useState("");
```

### Data Fetching
```typescript
useEffect(() => {
  fetchFaculty();
}, []);
```

### Filtering
```typescript
const filteredFaculty = faculty.filter(member => {
  const matchesSearch = /* search logic */;
  const matchesDepartment = 
    filterDepartment === "all" || 
    member.department === filterDepartment;
  return matchesSearch && matchesDepartment;
});
```

---

## Summary

The Faculty Profile page now features:
- ✅ Dynamic department filtering
- ✅ Automatic department extraction from data
- ✅ Alphabetically sorted departments
- ✅ Combined search and department filters
- ✅ Real-time filtering
- ✅ Clean, responsive UI
- ✅ No hardcoded values

The department filter automatically adapts to the available faculty data!
