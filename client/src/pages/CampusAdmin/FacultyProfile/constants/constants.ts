export const UserRoles = [
  "FACULTY",
  "DEPARTMENT_HEAD",
  "REGISTRAR",
  "CAMPUS_ADMIN",
] as const;

export const UserStatuses = ["PENDING", "VERIFIED", "APPROVED"] as const;

export const program = [
  { programCode: "BSED", programName: "Bachelor of Science in Education" },
  { programCode: "BSCRIM", programName: "Bachelor of Science in Criminology" },
  { programCode: "BSSW", programName: "Bachelor of Science in Social Work" },
  {
    programCode: "BSCS",
    programName: "Bachelor of Science in Computer Science",
  },
] as const;

export const designationList = [
  { designation: "Visiting Lecturer", role: "FACULTY" },
  { designation: "Regular Faculty", role: "FACULTY" },
  { designation: "Program Head", role: "DEPARTMENT_HEAD" },
  { designation: "Campus Registrar", role: "REGISTRAR" },
  { designation: "Campus Administrator", role: "CAMPUS_ADMIN" },
];
