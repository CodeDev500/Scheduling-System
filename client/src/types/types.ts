import type { ReactElement } from "react";

export type ArrayLink = {
  title: string;
  path: string;
  component: ReactElement;
};

export type LayoutHomeProps = {
  children: React.ReactNode;
};

export interface VerifyOTPProps {
  email: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  closeOTP: () => void;
  errorMessage?: string;
  loading?: boolean;
}

export interface User {
  id: number;
  image: string;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectTypes {
  id: number | null;
  subjectCode: string;
  subjectDescription: string;
  lec: number;
  lab: number;
  units: number;
}

export interface AcademicProgram {
  id: number | null;
  department?: string | null;
  programCode: string | null;
  programName: string | null;
}

export interface CurriculumCourse {
  id: number | null;
  curriculumYear: string | null;
  programCode: string | null;
  programName: string | null;
  courseCode: string | null;
  courseName: string | null;
  lec: number | null;
  lab: number | null;
  units: number | null;
  hours: number | null;
  period: string | null;
  yearLevel: string | null;
}

export type SubjectData = {
  id: number;
  code: string;
  name: string;
  lec: number;
  lab: number;
  units: number;
  programCode?: string;
  yearLevel?: string;
  room?: string;
  instructor?: string;
  schedule?: { day: string; time: string };
};
