# Department Head Teaching Load - Real Data Implementation

## Summary
Updated the Department Head Teaching Load page to:
1. **Fetch real data** from `/user/faculty/with-load` API endpoint
2. **Filter by department** - Only shows faculty from the logged-in department head's department
3. **Display teaching load** in a clean table format with progress bars
4. **Export to CSV** functionality
5. **Summary statistics** at the bottom

---

## Changes Made

### **Key Features**

#### **1. Real API Data**
```typescript
const fetchFacultyLoad = async () => {
  try {
    setIsLoading(true);
    const response = await api.get('/user/faculty/with-load');
    
    // Filter only APPROVED faculty from the same department
    const departmentFaculty = response.data.filter((user: Faculty) => 
      user.status === 'APPROVED' && user.department === userData?.department
    );
    
    setFaculty(departmentFaculty);
  } catch (error) {
    console.error('Error fetching faculty load:', error);
    toast.error('Failed to fetch faculty teaching load');
  } finally {
    setIsLoading(false);
  }
};
```

#### **2. Teaching Load Table**

**Columns**:
- Faculty (with image)
- Designation
- Total Units
- Max Units
- Load Percentage (with progress bar)
- Subjects
- Status (Light/Moderate/High/Overloaded)

#### **3. Load Status Colors**

```typescript
const getLoadBarColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-red-500';    // Overloaded
  if (percentage >= 80) return 'bg-yellow-500';  // High
  if (percentage >= 60) return 'bg-blue-500';    // Moderate
  return 'bg-green-500';                         // Light
};
```

#### **4. Export to CSV**

```typescript
const exportToCSV = () => {
  const headers = ['Name', 'Email', 'Designation', 'Total Units', 'Max Units', 'Load %', 'Total Subjects'];
  const rows = filteredFaculty.map(member => [
    getFullName(member),
    member.email,
    member.designation,
    member.totalUnits || 0,
    member.maxUnits || 21,
    getLoadPercentage(member.totalUnits, member.maxUnits),
    member.totalSubjects || 0
  ]);

  // Create and download CSV file
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `teaching-load-${userData?.department}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

#### **5. Summary Statistics**

```typescript
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div>
    <p>Total Faculty</p>
    <p>{filteredFaculty.length}</p>
  </div>
  <div>
    <p>Total Units</p>
    <p>{filteredFaculty.reduce((sum, f) => sum + (f.totalUnits || 0), 0)}</p>
  </div>
  <div>
    <p>Total Subjects</p>
    <p>{filteredFaculty.reduce((sum, f) => sum + (f.totalSubjects || 0), 0)}</p>
  </div>
  <div>
    <p>Average Load</p>
    <p>{Math.round(average)}%</p>
  </div>
</div>
```

---

## Table Layout

### **Teaching Load Table**

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Faculty                  │ Designation  │ Total │ Max  │ Load %        │ Subjects │ Status     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 👤 John M. Doe          │ Professor    │ 18    │ 21   │ ████████░░ 86%│ 6        │ High       │
│    john@example.com      │              │ units │ units│               │          │            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 👤 Jane A. Smith        │ Asst Prof    │ 15    │ 21   │ ██████░░░░ 71%│ 5        │ Moderate   │
│    jane@example.com      │              │ units │ units│               │          │            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 👤 Bob K. Johnson       │ Instructor   │ 12    │ 21   │ ████░░░░░░ 57%│ 4        │ Light      │
│    bob@example.com       │              │ units │ units│               │          │            │
└────────────────────────────────────────────────────────────────────────────────────────┘

Summary:
Total Faculty: 3  │  Total Units: 45  │  Total Subjects: 15  │  Average Load: 71%
```

---

## Load Status Indicators

### **Status Badges**

| Load Percentage | Status | Color | Badge |
|----------------|--------|-------|-------|
| 100%+ | Overloaded | Red | 🔴 Overloaded |
| 80-99% | High | Yellow | 🟡 High |
| 60-79% | Moderate | Blue | 🔵 Moderate |
| 0-59% | Light | Green | 🟢 Light |

### **Progress Bars**

```typescript
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className={`h-2 rounded-full ${getLoadBarColor(loadPercentage)}`}
    style={{ width: `${Math.min(loadPercentage, 100)}%` }}
  ></div>
</div>
```

---

## Example Data

### **API Response** (`/user/faculty/with-load`)

```json
[
  {
    "id": 7,
    "firstname": "Josiel Mark",
    "lastname": "Seroy",
    "middleInitial": "M",
    "email": "programhead@gmail.com",
    "designation": "Program Head",
    "department": "BSCS",
    "role": "DEPARTMENT_HEAD",
    "status": "APPROVED",
    "specialization": ["Cloud Computing", "Network Security"],
    "totalUnits": 18,
    "maxUnits": 21,
    "totalSubjects": 6,
    "currentSemesterLoad": 18,
    "image": null
  }
]
```

### **Displayed in Table**

| Faculty | Designation | Total Units | Max Units | Load % | Subjects | Status |
|---------|-------------|-------------|-----------|--------|----------|--------|
| 👤 Josiel Mark M. Seroy<br>programhead@gmail.com | Program Head | 18 units | 21 units | ████████░░ 86% | 📚 6 | 🟡 High |

---

## Search Functionality

### **Search Fields**
- First name
- Last name
- Email

### **Example**
```typescript
const filteredFaculty = faculty.filter(member => {
  const fullName = `${member.firstname} ${member.lastname}`.toLowerCase();
  const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                       member.email.toLowerCase().includes(searchTerm.toLowerCase());
  
  return matchesSearch;
});
```

---

## Export CSV Feature

### **CSV Format**

```csv
Name,Email,Designation,Total Units,Max Units,Load %,Total Subjects
Josiel Mark M. Seroy,programhead@gmail.com,Program Head,18,21,86,6
John M. Doe,john@example.com,Professor,15,21,71,5
Jane A. Smith,jane@example.com,Assistant Professor,12,21,57,4
```

### **File Name**
```
teaching-load-BSCS-2025-10-13.csv
```

---

## Department Filtering

### **Filter Logic**

```
1. Department Head logs in
   - userData.department = "BSCS"
    ↓
2. Fetch all faculty with load
   - GET /user/faculty/with-load
    ↓
3. Filter by department
   - user.status === 'APPROVED'
   - user.department === 'BSCS'
    ↓
4. Display only BSCS faculty teaching load
```

---

## Summary Statistics

### **Calculations**

**Total Faculty**:
```typescript
filteredFaculty.length
```

**Total Units**:
```typescript
filteredFaculty.reduce((sum, f) => sum + (f.totalUnits || 0), 0)
```

**Total Subjects**:
```typescript
filteredFaculty.reduce((sum, f) => sum + (f.totalSubjects || 0), 0)
```

**Average Load**:
```typescript
Math.round(
  filteredFaculty.reduce((sum, f) => 
    sum + getLoadPercentage(f.totalUnits, f.maxUnits), 0
  ) / filteredFaculty.length
)
```

---

## Loading & Empty States

### **Loading State**
```typescript
{isLoading ? (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p className="mt-4 text-gray-600">Loading teaching load...</p>
  </div>
) : (
  // Table content
)}
```

### **Empty State**
```typescript
{filteredFaculty.length === 0 && !isLoading && (
  <div className="text-center py-12">
    <User className="mx-auto h-12 w-12 text-gray-400" />
    <h3>No faculty found</h3>
    <p>
      {searchTerm 
        ? 'Try adjusting your search criteria.' 
        : `No faculty members in ${userData?.department} department.`}
    </p>
  </div>
)}
```

---

## Comparison

### **Before (Mock Data)**
- ❌ Used hardcoded mock data
- ❌ Complex schedule grid view
- ❌ Showed all departments
- ❌ No export functionality
- ❌ Overly complicated UI

### **After (Real Data)**
- ✅ Fetches from API
- ✅ Clean table view
- ✅ Filters by department
- ✅ CSV export
- ✅ Simple, clear UI
- ✅ Summary statistics
- ✅ User images
- ✅ Progress bars

---

## Files Modified

1. ✅ **`DepartmentHead/TeachingLoad/TeachingLoad.tsx`** - Complete rewrite
   - Real API data
   - Department filtering
   - Clean table layout
   - Export to CSV
   - Summary statistics
   - Loading/empty states

---

## Testing

### **Test Case 1: BSCS Department Head**
1. Login as Josiel Mark Seroy (BSCS)
2. Navigate to Teaching Load
3. **Expected**: Only BSCS faculty with their teaching load

### **Test Case 2: Search**
1. Enter faculty name in search
2. **Expected**: Filtered results

### **Test Case 3: Export CSV**
1. Click "Export CSV" button
2. **Expected**: CSV file downloaded with teaching load data

### **Test Case 4: Empty Department**
1. Login as department head with no faculty
2. **Expected**: "No faculty found" message

### **Test Case 5: Load Status**
1. Check faculty with different load percentages
2. **Expected**: 
   - 100%+ → Red "Overloaded"
   - 80-99% → Yellow "High"
   - 60-79% → Blue "Moderate"
   - 0-59% → Green "Light"

---

## Summary

### **Implementation**
- ✅ Real data from `/user/faculty/with-load`
- ✅ Department filtering
- ✅ Clean table layout
- ✅ Progress bars for visual load indication
- ✅ Status badges (Light/Moderate/High/Overloaded)
- ✅ User images
- ✅ Export to CSV
- ✅ Summary statistics
- ✅ Search functionality
- ✅ Loading and empty states

### **Result**
- **Department Head** sees only their department's faculty teaching load
- **Clear visualization** of workload distribution
- **Easy export** for reporting
- **Summary statistics** for quick overview
- **Professional UI** with progress indicators

Department Head Teaching Load now displays real data with department filtering! 🎉
