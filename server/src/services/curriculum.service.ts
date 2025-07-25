import { db } from "../utils/db.server";

export const createCurriculumCourse = async (data: {
  curriculumYear?: string;
  programCode?: string;
  programName?: string;
  subjectCode?: string;
  subjectDescription?: string;
  lec?: number;
  lab?: number;
  units?: number;
  hours?: number;
  period?: string;
  yearLevel?: string;

  offerings?: {
    courseType?: string;
    description?: string;
    sectionName?: string;
    yearLevel: string;
    roomSchedules?: {
      day: string;
      timeStarts: string;
      timeEnds: string;
      room?: string;
      instructorId?: number; // Ideally id of instructor (User)
      isActive?: boolean;
      isLoaded?: number;
    }[];
  }[];
}) => {
  return await db.curriculumCourse.create({
    data: {
      curriculumYear: data.curriculumYear,
      programCode: data.programCode,
      programName: data.programName,
      subjectCode: data.subjectCode,
      subjectDescription: data.subjectDescription,
      lec: data.lec,
      lab: data.lab,
      units: data.units,
      hours: data.hours,
      period: data.period,
      yearLevel: data.yearLevel,
      courseOfferings: {
        create:
          data.offerings?.map((offering) => ({
            courseType: offering.courseType,
            description: offering.description,
            sectionName: offering.sectionName,
            yearLevel: offering.yearLevel,
            roomSchedules: {
              create:
                offering.roomSchedules?.map((schedule) => ({
                  day: schedule.day,
                  timeStarts: schedule.timeStarts,
                  timeEnds: schedule.timeEnds,
                  room: schedule.room,
                  instructorId: schedule.instructorId,
                  isActive: schedule.isActive ?? true,
                  isLoaded: schedule.isLoaded ?? 0,
                })) ?? [],
            },
          })) ?? [],
      },
    },
    include: {
      courseOfferings: {
        include: {
          roomSchedules: true,
        },
      },
    },
  });
};

export const listCurriculumCourses = async () => {
  return await db.curriculumCourse.findMany({
    include: {
      courseOfferings: {
        include: {
          roomSchedules: {
            include: {
              instructor: true,
            },
          },
        },
      },
    },
  });
};

export const getCurriculumCourseById = async (id: number) => {
  return await db.curriculumCourse.findUnique({
    where: { id },
    include: {
      courseOfferings: {
        include: {
          roomSchedules: {
            include: {
              instructor: true,
            },
          },
        },
      },
    },
  });
};

export const updateCurriculumCourse = async (
  id: number,
  data: Partial<{
    curriculumYear: string;
    programCode: string;
    programName: string;
    subjectCode: string;
    subjectDescription: string;
    lec: number;
    lab: number;
    units: number;
    hours: number;
    period: string;
    yearLevel: string;
  }>
) => {
  return await db.curriculumCourse.update({
    where: { id },
    data,
  });
};

export const deleteCurriculumCourse = async (id: number) => {
  return await db.curriculumCourse.delete({
    where: { id },
  });
};

export const getCurriculumCoursesByProgramandLevel = async (
  programCode: string,
  yearLevel: string
) => {
  const courses = await db.curriculumCourse.findMany({
    where: {
      programCode,
      yearLevel,
    },
    include: {
      courseOfferings: {
        include: {
          roomSchedules: {
            include: {
              instructor: true,
            },
          },
        },
      },
    },
  });

  // Group by period: "1st Semester", "2nd Semester", "Summer"
  const grouped: Record<string, any[]> = {
    "1st Semester": [],
    "2nd Semester": [],
    Summer: [],
  };

  for (const course of courses) {
    const key = course.period ?? "Others";
    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push({
      id: course.id,
      code: course.subjectCode ?? "",
      name: course.subjectDescription ?? "",
      lec: course.lec ?? 0,
      lab: course.lab ?? 0,
      units: course.units ?? 0,
      hours: course.hours ?? 0,
      offerings: course.courseOfferings,
    });
  }

  return grouped;
};

export const upsertCurriculumCourse = async (data: {
  id?: number;
  curriculumYear?: string;
  programCode?: string;
  programName?: string;
  subjectCode?: string;
  subjectDescription?: string;
  lec?: number;
  lab?: number;
  units?: number;
  hours?: number;
  period?: string;
  yearLevel?: string;
}) => {
  const courseData = {
    curriculumYear: data.curriculumYear,
    programCode: data.programCode,
    programName: data.programName,
    subjectCode: data.subjectCode,
    subjectDescription: data.subjectDescription,
    lec: data.lec,
    lab: data.lab,
    units: data.units,
    hours: data.hours,
    period: data.period,
    yearLevel: data.yearLevel,
  };

  if (data.id) {
    // Update existing curriculum course
    return await db.curriculumCourse.update({
      where: { id: data.id },
      data: courseData,
    });
  } else {
    // Create new curriculum course
    return await db.curriculumCourse.create({
      data: courseData,
    });
  }
};
