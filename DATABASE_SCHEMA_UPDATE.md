# Database Schema Update - SubjectSchedule Model

## Changes Made

### ✅ Added Fields
1. **`lec`** (Int, default: 0) - Lecture hours per week
2. **`lab`** (Int, default: 0) - Laboratory hours per week
3. **`recommendedFaculty`** (Json) - Array of recommended faculty for the subject

### ❌ Removed Fields
1. **`credits`** - Redundant (replaced by `units`)
2. **`type`** - Not needed (can be derived from lec/lab values)
3. **`section`** - Not used in current implementation

---

## Updated Schema

```prisma
model SubjectSchedule {
  id              Int      @id @default(autoincrement())
  sourceId        String?
  subjectId       String
  subject         String
  subjectCode     String
  subjectName     String
  subjectDescription String?
  faculty         String
  facultyId       String
  facultyName     String
  room            String
  roomId          String
  roomName        String
  time            String
  day             String
  days            String?
  startTime       String
  endTime         String
  semester        String   @db.VarChar(32)
  academicYear    String   @db.VarChar(16)
  program         String   @db.VarChar(32)
  yearLevel       String   @db.VarChar(32)
  units           Int
  lec             Int      @default(0)      // ✅ NEW
  lab             Int      @default(0)      // ✅ NEW
  students        String?
  tags            Json?
  recommendedFaculty Json?                  // ✅ NEW
  hasConflict     Boolean?
  status          String?
  conflictType    String?
  department      String?
  curriculumId    Int?
  instructorId    Int?
  roomLegacyId    Int?
  isActive        Boolean? @default(true)
  generationId    Int?
  generation      ScheduleGeneration? @relation(fields: [generationId], references: [id], onDelete: Cascade)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([department, academicYear, semester, yearLevel, program])
  @@map("subject_schedules")
}
```

---

## Migration Steps

### 1. Run Prisma Migration

```bash
cd server
npx prisma migrate dev --name add_lec_lab_remove_credits_type_section
```

This will:
- Add `lec` column (Int, default 0)
- Add `lab` column (Int, default 0)
- Add `recommendedFaculty` column (Json, nullable)
- Remove `credits` column
- Remove `type` column
- Remove `section` column

### 2. Update Existing Data (Optional)

If you have existing data in the database, you may want to populate the `lec` and `lab` fields based on existing `units`:

```sql
-- Example: Update existing records
-- This is just an example - adjust based on your actual data
UPDATE subject_schedules 
SET lec = units, lab = 0 
WHERE lec IS NULL OR lec = 0;
```

### 3. Restart Server

After migration, restart your server to apply the changes:

```bash
npm run dev
```

---

## Frontend Changes

### Updated Schedule Interface

```typescript
interface Schedule {
  id: string;
  subject: string;
  subjectCode?: string;
  subjectName?: string;
  units?: number;
  lec?: number;                    // ✅ NEW
  lab?: number;                    // ✅ NEW
  startTime?: string;
  endTime?: string;
  faculty: string;
  facultyId?: string;
  facultyName: string;
  room: string;
  time: string;
  day: string;
  semester: string;
  academicYear: string;
  program: string;
  yearLevel: string;
  courseCode?: string;
  students?: string;
  recommendedFaculty?: any[];      // ✅ NEW
  roomName?: string;
  // ❌ REMOVED: credits, type, section
}
```

### Updated Schedule Processing

**Before:**
```typescript
credits: item.subject?.credits || item.units || 3,
units: item.units || item.subject?.credits || 3,
type: item.subject?.type || item.type || 'Lecture',
section: item.section || 'A',
```

**After:**
```typescript
units: item.units || 3,
lec: item.lec || 0,
lab: item.lab || 0,
recommendedFaculty: item.recommendedFaculty || [],
```

---

## Benefits

### 1. **Accurate Hour Tracking**
- `lec` and `lab` fields now properly stored in database
- Hours/Week calculation: `(lec × 1) + (lab × 3)`
- Prevents data loss when schedules are saved/loaded

### 2. **Simplified Schema**
- Removed redundant `credits` field (use `units` instead)
- Removed unused `type` field (can be derived from lec/lab)
- Removed unused `section` field

### 3. **Faculty Recommendations**
- New `recommendedFaculty` field stores array of recommended faculty
- Can be used for future features like faculty suggestion system
- Stored as JSON for flexibility

---

## Data Examples

### Example 1: Lecture-Only Course
```json
{
  "subjectCode": "CS 104",
  "subjectName": "Discrete Mathematics",
  "units": 3,
  "lec": 3,
  "lab": 0,
  "recommendedFaculty": [
    {"id": "1", "name": "Dr. Smith", "matchScore": 95},
    {"id": "2", "name": "Prof. Johnson", "matchScore": 85}
  ]
}
```
**Hours/Week:** (3 × 1) + (0 × 3) = **3 hours**

### Example 2: Lecture + Lab Course
```json
{
  "subjectCode": "CS 102",
  "subjectName": "Computer Programming 1",
  "units": 3,
  "lec": 1,
  "lab": 2,
  "recommendedFaculty": [
    {"id": "3", "name": "Dr. Brown", "matchScore": 98}
  ]
}
```
**Hours/Week:** (1 × 1) + (2 × 3) = **7 hours**

### Example 3: Lab-Only Course
```json
{
  "subjectCode": "CS 201",
  "subjectName": "Data Structures Lab",
  "units": 1,
  "lec": 0,
  "lab": 1,
  "recommendedFaculty": []
}
```
**Hours/Week:** (0 × 1) + (1 × 3) = **3 hours**

---

## Testing Checklist

After migration, verify:

- [ ] `lec` column exists and has default value 0
- [ ] `lab` column exists and has default value 0
- [ ] `recommendedFaculty` column exists and accepts JSON
- [ ] `credits` column removed
- [ ] `type` column removed
- [ ] `section` column removed
- [ ] Existing schedules still load correctly
- [ ] New schedules save with lec/lab values
- [ ] Hours/Week calculation displays correctly
- [ ] Faculty load tracking still works

---

## Rollback (If Needed)

If you need to rollback this migration:

```bash
cd server
npx prisma migrate resolve --rolled-back <migration_name>
```

Then manually restore the previous schema and run a new migration.

---

## Summary

This schema update:
- ✅ Adds `lec` and `lab` fields to properly track lecture and laboratory hours
- ✅ Adds `recommendedFaculty` field for future faculty recommendation features
- ✅ Removes redundant/unused fields (`credits`, `type`, `section`)
- ✅ Ensures data consistency between frontend and database
- ✅ Fixes the issue where lec/lab values were showing as 0

The database now accurately reflects the schedule generation logic and supports all current features.
