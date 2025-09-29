import api from '@/api/axios';
import type { Subject, Faculty, Room, GeneratedSchedule, ScheduleItem } from '../../../../types';

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
}

export class ScheduleGenerationService {
  // Global state tracking to prevent conflicts
  private static usedTimeSlots: UsedTimeSlot[] = [];
  private static globalTimeSlotIndex: number = 0;
  // Enhanced faculty matching algorithm that compares course tags with faculty specializations
  static calculateFacultyMatchScore(courseTags: string[], facultySpecializations: string[]): number {
    if (!courseTags || courseTags.length === 0 || !facultySpecializations || facultySpecializations.length === 0) {
      return 0;
    }

    // Normalize strings for comparison (lowercase, remove extra spaces)
    const normalizedCourseTags = courseTags.map(tag => tag.toLowerCase().trim());
    const normalizedSpecializations = facultySpecializations.map(spec => spec.toLowerCase().trim());

    let matchScore = 0;
    let totalPossibleMatches = normalizedCourseTags.length;

    // Direct matches (exact match)
    for (const courseTag of normalizedCourseTags) {
      if (normalizedSpecializations.includes(courseTag)) {
        matchScore += 10; // High score for exact matches
      }
    }

    // Partial matches (contains keywords)
    for (const courseTag of normalizedCourseTags) {
      for (const specialization of normalizedSpecializations) {
        // Check if course tag is contained in specialization or vice versa
        if (courseTag.includes(specialization) || specialization.includes(courseTag)) {
          matchScore += 5; // Medium score for partial matches
        }
        
        // Check for keyword matches (split by common separators)
        const courseKeywords = courseTag.split(/[\s\-_&]+/);
        const specKeywords = specialization.split(/[\s\-_&]+/);
        
        for (const courseKeyword of courseKeywords) {
          if (courseKeyword.length > 2 && specKeywords.some(specKeyword => 
            specKeyword.includes(courseKeyword) || courseKeyword.includes(specKeyword)
          )) {
            matchScore += 2; // Lower score for keyword matches
          }
        }
      }
    }

    // Normalize score to percentage (0-100)
    const maxPossibleScore = totalPossibleMatches * 10; // Maximum if all are exact matches
    return Math.min(100, (matchScore / maxPossibleScore) * 100);
  }

  // Parse JSON string tags/specializations safely
  static parseJsonArray(jsonString: string | string[]): string[] {
    if (Array.isArray(jsonString)) {
      return jsonString;
    }
    
    if (!jsonString || typeof jsonString !== 'string') {
      return [];
    }

    // Handle comma-separated strings (common format for specializations)
    if (jsonString.includes(',') && !jsonString.trim().startsWith('[')) {
      return jsonString.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }

    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [parsed.toString()];
    } catch (error) {
      console.warn('Failed to parse JSON array, treating as single string:', jsonString, error);
      // If JSON parsing fails, treat as a single string value
      return [jsonString.trim()];
    }
  }

  // Find best faculty matches for a course
  static findBestFacultyMatches(course: any, instructors: any[], maxMatches: number = 3): any[] {
    const courseTags = this.parseJsonArray(course.tags);
    
    const facultyWithScores = instructors.map(instructor => {
      // Handle both Redux faculty structure (FacultyWithSubjects) and API instructor structure
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

    // Sort by match score (highest first) and return top matches
    return facultyWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxMatches);
  }

  // Fetch curriculum courses for a specific program and year level
  static async getCurriculumCourses(programCode: string, yearLevel: string): Promise<ProgramCourses> {
    try {
      const response = await api.get(`/curriculum/program/${programCode}/${yearLevel}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching curriculum courses:', error);
      throw new Error('Failed to fetch curriculum courses');
    }
  }

  // Fetch faculty recommendations for a specific program
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

  // Fetch all instructors
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

  // Fetch rooms (if available)
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
  

  // Enhanced method to generate schedule data using curriculum from Redux store
  static async generateScheduleDataFromCurriculum(
    curriculumData: any[], 
    instructors: any[], 
    programCode: string, 
    yearLevel: string, 
    semester: string,
    department?: string
  ): Promise<ScheduleItem[]> {
    // Reset global state for new schedule generation
    this.usedTimeSlots = [];
    this.globalTimeSlotIndex = 0;
    try {
      console.log('🚀 Starting schedule generation with curriculum data:', curriculumData);
      console.log('📊 Input summary:', {
        totalCurriculum: curriculumData.length,
        instructors: instructors.length,
        programCode,
        yearLevel,
        semester
      });
      
      // Log all unique field values to understand the data structure
      if (curriculumData.length > 0) {
        const sampleItem = curriculumData[0];
        console.log('Sample curriculum item keys:', Object.keys(sampleItem));
        console.log('Sample programCode field:', sampleItem.programCode);
        console.log('Sample yearLevel field:', sampleItem.yearLevel);
        console.log('Sample period field:', sampleItem.period);
        
        // Log all unique values for key fields
        const uniqueProgramCodes = [...new Set(curriculumData.map(c => c.programCode))];
        const uniqueYearLevels = [...new Set(curriculumData.map(c => c.yearLevel))];
        const uniquePeriods = [...new Set(curriculumData.map(c => c.period))];
        
        console.log('Unique programCodes in data:', uniqueProgramCodes);
        console.log('Unique yearLevels in data:', uniqueYearLevels);
        console.log('Unique periods in data:', uniquePeriods);
      }
      
      console.log('Generating schedule from curriculum data:', { curriculumData, instructors, programCode, yearLevel, semester });
      console.log('Using faculty data:', instructors);
      
      // Filter curriculum data for the specific program, year level, and semester
      // Handle both 'period' and 'semester' fields for compatibility
      const filteredCourses = curriculumData.filter(course => {
        const programMatch = course.programCode === programCode;
        const yearMatch = course.yearLevel === yearLevel;
        const semesterMatch = course.period === semester || course.semester === semester;
        
        const matches = programMatch && yearMatch && semesterMatch;
        
        if (!matches) {
          console.log(`🔍 Course ${course.subjectCode || course.code} filtered out:`, {
            programMatch,
            yearMatch,
            semesterMatch,
            courseProgram: course.programCode,
            courseYearLevel: course.yearLevel,
            courseSemester: course.semester || course.period
          });
        }
        
        return matches;
      });

      console.log('📋 Filtered courses for schedule generation:', filteredCourses.length, 'courses');
      console.log('📝 Courses to process:', filteredCourses.map(c => ({
        id: c.id,
        code: c.subjectCode || c.code,
        name: c.subjectDescription || c.name,
        units: c.units
      })));

      if (filteredCourses.length === 0) {
        console.warn('⚠️ No courses found for the specified criteria');
        return [];
      }

      const rooms = await this.getRooms();
      const scheduleItems: ScheduleItem[] = [];

      // Initialize conflict tracking
      const facultySchedule: { [facultyId: string]: { [day: string]: { [timeSlot: string]: boolean } } } = {};
      const roomSchedule: { [roomId: string]: { [day: string]: { [timeSlot: string]: boolean } } } = {};
      const facultyWorkload: { [facultyId: string]: number } = {};

      // Initialize faculty workload tracking
      instructors.forEach(instructor => {
        const facultyId = instructor.id?.toString() || instructor.facultyId?.toString();
        if (facultyId) {
          facultyWorkload[facultyId] = 0;
          facultySchedule[facultyId] = {};
        }
      });

      // Helper function to check if faculty is available at a given time
      const isFacultyAvailable = (facultyId: string, day: string, startTime: string, endTime: string): boolean => {
        if (!facultySchedule[facultyId] || !facultySchedule[facultyId][day]) {
          return true;
        }
        
        const timeSlotKey = `${startTime}-${endTime}`;
        return !facultySchedule[facultyId][day][timeSlotKey];
      };

      // Helper function to check if room is available at a given time
      const isRoomAvailable = (roomId: string, day: string, startTime: string, endTime: string): boolean => {
        if (!roomSchedule[roomId] || !roomSchedule[roomId][day]) {
          return true;
        }
        
        const timeSlotKey = `${startTime}-${endTime}`;
        return !roomSchedule[roomId][day][timeSlotKey];
      };

      // Helper function to mark faculty as busy
      const markFacultyBusy = (facultyId: string, day: string, startTime: string, endTime: string) => {
        if (!facultySchedule[facultyId]) facultySchedule[facultyId] = {};
        if (!facultySchedule[facultyId][day]) facultySchedule[facultyId][day] = {};
        
        const timeSlotKey = `${startTime}-${endTime}`;
        facultySchedule[facultyId][day][timeSlotKey] = true;
        facultyWorkload[facultyId] = (facultyWorkload[facultyId] || 0) + 1;
      };

      // Helper function to mark room as busy
      const markRoomBusy = (roomId: string, day: string, startTime: string, endTime: string) => {
        if (!roomSchedule[roomId]) roomSchedule[roomId] = {};
        if (!roomSchedule[roomId][day]) roomSchedule[roomId][day] = {};
        
        const timeSlotKey = `${startTime}-${endTime}`;
        roomSchedule[roomId][day][timeSlotKey] = true;
      };

      // Helper function to find best available faculty for a course
      const findBestAvailableFaculty = (course: any, timeSlot: any): any => {
        // Get faculty matches based on specialization
        const facultyMatches = this.findBestFacultyMatches(course, instructors, instructors.length);
        
        // Sort by workload (ascending) and then by match score (descending)
        const sortedFaculty = facultyMatches.sort((a, b) => {
          const aWorkload = facultyWorkload[a.id?.toString()] || 0;
          const bWorkload = facultyWorkload[b.id?.toString()] || 0;
          
          // First priority: lower workload
          if (aWorkload !== bWorkload) {
            return aWorkload - bWorkload;
          }
          
          // Second priority: higher match score
          return (b.matchScore || 0) - (a.matchScore || 0);
        });

        // Find the first available faculty
        for (const faculty of sortedFaculty) {
          const facultyId = faculty.id?.toString();
          if (facultyId && isFacultyAvailable(facultyId, timeSlot.day, timeSlot.startTime, timeSlot.endTime)) {
            return faculty;
          }
        }

        // If no specialized faculty is available, try any available faculty
        for (const instructor of instructors) {
          const facultyId = instructor.id?.toString();
          if (facultyId && isFacultyAvailable(facultyId, timeSlot.day, timeSlot.startTime, timeSlot.endTime)) {
            return instructor;
          }
        }

        // Last resort: return faculty with lowest workload (even if conflicted)
        const leastBusyFaculty = instructors.reduce((min, current) => {
          const currentWorkload = facultyWorkload[current.id?.toString()] || 0;
          const minWorkload = facultyWorkload[min.id?.toString()] || 0;
          return currentWorkload < minWorkload ? current : min;
        });

        return leastBusyFaculty;
      };

      // Helper function to find available room
      const findAvailableRoom = (timeSlot: any): any => {
        // Try to find an available room
        for (const room of rooms) {
          const roomId = room.id?.toString();
          if (roomId && isRoomAvailable(roomId, timeSlot.day, timeSlot.startTime, timeSlot.endTime)) {
            return room;
          }
        }
        
        // If no room is available, return a random room (conflict will be noted)
        return rooms[Math.floor(Math.random() * rooms.length)];
      };

      // Generate schedule items for each course
      for (let courseIndex = 0; courseIndex < filteredCourses.length; courseIndex++) {
        const course = filteredCourses[courseIndex];
        console.log(`\n--- 📚 Processing course ${courseIndex + 1}/${filteredCourses.length}: ${course.subjectCode || course.code} ---`);
        console.log('📖 Course details:', {
          id: course.id,
          code: course.subjectCode || course.code,
          name: course.subjectDescription || course.name,
          units: course.units,
          lec: course.lec,
          lab: course.lab,
          programCode: course.programCode,
          yearLevel: course.yearLevel,
          semester: course.semester || course.period
        });
        
        // Skip courses with 0 units early in the process
        if (course.units === 0) {
          console.log(`⚠️ SKIPPED: Course ${course.subjectCode || course.code} has 0 units`);
          continue;
        }
        
        // Yield control to the event loop every few iterations to prevent UI blocking
        if (courseIndex % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        // Parse course tags
        const courseTags = this.parseJsonArray(course.tags);
        console.log('🏷️ Course tags:', courseTags);

        console.log(`🔍 Finding conflict-free schedule for ${course.subjectCode || course.code}...`);
        
        // Try to find a conflict-free schedule for this course
        const conflictFreeResult = this.findConflictFreeSchedule(course, instructors, rooms, 20);
        
        if (!conflictFreeResult) {
          console.log(`❌ SKIPPED: Failed to find conflict-free schedule for ${course.subjectCode || course.code} after 20 attempts`);
          console.log(`📊 Current schedule state:`, {
            usedTimeSlots: this.usedTimeSlots.length,
            globalTimeSlotIndex: this.globalTimeSlotIndex
          });
          continue;
        }

        const { timeSlots, faculty: subjectFaculty, room: assignedRoom } = conflictFreeResult;
        
        // Increment globalTimeSlotIndex based on the number of time slots used by this course
        // This ensures the next course starts from a different time slot
        this.globalTimeSlotIndex += timeSlots.length;
        
        // Validate that we have valid faculty and room assignments
        if (!subjectFaculty || !assignedRoom) {
          console.log(`❌ SKIPPED: Invalid assignments for ${course.subjectCode || course.code}:`, {
            hasFaculty: !!subjectFaculty,
            hasRoom: !!assignedRoom,
            faculty: subjectFaculty,
            room: assignedRoom
          });
          continue;
        }
        
        console.log(`✅ SUCCESS: Scheduled ${course.subjectCode || course.code}:`, {
          faculty: `${subjectFaculty.firstname} ${subjectFaculty.lastname}`,
          room: assignedRoom.name,
          timeSlots: timeSlots.length,
          days: timeSlots.map(ts => `${ts.day} ${ts.startTime}-${ts.endTime}`).join(', ')
        });

        // Skip courses with no time slots
        if (timeSlots.length === 0) {
          console.log(`❌ SKIPPED: No time slots generated for ${course.subjectCode || course.code}`);
          continue;
        }

        // Group time slots by type (Lecture vs Laboratory)
        const lecHours = course.lec || 0;
        const labHours = course.lab || 0;
        const lectureSlots = timeSlots.filter((_, index) => index < lecHours);
        const labSlots = timeSlots.filter((_, index) => index >= lecHours);

        const facultyId = subjectFaculty?.id?.toString() || 'unassigned';
        const roomId = assignedRoom?.id?.toString() || 'unassigned';

        // COMBINED APPROACH: Create single schedule item per subject combining lecture and lab
        const allSlots = [...lectureSlots, ...labSlots];
        const combinedDays = this.combineDays(allSlots.map(slot => slot.day));
        
        // Determine the type based on what components exist
        let subjectType = 'Lecture';
        if (lecHours > 0 && labHours > 0) {
          subjectType = 'Lecture/Laboratory';
        } else if (labHours > 0 && lecHours === 0) {
          subjectType = 'Laboratory';
        }

        // Create time range that covers all sessions
        const startTimes = allSlots.map(slot => slot.startTime);
        const endTimes = allSlots.map(slot => slot.endTime);
        const earliestStart = startTimes.reduce((earliest, current) => 
          this.compareTime(current, earliest) < 0 ? current : earliest
        );
        const latestEnd = endTimes.reduce((latest, current) => 
          this.compareTime(current, latest) > 0 ? current : latest
        );

        // Convert semester to proper string format for filtering
        let semesterValue = course.semester || course.period;
        if (typeof semesterValue === 'number') {
          if (semesterValue === 1) semesterValue = '1st Semester';
          else if (semesterValue === 2) semesterValue = '2nd Semester';
          else if (semesterValue === 3) semesterValue = 'Summer';
        } else if (typeof semesterValue === 'string') {
          // Handle various string formats
          if (semesterValue.toLowerCase().includes('summer')) {
            semesterValue = 'Summer';
          } else if (semesterValue === '1' || semesterValue.toLowerCase().includes('1st') || semesterValue.toLowerCase().includes('first')) {
            semesterValue = '1st Semester';
          } else if (semesterValue === '2' || semesterValue.toLowerCase().includes('2nd') || semesterValue.toLowerCase().includes('second')) {
            semesterValue = '2nd Semester';
          }
        }

        const scheduleItem: ScheduleItem = {
          id: `${course.id}`,
          subjectId: course.id.toString(),
          subjectCode: course.subjectCode || course.code,
          subjectName: course.subjectDescription || course.name || course.subjectName,
          facultyId: facultyId,
          facultyName: subjectFaculty?.firstname 
            ? `${subjectFaculty.firstname} ${subjectFaculty.lastname || ''}`.trim()
            : subjectFaculty?.name || subjectFaculty?.fullName || 'Unassigned',
          roomId: roomId,
          roomName: assignedRoom?.name || 'TBA',
          day: combinedDays,
          startTime: earliestStart,
          endTime: latestEnd,
          units: course.units || 3,
          yearLevel: parseInt(course.yearLevel) || 1,
          semester: semesterValue || '1st Semester',
          type: subjectType as 'Lecture' | 'Laboratory'
        };

        // Mark all time slots as used
        allSlots.forEach(timeSlot => {
          this.markTimeSlotAsUsed(
            timeSlot.day,
            timeSlot.startTime,
            timeSlot.endTime,
            facultyId,
            roomId,
            course.id.toString()
          );
        });

        scheduleItems.push(scheduleItem);
        console.log(`Created combined schedule item for ${course.subjectCode}:`, scheduleItem);
      }

      // Log final faculty workload distribution
      console.log('Final faculty workload distribution:');
      Object.entries(facultyWorkload).forEach(([facultyId, workload]) => {
        const faculty = instructors.find(i => i.id?.toString() === facultyId);
        console.log(`${faculty?.firstname || 'Unknown'}: ${workload} assignments`);
      });

      console.log(`Generated ${scheduleItems.length} total schedule items`);
      console.log('Final schedule items being returned:', scheduleItems);
      return scheduleItems;
    } catch (error) {
      console.error('Error generating schedule data from curriculum:', error);
      throw new Error('Failed to generate schedule data from curriculum');
    }
  }

  // Generate time slots for a course based on lecture and lab hours
  private static generateTimeSlots(lecHours: number, labHours: number, totalUnits: number = 3, startingTimeSlotIndex: number = 0, dayPatternIndex: number = 0) {
    const timeSlots = [];
    
    console.log(`Generating time slots - lecHours: ${lecHours}, labHours: ${labHours}, totalUnits: ${totalUnits}, startingTimeSlotIndex: ${startingTimeSlotIndex}, dayPatternIndex: ${dayPatternIndex}`);
    
    // Ensure total hours don't exceed total units
    const actualTotalHours = Math.min(lecHours + labHours, totalUnits);
    
    // If lecHours + labHours exceeds totalUnits, adjust proportionally
    let adjustedLecHours = lecHours;
    let adjustedLabHours = labHours;
    
    if (lecHours + labHours > totalUnits) {
      const ratio = totalUnits / (lecHours + labHours);
      adjustedLecHours = Math.round(lecHours * ratio);
      adjustedLabHours = Math.round(labHours * ratio);
    }
    
    console.log(`Adjusted hours - lecHours: ${adjustedLecHours}, labHours: ${adjustedLabHours}`);
    
    // Get day patterns for the course
    const dayPatterns = this.getDayPatternForUnits(totalUnits);
    const selectedDayPattern = dayPatterns[dayPatternIndex % dayPatterns.length];
    
    console.log(`Selected day pattern:`, selectedDayPattern);
    
    // Define available time slots - EXCLUDE 12:00 PM (lunch break)
    const timeSlotOptions = [
      { startTime: '08:00', endTime: '09:00', duration: 60 }, // 1 hour
      { startTime: '09:00', endTime: '10:00', duration: 60 }, // 1 hour
      { startTime: '10:00', endTime: '11:00', duration: 60 }, // 1 hour
      { startTime: '11:00', endTime: '12:00', duration: 60 }, // 1 hour
      // 12:00-1:00PM is lunch break - EXCLUDED
      { startTime: '13:00', endTime: '14:00', duration: 60 }, // 1 hour
      { startTime: '14:00', endTime: '15:00', duration: 60 }, // 1 hour
      { startTime: '15:00', endTime: '16:00', duration: 60 }, // 1 hour
      { startTime: '16:00', endTime: '17:00', duration: 60 }, // 1 hour
      { startTime: '17:00', endTime: '18:00', duration: 60 }  // 1 hour
    ];

    let slotIndex = 0;
    let timeSlotIndex = startingTimeSlotIndex;

    // DYNAMIC DURATION CALCULATION based on units and optimal distribution
    // Strategy: Distribute total weekly hours across optimal number of days
    // - 0 units: Skip scheduling (no time slots needed)
    // - 1-2 units: 1-2 sessions per week (1 hour each)
    // - 3 units: 2 sessions per week (1.5 hours each) OR 3 sessions per week (1 hour each)
    // - 4+ units: Distribute across multiple days with reasonable session lengths
    
    const totalWeeklyHours = totalUnits; // 1 unit = 1 hour per week
    let optimalSessionsPerWeek: number;
    let sessionDurationMinutes: number;
    
    if (totalWeeklyHours === 0) {
      // 0 units: No scheduling needed, return empty time slots
      console.log(`Skipping subject with 0 units - no time slots needed`);
      return [];
    } else if (totalWeeklyHours <= 2) {
      // 1-2 units: Simple 1 hour sessions
      optimalSessionsPerWeek = totalWeeklyHours;
      sessionDurationMinutes = 60;
    } else if (totalWeeklyHours === 3) {
      // 3 units: 2 sessions of 1.5 hours each (more efficient than 3 x 1 hour)
      optimalSessionsPerWeek = 2;
      sessionDurationMinutes = 90;
    } else {
      // 4+ units: Distribute across multiple days, max 2 hours per session
      const maxSessionDuration = 120; // 2 hours max per session
      sessionDurationMinutes = Math.min(maxSessionDuration, totalWeeklyHours * 60 / 2);
      optimalSessionsPerWeek = Math.ceil((totalWeeklyHours * 60) / sessionDurationMinutes);
    }
    
    console.log(`Dynamic scheduling: ${totalWeeklyHours} units → ${optimalSessionsPerWeek} sessions of ${sessionDurationMinutes} minutes each`);
    
    // Adjust session duration for time slot compatibility
    const sessionHours = sessionDurationMinutes / 60;
    const endTimeOffset = sessionDurationMinutes;
    
    console.log(`Dynamic scheduling: ${totalWeeklyHours} units → ${optimalSessionsPerWeek} sessions of ${sessionDurationMinutes} minutes each`);
    
    // UPDATED APPROACH: Create sessions based on dynamic calculation instead of separate lec/lab
    const sessionGroups = [];
    
    // For subjects with both lecture and lab components, combine them intelligently
    if (adjustedLecHours > 0 && adjustedLabHours > 0) {
      // Combined lecture/lab sessions
      const baseTimeOption = timeSlotOptions[timeSlotIndex % timeSlotOptions.length];
      const sessionEndTime = this.addMinutes(baseTimeOption.startTime, sessionDurationMinutes);
      
      if (this.isValidTimeSlot(baseTimeOption.startTime, sessionEndTime)) {
        sessionGroups.push({
          type: 'Lecture/Laboratory',
          startTime: baseTimeOption.startTime,
          endTime: sessionEndTime,
          duration: sessionDurationMinutes,
          sessionsNeeded: optimalSessionsPerWeek
        });
      }
    } else if (adjustedLecHours > 0) {
      // Lecture-only sessions
      const lectureTimeOption = timeSlotOptions[timeSlotIndex % timeSlotOptions.length];
      const lectureEndTime = this.addMinutes(lectureTimeOption.startTime, sessionDurationMinutes);
      
      if (this.isValidTimeSlot(lectureTimeOption.startTime, lectureEndTime)) {
        sessionGroups.push({
          type: 'Lecture',
          startTime: lectureTimeOption.startTime,
          endTime: lectureEndTime,
          duration: sessionDurationMinutes,
          sessionsNeeded: optimalSessionsPerWeek
        });
      }
    } else if (adjustedLabHours > 0) {
      // Lab-only sessions
      const labTimeOption = timeSlotOptions[timeSlotIndex % timeSlotOptions.length];
      const labEndTime = this.addMinutes(labTimeOption.startTime, sessionDurationMinutes);
      
      if (this.isValidTimeSlot(labTimeOption.startTime, labEndTime)) {
        sessionGroups.push({
          type: 'Laboratory',
          startTime: labTimeOption.startTime,
          endTime: labEndTime,
          duration: sessionDurationMinutes,
          sessionsNeeded: optimalSessionsPerWeek
        });
      }
    }
    
    // Generate time slots ensuring consistency across days for each session type
    for (const sessionGroup of sessionGroups) {
      let sessionsCreated = 0;
      let dayIndex = 0;
      
      while (sessionsCreated < sessionGroup.sessionsNeeded && dayIndex < selectedDayPattern.length * 2) {
        const day = selectedDayPattern[dayIndex % selectedDayPattern.length];
        
        if (!day) {
          console.error(`Day is undefined for session ${sessionsCreated}, dayIndex=${dayIndex}, selectedDayPattern:`, selectedDayPattern);
          dayIndex++;
          continue;
        }
        
        console.log(`Creating ${sessionGroup.type} session ${sessionsCreated + 1}: day=${day}, time=${sessionGroup.startTime}-${sessionGroup.endTime}`);
        
        timeSlots.push({
          id: `${sessionGroup.type.toLowerCase()}-slot-${slotIndex}`,
          day: day as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
          startTime: sessionGroup.startTime,
          endTime: sessionGroup.endTime,
          duration: sessionGroup.duration,
          type: sessionGroup.type
        });
        
        slotIndex++;
        sessionsCreated++;
        dayIndex++;
      }
    }

    console.log(`Generated ${timeSlots.length} time slots for ${totalUnits} units:`, timeSlots);
    return timeSlots;
  }

  // Helper method to check if a time slot conflicts with existing assignments
  private static hasTimeSlotConflict(
    day: string, 
    startTime: string, 
    endTime: string, 
    facultyId: string, 
    roomId: string
  ): boolean {
    return this.usedTimeSlots.some(slot => 
      slot.day === day &&
      slot.startTime === startTime &&
      slot.endTime === endTime &&
      (slot.facultyId === facultyId || slot.roomId === roomId)
    );
  }

  // Helper method to mark a time slot as used
  private static markTimeSlotAsUsed(
    day: string, 
    startTime: string, 
    endTime: string, 
    facultyId: string, 
    roomId: string, 
    subjectId: string
  ): void {
    this.usedTimeSlots.push({
      day,
      startTime,
      endTime,
      facultyId,
      roomId,
      subjectId
    });
  }

  // Method to find conflict-free schedule for a course
  private static findConflictFreeSchedule(
    course: any,
    instructors: any[],
    rooms: any[],
    maxRetries: number = 25
  ): { timeSlots: any[], faculty: any, room: any } | null {
    const lecHours = course.lec || 0;
    const labHours = course.lab || 0;
    const totalUnits = course.units || 3;
    
    console.log(`🔍 Finding schedule for ${course.subjectCode || course.code} (${totalUnits} units, ${lecHours}L/${labHours}Lab)`);
    
    // Get available day patterns for this course
    const dayPatterns = this.getDayPatternForUnits(totalUnits);
    console.log(`📅 Available day patterns: ${dayPatterns.length}`);
    
    // Calculate the number of available time slots to better distribute courses
    // EXCLUDE 12:00 PM (lunch break) from available scheduling times
    const timeSlotOptions = [
      { startTime: '08:00', endTime: '09:00', duration: 60 },
      { startTime: '09:00', endTime: '10:00', duration: 60 },
      { startTime: '10:00', endTime: '11:00', duration: 60 },
      { startTime: '11:00', endTime: '12:00', duration: 60 },
      // 12:00-1:00 PM is lunch break - EXCLUDED
      { startTime: '13:00', endTime: '14:00', duration: 60 },
      { startTime: '14:00', endTime: '15:00', duration: 60 },
      { startTime: '15:00', endTime: '16:00', duration: 60 },
      { startTime: '16:00', endTime: '17:00', duration: 60 },
      { startTime: '17:00', endTime: '18:00', duration: 60 }
    ];
    
    // Find qualified faculty for this course
    const courseTags = this.parseJsonArray(course.tags);
    const qualifiedFaculty = this.findBestFacultyMatches(course, instructors, 5); // Increased from 3 to 5
    console.log(`👨‍🏫 Qualified faculty: ${qualifiedFaculty.length}`);
    
    if (qualifiedFaculty.length === 0) {
      console.log(`⚠️ No qualified faculty found for ${course.subjectCode || course.code}`);
      // Fallback: use any available instructor
      if (instructors.length > 0) {
        qualifiedFaculty.push(instructors[0]);
        console.log(`🔄 Using fallback faculty: ${instructors[0].firstname} ${instructors[0].lastname}`);
      }
    }
    
    // Try different combinations of time slots, day patterns, faculty, and rooms
    // Start from the current globalTimeSlotIndex to ensure better distribution
    for (let timeSlotAttempt = 0; timeSlotAttempt < maxRetries; timeSlotAttempt++) {
      for (let dayPatternIndex = 0; dayPatternIndex < dayPatterns.length; dayPatternIndex++) {
        // Calculate starting time slot index with better distribution
        // Use modulo to wrap around available time slots
        const startingTimeSlotIndex = (this.globalTimeSlotIndex + timeSlotAttempt) % timeSlotOptions.length;
        
        // Generate time slots with current parameters
        const timeSlots = this.generateTimeSlots(
          lecHours, 
          labHours, 
          totalUnits, 
          startingTimeSlotIndex,
          dayPatternIndex
        );
        
        if (timeSlots.length === 0) continue;
        
        // Try each qualified faculty
        for (const faculty of qualifiedFaculty) {
          const facultyId = faculty.id?.toString() || 'unassigned';
          
          // Try each available room
          for (const room of rooms) {
            const roomId = room.id?.toString() || 'unassigned';
            
            // Check if this combination has any conflicts
            let hasConflict = false;
            for (const timeSlot of timeSlots) {
              if (this.hasTimeSlotConflict(
                timeSlot.day, 
                timeSlot.startTime, 
                timeSlot.endTime, 
                facultyId, 
                roomId
              )) {
                hasConflict = true;
                break;
              }
            }
            
            // If no conflicts found, return this combination
            if (!hasConflict) {
              console.log(`✅ Found conflict-free schedule for ${course.subjectCode || course.code} on attempt ${timeSlotAttempt + 1}/${maxRetries}`);
              console.log(`📍 Schedule details: ${faculty.firstname} ${faculty.lastname} in ${room.name} at ${timeSlots[0]?.startTime}`);
              return { timeSlots, faculty, room };
            }
          }
        }
      }
    }
    
    // No conflict-free combination found - try with relaxed constraints
    console.warn(`⚠️ No conflict-free schedule found for ${course.subjectCode || course.code} after ${maxRetries} attempts`);
    console.log(`🔄 Attempting fallback scheduling with relaxed constraints...`);
    
    // Fallback: Try to assign any available faculty and room, even with some conflicts
    if (qualifiedFaculty.length > 0 && rooms.length > 0) {
      const fallbackTimeSlots = this.generateTimeSlots(lecHours, labHours, totalUnits, 0, 0);
      if (fallbackTimeSlots.length > 0) {
        console.log(`🆘 Using fallback schedule for ${course.subjectCode || course.code}`);
        return { 
          timeSlots: fallbackTimeSlots, 
          faculty: qualifiedFaculty[0], 
          room: rooms[0] 
        };
      }
    }
    
    console.error(`❌ Complete failure to schedule ${course.subjectCode || course.code}`);
    return null;
  }

  // Helper method to validate time slots don't conflict with lunch break or exceed 8PM
  private static isValidTimeSlot(startTime: string, endTime: string): boolean {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const lunchStart = this.timeToMinutes('12:00');
    const lunchEnd = this.timeToMinutes('13:00');
    const dayEnd = this.timeToMinutes('20:00');
    
    // Check if slot conflicts with lunch break or goes past 8PM
    return end <= dayEnd && !(start < lunchEnd && end > lunchStart);
  }

  // Helper method to convert time string to minutes
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper method to get day patterns based on optimal session distribution
  private static getDayPatternForUnits(units: number): string[][] {
    // Updated day patterns to match dynamic scheduling approach
    // Focus on optimal distribution rather than strict unit-to-day mapping
    
    if (units <= 2) {
      // 1-2 units: Simple single or double day patterns
      return [
        ['Monday'], ['Tuesday'], ['Wednesday'], ['Thursday'], ['Friday'],
        ['Monday', 'Wednesday'], ['Tuesday', 'Thursday'], ['Monday', 'Friday']
      ];
    } else if (units === 3) {
      // 3 units: Prefer 2-day patterns (1.5 hours each) over 3-day patterns (1 hour each)
      return [
        ['Monday', 'Wednesday'], ['Tuesday', 'Thursday'], ['Monday', 'Friday'], 
        ['Wednesday', 'Friday'], ['Tuesday', 'Friday'],
        ['Monday', 'Wednesday', 'Friday'] // Fallback 3-day option
      ];
    } else if (units === 4) {
      // 4 units: Distribute across 2-3 days optimally
      return [
        ['Monday', 'Wednesday'], ['Tuesday', 'Thursday'], 
        ['Monday', 'Wednesday', 'Friday'], ['Tuesday', 'Thursday', 'Friday']
      ];
    } else if (units === 5) {
      // 5 units: Distribute across 3-4 days
      return [
        ['Monday', 'Wednesday', 'Friday'], ['Tuesday', 'Thursday', 'Friday'],
        ['Monday', 'Tuesday', 'Thursday'], ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
      ];
    } else {
      // 6+ units: Use maximum distribution
      return [
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      ];
    }
  }

  // Helper method to combine days into abbreviated format (e.g., "MW", "TTh", "MWF")
  private static combineDays(days: string[]): string {
    console.log('combineDays input:', days);
    
    if (!days || days.length === 0) {
      console.warn('combineDays received empty or undefined days array');
      return '';
    }
    
    // Filter out undefined, null, and empty string values
    const validDays = days.filter(day => day && day.trim() !== '');
    console.log('Valid days after filtering:', validDays);
    
    if (validDays.length === 0) {
      console.warn('No valid days found after filtering');
      return '';
    }
    
    const dayAbbreviations: { [key: string]: string } = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'Th',
      'Friday': 'F',
      'Saturday': 'S',
      'Sunday': 'Su'
    };

    // Remove duplicates and sort by day order
    const uniqueDays = [...new Set(validDays)];
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const sortedDays = uniqueDays.sort((a, b) => {
      return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    // Convert to abbreviations and join
    const result = sortedDays.map(day => dayAbbreviations[day] || day).join('');
    console.log('combineDays result:', result);
    return result;
  }

  // Helper method to add minutes to a time string
  private static addMinutes(timeString: string, minutes: number): string {
    const [hourStr, minuteStr] = timeString.split(':');
    const totalMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr) + minutes;
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    
    return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
  }

  // Helper method to compare two time strings
  private static compareTime(time1: string, time2: string): number {
    const [hour1, minute1] = time1.split(':').map(Number);
    const [hour2, minute2] = time2.split(':').map(Number);
    
    const totalMinutes1 = hour1 * 60 + minute1;
    const totalMinutes2 = hour2 * 60 + minute2;
    
    return totalMinutes1 - totalMinutes2;
  }

}