# Department Head Faculty Profile - Department Filtering

## Summary
Updated the Department Head Faculty Profile page to:
1. **Filter faculty by department** - Only shows faculty from the logged-in department head's department
2. **Updated design** - Matches the CampusAdmin FacultyProfile design with user images
3. **Real API data** - Fetches from `/user/faculty/with-load` endpoint

---

## Changes Made

### **Key Features**

#### **1. Department Filtering**
```typescript
const fetchFaculty = async () => {
  try {
    setIsLoading(true);
    const response = await api.get('/user/faculty/with-load');
    
    // ✅ Filter only APPROVED faculty from the same department
    const departmentFaculty = response.data.filter((user: Faculty) => 
      user.status === 'APPROVED' && user.department === userData?.department
    );
    
    setFaculty(departmentFaculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    toast.error('Failed to fetch faculty');
  } finally {
    setIsLoading(false);
  }
};
```

#### **2. Department Header**
```typescript
<div>
  <h2 className="text-lg font-semibold text-gray-900">
    {userData?.department} Faculty
  </h2>
  <p className="text-sm text-gray-500 mt-1">
    {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
  </p>
</div>
```

#### **3. User Images**
```typescript
<div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
  {member.image ? (
    <img
      src={member.image.startsWith('http') ? member.image : `${api.defaults.baseURL}/${member.image}`}
      alt={getFullName(member)}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
      <User className="w-6 h-6 text-white" />
    </div>
  )}
</div>
```

---

## How It Works

### **Filtering Logic**

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
4. Display only BSCS faculty
   - Shows: Josiel Mark Seroy (BSCS)
   - Hides: Other departments
```

### **Example Data**

**Logged-in User** (Department Head):
```json
{
  "id": 7,
  "firstname": "Josiel Mark",
  "lastname": "Seroy",
  "department": "BSCS",
  "role": "DEPARTMENT_HEAD"
}
```

**Faculty List** (Before Filter):
```json
[
  { "id": 1, "name": "John Doe", "department": "BSCS", "status": "APPROVED" },
  { "id": 2, "name": "Jane Smith", "department": "BSED", "status": "APPROVED" },
  { "id": 3, "name": "Bob Johnson", "department": "BSCS", "status": "APPROVED" }
]
```

**Faculty List** (After Filter):
```json
[
  { "id": 1, "name": "John Doe", "department": "BSCS", "status": "APPROVED" },
  { "id": 3, "name": "Bob Johnson", "department": "BSCS", "status": "APPROVED" }
]
```

**Result**: Only shows 2 BSCS faculty members ✅

---

## Design Features

### **Faculty Cards**

```
┌─────────────────────────────────────────┐
│ 👤 Josiel Mark M. Seroy    [APPROVED]  │
│    Program Head                         │
│                                         │
│ 📧 programhead@gmail.com                │
│ 📍 BSCS                                 │
│ 👤 DEPARTMENT_HEAD                      │
│                                         │
│ Specialization:                         │
│ Cloud Computing, Network Security...    │
│                                         │
│ Teaching Load: 18/21 units (86%)        │
│ ████████████████░░░░                    │
│                                         │
│ 📚 6 subjects    📅 Since 2025          │
│                                         │
│ [View Details]                          │
└─────────────────────────────────────────┘
```

### **Features**:
- ✅ **User image** or fallback icon
- ✅ **Full name** with middle initial
- ✅ **Designation** and **status badge**
- ✅ **Contact info** (email, department, role)
- ✅ **Specialization** list
- ✅ **Teaching load** with progress bar
- ✅ **Subject count** and **join year**
- ✅ **View Details** button

---

## Comparison

### **Before (Mock Data)**
- ❌ Used mock/hardcoded data
- ❌ Showed all departments
- ❌ No department filtering
- ❌ Different design
- ❌ No user images

### **After (Real Data + Filter)**
- ✅ Fetches from API
- ✅ Shows only department faculty
- ✅ Filters by logged-in user's department
- ✅ Matches CampusAdmin design
- ✅ Displays user images

---

## Route Configuration

### **Department Head Dashboard**
```typescript
// Quick Action Button
<button onClick={() => navigate('/department-head-faculty')}>
  <Users className="w-8 h-8 text-blue-500 mb-2" />
  <h3>Faculty Profiles</h3>
  <p>View faculty members</p>
</button>
```

### **Navigation**
```
/department-head-faculty → FacultyProfile Component
```

---

## API Endpoint

### **GET /user/faculty/with-load**

**Response**:
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
    "specialization": ["Cloud Computing", "Network Security", "DevOps", "Distributed Systems"],
    "image": null,
    "totalUnits": 18,
    "maxUnits": 21,
    "totalSubjects": 6,
    "currentSemesterLoad": 18,
    "createdAt": "2025-10-09T13:21:02.526Z",
    "updatedAt": "2025-10-09T13:21:02.526Z"
  }
]
```

---

## Search Functionality

### **Search Fields**
- First name
- Last name
- Email
- Specialization

### **Example**
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
  
  return matchesSearch;
});
```

---

## Modal Details

### **Faculty Details Modal**

**Sections**:
1. **Basic Information**
   - Full Name
   - Designation
   - Department
   - Role
   - Status
   - Date Joined

2. **Contact Information**
   - Email

3. **Specialization**
   - List of specializations

4. **Teaching Load**
   - Total Units
   - Maximum Units
   - Total Subjects
   - Hours/Week
   - Load Percentage with progress bar

---

## Empty States

### **No Faculty Found**
```typescript
{filteredFaculty.length === 0 && !isLoading && (
  <div className="text-center py-12">
    <User className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No faculty found</h3>
    <p className="mt-1 text-sm text-gray-500">
      {searchTerm 
        ? 'Try adjusting your search criteria.' 
        : `No faculty members in ${userData?.department} department.`}
    </p>
  </div>
)}
```

---

## Loading State

```typescript
{isLoading ? (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p className="mt-4 text-gray-600">Loading faculty...</p>
  </div>
) : (
  // Faculty grid
)}
```

---

## Files Modified

1. ✅ **`DepartmentHead/FacultyProfile/FacultyProfile.tsx`** - Complete rewrite
   - Added department filtering
   - Updated to match CampusAdmin design
   - Added user images
   - Fetches real API data
   - Added loading states
   - Added empty states

---

## Testing

### **Test Case 1: BSCS Department Head**
1. Login as Josiel Mark Seroy (BSCS)
2. Navigate to Faculty Profiles
3. **Expected**: Only BSCS faculty displayed

### **Test Case 2: BSED Department Head**
1. Login as BSED department head
2. Navigate to Faculty Profiles
3. **Expected**: Only BSED faculty displayed

### **Test Case 3: Search**
1. Enter faculty name in search
2. **Expected**: Filtered results

### **Test Case 4: View Details**
1. Click "View Details" on a faculty card
2. **Expected**: Modal opens with full details

### **Test Case 5: Empty Department**
1. Login as department head with no faculty
2. **Expected**: "No faculty found" message

---

## Summary

### **Implementation**
- ✅ Department filtering based on logged-in user
- ✅ Real API data from `/user/faculty/with-load`
- ✅ Updated design matching CampusAdmin
- ✅ User images with fallback icons
- ✅ Search functionality
- ✅ Loading and empty states
- ✅ Faculty details modal

### **Result**
- **Department Head** sees only their department's faculty
- **Clean, modern UI** with user images
- **Consistent design** across admin and department head views
- **Real-time data** from database

Department Head Faculty Profile now filters by department and displays beautifully! 🎉
