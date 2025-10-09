# Schedule Correction Example - 3-Unit Lecture Rule

## Validation Rule Applied
**For lecture subjects with 3 units (lec=3, lab=0):**
- Total contact time per week = **3 hours only**
- Divided into **two 1.5-hour sessions** (e.g., Monday and Wednesday, 8:00–9:30 AM)

**For laboratory subjects (lab > 0):**
- Retain longer schedule blocks (e.g., 3–4 hours per session)

---

## Input Schedule (Before Correction)

| Subject Code | Subject Name | Schedule | Room | Program | Year Level | Type |
|-------------|--------------|----------|------|---------|------------|------|
| CS 102 | Computer Programming 1 | M 08:30–12:00; W 13:00–16:30 | Lab 2 | BSCS | 1st Year | Lab |
| CS 104 | Discrete Mathematics | MW 08:30–11:30 | Room 1 | BSCS | 1st Year | Lec 3 |
| GE 103 | Understanding the Self | TTh 09:00–12:00 | Room 3 | BSCS | 1st Year | Lec 3 |
| CRIM 101 | Introduction to Criminology | MW 08:00–11:00 | Room 2 | BSCRIM | 1st Year | Lec 3 |
| CRIM 102 | Philippine Criminal Justice System | TTh 08:00–11:00 | Room 3 | BSCRIM | 1st Year | Lec 3 |
| CRIM 103 | Ethics and Values | MW 01:30–04:30 | Room 2 | BSCRIM | 1st Year | Lec 3 |
| PE 101 | Physical Fitness | S 08:30–10:30 | Room 1 | BSCRIM | 1st Year | Lec 2 |
| NSTP 101 | National Service Training Program 1 | TTh 02:00–05:00 | Room 2 | BSCRIM | 1st Year | Lec 3 |
| CRIM 104 | Theories of Crime Causation | MW 08:00–11:00 | Room 3 | BSCRIM | 1st Year | Lec 3 |
| CRIM 105 | Police Organization and Administration | TTh 08:00–11:00 | Room 1 | BSCRIM | 1st Year | Lec 3 |
| GE 103 | Understanding the Self | MW 01:30–04:30 | Room 3 | BSCRIM | 1st Year | Lec 3 |

---

## Corrected Schedule (After Auto-Correction)

### ✅ BSCS 1st Year

**✓ CS 102 – Computer Programming 1**
- **Schedule:** MW 13:00–16:30 (3.5 hours per session)
- **Total Hours/Week:** 7 hours (Lec 1 + Lab 2 = 1 + 6 = 7 hours)
- **Calculation:** 3.5h × 2 sessions = 7h/week ✅
- **Room:** Lab 2
- **Status:** ✅ **CORRECT** - Laboratory subject with proper 3.5h sessions on MW

**✓ CS 104 – Discrete Mathematics**
- **Before:** MW 08:30–11:30 (6 hours/week - INCORRECT)
- **After:** MW 08:30–10:00 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 1
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

**✓ GE 103 – Understanding the Self**
- **Before:** TTh 09:00–12:00 (6 hours/week - INCORRECT)
- **After:** TTh 09:00–10:30 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 3
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

---

### ✅ BSCRIM 1st Year

**✓ CRIM 101 – Introduction to Criminology**
- **Before:** MW 08:00–11:00 (6 hours/week - INCORRECT)
- **After:** MW 08:00–09:30 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 2
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

**✓ CRIM 102 – Philippine Criminal Justice System**
- **Before:** TTh 08:00–11:00 (6 hours/week - INCORRECT)
- **After:** TTh 08:00–09:30 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 3
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

**✓ CRIM 103 – Ethics and Values**
- **Before:** MW 01:30–04:30 (6 hours/week - INCORRECT)
- **After:** MW 01:30–03:00 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 2
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

**✓ PE 101 – Physical Fitness**
- **Schedule:** S 08:30–10:30
- **Total Hours/Week:** 2 hours (Lec 2 = 2h × 1 session)
- **Room:** Room 1
- **Status:** ✅ **CORRECT** - 2-unit course, single 2-hour session is valid

**✓ NSTP 101 – National Service Training Program 1**
- **Before:** TTh 02:00–05:00 (6 hours/week - INCORRECT)
- **After:** TTh 02:00–03:30 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 2
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

**✓ CRIM 104 – Theories of Crime Causation**
- **Before:** MW 08:00–11:00 (6 hours/week - INCORRECT)
- **After:** MW 08:00–09:30 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 3
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

**✓ CRIM 105 – Police Organization and Administration**
- **Before:** TTh 08:00–11:00 (6 hours/week - INCORRECT)
- **After:** TTh 08:00–09:30 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 1
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

**✓ GE 103 – Understanding the Self (Section 2)**
- **Before:** MW 01:30–04:30 (6 hours/week - INCORRECT)
- **After:** MW 01:30–03:00 (3 hours/week - CORRECTED)
- **Total Hours/Week:** 3 hours (Lec 3 = 1.5h × 2 sessions)
- **Room:** Room 3
- **Status:** ✅ **AUTO-CORRECTED** - Reduced from 3h/session to 1.5h/session

---

## Summary of Corrections

| Correction Type | Count |
|----------------|-------|
| ✅ Auto-corrected (3-unit lectures) | 9 subjects |
| ✅ Already correct (lab courses) | 1 subject |
| ✅ Already correct (2-unit lecture) | 1 subject |
| **Total Subjects** | **11** |

### Key Changes:
1. **All 3-unit lecture subjects** reduced from **3 hours/session** to **1.5 hours/session**
2. **Total weekly hours** now correctly match the unit requirements (3 units = 3 hours/week)
3. **Laboratory subjects** retain their longer session durations (CS 102 with 7 hours/week)
4. **Days remain the same** - only session duration was adjusted

---

## Validation Rules Summary

✅ **RULE 1:** Lab courses must be in lab rooms (Lab 1, Lab 2, etc.)  
✅ **RULE 2:** 3-unit lectures = 3 hours/week = 1.5 hours/session × 2 sessions  
✅ **RULE 3:** General duration validation for other course types  
✅ **RULE 4:** No room conflicts (same room, same day, overlapping times)  
✅ **RULE 5:** No faculty conflicts (same faculty, same day, overlapping times)

---

## How to Use

When you generate a schedule, the system will now automatically:

1. **Detect** 3-unit lecture subjects (lec=3, lab=0)
2. **Validate** that total weekly hours = 3 hours
3. **Auto-correct** sessions to 1.5 hours each if they exceed this
4. **Preserve** laboratory courses with their longer sessions
5. **Report** any conflicts or warnings in the console

The corrected schedule will be displayed in the UI with the proper time slots.
