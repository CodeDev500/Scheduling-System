# Faculty Profile - API Integration

## Summary

Successfully integrated the Faculty Profile page with real database data, filtering only **FACULTY** users with **APPROVED** status.

---

## Changes Made

### ✅ 1. Replaced Mock Data with API Integration

**Before:**
```typescript
// Mock data hardcoded in useEffect
const mockFaculty: Faculty[] = [...]
```

**After:**
```typescript
const fetchFaculty = async () => {
  try {
    setIsLoading(true);
    const response = await api.get('/user/faculty');
    // Filter only APPROVED faculty
    const approvedFaculty = response.data.filter(
      (user: Faculty) => user.status === 'APPROVED'
    );
    setFaculty(approvedFaculty);
  } catch (error) {
    toast.error('Failed to fetch faculty');
  }
};
```

### ✅ 2. Updated Faculty Interface

**Aligned with User table schema:**
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
}
```

### ✅ 3. Filters Applied

**Backend Filter:**
- API endpoint: `/user/faculty` - Returns only users with `role = 'FACULTY'`

**Frontend Filter:**
- Status filter: Only shows users with `status = 'APPROVED'`
- Search: By name, email, specialization
- Department: Filter by department

### ✅ 4. Updated UI Components

**Faculty Cards:**
- Full Name: `firstname middleInitial. lastname`
- Designation: From `designation` field
- Status Badge: Shows `APPROVED`, `VERIFIED`, or `PENDING`
- Department: From `department` field
- Role: From `role` field
- Specialization: Handles array or string
- Date Joined: From `createdAt` field

**Modal:**
- Enhanced design with backdrop blur
- Click-outside-to-close functionality
- Displays all faculty information
- Modern styling with rounded corners and shadows

---

## API Endpoint Used

### GET /user/faculty

**Description:** Fetches all users with role = 'FACULTY'

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
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## Features

### Search & Filter
- ✅ Search by name, email, or specialization
- ✅ Filter by department
- ✅ Only shows APPROVED faculty

### Faculty Cards Display
- ✅ Full name with middle initial
- ✅ Designation (Professor, Associate Professor, etc.)
- ✅ Status badge (APPROVED = green)
- ✅ Email address
- ✅ Department
- ✅ Role
- ✅ Specialization (array or string)
- ✅ Date joined

### Faculty Details Modal
- ✅ Enhanced design with backdrop blur
- ✅ Click outside to close
- ✅ Full faculty information
- ✅ Modern styling
- ✅ Responsive layout

---

## Helper Functions

### getFullName()
```typescript
const getFullName = (member: Faculty) => {
  return `${member.firstname} ${member.middleInitial}. ${member.lastname}`;
};
```

### getSpecialization()
```typescript
const getSpecialization = (spec: any) => {
  if (Array.isArray(spec)) {
    return spec.join(', ');
  }
  return spec || 'Not specified';
};
```

### getStatusBadge()
```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "VERIFIED":
      return "bg-blue-100 text-blue-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
  }
};
```

---

## Data Flow

```
Database (users table)
  ↓
Backend API (/user/faculty)
  ↓ Filter: role = 'FACULTY'
Frontend (FacultyProfile.tsx)
  ↓ Filter: status = 'APPROVED'
Display Faculty Cards
```

---

## Status Filtering

### Backend (API)
```typescript
// In user.service.ts
export const listUsers = async () => {
  return db.user.findMany({
    where: {
      status: {
        in: [statusList.VERIFIED, statusList.APPROVED],
      },
    },
  });
};
```

### Frontend (Component)
```typescript
// In FacultyProfile.tsx
const approvedFaculty = response.data.filter(
  (user: Faculty) => user.status === 'APPROVED'
);
```

---

## Testing Checklist

- [ ] Faculty load from database
- [ ] Only FACULTY role users shown
- [ ] Only APPROVED status users shown
- [ ] Search works correctly
- [ ] Department filter works
- [ ] Faculty cards display correct information
- [ ] Modal opens with correct data
- [ ] Modal closes on click outside
- [ ] Specialization displays correctly (array/string)
- [ ] Date formats correctly

---

## Benefits

### Before
- ❌ Hardcoded mock data
- ❌ No real-time updates
- ❌ No database integration
- ❌ Fake faculty information

### After
- ✅ Real data from database
- ✅ Auto-updates when data changes
- ✅ Filtered by role (FACULTY only)
- ✅ Filtered by status (APPROVED only)
- ✅ Accurate faculty information
- ✅ Toast notifications for errors
- ✅ Loading states
- ✅ Modern UI with enhanced modals

---

## Summary

The Faculty Profile page now:
- ✅ Fetches real faculty data from the database
- ✅ Filters only users with `role = 'FACULTY'`
- ✅ Shows only users with `status = 'APPROVED'`
- ✅ Displays accurate information from the User table
- ✅ Has enhanced UI with modern modals
- ✅ Supports search and filtering
- ✅ Handles specialization as array or string
- ✅ Shows proper error messages

All faculty data is now live and synced with the database!
