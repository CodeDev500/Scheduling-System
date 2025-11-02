# Quick Reference: Time Slot Rules

## 📋 Session Duration Rules

### Lecture Sessions
| Lec Units | Total Hours | Sessions | Duration per Session | Example |
|-----------|-------------|----------|---------------------|---------|
| 1 unit | 1 hour | 1 session | 1 hour | M: 7:00-8:00 |
| 2 units | 2 hours | 2 sessions | 1 hour each | M: 7:00-8:00, W: 7:00-8:00 |
| 3 units | 3 hours | 2 sessions | 1.5 hours each | M: 7:00-8:30, W: 7:00-8:30 |
| 4+ units | 4+ hours | 4+ sessions | 1 hour each | M: 7:00-8:00, W: 7:00-8:00, T: 7:00-8:00, Th: 7:00-8:00 |

### Laboratory Sessions
| Lab Units | Total Hours | Sessions | Duration per Session | Example |
|-----------|-------------|----------|---------------------|---------|
| 1 unit | 3 hours | 2 sessions | 1.5 hours each | T: 13:00-14:30, Th: 13:00-14:30 |
| 2 units | 6 hours | 4 sessions | 1.5 hours each | T: 13:00-14:30, Th: 13:00-14:30, W: 13:00-14:30, F: 13:00-14:30 |

---

## 🕐 Available Time Slots

### Monday - Sunday (All Days)

**Morning Slots (5 slots):**
```
07:00 - 08:00
08:00 - 09:00
09:00 - 10:00
10:00 - 11:00
11:00 - 12:00
```

**🍽️ LUNCH BREAK: 12:00 - 13:00 (EXCLUDED)**

**Afternoon/Evening Slots (8 slots):**
```
13:00 - 14:00
14:00 - 15:00
15:00 - 16:00
16:00 - 17:00
17:00 - 18:00
18:00 - 19:00
19:00 - 20:00
20:00 - 21:00
```

**Total: 13 time slots per day**

---

## 📅 Day Pairing Priority

Sessions are scheduled using preferred day pairs:

**Priority 1 (Weekdays):**
1. Monday + Wednesday (MW)
2. Tuesday + Thursday (TTh)
3. Monday + Friday (MF)
4. Tuesday + Friday (TF)
5. Wednesday + Friday (WF)

**Priority 2 (Weekend Fallback):**
6. Monday + Saturday (MS)
7. Tuesday + Saturday (TS)
8. Wednesday + Saturday (WS)
9. Thursday + Saturday (ThS)
10. Friday + Saturday (FS)
11. Monday + Sunday (MSu)
12. Tuesday + Sunday (TSu)

---

## 💡 Common Subject Examples

### Example 1: Programming 1 (3 Lec + 1 Lab)
**Total Units:** 4 units  
**Total Hours:** 6 hours per week

**Lecture (3 units):**
- 2 sessions × 1.5 hours = 3 hours
- Monday: 7:00 AM - 8:30 AM
- Wednesday: 7:00 AM - 8:30 AM

**Laboratory (1 unit):**
- 2 sessions × 1.5 hours = 3 hours
- Tuesday: 1:00 PM - 2:30 PM
- Thursday: 1:00 PM - 2:30 PM

---

### Example 2: Mathematics (3 Lec)
**Total Units:** 3 units  
**Total Hours:** 3 hours per week

**Lecture (3 units):**
- 2 sessions × 1.5 hours = 3 hours
- Monday: 8:00 AM - 9:30 AM
- Wednesday: 8:00 AM - 9:30 AM

---

### Example 3: English (2 Lec)
**Total Units:** 2 units  
**Total Hours:** 2 hours per week

**Lecture (2 units):**
- 2 sessions × 1 hour = 2 hours
- Tuesday: 7:00 AM - 8:00 AM
- Thursday: 7:00 AM - 8:00 AM

---

### Example 4: Database Systems (2 Lec + 1 Lab)
**Total Units:** 3 units  
**Total Hours:** 5 hours per week

**Lecture (2 units):**
- 2 sessions × 1 hour = 2 hours
- Monday: 9:00 AM - 10:00 AM
- Wednesday: 9:00 AM - 10:00 AM

**Laboratory (1 unit):**
- 2 sessions × 1.5 hours = 3 hours
- Tuesday: 2:00 PM - 3:30 PM
- Thursday: 2:00 PM - 3:30 PM

---

## ⚠️ Important Rules

### ✅ DO:
- Schedule lectures and labs on different days
- Use weekdays (Mon-Fri) as priority
- Maintain 30-minute breaks between faculty classes
- Assign lab rooms for laboratory sessions
- Assign regular rooms for lecture sessions

### ❌ DON'T:
- Schedule multiple sessions of same subject on same day
- Schedule during lunch break (12:00 PM - 1:00 PM)
- Exceed faculty maximum teaching units (default: 18 units)
- Double-book rooms or faculty
- Schedule before 7:00 AM or after 8:00 PM

---

## 🎯 Quick Calculation Formulas

### Total Hours per Week
```
Total Hours = (Lec Units × 1 hour) + (Lab Units × 3 hours)
```

**Examples:**
- 3 Lec + 1 Lab = (3 × 1) + (1 × 3) = **6 hours/week**
- 2 Lec + 1 Lab = (2 × 1) + (1 × 3) = **5 hours/week**
- 3 Lec + 0 Lab = (3 × 1) + (0 × 3) = **3 hours/week**

### Number of Sessions
```
Lec Sessions = 
  - If 2 units: 2 sessions
  - If 3 units: 2 sessions
  - Otherwise: number of units

Lab Sessions = Lab Units × 2
```

**Examples:**
- 3 Lec = **2 sessions** (1.5 hrs each)
- 2 Lec = **2 sessions** (1 hr each)
- 1 Lab = **2 sessions** (1.5 hrs each)

---

## 🔍 Conflict Detection

The system automatically checks for:

1. **Faculty Conflicts**: Same faculty, same day, overlapping times
2. **Room Conflicts**: Same room, same day, overlapping times
3. **Student Conflicts**: Same program/year/section, same day, overlapping times
4. **Break Violations**: Less than 30 minutes between faculty classes
5. **Lunch Violations**: Sessions overlapping 12:00 PM - 1:00 PM
6. **Same-Day Violations**: Multiple sessions of same subject on same day

---

## 📊 Time Slot Capacity

### Per Day (13 slots)
- **1-hour sessions**: Up to 13 sessions
- **1.5-hour sessions**: Up to 8 sessions (with some 1-hour gaps)
- **Mixed sessions**: Varies based on combination

### Per Week (Mon-Fri = 65 slots)
- **Maximum 1-hour sessions**: 65 sessions
- **Maximum 1.5-hour sessions**: ~43 sessions
- **Practical limit**: ~50-55 sessions (accounting for conflicts)

---

## 🎓 Faculty Workload

### Default Maximum: 18 units per faculty

**Example Workload:**
- Programming 1 (4 units) + Database (3 units) + Web Dev (4 units) = **11 units** ✅
- 6 subjects × 3 units each = **18 units** ✅
- 7 subjects × 3 units each = **21 units** ❌ OVERLOAD

**Note:** Units are counted once per subject, not per session.

---

## 🚀 Pro Tips

1. **Prioritize Core Subjects**: Schedule major subjects in morning slots (7:00 AM - 12:00 PM)
2. **Lab Scheduling**: Prefer afternoon slots for lab sessions (1:00 PM onwards)
3. **Faculty Availability**: Check faculty preferred time slots for better matching
4. **Room Optimization**: Group similar subjects in same room to minimize transitions
5. **Conflict Resolution**: If conflicts occur, regenerate or manually adjust times

---

## 📱 Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  TIME SLOT QUICK REFERENCE                  │
├─────────────────────────────────────────────┤
│  Lec: 1 unit = 1 hour                       │
│    • 2 units → 2 sessions × 1h              │
│    • 3 units → 2 sessions × 1.5h            │
│                                             │
│  Lab: 1 unit = 3 hours                      │
│    • 1 unit → 2 sessions × 1.5h             │
│                                             │
│  Time Range: 7:00 AM - 8:00 PM              │
│  Lunch Break: 12:00 PM - 1:00 PM (excluded) │
│  Days: Mon-Fri (priority), Sat-Sun (backup) │
│                                             │
│  Total Slots: 13 per day                    │
│  Faculty Max: 18 units (default)            │
└─────────────────────────────────────────────┘
```

---

**Last Updated:** November 3, 2025  
**System Version:** 2.0 (Flexible Time Slots)
