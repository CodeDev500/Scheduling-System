# Academic Year CRUD Implementation

## Summary

Successfully implemented a complete CRUD system for Academic Year management in the Settings page. Admins can now add, view, activate, and delete academic years (e.g., 2024-2025, 2025-2026).

---

## Changes Made

### ✅ 1. Database Schema

**File:** `server/prisma/schema.prisma`

**New Model:**
```prisma
model AcademicYear {
  id          Int      @id @default(autoincrement())
  year        String   @unique // e.g., "2024-2025"
  isActive    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("academic_years")
}
```

### ✅ 2. Backend Service

**File:** `server/src/services/academicYear.service.ts`

**Functions:**
- `getAllAcademicYears()` - Get all academic years
- `getActiveAcademicYear()` - Get currently active year
- `createAcademicYear(year)` - Create new academic year
- `updateAcademicYear(id, year)` - Update academic year
- `setActiveAcademicYear(id)` - Set active year (deactivates others)
- `deleteAcademicYear(id)` - Delete academic year (cannot delete active)

### ✅ 3. Backend Controller

**File:** `server/src/controllers/academicYear.controller.ts`

**Endpoints:**
- `GET /academic-years` - Get all
- `GET /academic-years/active` - Get active
- `POST /academic-years` - Create
- `PUT /academic-years/:id` - Update
- `PUT /academic-years/:id/activate` - Set active
- `DELETE /academic-years/:id` - Delete

### ✅ 4. Backend Routes

**File:** `server/src/routes/academicYear.router.ts`

Registered in `server/src/index.ts`:
```typescript
app.use("/academic-years", academicYearRoutes);
```

### ✅ 5. Frontend UI

**File:** `client/src/pages/CampusAdmin/Settings/Settings.tsx`

**Features:**
- List all academic years
- Add new academic year
- Set active academic year
- Delete academic year
- Visual indicators for active year
- Confirmation dialogs

---

## API Endpoints

### GET /academic-years
**Description:** Get all academic years

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "year": "2024-2025",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### GET /academic-years/active
**Description:** Get currently active academic year

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "year": "2024-2025",
    "isActive": true
  }
}
```

### POST /academic-years
**Description:** Create new academic year

**Request Body:**
```json
{
  "year": "2025-2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Academic year created successfully",
  "data": {
    "id": 2,
    "year": "2025-2026",
    "isActive": false
  }
}
```

### PUT /academic-years/:id/activate
**Description:** Set academic year as active (deactivates all others)

**Response:**
```json
{
  "success": true,
  "message": "Active academic year set successfully",
  "data": {
    "id": 2,
    "year": "2025-2026",
    "isActive": true
  }
}
```

### DELETE /academic-years/:id
**Description:** Delete academic year (cannot delete active year)

**Response:**
```json
{
  "success": true,
  "message": "Academic year deleted successfully"
}
```

---

## UI Components

### Academic Year Card

```tsx
<Card>
  <CardHeader>
    <Calendar icon />
    <CardTitle>Academic Year Management</CardTitle>
    <Button>Add Academic Year</Button>
  </CardHeader>
  <CardContent>
    {/* List of academic years */}
    {academicYears.map(year => (
      <div className={year.isActive ? 'active' : 'inactive'}>
        <CheckCircle /> {/* if active */}
        <h4>{year.year}</h4>
        <p>{year.isActive ? 'Currently Active' : 'Inactive'}</p>
        <Button>Set Active</Button> {/* if not active */}
        <Button>Delete</Button> {/* disabled if active */}
      </div>
    ))}
  </CardContent>
</Card>
```

### Features

1. **Add Academic Year Dialog**
   - Input field for year (e.g., "2024-2025")
   - Validation
   - Success/error messages

2. **Academic Year List**
   - Visual distinction for active year (green border/background)
   - CheckCircle icon for active year
   - "Set Active" button for inactive years
   - "Delete" button (disabled for active year)

3. **Delete Confirmation Dialog**
   - Confirms before deletion
   - Shows year being deleted
   - Cannot delete active year

---

## Business Logic

### Setting Active Year
When an academic year is set as active:
1. All other years are set to `isActive = false`
2. The selected year is set to `isActive = true`
3. Only ONE year can be active at a time

### Deleting Years
- ✅ Can delete inactive years
- ❌ Cannot delete active year
- Shows error message if attempting to delete active year

### Creating Years
- Year must be unique
- Format: "YYYY-YYYY" (e.g., "2024-2025")
- Shows error if year already exists

---

## Database Migration

**IMPORTANT:** Run Prisma migration to create the table:

```bash
cd server
npx prisma migrate dev --name add_academic_year
npx prisma generate
```

This will:
1. Create the `academic_years` table
2. Generate Prisma client types
3. Update the database schema

---

## Usage Example

### Admin Workflow

1. **Add Academic Years**
   - Click "Add Academic Year"
   - Enter "2024-2025"
   - Click "Add Year"
   - Repeat for "2025-2026", "2026-2027", etc.

2. **Set Active Year**
   - Click "Set Active" on "2024-2025"
   - System marks it as active
   - All other years become inactive

3. **Switch Active Year**
   - When new semester starts
   - Click "Set Active" on "2025-2026"
   - Previous year becomes inactive
   - New year becomes active

4. **Delete Old Years**
   - Select inactive year
   - Click delete button
   - Confirm deletion
   - Year is removed

---

## Visual Design

### Active Year
```
┌─────────────────────────────────────────┐
│ ✓ 2024-2025                             │
│   Currently Active                      │
│                          [Delete] (disabled)
└─────────────────────────────────────────┘
Green border, green background
```

### Inactive Year
```
┌─────────────────────────────────────────┐
│   2025-2026                             │
│   Inactive                              │
│                [Set Active]  [Delete]   │
└─────────────────────────────────────────┘
Gray border, white background
```

---

## Error Handling

### Frontend
- ✅ Empty year input validation
- ✅ API error messages displayed
- ✅ Loading states
- ✅ Confirmation dialogs

### Backend
- ✅ Duplicate year check
- ✅ Active year deletion prevention
- ✅ Validation errors
- ✅ Database error handling

---

## Testing Checklist

- [ ] Run Prisma migration
- [ ] Create academic year (2024-2025)
- [ ] Create another year (2025-2026)
- [ ] Set first year as active
- [ ] Try to delete active year (should fail)
- [ ] Switch active year to second year
- [ ] Delete first year (should succeed)
- [ ] Try to create duplicate year (should fail)
- [ ] Check active year API endpoint
- [ ] Verify only one year is active at a time

---

## Integration Points

### Where Active Year is Used

The active academic year can be used in:
- **Schedule Generation** - Filter schedules by year
- **Reports** - Show data for current year
- **Faculty Load** - Calculate load for current year
- **Curriculum** - Display current year's curriculum

### Getting Active Year

**Frontend:**
```typescript
const response = await api.get('/academic-years/active');
const activeYear = response.data.data;
console.log(activeYear.year); // "2024-2025"
```

**Backend:**
```typescript
const activeYear = await AcademicYearService.getActiveAcademicYear();
console.log(activeYear.year); // "2024-2025"
```

---

## Summary

The Academic Year CRUD system provides:
- ✅ Complete CRUD operations
- ✅ Active year management
- ✅ Visual UI in Settings page
- ✅ Validation and error handling
- ✅ Confirmation dialogs
- ✅ Database persistence
- ✅ RESTful API endpoints
- ✅ Single active year enforcement

Admins can now manage academic years and set the currently active year for the entire system!
