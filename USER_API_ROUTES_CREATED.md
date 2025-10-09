# User API Routes - Created & Updated

## Problem Fixed
The frontend was getting a **404 error** when trying to fetch users because the `/user` route didn't exist.

**Error:** `Cannot GET /user`

## Solution
Added missing routes and controller functions to handle user management operations.

---

## API Endpoints Created

### 1. **GET /user**
Fetch all users from the database.

**Controller:** `getAllUsers`
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
    "updatedAt": "2024-01-15T10:30:00Z",
    "image": null,
    "specialization": null
  }
]
```

### 2. **PUT /user/:id**
Update user information (including status).

**Controller:** `updateUser`
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
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "status": "APPROVED",
    ...
  }
}
```

### 3. **DELETE /user/:id**
Delete a user from the database.

**Controller:** `deleteUser`
**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Existing Routes (Already Working)

### 4. **GET /user/id/:id**
Get user by ID.

### 5. **GET /user/faculty**
Get all faculty members.

### 6. **GET /user/faculty/department/:department**
Get faculty by department.

### 7. **GET /user/instructor**
Get all instructors (Faculty, Department Head, Campus Admin with APPROVED status).

---

## Files Modified

### 1. **user.controller.ts**
Added three new controller functions:

```typescript
// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.listUsers();
    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user (including status)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedUser = await UserService.updateUser(parseInt(id), updateData);
    
    res.status(200).json({ 
      success: true, 
      message: 'User updated successfully',
      data: updatedUser 
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update user" 
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await UserService.deleteUser(parseInt(id));
    
    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete user" 
    });
  }
};
```

### 2. **user.router.ts**
Added three new routes:

```typescript
// Get all users
router.get("/", UserController.getAllUsers);

// Update user (including status)
router.put("/:id", UserController.updateUser);

// Delete user
router.delete("/:id", UserController.deleteUser);
```

---

## Complete Route List

| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| **GET** | `/user` | **Get all users** | `getAllUsers` |
| GET | `/user/id/:id` | Get user by ID | `getUserById` |
| GET | `/user/faculty` | Get all faculty | `getAllFaculty` |
| GET | `/user/faculty/department/:department` | Get faculty by department | `getFacultyByDepartment` |
| GET | `/user/instructor` | Get all instructors | `getInstructor` |
| **PUT** | `/user/:id` | **Update user** | `updateUser` |
| **DELETE** | `/user/:id` | **Delete user** | `deleteUser` |

---

## Service Functions Used

All controller functions use existing service functions from `user.service.ts`:

- `listUsers()` - Get all users
- `getUserById(id)` - Get user by ID
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user
- `getFacultyByDepartment(department)` - Get faculty by department
- `getInstructors()` - Get instructors

---

## Testing

### Test GET /user
```bash
curl http://localhost:3001/user
```

### Test PUT /user/:id (Approve User)
```bash
curl -X PUT http://localhost:3001/user/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

### Test DELETE /user/:id
```bash
curl -X DELETE http://localhost:3001/user/1
```

---

## Server Restart

Since you're running `npm run dev` with **nodemon**, the server should automatically restart and pick up the new routes.

If not, restart manually:
```bash
cd server
npm run dev
```

---

## Expected Result

✅ **GET /user** now returns all users  
✅ **PUT /user/:id** updates user status  
✅ **DELETE /user/:id** deletes user  
✅ Frontend Manage User page now works correctly  
✅ Approve button updates status to APPROVED  
✅ Delete button removes user from database  

---

## Summary

The user API routes are now complete:
- ✅ Added `GET /user` to fetch all users
- ✅ Added `PUT /user/:id` to update users (including status)
- ✅ Added `DELETE /user/:id` to delete users
- ✅ All routes use existing service functions
- ✅ Error handling and logging included
- ✅ Server will auto-restart with nodemon

The 404 error is now fixed and the Manage User page will work correctly!
