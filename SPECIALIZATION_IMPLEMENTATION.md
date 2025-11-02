# Dynamic Specialization System Implementation

## Overview
Successfully converted the hardcoded `specializationOptions` constant into a fully dynamic, database-driven system with admin management capabilities.

## Backend Implementation

### Database Schema
The `Specialization` model already exists in `schema.prisma`:
```prisma
model Specialization {
  id          Int      @id @default(autoincrement())
  name        String   @unique  // Simple name like "Web Development", "Data Structures"
  description String?  // Optional (not used in UI)
  department  String?  // Optional (not used in UI)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("specializations")
}
```

**Note:** While the database supports `description` and `department` fields, the UI only manages the `name` field for simplicity.

### API Endpoints
**Base URL:** `/api/specializations`

All endpoints require authentication (`verifyToken` middleware).

#### Endpoints:
1. **GET /** - Get all specializations
   - Query params: `department`, `isActive`
   - Returns: Array of specializations

2. **GET /:id** - Get specialization by ID
   - Returns: Single specialization object

3. **POST /** - Create new specialization
   - Body: `{ name, description?, department? }`
   - Returns: Created specialization

4. **PUT /:id** - Update specialization
   - Body: `{ name?, description?, department?, isActive? }`
   - Returns: Updated specialization

5. **DELETE /:id** - Delete specialization
   - Returns: Success message

6. **PATCH /:id/toggle** - Toggle active status
   - Returns: Updated specialization with toggled status

### Controller
Location: `server/src/controllers/specialization.controller.ts`
- Full CRUD operations
- Validation for unique names
- Error handling

### Routes
Location: `server/src/routes/specialization.router.ts`
- Schema validation using Zod
- Protected with authentication middleware

## Frontend Implementation

### Custom Hook
**File:** `client/src/hooks/useSpecializations.ts`

```typescript
export const useSpecializations = (activeOnly: boolean = true) => {
  // Returns: { specializations, fullSpecializations, isLoading, error }
}
```

**Features:**
- Fetches specializations from API
- Filters by active status
- Returns both full objects and name array for backward compatibility
- Loading and error states

### Admin UI - Specialization Management
**Location:** `client/src/pages/CampusAdmin/Settings/Settings.tsx`

**Features:**
- ✅ View all specializations in a card-based layout
- ✅ Add new specializations (simple name field only)
- ✅ Edit specialization names
- ✅ Toggle active/inactive status
- ✅ Delete specializations
- ✅ Visual indicators for active/inactive status
- ✅ Confirmation dialogs for destructive actions
- ✅ Enter key support for quick add/edit

**UI Components:**
- Specialization list with status indicators
- Add/Edit dialogs with form validation
- Delete confirmation dialog
- Activate/Deactivate toggle buttons

### Updated Components

All components now use the `useSpecializations` hook instead of the hardcoded constant:

1. **Registration Form**
   - File: `client/src/pages/Auth/Register.tsx`
   - Uses: Multi-select for faculty specializations

2. **User Management**
   - File: `client/src/pages/CampusAdmin/ManageUser/ManageUser.tsx`
   - Uses: Edit user specializations

3. **User Profile**
   - File: `client/src/pages/UserProfile/UserProfile.tsx`
   - Uses: Edit own specializations

4. **Add Subject**
   - File: `client/src/pages/Registrar/Subjects/AddSubject.tsx`
   - Uses: Subject tags/specializations

5. **Update Subject**
   - File: `client/src/pages/Registrar/Subjects/UpdateSubject.tsx`
   - Uses: Subject tags/specializations

## Migration Path

### Old System (Hardcoded)
```typescript
// constants/constants.ts
export const specializationOptions = [
  "Web Development",
  "Machine Learning",
  // ... 100+ hardcoded values
] as const;
```

### New System (Dynamic)
```typescript
// Using the hook
const { specializations, isLoading } = useSpecializations(true);

// specializations is an array of strings from the database
```

## Benefits

1. **Admin Control**
   - Campus admins can add/edit/remove specializations without code changes
   - No developer intervention needed

2. **Department-Specific**
   - Optional department field for organization
   - Can filter by department if needed

3. **Active/Inactive Status**
   - Deactivate obsolete specializations without deleting
   - Only active specializations show in forms

4. **Scalability**
   - Easy to add new specializations
   - No code deployment required

5. **Data Integrity**
   - Database-driven ensures consistency
   - Unique constraint prevents duplicates

## Usage Instructions

### For Administrators

1. **Navigate to Settings**
   - Go to Campus Admin → Settings
   - Scroll to "Specialization Management" section

2. **Add Specialization**
   - Click "Add Specialization"
   - Enter specialization name (e.g., "Web Development", "Data Structures")
   - Press Enter or click "Add Specialization"

3. **Edit Specialization**
   - Click the edit icon on any specialization
   - Modify the name
   - Press Enter or click "Update Specialization"

4. **Toggle Status**
   - Click "Activate" or "Deactivate" button
   - Inactive specializations won't appear in forms

5. **Delete Specialization**
   - Click the trash icon
   - Confirm deletion in the dialog

### For Developers

1. **Use the Hook**
   ```typescript
   import { useSpecializations } from '@/hooks/useSpecializations';
   
   const MyComponent = () => {
     const { specializations, isLoading, error } = useSpecializations(true);
     
     if (isLoading) return <div>Loading...</div>;
     if (error) return <div>Error: {error}</div>;
     
     return (
       <select>
         {specializations.map(spec => (
           <option key={spec} value={spec}>{spec}</option>
         ))}
       </select>
     );
   };
   ```

2. **Get All Specializations (including inactive)**
   ```typescript
   const { specializations } = useSpecializations(false);
   ```

3. **Access Full Objects**
   ```typescript
   const { fullSpecializations } = useSpecializations(true);
   // Returns array of { id, name, description, department, isActive, ... }
   ```

## Database Seeding (Recommended)

To seed initial specializations from the old constant:

```typescript
// server/prisma/seed.ts or migration script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const specializationOptions = [
  "Data Structures",
  "Algorithms",
  "Software Engineering",
  "Database Systems",
  "Web Development",
  "Mobile Development",
  "Cross-platform Development",
  "Computer Networks",
  "Operating Systems",
  "Computer Architecture",
  // ... add all from constants.ts
];

async function seedSpecializations() {
  console.log('Seeding specializations...');
  
  for (const name of specializationOptions) {
    await prisma.specialization.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true }
    });
  }
  
  console.log(`✅ Seeded ${specializationOptions.length} specializations`);
}

seedSpecializations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run with:** `npx ts-node prisma/seed.ts`

## Testing Checklist

- [ ] Admin can add new specializations
- [ ] Admin can edit specializations
- [ ] Admin can toggle active/inactive status
- [ ] Admin can delete specializations
- [ ] Registration form shows only active specializations
- [ ] User profile edit shows only active specializations
- [ ] Subject forms show only active specializations
- [ ] Inactive specializations don't appear in dropdowns
- [ ] Loading states work correctly
- [ ] Error handling works correctly

## Notes

- **Simple Design:** Specializations are just simple name strings (e.g., "Web Development", "Data Structures")
- The database supports `description` and `department` fields, but the UI intentionally keeps it simple with just the name
- The old `specializationOptions` constant in `constants/constants.ts` can be removed or kept as a reference
- All forms now dynamically fetch specializations on component mount
- Changes to specializations are immediately reflected (may need page refresh)
- The system is backward compatible - existing specialization data in user profiles and subjects will continue to work
- Press Enter in add/edit dialogs for quick submission

## Future Enhancements

1. **Department Filtering**
   - Filter specializations by user's department
   - Department-specific specialization lists

2. **Bulk Import**
   - CSV import for multiple specializations
   - Bulk activate/deactivate

3. **Usage Analytics**
   - Track which specializations are most used
   - Suggest removing unused specializations

4. **Hierarchical Categories**
   - Group specializations by category
   - Nested specialization structure

5. **Real-time Updates**
   - WebSocket integration for live updates
   - No page refresh needed
