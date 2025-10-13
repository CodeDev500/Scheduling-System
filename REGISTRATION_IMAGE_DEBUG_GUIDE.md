# Registration Image Upload - Debugging Guide

## Issue
Image uploaded during registration is not being saved with the `uploads/` prefix in the database.

## Current Implementation

### **Backend** (`auth.controller.ts`)
```typescript
let newFilename: null | string = null;
if (req.file) {
  console.log('File received:', req.file);
  let filetype: string = req.file.mimetype.split("/")[1];
  newFilename = req.file.filename + "." + filetype;

  fs.renameSync(
    `./uploads/${req.file.filename}`,
    `./uploads/${newFilename}`
  );
  userRequest.image = `uploads/${newFilename}`;  // ✅ Should save with prefix
  console.log('Image path set to:', userRequest.image);
} else {
  console.log('No file received in request');
}
```

### **Frontend** (`Register.tsx`)
```typescript
const formData = new FormData();
for (const key in form) {
  const value = form[key as keyof typeof form];
  if (value !== null) {
    if (key === 'specialization' && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      if (value instanceof File) {
        console.log('Appending file:', key, value);
        formData.append(key, value);  // ✅ Should send file
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    }
  }
}

// Debug logging
console.log('FormData contents:');
for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}

await dispatch(register(formData)).unwrap();
```

---

## Debugging Steps

### **Step 1: Check Frontend Console**

When you submit the registration form, check the browser console for:

```
Appending file: image File {name: "profile.jpg", size: 12345, ...}

FormData contents:
firstname John
lastname Doe
email john@example.com
image File {name: "profile.jpg", ...}
...
```

**Expected**:
- ✅ `image` field should be a File object
- ✅ File should have name, size, type

**If NOT showing**:
- ❌ Image not being set in form state
- ❌ Check Profile component

---

### **Step 2: Check Backend Console**

When the request reaches the server, check the terminal for:

```
File received: {
  fieldname: 'image',
  originalname: 'profile.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './uploads',
  filename: 'abc123',
  path: 'uploads/abc123',
  size: 12345
}
Image path set to: uploads/abc123.jpeg
```

**Expected**:
- ✅ `req.file` should be defined
- ✅ Image path should include `uploads/` prefix

**If showing "No file received in request"**:
- ❌ Multer not receiving file
- ❌ Check multer configuration
- ❌ Check route middleware

---

### **Step 3: Check Database**

After registration, check the database:

```sql
SELECT id, firstname, lastname, email, image FROM users WHERE email = 'john@example.com';
```

**Expected**:
```
id: 12
image: "uploads/abc123.jpeg"  ✅
```

**If showing**:
```
image: "abc123.jpeg"  ❌ Missing uploads/
image: null           ❌ Not saved
```

---

## Common Issues & Solutions

### **Issue 1: "No file received in request"**

**Cause**: Multer middleware not applied or file not sent

**Solutions**:

1. **Check Route Middleware**:
```typescript
// auth.router.ts
router.post("/register", upload.single("image"), AuthController.register);
//                       ^^^^^^^^^^^^^^^^^^^^^ Must be present
```

2. **Check Multer Configuration**:
```typescript
const multer = require("multer");
const upload = multer({ dest: "./uploads" });
```

3. **Check FormData Field Name**:
```typescript
// Frontend must use "image" as field name
formData.append('image', file);  // ✅ Correct
formData.append('photo', file);  // ❌ Wrong field name
```

---

### **Issue 2: Image Path Without Prefix**

**Cause**: Image path not including `uploads/` when saved

**Solution**:

Check line 62 in `auth.controller.ts`:
```typescript
userRequest.image = `uploads/${newFilename}`;  // ✅ Must have uploads/
```

**NOT**:
```typescript
userRequest.image = newFilename;  // ❌ Missing uploads/
```

---

### **Issue 3: File Not Uploaded**

**Cause**: Profile component not setting file in form state

**Solution**:

Check Profile component callback:
```typescript
<Profile
  setValue={(field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "image" && value instanceof File) {
      const url = URL.createObjectURL(value);
      setImagePreview(url);
    }
  }}
  image={imagePreview}
/>
```

**Verify**:
- ✅ `setValue` is called with `"image"` field
- ✅ `value` is a File object
- ✅ Form state is updated

---

### **Issue 4: FormData Not Sending File**

**Cause**: File not appended to FormData or wrong content type

**Solution**:

1. **Check FormData Append**:
```typescript
if (value instanceof File) {
  formData.append(key, value);  // ✅ Correct
}
```

2. **Check Headers**:
```typescript
// authSlice.ts
const response = await axios.post("/auth/register", data, {
  headers: {
    "Content-Type": "multipart/form-data",  // ✅ Required
  },
});
```

---

## Testing Procedure

### **Test 1: Frontend Logging**

1. Open browser console
2. Fill registration form
3. Select an image
4. Click Register
5. Check console logs:
   - Should see: `Appending file: image File {...}`
   - Should see: FormData contents with image

**If NOT seeing file**:
- Profile component not working
- Image not selected
- Form state not updated

---

### **Test 2: Backend Logging**

1. Open server terminal
2. Submit registration
3. Check terminal logs:
   - Should see: `File received: {...}`
   - Should see: `Image path set to: uploads/...`

**If NOT seeing logs**:
- Request not reaching server
- Multer not processing file
- Route middleware missing

---

### **Test 3: Database Check**

1. Register new user with image
2. Check database:
```sql
SELECT * FROM users ORDER BY id DESC LIMIT 1;
```
3. Verify `image` field has `uploads/` prefix

**If NOT correct**:
- Backend not setting path correctly
- Database constraint issue
- Schema mismatch

---

### **Test 4: Image Display**

1. After registration, login
2. Go to ManageUser page
3. Check if image displays

**If NOT displaying**:
- Image path incorrect in database
- File not saved to uploads folder
- Frontend URL construction issue

---

## Expected Flow

### **Complete Registration Flow**

```
1. User selects image in Profile component
    ↓
2. Profile calls setValue("image", File)
    ↓
3. Form state updated: form.image = File
    ↓
4. User clicks Register
    ↓
5. handleSubmit creates FormData
    ↓
6. FormData.append("image", File)
    ↓
7. dispatch(register(formData))
    ↓
8. POST /auth/register with multipart/form-data
    ↓
9. Multer middleware processes file
    ↓
10. File saved to ./uploads/abc123
    ↓
11. Backend renames: ./uploads/abc123.jpeg
    ↓
12. Backend sets: userRequest.image = "uploads/abc123.jpeg"
    ↓
13. Database saves: image = "uploads/abc123.jpeg"
    ↓
14. User created successfully ✅
```

---

## Verification Checklist

- [ ] Frontend console shows file being appended
- [ ] FormData contains image field
- [ ] Backend console shows "File received"
- [ ] Backend console shows "Image path set to: uploads/..."
- [ ] File exists in ./uploads/ directory
- [ ] Database has image path with uploads/ prefix
- [ ] Image displays in ManageUser table
- [ ] Image displays in FacultyProfile cards
- [ ] Image displays in UserProfile page

---

## Quick Fix Checklist

If image is not saving with `uploads/` prefix:

1. ✅ **Line 62** in `auth.controller.ts`:
   ```typescript
   userRequest.image = `uploads/${newFilename}`;
   ```

2. ✅ **Multer middleware** in `auth.router.ts`:
   ```typescript
   router.post("/register", upload.single("image"), AuthController.register);
   ```

3. ✅ **Content-Type** in `authSlice.ts`:
   ```typescript
   headers: { "Content-Type": "multipart/form-data" }
   ```

4. ✅ **FormData append** in `Register.tsx`:
   ```typescript
   if (value instanceof File) {
     formData.append(key, value);
   }
   ```

---

## Files to Check

1. **`auth.controller.ts`** - Line 62: Image path assignment
2. **`auth.router.ts`** - Line 10: Multer middleware
3. **`authSlice.ts`** - Line 81: Content-Type header
4. **`Register.tsx`** - Line 93: File append
5. **`Profile.tsx`** - setValue callback

---

## Next Steps

1. **Run the application**
2. **Open browser console** (F12)
3. **Open server terminal**
4. **Register a new user with image**
5. **Check all console logs**
6. **Verify database entry**
7. **Check if image displays**

If you see any errors or unexpected behavior, share the console logs and I'll help debug further!

---

## Summary

**Current Status**:
- ✅ Code updated to include `uploads/` prefix
- ✅ Logging added for debugging
- ⏳ Waiting for test results

**Expected Result**:
- ✅ Image saved to database as `uploads/filename.jpeg`
- ✅ Image displays in all pages
- ✅ No 404 errors

Test the registration now and check the console logs! 🔍
