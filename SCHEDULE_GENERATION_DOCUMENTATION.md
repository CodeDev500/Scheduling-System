# 📅 Schedule Generation Algorithm Documentation

## Overview

The **OptiSched Schedule Generation System** is an intelligent, automated scheduling algorithm that generates optimal class schedules while considering multiple constraints and priorities.

### Key Features
- ✅ **Intelligent Faculty Recommendation** - Matches faculty based on specialization first, then experience and availability
- ✅ **Conflict-Free Scheduling** - Prevents overlapping schedules for faculty, rooms, and student sections
- ✅ **Role-Based Workload Management** - Campus Admin: 6 units max, Others: 18 units max (configurable)
- ✅ **Department-Specific Rules** - BSCS/ACT: 1 lab unit = 3 hours; Others: 1 lab unit = 1 hour
- ✅ **Priority-Based Scheduling** - Lectures scheduled before laboratories
- ✅ **Lunch Break Avoidance** - No classes scheduled during 12:00-13:00

---

## Algorithm Flow

### Step-by-Step Process

**1. Fetch Data**
- Get all subjects for the specified curriculum year and semester
- Get all faculty members (instructors)
- Get all available rooms
- Get configuration (max units per faculty)

**2. Initialize Tracking**
- `facultyWorkload` - Track current units assigned to each faculty
- `usedSlots` - Track faculty time slots to prevent double-booking
- `usedRooms` - Track room occupancy
- `usedProgramYearSlots` - Track student section schedules
- `instructorMaxUnits` - Set max units per faculty based on role (CAMPUS_ADMIN: 6, Others: 18)

**3. Find Faculty Recommendations**
- For each subject, score all faculty using the recommendation algorithm
- Return top 3 best matches per subject

**4. Schedule Each Subject**
- Calculate session rules (lecture/lab splits based on units and department)
- Sort sessions by priority (lectures first, then labs)
- For each session:
  - Try each recommended faculty
  - Try each day pair (MW, TTh, etc.)
  - Try each time slot (avoiding lunch 12:00-13:00)
  - Try each suitable room
  - Check all conflicts (faculty, room, student section)
  - If valid → Schedule and update tracking
  - If not → Try next combination

**5. Save & Return Results**
- Save all scheduled sessions to database
- Return scheduled subjects and any unscheduled subjects with reasons

---

## Faculty Recommendation System

### Scoring Priority (Hierarchical)

The system matches faculty to subjects using a **hierarchical scoring algorithm**:

**Priority 1: Specialization Match**
- Formula: `(Matched Tags / Total Course Tags) × 100`
- Compares course tags with faculty specializations (case-insensitive)
- Example: Course ["Programming", "Web Dev"] + Faculty ["Programming", "Web Dev"] = 100% match

**Priority 2: Previous Subject Experience**
- Checks if faculty has taught this exact subject before
- Matches against `previousSubjects` array (subject code or name)
- Adds weight to faculty who have taught the subject previously

**Priority 3: Years of Experience**
- Considers teaching experience (capped at maximum threshold)
- More experienced faculty receive higher scores

**Priority 4: Faculty Designation**
- Regular faculty members receive additional weight
- Encourages assignment to permanent staff over part-time

**Priority 5: Workload Availability (Disqualifier)**
- Faculty at or over max units are disqualified
- Max units by role: CAMPUS_ADMIN = 6, Others = 18 (configurable)

### Selection Process

1. **Calculate scores** for all faculty members
2. **Filter out** faculty with negative scores (overloaded)
3. **Sort** by:
   - Total score (descending)
   - If tied → Specialization match % (descending)
   - If tied → Years of experience (descending)
4. **Return top 5** candidates

### Example

**Subject**: "Web Development" (Tags: ["Programming", "Web Development"])

| Faculty | Specialization Match | Previous | Experience | Designation | Load | Result |
|---------|---------------------|----------|------------|-------------|------|--------|
| Prof. A | 100% (both tags) | ✅ Yes | 10 yrs | Regular | 12/18 | **Highest Score** ✅ |
| Prof. B | 50% (1 tag) | ❌ No | 15 yrs | Part-time | 15/18 | **Moderate Score** |
| Prof. C | 0% (no tags) | ❌ No | 20 yrs | Regular | 10/18 | **Low Score** |
| Prof. D | 100% (both tags) | ❌ No | 5 yrs | Regular | 18/18 | **Disqualified** ❌ |

**Winner**: Prof. A (perfect specialization match + has taught subject before + available capacity)

---

## Session Rules & Scheduling

### Lecture Sessions (Priority 1)

| Lec Units | Sessions/Week | Hours/Session | Day Pattern |
|-----------|---------------|---------------|-------------|
| 3 units   | 2 sessions    | 1.5 hours     | MW, TTh, MF, WF, TF |
| 2 units   | 2 sessions    | 1 hour        | MW, TTh, MF, WF, TF |
| 1 unit    | 1 session     | 1 hour        | M, T, W, Th, F |

### Laboratory Sessions (Priority 2)

**BSCS & ACT Departments:**
- 1 lab unit = 3 contact hours = 2 sessions × 1.5h

**Other Departments:**
- 1 lab unit = 1 contact hour = 1 session × 1h

### Day Pair Preferences

**Lectures**: MW → TTh → MF → WF → TF  
**Labs**: TTh → WF → MF → MW → TF

### Time Slots

**Available Hours**: 07:00-20:00  
**Lunch Break (BLOCKED)**: 12:00-13:00

---

## Conflict Detection

The system checks for the following conflicts before scheduling:

1. **Faculty Time Conflict** - Faculty already teaching at this time
2. **Room Conflict** - Room already occupied
3. **Student Section Conflict** - Program-year-section already has a class
4. **Faculty Workload Limit** - Faculty at or over max units
5. **Room Capacity** - Room too small for expected students
6. **Room Type Match** - Lab sessions need lab rooms
7. **Faculty Availability** - Faculty not available on this day
8. **Lunch Break Overlap** - Time overlaps with 12:00-13:00

### Resolution Strategy

For each session, the system tries combinations in this order:
1. Faculty (by recommendation score)
2. Day pair (by preference)
3. Time slot (07:00-20:00, avoiding lunch)
4. Room (by type and capacity)

If all combinations fail → Mark as **UNSCHEDULED** with reason

---

## Flowchart

### Schedule Generation Flow

```
START
  │
  ├─→ Fetch Data (Subjects, Faculty, Rooms for curriculum year & semester)
  │
  ├─→ Initialize Tracking (Workload, Time Slots, Rooms, Max Units by Role)
  │
  ├─→ For Each Subject:
  │     │
  │     ├─→ Find Top 5 Faculty Recommendations
  │     │     └─→ Score by: Specialization → Previous Experience → Years → Designation
  │     │
  │     ├─→ Calculate Session Rules (Lectures first, then Labs)
  │     │
  │     └─→ For Each Session:
  │           │
  │           └─→ Try Combinations:
  │                 ├─→ Faculty (by score)
  │                 ├─→ Day Pair (MW, TTh, etc.)
  │                 ├─→ Time Slot (07:00-20:00, avoid lunch)
  │                 └─→ Room (by type & capacity)
  │                       │
  │                       ├─→ Check All Conflicts
  │                       │     ├─ Faculty time conflict?
  │                       │     ├─ Room occupied?
  │                       │     ├─ Student section conflict?
  │                       │     ├─ Faculty over workload?
  │                       │     ├─ Room capacity sufficient?
  │                       │     ├─ Room type matches?
  │                       │     ├─ Faculty available?
  │                       │     └─ Lunch overlap?
  │                       │
  │                       ├─→ If Valid: Schedule & Update Tracking
  │                       └─→ If Invalid: Try Next Combination
  │
  └─→ Save to Database & Return Results
END
```

### Faculty Scoring Flow

```
START
  │
  ├─→ Specialization Match: (Matched Tags / Total Tags) × 100
  │
  ├─→ Previous Subject Experience: Add weight if taught before
  │
  ├─→ Years of Experience: Add weight based on experience
  │
  ├─→ Faculty Designation: Add weight if Regular
  │
  ├─→ Workload Check: Disqualify if at/over max units
  │
  └─→ Return Final Score
END
```

---

## Important Notes

### Program Priority
- Programs are stored in the `academic_programs` table with a `priority` field
- **Priority is NOT used for scheduling order** - it's only for display/organization in the UI
- The frontend sorts schedules by program priority for display purposes only
- Users can adjust program priorities via drag-and-drop in the Priority Settings modal

### Data Sources
- **Subjects**: Fetched from `curriculum_courses` table filtered by curriculum year and semester
- **Faculty**: All instructors with APPROVED status
- **Rooms**: All rooms from `rooms` table
- **Configuration**: Max units from `total_units` table (default: 18)

### Faculty Recommendation Priority
The system prioritizes **specialization match first**, then considers other factors:
1. **Specialization** - Must match course tags (0-100% match)
2. **If tied** → Previous teaching experience with the subject
3. **If tied** → Years of experience
4. **If tied** → Faculty designation (Regular vs Part-time)
5. **If tied** → Available time slots

This ensures the most qualified faculty (by expertise) are assigned first, regardless of seniority alone.
