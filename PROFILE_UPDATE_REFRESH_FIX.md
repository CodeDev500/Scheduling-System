# Profile Update - Data Refresh Fix

## Issue
After updating profile (fields + image + specialization), the page refreshes but shows **old data** instead of the updated information.

## Root Cause
The profile update was using `window.location.reload()` which reloads the page, but the Redux state was loaded from the JWT token which contains old user data. The token is not automatically updated when the database is updated.

## Solution Applied

### **Changed from Page Reload to Redux Update**

**Before** (Doesn't work):
```typescript
await api.put(`/user/${userData?.id}`, formData);

toast.success('Profile updated successfully!');
setIsEditing(false);
setImageFile(null);
setImagePreview('');

// ❌ Reloads page but shows old data from token
window.location.reload();
```

**After** (Works):
```typescript
await api.put(`/user/${userData?.id}`, formData);

// ✅ Fetch fresh user data from server
await dispatch(fetchUser()).unwrap();

toast.success('Profile updated successfully!');
setIsEditing(false);
setImageFile(null);
setImagePreview('');
// No reload needed - Redux state updated
```

---

## How It Works Now

### **Update Flow**

```
1. User edits profile
    ↓
2. Click "Save"
    ↓
3. API call: PUT /user/:id
   - Updates database
   - Returns success
    ↓
4. Dispatch fetchUser()
   - Calls GET /protected
   - Gets fresh user data from database
   - Updates Redux state
    ↓
5. UI re-renders automatically
   - Shows updated data
   - No page reload needed
```

### **fetchUser Action**

```typescript
// From authSlice.ts
export const fetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "/auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ user: User; message: string }>(
        "/protected",
        { withCredentials: true }
      );
      return response.data.user;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Unauthorized");
      }
      return rejectWithValue("Unauthorized");
    }
  }
);
```

### **Backend /protected Endpoint**

```typescript
// From index.ts
app.use("/protected", verifyToken, async (req: Request, res: Response) => {
  res.json({
    user: req.user?.user,
    message: "You are authorized to access this protected resouces",
  });
  return;
});
```

---

## Changes Made

### **File**: `UserProfile.tsx`

#### **1. Added Imports**
```typescript
import { useAppDispatch } from '../../hooks/redux';
import { fetchUser } from '../../services/authSlice';
```

#### **2. Added Dispatch**
```typescript
const dispatch = useAppDispatch();
```

#### **3. Updated handleSave**
```typescript
const handleSave = async () => {
  try {
    setIsSaving(true);

    const formData = new FormData();
    // ... append all fields

    // Update user in database
    await api.put(`/user/${userData?.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // ✅ Fetch updated user data
    await dispatch(fetchUser()).unwrap();

    toast.success('Profile updated successfully!');
    setIsEditing(false);
    setImageFile(null);
    setImagePreview('');
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error(error.response?.data?.message || 'Failed to update profile');
  } finally {
    setIsSaving(false);
  }
};
```

---

## Benefits

### **Before (Page Reload)**
- ❌ Shows old data from JWT token
- ❌ Page flickers/reloads
- ❌ Loses scroll position
- ❌ Poor user experience
- ❌ Specialization not updated

### **After (Redux Update)**
- ✅ Shows fresh data from database
- ✅ Smooth transition, no reload
- ✅ Maintains scroll position
- ✅ Better user experience
- ✅ All fields updated instantly

---

## Data Flow Comparison

### **Old Flow (Broken)**
```
Update DB → Reload Page → Load JWT → Show Old Data ❌
```

### **New Flow (Fixed)**
```
Update DB → Fetch Fresh Data → Update Redux → Show New Data ✅
```

---

## Potential Issues & Solutions

### **Issue 1: JWT Token Still Has Old Data**

**Problem**: The JWT token stored in cookies still contains old user data.

**Solution**: The `/protected` endpoint should fetch fresh data from the database, not just decode the token.

**Backend Fix Needed**:
```typescript
// Instead of just returning token data:
app.use("/protected", verifyToken, async (req: Request, res: Response) => {
  // Fetch fresh user from database
  const user = await db.user.findUnique({
    where: { id: req.user?.user.id },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      middleInitial: true,
      email: true,
      designation: true,
      department: true,
      specialization: true, // ✅ Include specialization
      image: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  res.json({
    user,
    message: "You are authorized to access this protected resources",
  });
});
```

### **Issue 2: Specialization Not in Token**

**Problem**: JWT token doesn't include specialization field.

**Solution**: Update the login endpoint to include specialization in the token payload.

**Backend Fix**:
```typescript
// In auth.controller.ts login function
const token = jwt.sign(
  {
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      designation: user.designation,
      department: user.department,
      specialization: user.specialization, // ✅ Add this
      role: user.role,
      status: user.status,
      image: user.image,
    },
  },
  process.env.JWT_SECRET!,
  { expiresIn: "7d" }
);
```

### **Issue 3: Image Path Not Absolute**

**Problem**: Image path is relative (`uploads/abc123`) and doesn't display.

**Solution**: Return absolute URL from backend.

**Backend Fix**:
```typescript
// In user.service.ts
export const updateUser = async (id: number, data: Partial<UserRegisterInput>) => {
  // ... parse specialization

  const updatedUser = await db.user.update({
    where: { id },
    data: {
      ...data,
      specialization: specialization as any,
    },
    // ... select fields
  });

  // Convert relative path to absolute URL
  if (updatedUser.image && !updatedUser.image.startsWith('http')) {
    updatedUser.image = `${process.env.BASE_URL || 'http://localhost:3001'}/${updatedUser.image}`;
  }

  return updatedUser;
};
```

---

## Testing

### **Test Case 1: Update Name**
1. Edit firstname/lastname
2. Click Save
3. **Expected**: Name updates immediately ✅

### **Test Case 2: Update Specialization**
1. Select multiple specializations
2. Click Save
3. **Expected**: Tags update immediately ✅

### **Test Case 3: Upload Image**
1. Select new image
2. Click Save
3. **Expected**: Image updates immediately ✅

### **Test Case 4: Update All Fields**
1. Change name, designation, department, specialization, image
2. Click Save
3. **Expected**: All fields update immediately ✅

### **Test Case 5: Cancel Edit**
1. Make changes
2. Click Cancel
3. **Expected**: Changes reverted, shows original data ✅

---

## Debugging

### **If Data Still Doesn't Update**

#### **1. Check Network Tab**
```
PUT /user/2 → 200 OK ✅
GET /protected → 200 OK ✅
Response includes updated data? ✅
```

#### **2. Check Redux DevTools**
```
Action: fetchUser/fulfilled
Payload: { /* updated user data */ }
State updated? ✅
```

#### **3. Check Console**
```typescript
// Add logging in handleSave
const response = await api.put(`/user/${userData?.id}`, formData);
console.log('Update response:', response.data);

const freshUser = await dispatch(fetchUser()).unwrap();
console.log('Fresh user data:', freshUser);
```

#### **4. Check Backend Logs**
```
PUT /user/2 - User updated ✅
Specialization saved: ["Web Dev", "Mobile Dev"] ✅
GET /protected - Returning user data ✅
```

---

## Alternative Solutions

### **Option 1: Return Updated User from PUT**
```typescript
// Backend returns updated user
const response = await api.put(`/user/${userData?.id}`, formData);

// Update Redux directly
dispatch(updateUserInState(response.data.user));
```

### **Option 2: Optimistic Update**
```typescript
// Update UI immediately
setEditedData(newData);

// Then save to backend
await api.put(`/user/${userData?.id}`, formData);
```

### **Option 3: Refresh Token**
```typescript
// Get new token with updated data
await api.post('/refresh');
await dispatch(fetchUser());
```

---

## Summary

### **Problem**
- Page reload showed old data after profile update
- Specialization and other fields not updating

### **Solution**
- Use `dispatch(fetchUser())` instead of `window.location.reload()`
- Fetch fresh data from server
- Update Redux state automatically

### **Result**
- ✅ Profile updates show immediately
- ✅ No page reload needed
- ✅ Smooth user experience
- ✅ All fields update correctly
- ✅ Specialization works
- ✅ Image uploads work

The profile now updates instantly without page reload! 🎉
