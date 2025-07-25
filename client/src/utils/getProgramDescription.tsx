import { type AcademicProgram } from "../types/types";

export const programDescription = (
  programCode?: string,
  programs?: AcademicProgram[]
) => {
  if (!programs || !Array.isArray(programs)) return "Unknown Program";

  const program = programs.find(
    (p) => p.programCode?.toLowerCase() === programCode?.toLowerCase()
  );
  return program ? program.programName : "Unknown Program";
};
