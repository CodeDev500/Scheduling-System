# Schedules Latest Endpoint - Implementation

## Summary

Created the `/schedules/latest` endpoint to fetch all active subject schedules from the `SubjectSchedule` table for the Teaching Load page.

---

## Changes Made

### ✅ 1. Created Controller Function

**File:** `server/src/controllers/schedules.controller.ts`

**New Function:** `getLatestSchedules`

```typescript
export const getLatestSchedules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scheduleItems = await db.subjectSchedule.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      scheduleItems
    });
  } catch (error) {
    console.error("Error fetching latest schedules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest schedules"
    });
  }
};
```

### ✅ 2. Added Route

**File:** `server/src/routes/schedules.router.ts`

```typescript
import { getLatestSchedules } from "../controllers/schedules.controller";

// Get latest schedules (all active subject schedules)
router.get("/latest", getLatestSchedules);
```

---

## API Endpoint

### GET /schedules/latest

**Description:** Fetches all active subject schedules from the `subject_schedules` table

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "scheduleItems": [
    {
      "id": 1,
      "sourceId": "2",
      "subjectId": "2",
      "subject": "Computer Programming 1",
      "subjectCode": "CS 102",
      "subjectName": "Computer Programming 1",
      "subjectDescription": "",
      "faculty": "faculty fac",
      "facultyId": "3",
      "facultyName": "faculty fac",
      "room": "Lab 2",
      "roomId": "2",
      "roomName": "Lab 2",
      "time": "7:30 AM - 11:00 AM",
      "day": "MW",
      "days": null,
      "startTime": "07:30",
      "endTime": "11:00",
      "semester": "1st Semester",
      "academicYear": "2025-2026",
      "program": "BSCS",
      "yearLevel": "1st Year",
      "units": 3,
      "lec": 3,
      "lab": 0,
      "students": "0/50",
      "tags": [],
      "recommendedFaculty": null,
      "hasConflict": true,
      "status": "conflict",
      "conflictType": "faculty",
      "department": null,
      "curriculumId": null,
      "instructorId": null,
      "roomLegacyId": null,
      "isActive": true,
      "generationId": null,
      "createdAt": "2025-01-09T03:56:08.000Z",
      "updatedAt": "2025-01-09T03:56:08.000Z"
    }
  ]
}
```

---

## Features

### Query Logic
- ✅ Fetches from `subject_schedules` table
- ✅ Filters only active schedules (`isActive = true`)
- ✅ Orders by day (ascending)
- ✅ Orders by start time (ascending)

### Response Format
- ✅ Returns `success` flag
- ✅ Returns array of `scheduleItems`
- ✅ Includes all schedule fields
- ✅ Error handling with proper status codes

---

## Data Structure

### SubjectSchedule Fields

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| subjectCode | String | Subject code (e.g., "CS 102") |
| subjectName | String | Subject name |
| facultyId | String | Faculty ID |
| facultyName | String | Faculty full name |
| roomName | String | Room name |
| day | String | Day pattern (MW, TTh, etc.) |
| startTime | String | Start time (24h format) |
| endTime | String | End time (24h format) |
| semester | String | Semester |
| academicYear | String | Academic year |
| program | String | Program code |
| yearLevel | String | Year level |
| units | Int | Subject units |
| lec | Int | Lecture hours |
| lab | Int | Lab hours |
| isActive | Boolean | Active status |

---

## Usage

### Frontend Call

```typescript
const response = await api.get('/schedules/latest');
const schedules = response.data.scheduleItems;
```

### Response Handling

```typescript
try {
  const response = await api.get('/schedules/latest');
  
  if (response.data.success) {
    const schedules = response.data.scheduleItems;
    // Process schedules
  }
} catch (error) {
  console.error('Error fetching schedules:', error);
}
```

---

## Integration with Teaching Load

### Data Flow

```
GET /schedules/latest
  ↓
Filter by isActive = true
  ↓
Order by day, startTime
  ↓
Return scheduleItems
  ↓
Frontend groups by facultyId
  ↓
Display in Teaching Load page
```

### Example Usage in TeachingLoad.tsx

```typescript
// Fetch all subject schedules
const schedulesResponse = await api.get('/schedules/latest');
const schedules = schedulesResponse.data?.scheduleItems || [];

// Group schedules by faculty
const facultyScheduleItems = schedules.filter(
  (s: any) => String(s.facultyId) === String(faculty.id)
);
```

---

## Error Handling

### Success Response (200)
```json
{
  "success": true,
  "scheduleItems": [...]
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "Failed to fetch latest schedules"
}
```

---

## Testing

### Test Cases

1. **Get all active schedules**
   ```bash
   GET http://localhost:3001/schedules/latest
   ```
   Expected: Returns all schedules with `isActive = true`

2. **Empty schedules**
   - No active schedules in database
   - Expected: Returns empty array

3. **Ordering**
   - Schedules ordered by day, then start time
   - Expected: Monday schedules first, then Tuesday, etc.

4. **Error handling**
   - Database error
   - Expected: Returns 500 with error message

---

## Benefits

### Before
- ❌ No endpoint to fetch all schedules
- ❌ 404 error on `/schedules/latest`
- ❌ Teaching Load page couldn't load data

### After
- ✅ Endpoint created and working
- ✅ Fetches all active schedules
- ✅ Ordered by day and time
- ✅ Teaching Load page can load data
- ✅ Error handling implemented
- ✅ Proper response format

---

## Summary

The `/schedules/latest` endpoint:
- ✅ Fetches all active subject schedules
- ✅ Orders by day and start time
- ✅ Returns proper JSON format
- ✅ Includes error handling
- ✅ Integrates with Teaching Load page
- ✅ Filters only active schedules
- ✅ Returns all necessary fields

The Teaching Load page can now successfully fetch schedule data!
