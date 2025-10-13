# Schedule Generation - View Modal & Faculty Recommendations

## Summary
Added view modal to schedule generation table with faculty recommendations based on matching subject tags with faculty specialization.

---

## Changes Made

### **1. View Button in Table** ✅

Added an "Actions" column with a "View" button for each schedule item.

**Location**: Schedule Generation table

```typescript
<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
  <div className="flex items-center space-x-2">
    <Eye className="h-4 w-4 text-blue-500" />
    <span>Actions</span>
  </div>
</th>
```

**Button**:
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    setViewScheduleItem(subject);
    setShowViewModal(true);
  }}
  className="flex items-center gap-2 hover:bg-blue-50"
>
  <Eye className="h-4 w-4" />
  View
</Button>
```

---

### **2. View Schedule Details Modal** ✅

Created a comprehensive modal that displays schedule information in organized sections.

**Sections**:
1. **Subject Information** (Blue)
   - Subject Code
   - Subject Name
   - Program
   - Year Level

2. **Schedule Information** (Green)
   - Day
   - Time
   - Room
   - Semester

3. **Faculty Information** (Purple)
   - Faculty Name
   - Faculty Load
   - **Recommended Faculty** (with match scores)

4. **Units & Load Information** (Yellow)
   - Lecture units
   - Laboratory units
   - Total units
   - Hours/Week

---

### **3. Faculty Recommendation System** ✅

Implemented intelligent faculty matching based on subject tags and faculty specialization.

**Algorithm** (`scheduleGenerationService.ts`):

```typescript
// Get faculty recommendations based on subject tags
const recommendedFaculty = this.findBestFacultyMatches(course, instructors, 5);

const scheduleItem: ScheduleItem = {
  // ... other fields
  recommendedFaculty: recommendedFaculty
};
```

**Matching Logic**:
```typescript
static calculateFacultyMatchScore(courseTags: string[], facultySpecializations: string[]): number {
  let matchScore = 0;
  
  // Exact match: +10 points
  for (const courseTag of normalizedCourseTags) {
    if (normalizedSpecializations.includes(courseTag)) {
      matchScore += 10;
    }
  }
  
  // Partial match: +5 points
  for (const courseTag of normalizedCourseTags) {
    for (const specialization of normalizedSpecializations) {
      if (courseTag.includes(specialization) || specialization.includes(courseTag)) {
        matchScore += 5;
      }
    }
  }
  
  // Keyword match: +2 points
  // ... keyword matching logic
  
  return Math.min(100, (matchScore / maxPossibleScore) * 100);
}
```

---

## How It Works

### **Faculty Matching Process**

```
1. Subject has tags: ["Web Development", "JavaScript", "React"]
    ↓
2. Faculty specializations checked:
   - Faculty A: ["Web Development", "Frontend"]  → 85% match
   - Faculty B: ["Database", "SQL"]              → 0% match
   - Faculty C: ["JavaScript", "Node.js"]        → 60% match
    ↓
3. Sort by match score (descending)
    ↓
4. Return top 5 recommended faculty
    ↓
5. Display in modal with match percentages
```

### **Example**

**Subject**: CS101 - Web Development Fundamentals
**Tags**: `["Web Development", "HTML", "CSS", "JavaScript"]`

**Faculty Recommendations**:
```
┌─────────────────────────────────────────────────────────┐
│ 👤 John M. Doe                        [95% Match] ✅    │
│    john@example.com                                     │
│    Specialization: Web Development, Frontend            │
├─────────────────────────────────────────────────────────┤
│ 👤 Jane A. Smith                      [75% Match] ✅    │
│    jane@example.com                                     │
│    Specialization: JavaScript, React, Node.js           │
├─────────────────────────────────────────────────────────┤
│ 👤 Bob K. Johnson                     [50% Match] ⚠️    │
│    bob@example.com                                      │
│    Specialization: HTML, CSS, UI/UX Design              │
└─────────────────────────────────────────────────────────┘
```

---

## Modal Layout

### **Schedule Details Modal**

```
┌────────────────────────────────────────────────────────────┐
│ 📚 Schedule Details                                        │
│    CS101 - Introduction to Programming                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 📘 Subject Information                                     │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Subject Code: CS101                                │   │
│ │ Subject Name: Introduction to Programming          │   │
│ │ Program: BSCS                                      │   │
│ │ Year Level: 1st Year                               │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ 🕐 Schedule Information                                    │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Day: MW                                            │   │
│ │ Time: 09:00 AM - 10:30 AM                          │   │
│ │ Room: CS Lab 1                                     │   │
│ │ Semester: 1st Semester                             │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ 👤 Faculty Information                                     │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Faculty Name: John M. Doe                          │   │
│ │ Faculty Load: 18/21 units                          │   │
│ │                                                    │   │
│ │ Recommended Faculty (Based on Specialization):     │   │
│ │ ┌──────────────────────────────────────────────┐  │   │
│ │ │ 👤 Jane A. Smith                  [95% Match]│  │   │
│ │ │    jane@example.com                          │  │   │
│ │ └──────────────────────────────────────────────┘  │   │
│ │ ┌──────────────────────────────────────────────┐  │   │
│ │ │ 👤 Bob K. Johnson                 [80% Match]│  │   │
│ │ │    bob@example.com                           │  │   │
│ │ └──────────────────────────────────────────────┘  │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ 🏆 Units & Load Information                                │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Lecture: 3 units                                   │   │
│ │ Laboratory: 0 units                                │   │
│ │ Total Units: 3 units                               │   │
│ │ Hours/Week: 3 hrs                                  │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│                                          [Close]           │
└────────────────────────────────────────────────────────────┘
```

---

## Match Score Calculation

### **Scoring System**

| Match Type | Points | Example |
|-----------|--------|---------|
| **Exact Match** | +10 | Tag: "Web Development" = Spec: "Web Development" |
| **Partial Match** | +5 | Tag: "JavaScript" contains "Script" |
| **Keyword Match** | +2 | Tag: "Web Dev" matches "Web Development" |

### **Example Calculation**

**Subject Tags**: `["Web Development", "JavaScript"]`
**Faculty Spec**: `["Web Development", "Frontend Development", "JavaScript"]`

```
Calculation:
- "Web Development" exact match: +10
- "JavaScript" exact match: +10
- Total: 20 points
- Max possible: 20 points (2 tags × 10)
- Match Score: (20/20) × 100 = 100%
```

---

## Benefits

### **For Campus Admin**

✅ **Quick Overview**: See all schedule details at a glance
✅ **Faculty Insights**: View recommended faculty based on expertise
✅ **Load Monitoring**: Check faculty workload in modal
✅ **Better Decisions**: Make informed faculty assignments

### **For Faculty Matching**

✅ **Intelligent Matching**: Automatically matches subject tags with faculty specialization
✅ **Ranked Recommendations**: Shows top 5 best matches with scores
✅ **Expertise Alignment**: Ensures faculty teach subjects they specialize in
✅ **Quality Assurance**: Reduces mismatched assignments

---

## Technical Implementation

### **State Management**

```typescript
const [viewScheduleItem, setViewScheduleItem] = useState<Schedule | null>(null);
const [showViewModal, setShowViewModal] = useState(false);
```

### **Modal Trigger**

```typescript
onClick={() => {
  setViewScheduleItem(subject);
  setShowViewModal(true);
}}
```

### **Faculty Recommendations**

```typescript
// In scheduleGenerationService.ts
static findBestFacultyMatches(course: any, instructors: any[], maxMatches: number = 3): any[] {
  const courseTags = this.parseJsonArray(course.tags);
  
  const facultyWithScores = instructors.map(instructor => {
    const specialization = instructor.specialization || instructor.designation || '';
    const facultySpecializations = this.parseJsonArray(specialization);
    const matchScore = this.calculateFacultyMatchScore(courseTags, facultySpecializations);
    
    return {
      ...instructor,
      matchScore,
      matchedTags: courseTags.filter(tag => 
        facultySpecializations.some(spec => 
          spec.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(spec.toLowerCase())
        )
      )
    };
  });

  return facultyWithScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxMatches);
}
```

---

## Files Modified

1. ✅ **`ScheduleGeneration.tsx`**
   - Added view button in table
   - Created view modal with sections
   - Integrated faculty recommendations display

2. ✅ **`scheduleGenerationService.ts`**
   - Added `recommendedFaculty` to schedule items
   - Implemented faculty matching algorithm
   - Calculated match scores

---

## Testing

### **Test Case 1: View Schedule**
1. Generate schedule
2. Click "View" button on any schedule item
3. **Expected**: Modal opens with all details

### **Test Case 2: Faculty Recommendations**
1. Open schedule details modal
2. Check "Recommended Faculty" section
3. **Expected**: Top 5 faculty with match scores displayed

### **Test Case 3: Match Score Accuracy**
1. Subject with tags: `["Web Development", "JavaScript"]`
2. Faculty with spec: `["Web Development", "React"]`
3. **Expected**: High match score (70-90%)

### **Test Case 4: No Match**
1. Subject with tags: `["Database", "SQL"]`
2. Faculty with spec: `["Web Development", "React"]`
3. **Expected**: Low or 0% match score

---

## Summary

### **Implementation**
- ✅ View button in schedule table
- ✅ Comprehensive modal with 4 sections
- ✅ Faculty recommendation system
- ✅ Match score calculation
- ✅ Top 5 recommended faculty display
- ✅ Color-coded sections for clarity

### **Result**
- **Better UX**: Easy access to detailed schedule information
- **Smart Matching**: Intelligent faculty recommendations
- **Informed Decisions**: See match scores before assignment
- **Quality Control**: Ensure expertise alignment

Schedule generation now has view modal with intelligent faculty recommendations! 🎉
