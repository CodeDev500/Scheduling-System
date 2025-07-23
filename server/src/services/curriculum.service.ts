import { CurriculumCourse } from "../schema/curriculumCourse.schema";
import { db } from "../utils/db.server";

export const createCurriculum = async (
  data: CurriculumCourse
): Promise<CurriculumCourse> => {
  const {
    curriculumYear,
    programCode,
    programName,
    courseCode,
    courseName,
    lec,
    lab,
    units,
    hours,
    period,
    yearLevel,
  } = data;

  return await db.curriculumCourse.create({
    data: {
      curriculumYear,
      programCode,
      programName,
      courseCode,
      courseName,
      lec,
      lab,
      units,
      hours,
      period,
      yearLevel,
    },
  });
};

export const getCurriculum = async (): Promise<CurriculumCourse[]> => {
  return await db.curriculumCourse.findMany();
};

export const getCurriculumById = async (
  id: number
): Promise<CurriculumCourse> => {
  const curriculum = await db.curriculumCourse.findUnique({ where: { id } });

  if (!curriculum) {
    throw new Error("Curriculum not found");
  }

  return curriculum;
};

export const updateCurriculum = async (
  id: number,
  data: CurriculumCourse
): Promise<CurriculumCourse> => {
  return await db.curriculumCourse.update({
    where: { id },
    data,
  });
};

export const deleteCurriculum = async (
  id: number
): Promise<CurriculumCourse> => {
  return await db.curriculumCourse.delete({ where: { id } });
};
