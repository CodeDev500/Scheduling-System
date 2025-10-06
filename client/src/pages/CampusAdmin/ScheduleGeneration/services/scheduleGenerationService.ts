import api from '@/api/axios';
import type { Subject, Faculty, Room, GeneratedSchedule, ScheduleItem } from '../../../../types';
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

  // Overloaded main generation method (unchanged interface)
  static async generateScheduleDataFromCurriculum(
    courses: CourseInput[],
    instructors: any[],
    rooms: Room[]
  ): Promise<ScheduleItem[]>;
  static async generateScheduleDataFromCurriculum(
    curriculumData: any[],
    instructors: any[],
    programCode: string,
    yearLevel: string,
    semester: string,
    department?: string
  ): Promise<ScheduleItem[]>;
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

      const filteredCourses = isNewApi
        ? courses
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
        const expectedMinutes = (course.units || 3) * 60;
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
          subjectCode: course.subjectCode || course.code,
          subjectName: course.subjectDescription || course.name || course.subjectName,
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
      return scheduleItems;
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
    const totalWeeklyMinutes = totalUnits * 60;

    // Decide sessionsNeeded
    let sessionsNeeded: number;
    if (options?.sessionsPerWeekOverride) {
      sessionsNeeded = options.sessionsPerWeekOverride;
    } else {
      if (totalWeeklyMinutes === 420) { // 7 units
        sessionsNeeded = 2;
      } else if (totalWeeklyMinutes <= 120) {
        sessionsNeeded = 1;
      } else if (totalWeeklyMinutes === 180) {
        sessionsNeeded = 2;
      } else {
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

    // Day patterns and selection
    const dayPatterns = this.getDayPatternForUnits(totalUnits);
    const selectedDayPattern = dayPatterns[dayPatternIndex % dayPatterns.length];

    // Candidate start times (30-min increments)
    const baseTimeSlotOptions = this.getTimeSlotOptions(30); // all possible 30-min starts (validated)
    if (baseTimeSlotOptions.length === 0) return [];

    // If pattern is single-day and sessionsNeeded > 1, try to fit the FULL weekly minutes as a single continuous block
    // inside morning or inside afternoon (this avoids splitting around lunch and displaying e.g., 9:00-15:00)
    const isSingleDayPattern = selectedDayPattern.length === 1;
    if (isSingleDayPattern && sessionsNeeded > 1) {
      const day = selectedDayPattern[0];

      // look for a start time such that start + totalWeeklyMinutes fits entirely inside morning OR inside afternoon
      for (const option of baseTimeSlotOptions) {
        const start = option.startTime;
        const end = this.addMinutes(start, totalWeeklyMinutes);
        if (!this.isValidTimeSlot(start, end)) continue;

        // ensure requested day/time doesn't collide with lunch by isValidTimeSlot already
        timeSlots.push({
          id: `singleblock-${day}-${start}`,
          day,
          startTime: start,
          endTime: end,
          duration: totalWeeklyMinutes,
          type: (lecHours > 0 && labHours > 0) ? 'Lec/Lab' : (lecHours > 0 ? 'Lecture' : 'Lab')
        });
        return timeSlots; // perfect single continuous block found
      }
      // if no single-block fits, fall back to splitting across days or back-to-back same-day sessions (below)
    }

    // Otherwise try systematic placement of each session (distribute across selectedDayPattern)
    const maxAttempts = baseTimeSlotOptions.length * selectedDayPattern.length * sessionsNeeded * 4;
    let attempts = 0;
    const usedStartsForThisCourse: { day: string; startTime: string; endTime: string }[] = [];
    let createdSessions = 0;
    let searchIndexOffset = startingTimeSlotIndex % baseTimeSlotOptions.length;

    while (createdSessions < sessionsNeeded && attempts < maxAttempts) {
      attempts++;

      // pick day in round-robin across pattern days
      const day = selectedDayPattern[createdSessions % selectedDayPattern.length] || selectedDayPattern[0];

      // choose a candidate start index (rotates to give AM/PM balance)
      const candidateStartIndex = (searchIndexOffset + createdSessions + attempts) % baseTimeSlotOptions.length;
      const candidateStart = baseTimeSlotOptions[candidateStartIndex].startTime;
      const duration = sessionDurations[createdSessions];
      const candidateEnd = this.addMinutes(candidateStart, duration);

      if (!this.isValidTimeSlot(candidateStart, candidateEnd)) {
        continue;
      }

      // ensure no local overlap with already chosen sessions for this course
      const overlapsLocal = usedStartsForThisCourse.some(s =>
        s.day === day && this.timeRangesOverlap(s.startTime, s.endTime, candidateStart, candidateEnd)
      );
      if (overlapsLocal) {
        continue;
      }

      // Good candidate -> add
      const slot = {
        id: `slot-${createdSessions}-${day}-${candidateStart}`,
        day,
        startTime: candidateStart,
        endTime: candidateEnd,
        duration,
        type: (lecHours > 0 && labHours > 0) ? 'Lec/Lab' : (lecHours > 0 ? 'Lecture' : 'Lab')
      };

      timeSlots.push(slot);
      usedStartsForThisCourse.push({ day, startTime: candidateStart, endTime: candidateEnd });
      createdSessions++;
    }

    // If not all sessions created, do exhaustive fallback trying all days x starts
    if (createdSessions < sessionsNeeded) {
      for (let s = createdSessions; s < sessionsNeeded; s++) {
        let filled = false;
        for (let dayIdx = 0; dayIdx < selectedDayPattern.length && !filled; dayIdx++) {
          const d = selectedDayPattern[dayIdx];
          for (let startIdx = 0; startIdx < baseTimeSlotOptions.length && !filled; startIdx++) {
            const candidateStart = baseTimeSlotOptions[(startIdx + startingTimeSlotIndex) % baseTimeSlotOptions.length].startTime;
            const duration = sessionDurations[s];
            const candidateEnd = this.addMinutes(candidateStart, duration);
            if (!this.isValidTimeSlot(candidateStart, candidateEnd)) continue;
            const overlapsLocal = usedStartsForThisCourse.some(st =>
              st.day === d && this.timeRangesOverlap(st.startTime, st.endTime, candidateStart, candidateEnd)
            );
            if (overlapsLocal) continue;
            const slot = {
              id: `slot-fallback-${s}-${d}-${candidateStart}`,
              day: d,
              startTime: candidateStart,
              endTime: candidateEnd,
              duration,
              type: (lecHours > 0 && labHours > 0) ? 'Lec/Lab' : (lecHours > 0 ? 'Lecture' : 'Lab')
            };
            timeSlots.push(slot);
            usedStartsForThisCourse.push({ day: d, startTime: candidateStart, endTime: candidateEnd });
            filled = true;
            break;
          }
        }
      }
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
    const totalWeeklyHours = totalUnits;

    // Build candidate distributions
    const distributionCandidates: { duration: number; sessions: number }[] = [];
    if (totalWeeklyHours === 7) {
      distributionCandidates.push({ duration: 210, sessions: 2 });
      distributionCandidates.push({ duration: 60, sessions: 7 });
    } else if (totalWeeklyHours <= 2) {
      distributionCandidates.push({ duration: 120, sessions: 1 });
    } else if (totalWeeklyHours === 3) {
      distributionCandidates.push({ duration: 90, sessions: 2 });
    } else {
      const baseDuration = 120;
      const sessions = Math.ceil((totalWeeklyHours * 60) / baseDuration);
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
