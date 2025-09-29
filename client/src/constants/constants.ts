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
export const specializationOptions = [
  // ==============================
  // Computer Science (BSCS) & ACT
  // ==============================
  "Data Structures",
  "Algorithms",
  "Software Engineering",
  "Database Systems",
  "Web Development",
  "Mobile Development",
  "Cross-platform Development",
  "Computer Networks",
  "Operating Systems",
  "Computer Architecture",
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "Big Data Analytics",
  "Cybersecurity",
  "Network Security",
  "Cloud Computing",
  "DevOps",
  "Distributed Systems",
  "Computer Graphics",
  "Human-Computer Interaction",
  "UI/UX Design",
  "Programming Languages",
  "Parallel Computing",
  "Systems Analysis & Design",
  "IT Project Management",
  "Software Testing & Quality Assurance",
  "Technical Writing",
  "Digital Forensics",
  "IT Governance",
  "Enterprise Architecture",

  // ==============================
  // Criminology (BSCRIM)
  // ==============================
  "Criminal Investigation",
  "Forensic Science",
  "Criminal Law",
  "Criminalistics",
  "Penology",
  "Police Administration",
  "Criminal Psychology",
  "Juvenile Justice",
  "Corrections",
  "Crime Prevention & Control",
  "Forensic Ballistics",
  "Questioned Documents Examination",
  "Forensic Toxicology",
  "Human Rights & Law Enforcement Ethics",
  "Disaster Risk & Crisis Management",

  // ==============================
  // Social Work (BSSW)
  // ==============================
  "Community Development",
  "Social Welfare Policy",
  "Case Management",
  "Group Work Practice",
  "Social Policy & Advocacy",
  "Human Rights & Social Justice",
  "Mental Health Social Work",
  "Family Therapy",
  "Child Welfare",
  "Substance Abuse Rehabilitation",
  "Gerontology & Elderly Care",
  "Women & Gender Studies",
  "Poverty Alleviation Programs",
  "Disaster Response & Recovery",

  // ==============================
  // Education (BSED)
  // ==============================
  "Educational Technology",
  "Curriculum Development",
  "Assessment and Evaluation",
  "Classroom Management",
  "Special Education",
  "Educational Psychology",
  "Research Methods in Education",
  "Educational Leadership",
  "Student Development & Counseling",
  "Learning Theories",
  "Early Childhood Education",
  "Mathematics Education",
  "Science Education",
  "English Language Teaching",
  "Filipino Language Teaching",
  "Social Studies Education",
  "Physical Education",
  "Music & Arts Education",
  "Values Education",

  // ==============================
  // General Academic Specializations
  // ==============================
  "Research and Development",
  "Academic Writing",
  "Statistics",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature",
  "Communication Skills",
  "Public Speaking",
  "Leadership",
  "Project Management"
] as const;
