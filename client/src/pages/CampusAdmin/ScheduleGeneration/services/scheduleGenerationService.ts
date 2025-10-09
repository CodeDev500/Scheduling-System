import api from '@/api/axios';
import type { Faculty, Room, ScheduleItem } from '../../../../types';
// Day utilities not required here; constrain patterns internally to MW, TTh, and S.

export interface CurriculumCourse {
  id: number;
  code: string;
  name: string;
  lec: number;
  lab: number;
  units: number;
  hours: number;
  tags?: string[];
  offerings: any[];
}

export interface FacultyRecommendation {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial?: string;
  email: string;
  department: string;
  specialization?: string;
  matchScore: number;
  matchingTags: string[];
}

export interface ProgramCourses {
  [semester: string]: CurriculumCourse[];
}

export interface UsedTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  facultyId: string;
  roomId: string;
  subjectId: string;
  programCode?: string;
  yearLevel?: string | number;
}

// Local course input interface aligned with requirements
interface CourseInput {
  id: string | number;
  code?: string; // e.g., "CS101"
  subjectCode?: string;
  name?: string;
  subjectName?: string;
  subjectDescription?: string;
  lec?: number; // lecture hours
  lab?: number; // lab hours
  units: number; // total units (hours per week)
  hours?: number; // optional total hours
  yearLevel?: number | string;
  semester?: string | number;
  period?: string | number; // sometimes used instead of semester
  programCode?: string; // used by existing flow
  tags?: string[] | string; // may come as CSV or array
}

export class ScheduleGenerationService {
  // Global state tracking to prevent conflicts
  private static usedTimeSlots: UsedTimeSlot[] = [];
  private static globalTimeSlotIndex: number = 0;
  // Tracks how many courses have been successfully scheduled to alternate AM/PM distribution
  private static scheduledCourseCount: number = 0;

  // Enhanced faculty matching algorithm (unchanged)
  static calculateFacultyMatchScore(courseTags: string[], facultySpecializations: string[]): number {
    if (!courseTags || courseTags.length === 0 || !facultySpecializations || facultySpecializations.length === 0) {
      return 0;
    }

    const normalizedCourseTags = courseTags.map(tag => tag.toLowerCase().trim());
    const normalizedSpecializations = facultySpecializations.map(spec => spec.toLowerCase().trim());

    let matchScore = 0;
    let totalPossibleMatches = normalizedCourseTags.length;

    for (const courseTag of normalizedCourseTags) {
      if (normalizedSpecializations.includes(courseTag)) {
        matchScore += 10;
      }
    }

    for (const courseTag of normalizedCourseTags) {
      for (const specialization of normalizedSpecializations) {
        if (courseTag.includes(specialization) || specialization.includes(courseTag)) {
          matchScore += 5;
        }
        
        const courseKeywords = courseTag.split(/[\s\-_&]+/);
        const specKeywords = specialization.split(/[\s\-_&]+/);
        
        for (const courseKeyword of courseKeywords) {
          if (courseKeyword.length > 2 && specKeywords.some(specKeyword => 
            specKeyword.includes(courseKeyword) || courseKeyword.includes(specKeyword)
          )) {
            matchScore += 2;
          }
        }
      }
    }

    const maxPossibleScore = Math.max(1, totalPossibleMatches * 10);
    return Math.min(100, (matchScore / maxPossibleScore) * 100);
  }

  static parseJsonArray(jsonString: string | string[]): string[] {
    if (Array.isArray(jsonString)) {
      return jsonString;
    }
    
    if (!jsonString || typeof jsonString !== 'string') {
      return [];
    }

    if (jsonString.includes(',') && !jsonString.trim().startsWith('[')) {
      return jsonString.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }

    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [parsed.toString()];
    } catch (error) {
      return [jsonString.trim()];
    }
  }

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

    const sortedFaculty = facultyWithScores.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      const aLoad = a.currentLoad || 0;
      const bLoad = b.currentLoad || 0;
      return aLoad - bLoad;
    });
    
    const goodMatches = sortedFaculty.filter(f => f.matchScore > 0);
    
    if (goodMatches.length >= maxMatches) {
      return goodMatches.slice(0, maxMatches);
    }
    
    const fallbackFaculty = sortedFaculty.filter(f => f.matchScore === 0).slice(0, maxMatches - goodMatches.length);
    
    return [...goodMatches, ...fallbackFaculty];
  }

  static async getCurriculumCourses(programCode: string, yearLevel: string): Promise<ProgramCourses> {
    try {
      const response = await api.get(`/curriculum/program/${programCode}/${yearLevel}`);
      console.log('Curriculum courses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching curriculum courses:', error);
      throw new Error('Failed to fetch curriculum courses');
    }
  }

  static async getFacultyRecommendations(programCode: string, yearLevel: string, department?: string): Promise<any> {
    try {
      const params = department ? `?department=${department}` : '';
      const response = await api.get(`/faculty-recommendations/program/${programCode}/${yearLevel}${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty recommendations:', error);
      throw new Error('Failed to fetch faculty recommendations');
    }
  }

  static async getInstructors(): Promise<Faculty[]> {
    try {
      const response = await api.get('/user/instructor');
      return response.data.map((instructor: any) => ({
        id: instructor.id.toString(),
        name: `${instructor.firstname} ${instructor.lastname}`,
        email: instructor.email,
        department: instructor.department,
        specialization: instructor.specialization,
        expertise: instructor.specialization ? instructor.specialization.split(',').map((s: string) => s.trim()) : [],
        maxHoursPerWeek: 40,
        preferredTimeSlots: [],
        unavailableSlots: []
      }));
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new Error('Failed to fetch instructors');
    }
  }

  static async getRooms(): Promise<Room[]> {
    try {
      const response = await api.get('/rooms');
      return response.data.data.map((room: any) => ({
        id: room.id.toString(),
        name: room.name,
        capacity: room.capacity || 30,
        type: room.type || 'Classroom',
        equipment: room.equipment || [],
        building: room.building || 'Main Building',
        floor: room.floor || 1
      }));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  }

  // Enhanced conflict detection
  private static timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  }

  private static markTimeSlotAsUsed(
    day: string,
    startTime: string,
    endTime: string,
    facultyId: string,
    roomId: string,
    subjectId: string,
    programCode?: string,
    yearLevel?: string | number
  ): void {
    this.usedTimeSlots.push({
      day,
      startTime,
      endTime,
      facultyId,
      roomId,
      subjectId,
      programCode,
      yearLevel
    });
  }

  // Validation and auto-correction helper
  private static validateAndCorrectCourse(course: CourseInput): CourseInput {
    const corrected = { ...course };
    
    // Ensure lec and lab are numbers
    corrected.lec = Number(corrected.lec) || 0;
    corrected.lab = Number(corrected.lab) || 0;
    corrected.units = Number(corrected.units) || 0;
    
    // VALIDATION RULE: Prevent scheduling if both lec and lab are 0
    if (corrected.lec === 0 && corrected.lab === 0) {
      console.warn(`⚠️ SKIPPING: ${corrected.code || corrected.subjectCode} has 0 lec and 0 lab units`);
      return { ...corrected, units: 0 }; // Mark as invalid
    }
    
    // AUTO-CORRECT: If units don't match lec + lab, recalculate
    const calculatedUnits = corrected.lec + corrected.lab;
    if (corrected.units !== calculatedUnits) {
      console.warn(`⚠️ AUTO-CORRECTING: ${corrected.code || corrected.subjectCode} units: ${corrected.units} → ${calculatedUnits} (lec: ${corrected.lec}, lab: ${corrected.lab})`);
      corrected.units = calculatedUnits;
    }
    
    // Calculate total hours per week using the formula
    const hoursPerWeek = (corrected.lec * 1) + (corrected.lab * 3);
    corrected.hours = hoursPerWeek;
    
    console.log(`✅ VALIDATED: ${corrected.code || corrected.subjectCode} - Lec: ${corrected.lec}, Lab: ${corrected.lab}, Units: ${corrected.units}, Hours/Week: ${hoursPerWeek}`);
    
    return corrected;
  }

  static async generateScheduleDataFromCurriculum(
    arg0: any[],
    instructors: any[],
    arg2: any,
    yearLevel?: string,
    semester?: string,
    department?: string
  ): Promise<ScheduleItem[]> {
    this.globalTimeSlotIndex = Math.floor(Math.random() * 10);
    this.scheduledCourseCount = 0;
    this.usedTimeSlots = []; // clear used slots for fresh run

    try {
      const isNewApi = Array.isArray(arg2);
      const courses: CourseInput[] = isNewApi ? (arg0 as CourseInput[]) : (arg0 as CourseInput[]);

      // VALIDATE AND AUTO-CORRECT ALL COURSES
      const validatedCourses = courses.map(c => this.validateAndCorrectCourse(c));
      
      // FILTER OUT INVALID COURSES (0 lec and 0 lab)
      const filteredCourses = isNewApi
        ? validatedCourses.filter(c => c.units > 0)
        : (courses as any[]).filter(course => {
            const programMatch = course.programCode === arg2;
            const yearMatch = course.yearLevel === yearLevel;
            const semesterMatch = course.period === semester || course.semester === semester;
            return programMatch && yearMatch && semesterMatch;
          });

      if (filteredCourses.length === 0) {
        console.warn('⚠️ No courses found');
        return [];
      }

      const rooms: Room[] = isNewApi ? (arg2 as Room[]) : await this.getRooms();
      if (rooms.length === 0) {
        throw new Error('No rooms available for scheduling');
      }

      const scheduleItems: ScheduleItem[] = [];

      for (let courseIndex = 0; courseIndex < filteredCourses.length; courseIndex++) {
        const course = filteredCourses[courseIndex] as CourseInput;
        console.log(`\n--- 📚 Processing course ${courseIndex + 1}/${filteredCourses.length}: ${course.subjectCode || course.code} ---`);

        if (course.units === 0) {
          console.log(`⚠️ SKIPPED: Course has 0 units`);
          continue;
        }

        if (courseIndex % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        console.log(`🔍 Finding conflict-free schedule...`);
        const conflictFreeResult = this.findConflictFreeSchedule(course, instructors, rooms, 150);

        if (!conflictFreeResult) {
          console.log(`❌ SKIPPED: Failed to find conflict-free schedule after attempts`);
          continue;
        }

        const { timeSlots, faculty: subjectFaculty, room: assignedRoom } = conflictFreeResult;

        if (!subjectFaculty || !assignedRoom || timeSlots.length === 0) {
          console.log(`❌ SKIPPED: Invalid assignments`);
          continue;
        }

        // compute total scheduled minutes for sanity check
        const totalScheduledMinutes = timeSlots.reduce((sum, t) => sum + (t.duration || (this.timeToMinutes(t.endTime) - this.timeToMinutes(t.startTime))), 0);
        // New logic: Lec 1 unit = 1 hour, Lab 1 unit = 3 hours
        const expectedMinutes = ((course.lec || 0) * 60) + ((course.lab || 0) * 180);
        if (totalScheduledMinutes < expectedMinutes) {
          console.warn(`⚠️ WARNING: Scheduled minutes (${totalScheduledMinutes}) < expected (${expectedMinutes}) for ${course.subjectCode || course.code}`);
        }

        console.log(`✅ SUCCESS: Scheduled ${course.subjectCode || course.code}`);

        const facultyId = subjectFaculty?.id?.toString() || 'unassigned';
        const roomId = assignedRoom?.id?.toString() || 'unassigned';

        // Instead of collapsing multiple separated sessions into a single continuous start/end,
        // we keep earliestStart/latestEnd only if sessions are contiguous (no big gaps).
        const startTimes = timeSlots.map(slot => slot.startTime);
        const endTimes = timeSlots.map(slot => slot.endTime);
        const earliestStart = startTimes.reduce((earliest, current) =>
          this.compareTime(current, earliest) < 0 ? current : earliest
        );
        const latestEnd = endTimes.reduce((latest, current) =>
          this.compareTime(current, latest) > 0 ? current : latest
        );

        // detect if there is any gap > 30 minutes between sessions (e.g., lunch)
        const sortedSlots = timeSlots.slice().sort((a, b) => this.compareTime(a.startTime, b.startTime));
        let contiguous = true;
        for (let i = 1; i < sortedSlots.length; i++) {
          const prevEnd = sortedSlots[i - 1].endTime;
          const nextStart = sortedSlots[i].startTime;
          if (this.timeToMinutes(nextStart) - this.timeToMinutes(prevEnd) > 30) {
            contiguous = false;
            break;
          }
        }

        // produce a clear day/time representation:
        // if contiguous -> show combined day string and earliestStart/latestEnd
        // otherwise -> create day string with semicolon-separated sessions (keeps accurate representation)
        let dayString = this.combineDays(timeSlots.map(slot => slot.day)); // fallback (keeps abbreviations)
        let displayStart = earliestStart;
        let displayEnd = latestEnd;

        if (!contiguous) {
          // build a descriptive day/time string like "F 09:00-11:30; F 13:00-15:00"
          dayString = timeSlots.map(ts => `${this.abbrevDay(ts.day)} ${ts.startTime}-${ts.endTime}`).join('; ');
          // set displayStart/displayEnd to the first session only (to avoid appearing as continuous 9-15)
          displayStart = sortedSlots[0].startTime;
          displayEnd = sortedSlots[0].endTime;
        } else {
          // keep dayString as combined abbreviations
          dayString = this.combineDays(timeSlots.map(slot => slot.day));
        }

        let semesterValue = course.semester || course.period;
        if (typeof semesterValue === 'number') {
          if (semesterValue === 1) semesterValue = '1st Semester';
          else if (semesterValue === 2) semesterValue = '2nd Semester';
          else if (semesterValue === 3) semesterValue = 'Summer';
        }

        const lecHours = course.lec || 0;
        const labHours = course.lab || 0;
        let subjectType = 'Lecture';
        if (lecHours > 0 && labHours > 0) {
          subjectType = 'Lecture/Laboratory';
        } else if (labHours > 0 && lecHours === 0) {
          subjectType = 'Laboratory';
        }

        const scheduleItem: ScheduleItem = {
          id: `${course.id}`,
          subjectId: course.id.toString(),
          subjectCode: course.subjectCode ?? "",
          subjectName: course.subjectDescription ?? "",
          facultyId: facultyId,
          facultyName: subjectFaculty?.firstname
            ? `${subjectFaculty.firstname} ${subjectFaculty.lastname || ''}`.trim()
            : 'Unassigned',
          roomId: roomId,
          roomName: assignedRoom?.name || 'TBA',
          day: dayString,
          startTime: displayStart,
          endTime: displayEnd,
          units: course.units || 3,
          lec: lecHours,
          lab: labHours,
          yearLevel: course.yearLevel || "1st Year",
          semester: semesterValue || '1st Semester',
          type: subjectType as 'Lec' | 'Lab' | 'Lec/Lab'
        };

        // Mark each precise timeslot as used (so conflicts are detected per-block)
        timeSlots.forEach(timeSlot => {
          this.markTimeSlotAsUsed(
            timeSlot.day,
            timeSlot.startTime,
            timeSlot.endTime,
            facultyId,
            roomId,
            course.id.toString(),
            (course as any).programCode || (course as any).program,
            (course as any).yearLevel
          );
        });

        scheduleItems.push(scheduleItem);
        this.scheduledCourseCount++;
      }

      console.log(`✅ Generated ${scheduleItems.length} total schedule items`);
      
      // APPLY COMPREHENSIVE VALIDATION AND AUTO-CORRECTION
      const availableRooms = isNewApi ? arg2 : await this.getRooms();
      const { correctedSchedule, conflicts, warnings } = this.validateAndFixSchedule(scheduleItems, availableRooms);
      
      if (conflicts.length > 0 || warnings.length > 0) {
        console.log('\n📊 VALIDATION SUMMARY:');
        console.log(`   ✅ Auto-fixed issues: ${scheduleItems.length - conflicts.length - warnings.length}`);
        console.log(`   ⚠️ Warnings: ${warnings.length}`);
        console.log(`   ❌ Unresolved conflicts: ${conflicts.length}`);
      }
      
      return correctedSchedule;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw new Error('Failed to generate schedule data from curriculum');
    }
  }

  // Helper that returns day abbreviation used for the descriptive day/time string above
  private static abbrevDay(day: string) {
    const map: Record<string, string> = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'Th',
      'Friday': 'F',
      'Saturday': 'S',
      'Sunday': 'Su'
    };
    return map[day] || day;
  }

  /**
   * generateTimeSlots — rewritten to:
   *  - compute per-session durations that sum exactly to total units * 60 (in 30-min increments)
   *  - prefer single continuous placement for single-day patterns (so we don't split across lunch and then display 9:00-15:00)
   *  - systematically try day × startTime combinations to fill sessionsNeeded (with attempt cap)
   */
  static generateTimeSlots(
    lecHours: number,
    labHours: number,
    totalUnits: number = 3,
    startingTimeSlotIndex: number = 0,
    dayPatternIndex: number = 0,
    options?: { sessionDurationMinutesOverride?: number; sessionsPerWeekOverride?: number }
  ) {
    if (totalUnits === 0) return [];

    const timeSlots: any[] = [];
    const totalWeeklyMinutes = (lecHours * 60) + (labHours * 180);

    // Decide sessionsNeeded
    let sessionsNeeded: number;
    if (options?.sessionsPerWeekOverride) {
      sessionsNeeded = options.sessionsPerWeekOverride;
    } else {
      if (totalWeeklyMinutes === 420) { // 7 units (7 hours)
        sessionsNeeded = 2;
      } else if (totalWeeklyMinutes <= 90) { // 1.5 hours or less
        sessionsNeeded = 1;
      } else if (totalWeeklyMinutes === 180) { // 3 hours (3 lec units)
        sessionsNeeded = 2; // Split into 2 sessions of 1.5 hours each
      } else if (totalWeeklyMinutes === 120) { // 2 hours
        sessionsNeeded = 1; // Single 2-hour session
      } else {
        // For other durations, split into sessions of max 2 hours (120 min) each
        sessionsNeeded = Math.ceil(totalWeeklyMinutes / 120);
      }
    }

    // compute per-session durations in 30-minute increments that sum exactly to totalWeeklyMinutes
    const perSessionBase = Math.floor((totalWeeklyMinutes / sessionsNeeded) / 30) * 30;
    let remainder = totalWeeklyMinutes - perSessionBase * sessionsNeeded;
    const sessionDurations: number[] = [];
    for (let i = 0; i < sessionsNeeded; i++) {
      let dur = perSessionBase;
      if (remainder >= 30) {
        dur += 30;
        remainder -= 30;
      }
      sessionDurations.push(dur);
    }
    if (remainder > 0) sessionDurations[sessionDurations.length - 1] += remainder;
    
    // Debug log for session distribution
    console.log(`📊 Session Distribution: ${totalWeeklyMinutes}min total → ${sessionsNeeded} sessions of [${sessionDurations.map(d => `${d}min (${(d/60).toFixed(1)}h)`).join(', ')}]`);

    // Day patterns and selection
    const dayPatterns = this.getDayPatternForUnits(totalUnits);
    const selectedDayPattern = dayPatterns[dayPatternIndex % dayPatterns.length];

    // Candidate start times - generate all possible start times in 30-min increments
    // We'll validate against actual session durations when creating slots
    const allPossibleStarts: string[] = [];
    for (let hour = 7; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        allPossibleStarts.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      }
    }
    if (allPossibleStarts.length === 0) return [];

    // REMOVED: Single-day continuous block logic
    // This was causing issues where multi-day patterns (MW, TTh) were being treated as single blocks
    // Now all courses properly distribute sessions across their designated days

    // Try systematic placement - all sessions use the SAME start time on different days
    const maxAttempts = allPossibleStarts.length * 10;
    let attempts = 0;
    
    // Try each possible start time until we find one that works for ALL sessions
    while (timeSlots.length === 0 && attempts < maxAttempts) {
      const candidateStartIndex = (startingTimeSlotIndex + attempts) % allPossibleStarts.length;
      const candidateStart = allPossibleStarts[candidateStartIndex];
      
      // Try to create all sessions with this same start time on different days
      const tempSlots: any[] = [];
      let allSessionsValid = true;
      
      for (let sessionIdx = 0; sessionIdx < sessionsNeeded; sessionIdx++) {
        const day = selectedDayPattern[sessionIdx % selectedDayPattern.length] || selectedDayPattern[0];
        const duration = sessionDurations[sessionIdx];
        const candidateEnd = this.addMinutes(candidateStart, duration);
        
        // Validate this time slot
        if (!this.isValidTimeSlot(candidateStart, candidateEnd)) {
          allSessionsValid = false;
          break;
        }
        
        // Check for overlap with already created sessions on the same day
        const overlapsWithOtherSession = tempSlots.some(s =>
          s.day === day && this.timeRangesOverlap(s.startTime, s.endTime, candidateStart, candidateEnd)
        );
        
        if (overlapsWithOtherSession) {
          allSessionsValid = false;
          break;
        }
        
        // Add to temp slots
        tempSlots.push({
          id: `slot-${sessionIdx}-${day}-${candidateStart}`,
          day,
          startTime: candidateStart,
          endTime: candidateEnd,
          duration,
          type: (lecHours > 0 && labHours > 0) ? 'Lec/Lab' : (lecHours > 0 ? 'Lecture' : 'Lab')
        });
      }
      
      // If all sessions are valid with this start time, use them
      if (allSessionsValid && tempSlots.length === sessionsNeeded) {
        timeSlots.push(...tempSlots);
        console.log(`✅ All ${sessionsNeeded} sessions scheduled at ${candidateStart} on different days`);
      }
      
      attempts++;
    }
    
    // If no valid time slots found after all attempts, log warning
    if (timeSlots.length === 0) {
      console.warn(`⚠️ Could not find valid time slots for course after ${attempts} attempts`);
      return [];
    }

    // Final sanity: ensure total scheduled minutes equal expected; try best-effort adjust last session by 30s if necessary
    const scheduledMinutes = timeSlots.reduce((sum, t) => sum + (t.duration || (this.timeToMinutes(t.endTime) - this.timeToMinutes(t.startTime))), 0);
    if (scheduledMinutes !== totalWeeklyMinutes) {
      const diff = totalWeeklyMinutes - scheduledMinutes;
      if (Math.abs(diff) >= 30 && timeSlots.length > 0) {
        // try to expand/shrink last session by multiples of 30
        const last = timeSlots[timeSlots.length - 1];
        let newDur = (last.duration || (this.timeToMinutes(last.endTime) - this.timeToMinutes(last.startTime))) + diff;
        newDur = Math.max(30, Math.round(newDur / 30) * 30);
        const newEnd = this.addMinutes(last.startTime, newDur);
        if (this.isValidTimeSlot(last.startTime, newEnd)) {
          last.duration = newDur;
          last.endTime = newEnd;
        } else {
          console.warn(`⚠️ Unable to exactly match required minutes (${totalWeeklyMinutes}) for course — scheduled ${scheduledMinutes}`);
        }
      } else if (scheduledMinutes !== totalWeeklyMinutes) {
        console.warn(`⚠️ TimeSlots sum mismatch: scheduled ${scheduledMinutes} / expected ${totalWeeklyMinutes}`);
      }
    }

    return timeSlots;
  }

// Improved conflict-free scheduling
static findConflictFreeSchedule(
  course: any,
  instructors: any[],
  rooms: any[],
  maxRetries: number = 100
): { timeSlots: any[], faculty: any, room: any } | null {
  const lecHours = course.lec || 0;
  const labHours = course.lab || 0;
  const totalUnits = course.units || 3;

  const dayPatterns = this.getDayPatternForUnits(totalUnits);
  // New logic: Lab counts as 3 hours per unit
  const totalWeeklyHours = (lecHours * 1) + (labHours * 3);

  // Build candidate distributions
  const distributionCandidates: { duration: number; sessions: number }[] = [];
  const totalWeeklyMinutes = totalWeeklyHours * 60;
  
  if (totalWeeklyHours === 7) {
    distributionCandidates.push({ duration: 210, sessions: 2 }); // 3.5 hours per session
    distributionCandidates.push({ duration: 60, sessions: 7 });  // 1 hour per session
  } else if (totalWeeklyHours <= 1.5) {
    distributionCandidates.push({ duration: totalWeeklyMinutes, sessions: 1 }); // Single session
  } else if (totalWeeklyHours === 2) {
    distributionCandidates.push({ duration: 120, sessions: 1 }); // Single 2-hour session
  } else if (totalWeeklyHours === 3) {
    distributionCandidates.push({ duration: 90, sessions: 2 }); // Two 1.5-hour sessions
  } else {
    // For other durations, split into sessions of max 2 hours (120 min) each
    const baseDuration = 120;
    const sessions = Math.ceil(totalWeeklyMinutes / baseDuration);
    distributionCandidates.push({ duration: baseDuration, sessions });
  }

  const qualifiedFaculty = this.findBestFacultyMatches(course, instructors, instructors.length);
  const roomsShuffled = [...rooms].sort(() => Math.random() - 0.5);
  const facultyShuffled = [...qualifiedFaculty].sort(() => Math.random() - 0.5);

  if (qualifiedFaculty.length === 0 && instructors.length > 0) {
    qualifiedFaculty.push(...instructors);
  }

  // Strategy: try combinations
  for (const candidate of distributionCandidates) {
    const timeSlotOptions = this.getTimeSlotOptions(candidate.duration);
    const balancedOrder = this.getBalancedStartOrder(timeSlotOptions);

    for (let timeSlotAttempt = 0; timeSlotAttempt < maxRetries; timeSlotAttempt++) {
      for (let dayPatternIndex = 0; dayPatternIndex < dayPatterns.length; dayPatternIndex++) {
        if (totalWeeklyHours === 7 && candidate.duration === 210 && dayPatterns[dayPatternIndex].length < 2) {
          continue;
        }

        const startingTimeSlotIndex = balancedOrder[(this.globalTimeSlotIndex + timeSlotAttempt) % balancedOrder.length];

        const timeSlots = this.generateTimeSlots(
          lecHours,
          labHours,
          totalUnits,
          startingTimeSlotIndex,
          dayPatternIndex,
          { sessionDurationMinutesOverride: candidate.duration, sessionsPerWeekOverride: candidate.sessions }
        );

        if (timeSlots.length === 0) continue;

        // NEW: ensure only one session per subject per calendar day
        const seenDays = new Set<string>();
        let duplicateDay = false;
        for (const ts of timeSlots) {
          if (seenDays.has(ts.day)) {
            duplicateDay = true;
            break;
          }
          seenDays.add(ts.day);
        }
        if (duplicateDay) {
          // skip this generated combination — it places multiple sessions on same day
          continue;
        }

        // Prevent overlapping within same program/year
        let programYearOk = true;
        const courseProgram = (course as any).programCode || (course as any).program;
        const courseYear = (course as any).yearLevel;
        for (const timeSlot of timeSlots) {
          const overlapWithinProgramYear = this.usedTimeSlots.some(slot =>
            slot.day === timeSlot.day &&
            slot.programCode === courseProgram &&
            String(slot.yearLevel) === String(courseYear) &&
            this.timeRangesOverlap(slot.startTime, slot.endTime, timeSlot.startTime, timeSlot.endTime)
          );
          if (overlapWithinProgramYear) {
            programYearOk = false;
            break;
          }
        }
        if (!programYearOk) continue;

        // Try rooms first
        for (const room of roomsShuffled) {
          const roomId = room.id?.toString() || 'unassigned';
          const roomName = room.name || '';
          const isLabRoom = roomName.toLowerCase().includes('lab');

          // ROOM TYPE VALIDATION: Enforce lab/non-lab room assignment rules
          // If course has lab units, it MUST be assigned to a lab room
          if (labHours > 0 && !isLabRoom) {
            continue; // Skip non-lab rooms for courses with lab component
          }
          // If course has NO lab units, it must NOT be assigned to a lab room
          if (labHours === 0 && isLabRoom) {
            continue; // Skip lab rooms for lecture-only courses
          }

          let roomAvailable = true;
          for (const timeSlot of timeSlots) {
            const roomConflict = this.usedTimeSlots.some(slot =>
              slot.day === timeSlot.day &&
              slot.roomId === roomId &&
              this.timeRangesOverlap(slot.startTime, slot.endTime, timeSlot.startTime, timeSlot.endTime)
            );
            if (roomConflict) {
              roomAvailable = false;
              break;
            }
          }
          if (!roomAvailable) continue;

          // Try faculties
          for (const faculty of facultyShuffled) {
            const facultyId = faculty.id?.toString() || 'unassigned';

            let facultyAvailable = true;
            for (const timeSlot of timeSlots) {
              const facultyConflict = this.usedTimeSlots.some(slot =>
                slot.day === timeSlot.day &&
                slot.facultyId === facultyId &&
                this.timeRangesOverlap(slot.startTime, slot.endTime, timeSlot.startTime, timeSlot.endTime)
              );
              if (facultyConflict) {
                facultyAvailable = false;
                break;
              }
            }
            if (!facultyAvailable) continue;

            // Avoid repeating exact Time+Day+Room for same subject or same faculty
            const repeatsPreviousCombo = timeSlots.some(ts =>
              this.usedTimeSlots.some(slot =>
                slot.day === ts.day &&
                slot.startTime === ts.startTime &&
                slot.endTime === ts.endTime &&
                slot.roomId === roomId &&
                (slot.subjectId === String(course.id) || slot.facultyId === facultyId)
              )
            );
            if (repeatsPreviousCombo) continue;

            // Success
            console.log(`✅ Found conflict-free schedule for ${course.subjectCode || course.code}:`);
            console.log(`   Faculty: ${faculty.firstname} ${faculty.lastname} (ID: ${facultyId})`);
            console.log(`   Room: ${room.name} (ID: ${roomId})`);
            console.log(`   Time: ${timeSlots.map(t => `${t.day} ${t.startTime}-${t.endTime}`).join('; ')}`);
            console.log(`   Attempt: ${timeSlotAttempt + 1}/${maxRetries}`);

            this.globalTimeSlotIndex = (this.globalTimeSlotIndex + 1) % balancedOrder.length;
            return { timeSlots, faculty, room };
          }
        }
      }
    }
  }

  console.warn(`⚠️ No conflict-free schedule found for ${course.subjectCode || course.code} after ${maxRetries} attempts`);
  console.log(`   Tried ${dayPatterns.length} day patterns x multiple time slots x ${rooms.length} rooms x ${qualifiedFaculty.length} faculty`);
  return null;
}

  static isValidTimeSlot(startTime: string, endTime: string): boolean {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const dayStart = this.timeToMinutes('07:00');
    const lunchStart = this.timeToMinutes('12:00');
    const lunchEnd = this.timeToMinutes('13:00');
    const morningEnd = this.timeToMinutes('12:00');
    const afternoonStart = this.timeToMinutes('13:00');
    const afternoonEnd = this.timeToMinutes('20:00');

    const inMorning = start >= dayStart && end <= morningEnd;
    const inAfternoon = start >= afternoonStart && end <= afternoonEnd;
    const crossesLunch = start < lunchEnd && end > lunchStart;

    return (inMorning || inAfternoon) && !crossesLunch && end > start;
  }

  static getTimeSlotOptions(sessionDurationMinutes: number = 60) {
    const options: { startTime: string; endTime: string; duration: number }[] = [];
    // Start from 7:00 AM and generate slots every 30 minutes
    const startHour = 7;
    const endHour = 20;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const start = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const end = this.addMinutes(start, sessionDurationMinutes);
        if (this.isValidTimeSlot(start, end)) {
          options.push({ startTime: start, endTime: end, duration: sessionDurationMinutes });
        }
      }
    }
    return options;
  }

  // COMPREHENSIVE SCHEDULE VALIDATION AND AUTO-CORRECTION
  static validateAndFixSchedule(
    scheduleItems: ScheduleItem[],
    rooms: Room[]
  ): { 
    correctedSchedule: ScheduleItem[], 
    conflicts: string[], 
    warnings: string[] 
  } {
    const conflicts: string[] = [];
    const warnings: string[] = [];
    const correctedSchedule = [...scheduleItems];

    console.log('\n🔍 STARTING SCHEDULE VALIDATION AND AUTO-CORRECTION...\n');

    for (let i = 0; i < correctedSchedule.length; i++) {
      const item = correctedSchedule[i];
      const lec = item.lec || 0;
      const lab = item.lab || 0;
      
      // Calculate required hours per week
      const requiredHoursPerWeek = (lec * 1) + (lab * 3);
      
      // Parse the day string to count sessions
      // Day format can be: "MW" (combined), "M; W" (separated), or "M 08:30-10:00; W 08:30-10:00" (detailed)
      const dayString = item.day || '';
      let sessionsCount = 1;
      
      // Check if day string contains semicolons (indicates multiple sessions)
      if (dayString.includes(';')) {
        sessionsCount = dayString.split(';').length;
      } else if (dayString.length > 1 && !dayString.includes(' ')) {
        // Combined format like "MW" or "TTh"
        if (dayString.includes('Th')) {
          sessionsCount = (dayString.match(/Th/g) || []).length + (dayString.replace(/Th/g, '').length);
        } else {
          sessionsCount = dayString.length;
        }
      }
      
      // Calculate total scheduled hours (convert minutes to hours)
      const startMinutes = this.timeToMinutes(item.startTime);
      const endMinutes = this.timeToMinutes(item.endTime);
      const scheduledMinutesPerSession = endMinutes - startMinutes;
      const scheduledHoursPerSession = scheduledMinutesPerSession / 60;
      const totalScheduledHoursPerWeek = scheduledHoursPerSession * sessionsCount;
      
      console.log(`\n📋 Validating: ${item.subjectCode} - ${item.subjectName}`);
      console.log(`   Lec: ${lec}, Lab: ${lab}, Required Hours/Week: ${requiredHoursPerWeek}`);
      console.log(`   Scheduled: ${item.day} ${item.startTime}-${item.endTime}`);
      console.log(`   Sessions: ${sessionsCount}, Hours/Session: ${scheduledHoursPerSession.toFixed(2)}, Total/Week: ${totalScheduledHoursPerWeek.toFixed(2)}`);
      console.log(`   Room: ${item.roomName}`);

      // RULE 1: Lab room validation
      const isLabRoom = (item.roomName || '').toLowerCase().includes('lab');
      
      if (lab > 0 && !isLabRoom) {
        console.warn(`   ⚠️ Lab course in non-lab room!`);
        // Try to find an available lab room
        const labRooms = rooms.filter(r => r.name.toLowerCase().includes('lab'));
        let fixed = false;
        
        for (const labRoom of labRooms) {
          const hasConflict = correctedSchedule.some((other, idx) => 
            idx !== i &&
            other.roomId === labRoom.id.toString() &&
            other.day === item.day &&
            this.timeRangesOverlap(other.startTime, other.endTime, item.startTime, item.endTime)
          );
          
          if (!hasConflict) {
            item.roomId = labRoom.id.toString();
            item.roomName = labRoom.name;
            console.log(`   ✅ AUTO-FIX: Moved to ${labRoom.name}`);
            fixed = true;
            break;
          }
        }
        
        if (!fixed) {
          conflicts.push(`${item.subjectCode}: Lab course (${lab} lab units) in non-lab room "${item.roomName}". Move to Lab 1 or Lab 2.`);
        }
      }
      
      if (lab === 0 && isLabRoom) {
        console.warn(`   ⚠️ Lecture-only course in lab room!`);
        // Try to find an available regular room
        const regularRooms = rooms.filter(r => !r.name.toLowerCase().includes('lab'));
        let fixed = false;
        
        for (const regularRoom of regularRooms) {
          const hasConflict = correctedSchedule.some((other, idx) => 
            idx !== i &&
            other.roomId === regularRoom.id.toString() &&
            other.day === item.day &&
            this.timeRangesOverlap(other.startTime, other.endTime, item.startTime, item.endTime)
          );
          
          if (!hasConflict) {
            item.roomId = regularRoom.id.toString();
            item.roomName = regularRoom.name;
            console.log(`   ✅ AUTO-FIX: Moved to ${regularRoom.name}`);
            fixed = true;
            break;
          }
        }
        
        if (!fixed) {
          conflicts.push(`${item.subjectCode}: Lecture-only course in lab room "${item.roomName}". Move to Room 1, 2, or 3.`);
        }
      }

      // RULE 2: 3-UNIT LECTURE VALIDATION (Critical Rule)
      // For lecture subjects with 3 units (lec=3, lab=0), enforce 3 hours/week = 1.5 hours/session
      if (lec === 3 && lab === 0) {
        const expectedHoursPerSession = 1.5; // 90 minutes
        const expectedTotalHoursPerWeek = 3.0;
        
        if (Math.abs(totalScheduledHoursPerWeek - expectedTotalHoursPerWeek) > 0.1) {
          console.warn(`   ❌ 3-UNIT LECTURE VIOLATION: Scheduled ${totalScheduledHoursPerWeek.toFixed(2)}h/week but should be ${expectedTotalHoursPerWeek}h/week`);
          
          // Auto-correct: adjust to 1.5 hours per session
          if (sessionsCount >= 2) {
            const correctedEndTime = this.addMinutes(item.startTime, 90); // 1.5 hours = 90 minutes
            
            if (this.isValidTimeSlot(item.startTime, correctedEndTime)) {
              const hasConflict = correctedSchedule.some((other, idx) => 
                idx !== i &&
                ((other.roomId === item.roomId && other.day === item.day) ||
                 (other.facultyId === item.facultyId && other.day === item.day)) &&
                this.timeRangesOverlap(other.startTime, other.endTime, item.startTime, correctedEndTime)
              );
              
              if (!hasConflict) {
                const oldEndTime = item.endTime;
                item.endTime = correctedEndTime;
                console.log(`   ✅ AUTO-FIX: 3-unit lecture corrected from ${item.startTime}-${oldEndTime} to ${item.startTime}-${correctedEndTime} (1.5h/session × ${sessionsCount} sessions = 3h/week)`);
              } else {
                conflicts.push(`${item.subjectCode}: 3-unit lecture has ${totalScheduledHoursPerWeek.toFixed(2)}h/week (should be 3h/week = 1.5h/session). Cannot auto-correct due to conflicts.`);
              }
            } else {
              conflicts.push(`${item.subjectCode}: 3-unit lecture has ${totalScheduledHoursPerWeek.toFixed(2)}h/week (should be 3h/week = 1.5h/session). Cannot adjust to valid time slot.`);
            }
          } else {
            warnings.push(`${item.subjectCode}: 3-unit lecture needs 2 sessions/week but only ${sessionsCount} session(s) scheduled.`);
          }
        } else {
          console.log(`   ✅ 3-unit lecture rule satisfied: ${totalScheduledHoursPerWeek.toFixed(2)}h/week`);
        }
      }
      
      // RULE 3: General duration validation for non-3-unit lectures
      if (!(lec === 3 && lab === 0)) {
        const hoursDifference = Math.abs(totalScheduledHoursPerWeek - requiredHoursPerWeek);
        if (hoursDifference > 0.1) {
          console.warn(`   ⚠️ Duration mismatch: Scheduled ${totalScheduledHoursPerWeek.toFixed(2)}h/week vs Required ${requiredHoursPerWeek}h/week`);
          
          // For lab courses, keep longer sessions (3-4 hours)
          if (lab > 0) {
            console.log(`   ℹ️ Laboratory course - longer sessions are acceptable`);
          } else {
            // Try to adjust end time to match required hours per session
            const requiredMinutesPerSession = (requiredHoursPerWeek / sessionsCount) * 60;
            const newEndTime = this.addMinutes(item.startTime, requiredMinutesPerSession);
            
            if (this.isValidTimeSlot(item.startTime, newEndTime)) {
              const hasConflict = correctedSchedule.some((other, idx) => 
                idx !== i &&
                ((other.roomId === item.roomId && other.day === item.day) ||
                 (other.facultyId === item.facultyId && other.day === item.day)) &&
                this.timeRangesOverlap(other.startTime, other.endTime, item.startTime, newEndTime)
              );
              
              if (!hasConflict) {
                item.endTime = newEndTime;
                console.log(`   ✅ AUTO-FIX: Adjusted duration to ${item.startTime}-${newEndTime} (${(requiredMinutesPerSession/60).toFixed(2)}h/session)`);
              } else {
                warnings.push(`${item.subjectCode}: Duration is ${totalScheduledHoursPerWeek.toFixed(2)}h/week but requires ${requiredHoursPerWeek}h/week. Adjusting would cause conflicts.`);
              }
            } else {
              warnings.push(`${item.subjectCode}: Duration is ${totalScheduledHoursPerWeek.toFixed(2)}h/week but requires ${requiredHoursPerWeek}h/week. Cannot extend beyond valid time range.`);
            }
          }
        }
      }
    }

    // RULE 4: Detect room conflicts
    for (let i = 0; i < correctedSchedule.length; i++) {
      for (let j = i + 1; j < correctedSchedule.length; j++) {
        const item1 = correctedSchedule[i];
        const item2 = correctedSchedule[j];
        
        if (item1.roomId === item2.roomId && 
            item1.day === item2.day &&
            this.timeRangesOverlap(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) {
          conflicts.push(`ROOM CONFLICT: ${item1.subjectCode} and ${item2.subjectCode} both use ${item1.roomName} on ${item1.day} at overlapping times.`);
        }
        
        // RULE 5: Detect faculty conflicts
        if (item1.facultyId === item2.facultyId && 
            item1.day === item2.day &&
            this.timeRangesOverlap(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) {
          conflicts.push(`FACULTY CONFLICT: ${item1.facultyName} is assigned to both ${item1.subjectCode} and ${item2.subjectCode} on ${item1.day} at overlapping times.`);
        }
      }
    }

    console.log('\n✅ VALIDATION COMPLETE\n');
    console.log(`   Conflicts: ${conflicts.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    
    if (conflicts.length > 0) {
      console.log('\n❌ UNRESOLVED CONFLICTS:');
      conflicts.forEach(c => console.log(`   - ${c}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(w => console.log(`   - ${w}`));
    }
    
    // Print corrected schedule summary
    console.log('\n📋 CORRECTED SCHEDULE SUMMARY:');
    console.log('═'.repeat(100));
    correctedSchedule.forEach(item => {
      const lec = item.lec || 0;
      const lab = item.lab || 0;
      const totalHoursPerWeek = (lec * 1) + (lab * 3);
      const type = lab > 0 ? `Lec ${lec} + Lab ${lab}` : `Lec ${lec}`;
      console.log(`✓ ${item.subjectCode} – ${item.subjectName}`);
      console.log(`  ${item.day} ${item.startTime}–${item.endTime} | ${totalHoursPerWeek}h/week (${type}) | ${item.roomName} | ${item.program} ${item.yearLevel}`);
    });
    console.log('═'.repeat(100));

    return { correctedSchedule, conflicts, warnings };
  }

  // Legacy method kept for compatibility
  static getTimeSlotOptions_OLD(sessionDurationMinutes: number = 60) {
    const options: { startTime: string; endTime: string; duration: number }[] = [];
    let hour = 7;
    let minute = 0;
    while (hour < 20) {
      const start = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const end = this.addMinutes(start, sessionDurationMinutes);
      if (this.isValidTimeSlot(start, end)) {
        options.push({ startTime: start, endTime: end, duration: sessionDurationMinutes });
      }
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    return options;
  }

  static getBalancedStartOrder(timeSlotOptions: { startTime: string }[]) {
    const amIndices: number[] = [];
    const pmIndices: number[] = [];
    for (let i = 0; i < timeSlotOptions.length; i++) {
      const hour = parseInt(timeSlotOptions[i].startTime.split(':')[0], 10);
      if (hour < 12) amIndices.push(i);
      else if (hour >= 13) pmIndices.push(i);
    }

    const startWithPm = this.globalTimeSlotIndex % 2 === 1;
    const first = startWithPm ? pmIndices : amIndices;
    const second = startWithPm ? amIndices : pmIndices;

    const interleaved: number[] = [];
    const maxLen = Math.max(first.length, second.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < first.length) interleaved.push(first[i]);
      if (i < second.length) interleaved.push(second[i]);
    }
    return interleaved.length > 0 ? interleaved : [...amIndices, ...pmIndices];
  }

  static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static getDayPatternForUnits(units: number): string[][] {
    let basePatterns: string[][];
    if (units === 7) {
      basePatterns = [
        ['Monday', 'Wednesday'],
        ['Tuesday', 'Thursday'],
        ['Friday', 'Saturday'],
        ['Friday'],
        ['Saturday']
      ];
    } else if (units === 3) {
      basePatterns = [
        ['Monday', 'Wednesday'],
        ['Tuesday', 'Thursday']
      ];
    } else if (units <= 2) {
      basePatterns = [
        ['Monday', 'Wednesday'],
        ['Tuesday', 'Thursday'],
        ['Friday'],
        ['Saturday']
      ];
    } else {
      basePatterns = [
        ['Monday', 'Wednesday'],
        ['Tuesday', 'Thursday'],
        ['Friday'],
        ['Saturday']
      ];
    }

    const rotate = this.scheduledCourseCount % basePatterns.length;
    const ordered = [...basePatterns.slice(rotate), ...basePatterns.slice(0, rotate)];
    return ordered;
  }

  static combineDays(days: string[]): string {
    if (!days || days.length === 0) return '';

    const validDays = days.filter(day => day && day.trim() !== '');
    if (validDays.length === 0) return '';

    const dayAbbreviations: { [key: string]: string } = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'Th',
      'Friday': 'F',
      'Saturday': 'S',
      'Sunday': 'Su'
    };

    const uniqueDays = [...new Set(validDays)];
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedDays = uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    return sortedDays.map(day => dayAbbreviations[day] || day).join('');
  }

  static addMinutes(timeString: string, minutes: number): string {
    const [hourStr, minuteStr] = timeString.split(':');
    const totalMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr) + minutes;
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;

    return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
  }

  static compareTime(time1: string, time2: string): number {
    const [hour1, minute1] = time1.split(':').map(Number);
    const [hour2, minute2] = time2.split(':').map(Number);

    const totalMinutes1 = hour1 * 60 + minute1;
    const totalMinutes2 = hour2 * 60 + minute2;

    return totalMinutes1 - totalMinutes2;
  }
}
