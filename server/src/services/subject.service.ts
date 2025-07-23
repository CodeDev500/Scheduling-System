import { Subject } from "../schema/subject.schema";
import { db } from "../utils/db.server";

export const createSubject = async (data: any): Promise<Subject> => {
  const { subjectCode, subjectDescription, lec, lab, units } = data;
  return db.curriculumCourse.create({
    data: { subjectCode, subjectDescription, lec, lab, units },
  });
};

export const listSubjects = async (): Promise<Subject[]> => {
  return db.curriculumCourse.findMany();
};

export const getSubjectById = async (id: number): Promise<Subject | null> => {
  return db.curriculumCourse.findUnique({ where: { id } });
};

export const updateSubjectData = async (
  id: number,
  data: any
): Promise<Subject> => {
  const { subjectCode, subjectDescription, lec, lab, units } = data;
  return db.curriculumCourse.update({
    where: { id },
    data: { subjectCode, subjectDescription, lec, lab, units },
  });
};

export const deleteSubject = async (id: number): Promise<Subject> => {
  return db.curriculumCourse.delete({ where: { id } });
};

export const searchSubjectQuery = async (query: string): Promise<Subject[]> => {
  return db.curriculumCourse.findMany({
    where: {
      OR: [
        { subjectCode: { contains: query } },
        { subjectDescription: { contains: query } },
      ],
    },
  });
};
