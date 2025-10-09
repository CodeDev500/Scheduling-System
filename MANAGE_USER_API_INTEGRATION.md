# Manage User - API Integration & Approve Button

## Overview
Updated the Manage User page to fetch real users from the server API and added an **Approve** button to change user status from PENDING to APPROVED.

---

## Changes Made

### 1. **Fetch Users from API**

**Before:** Used mock/hardcoded data
**After:** Fetches real users from `/user` endpoint

```typescript
const fetchUsers = async () => {
  try {
    setIsLoading(true);
    const response = await api.get('/user');
    setUsers(response.data);
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users');
  } finally {
    setIsLoading(false);
  }
};
```

### 2. **Updated User Interface**

Aligned with Prisma schema (`model User`):

```typescript
interface User {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  role: string;
  designation: string;
  department: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
  image?: string;
  specialization?: any;
}
```

### 3. **Added Approve Button**

New button appears **only for PENDING users**:

```typescript
{user.status === 'PENDING' && (
  <button
    onClick={() => handleApproveUser(user.id)}
    className="text-green-600 hover:text-green-900 p-1 rounded"
    title="Approve User"
  >
    <CheckCircle className="h-4 w-4" />
  </button>
)}
```

**Handler Function:**
```typescript
const handleApproveUser = async (userId: number) => {
  try {
    await api.put(`/user/${userId}`, { status: 'APPROVED' });
    toast.success('User approved successfully');
    fetchUsers();
  } catch (error) {
    console.error('Error approving user:', error);
    toast.error('Failed to approve user');
  }
};
```

### 4. **Updated Status Badges**

Matches Prisma enum values:

```typescript
const getStatusBadge = (status: string) => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  switch (status) {
    case 'APPROVED':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'VERIFIED':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'PENDING':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};
```

### 5. **Updated API Calls**

All user operations now use real API endpoints:

- **Fetch Users:** `GET /user`
- **Delete User:** `DELETE /user/:id`
- **Update Status:** `PUT /user/:id` with `{ status: 'APPROVED' }`
- **Approve User:** `PUT /user/:id` with `{ status: 'APPROVED' }`

### 6. **Updated Display Fields**

- **Name:** Shows `firstname middleInitial. lastname`
- **Date Created:** Shows formatted `createdAt` date
- **Designation:** Added to view modal
- **Last Updated:** Shows formatted `updatedAt` date

---

## User Actions

### Action Buttons in Table

| Button | Icon | Color | Action | Condition |
|--------|------|-------|--------|-----------|
| **View** | Eye | Blue | View user details | Always |
| **Edit** | Edit | Indigo | Edit user info | Always |
| **Approve** | CheckCircle | Green | Approve user (PENDING → APPROVED) | Only if status = PENDING |
| **Toggle Status** | UserCheck/UserX | Green/Red | Toggle between APPROVED/PENDING | Always |
| **Delete** | Trash2 | Red | Delete user | Always |

---

## Status Flow

```
PENDING → [Approve Button] → APPROVED
   ↓                            ↓
   ↓      [Toggle Status]       ↓
   ↓ ←──────────────────────────↓
```

### Status Descriptions

1. **PENDING** (Yellow Badge)
   - New user registration
   - Waiting for admin approval
   - **Approve button visible**

2. **VERIFIED** (Blue Badge)
   - Email verified
   - Not yet approved

3. **APPROVED** (Green Badge)
   - Fully approved user
   - Can access the system
   - **Approve button hidden**

---

## API Endpoints Used

### GET /user
Fetches all users from the database.

**Response:**
```json
[
  {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "middleInitial": "M",
    "email": "john.doe@example.com",
    "role": "FACULTY",
    "designation": "Professor",
    "department": "Computer Science",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### PUT /user/:id
Updates user information (including status).

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

### DELETE /user/:id
Deletes a user from the database.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## UI Features

### Search Functionality
Search users by:
- Full name (firstname + lastname)
- Email
- Role
- Department

### Status Badges
- **APPROVED:** Green badge
- **VERIFIED:** Blue badge
- **PENDING:** Yellow badge

### Toast Notifications
- ✅ Success: "User approved successfully"
- ✅ Success: "User deleted successfully"
- ✅ Success: "User status updated to APPROVED"
- ❌ Error: "Failed to fetch users"
- ❌ Error: "Failed to approve user"
- ❌ Error: "Failed to delete user"

---

## Example Usage

### Scenario 1: Approve Pending User

1. Admin sees user with **PENDING** status (yellow badge)
2. **Approve button** (green CheckCircle icon) is visible
3. Admin clicks **Approve** button
4. API call: `PUT /user/1` with `{ status: 'APPROVED' }`
5. Toast: "User approved successfully"
6. User list refreshes
7. User now shows **APPROVED** status (green badge)
8. **Approve button disappears**

### Scenario 2: Toggle User Status

1. Admin sees user with **APPROVED** status
2. Admin clicks **Toggle Status** button (red UserX icon)
3. API call: `PUT /user/1` with `{ status: 'PENDING' }`
4. Toast: "User status updated to PENDING"
5. User now shows **PENDING** status
6. **Approve button appears**

### Scenario 3: Delete User

1. Admin clicks **Delete** button (red Trash2 icon)
2. Confirmation dialog: "Are you sure you want to delete this user?"
3. Admin confirms
4. API call: `DELETE /user/1`
5. Toast: "User deleted successfully"
6. User list refreshes
7. User removed from table

---

## Testing Checklist

- [ ] Users load from API on page mount
- [ ] Search filters users correctly
- [ ] Approve button only shows for PENDING users
- [ ] Approve button changes status to APPROVED
- [ ] Approve button disappears after approval
- [ ] Toggle status works correctly
- [ ] Delete user works with confirmation
- [ ] Status badges display correct colors
- [ ] Toast notifications appear for all actions
- [ ] View modal shows correct user details
- [ ] Date fields format correctly

---

## Summary

The Manage User page now:
- ✅ Fetches real users from the server
- ✅ Displays users with correct schema fields
- ✅ Has an **Approve** button for PENDING users
- ✅ Updates user status to APPROVED via API
- ✅ Shows/hides approve button based on status
- ✅ Provides toast notifications for all actions
- ✅ Refreshes user list after each action

All user management operations are now integrated with the backend API!
