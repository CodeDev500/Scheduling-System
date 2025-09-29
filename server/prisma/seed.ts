// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - remove if you want to keep existing data)
  await prisma.notifications.deleteMany();
  await prisma.userSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.units_Loads.deleteMany();
  await prisma.roomSchedules.deleteMany();
  await prisma.courseOffering.deleteMany();
  await prisma.curriculumCourse.deleteMany();
  await prisma.room.deleteMany();
  await prisma.academicProgram.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  console.log("👥 Creating users...");
  const users = await Promise.all([
    // Campus Admin
    prisma.user.create({
      data: {
        image: "admin-avatar.png",
        firstname: "Campus",
        lastname: "Administrator",
        middleInitial: "A",
        email: "campus.admin@university.edu",
        designation: "Campus Administrator",
        department: "Administration",
        password: "admin123", // In production, hash this password
        role: "CAMPUS_ADMIN",
        status: "VERIFIED",
      },
    }),

    // Registrar
    prisma.user.create({
      data: {
        image: "registrar-avatar.png",
        firstname: "Maria",
        lastname: "Santos",
        middleInitial: "R",
        email: "registrar@university.edu",
        designation: "University Registrar",
        department: "Registrar Office",
        password: "registrar123",
        role: "REGISTRAR",
        status: "VERIFIED",
      },
    }),

    // Department Head - Computer Science
    prisma.user.create({
      data: {
        image: "dept-head-cs.png",
        firstname: "Dr. John",
        lastname: "Cruz",
        middleInitial: "D",
        email: "cs.head@university.edu",
        designation: "Department Head",
        department: "BSCS",
        password: "depthead123",
        role: "DEPARTMENT_HEAD",
        status: "VERIFIED",
      },
    }),

    // Department Head - Information Technology
    prisma.user.create({
      data: {
        image: "dept-head-it.png",
        firstname: "Dr. Ana",
        lastname: "Reyes",
        middleInitial: "M",
        email: "it.head@university.edu",
        designation: "Department Head",
        department: "BSIT",
        password: "depthead123",
        role: "DEPARTMENT_HEAD",
        status: "VERIFIED",
      },
    }),

    // Faculty Members
    prisma.user.create({
      data: {
        image: "faculty1.png",
        firstname: "Prof. Miguel",
        lastname: "Garcia",
        middleInitial: "A",
        email: "miguel.garcia@university.edu",
        designation: "Associate Professor",
        department: "BSCS",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    prisma.user.create({
      data: {
        image: "faculty2.png",
        firstname: "Prof. Sarah",
        lastname: "Mendoza",
        middleInitial: "L",
        email: "sarah.mendoza@university.edu",
        designation: "Assistant Professor",
        department: "BSIT",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    prisma.user.create({
      data: {
        image: "faculty3.png",
        firstname: "Prof. Roberto",
        lastname: "Dela Cruz",
        middleInitial: "P",
        email: "roberto.delacruz@university.edu",
        designation: "Instructor I",
        department: "BSCS",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    prisma.user.create({
      data: {
        image: "faculty4.png",
        firstname: "Prof. Lisa",
        lastname: "Fernandez",
        middleInitial: "C",
        email: "lisa.fernandez@university.edu",
        designation: "Instructor II",
        department: "BSIT",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    // Department Head - BSCRIM
    prisma.user.create({
      data: {
        image: "dept-head-crim.png",
        firstname: "Dr. Carlos",
        lastname: "Villanueva",
        middleInitial: "R",
        email: "crim.head@university.edu",
        designation: "Department Head",
        department: "BSCRIM",
        password: "depthead123",
        role: "DEPARTMENT_HEAD",
        status: "VERIFIED",
      },
    }),

    // Department Head - BSSW
    prisma.user.create({
      data: {
        image: "dept-head-sw.png",
        firstname: "Dr. Maria",
        lastname: "Gonzales",
        middleInitial: "T",
        email: "sw.head@university.edu",
        designation: "Department Head",
        department: "BSSW",
        password: "depthead123",
        role: "DEPARTMENT_HEAD",
        status: "VERIFIED",
      },
    }),

    // Department Head - BSED
    prisma.user.create({
      data: {
        image: "dept-head-ed.png",
        firstname: "Dr. Elena",
        lastname: "Morales",
        middleInitial: "D",
        email: "ed.head@university.edu",
        designation: "Department Head",
        department: "BSED",
        password: "depthead123",
        role: "DEPARTMENT_HEAD",
        status: "VERIFIED",
      },
    }),

    // Faculty - BSCRIM
    prisma.user.create({
      data: {
        image: "faculty-crim1.png",
        firstname: "Prof. Mark",
        lastname: "Rodriguez",
        middleInitial: "S",
        email: "mark.rodriguez@university.edu",
        designation: "Assistant Professor",
        department: "BSCRIM",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    prisma.user.create({
      data: {
        image: "faculty-crim2.png",
        firstname: "Prof. Patricia",
        lastname: "Santos",
        middleInitial: "L",
        email: "patricia.santos@university.edu",
        designation: "Instructor I",
        department: "BSCRIM",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    // Faculty - BSSW
    prisma.user.create({
      data: {
        image: "faculty-sw1.png",
        firstname: "Prof. James",
        lastname: "Tan",
        middleInitial: "K",
        email: "james.tan@university.edu",
        designation: "Associate Professor",
        department: "BSSW",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    prisma.user.create({
      data: {
        image: "faculty-sw2.png",
        firstname: "Prof. Grace",
        lastname: "Lim",
        middleInitial: "M",
        email: "grace.lim@university.edu",
        designation: "Instructor III",
        department: "BSSW",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    // Faculty - BSED
    prisma.user.create({
      data: {
        image: "faculty-ed1.png",
        firstname: "Prof. Anna",
        lastname: "Cruz",
        middleInitial: "M",
        email: "anna.cruz@university.edu",
        designation: "Assistant Professor",
        department: "BSED",
        password: "faculty123",
        role: "FACULTY",
        status: "VERIFIED",
      },
    }),

    // Additional Registrar
    prisma.user.create({
      data: {
        image: "registrar2.png",
        firstname: "Ms. Carmen",
        lastname: "Torres",
        middleInitial: "V",
        email: "assistant.registrar@university.edu",
        designation: "Assistant Registrar",
        department: "Registrar Office",
        password: "registrar123",
        role: "REGISTRAR",
        status: "VERIFIED",
      },
    }),
  ]);

  // 7. Create Subjects
  console.log("📖 Creating subjects...");
  const subjects = await Promise.all([
    // Computer Science Subjects
    prisma.subject.create({
      data: {
        subjectCode: "CS101",
        subjectDescription: "Introduction to Computing",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "CS102",
        subjectDescription: "Computer Programming 1",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "CS201",
        subjectDescription: "Data Structures and Algorithms",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "CS202",
        subjectDescription: "Object-Oriented Programming",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "CS301",
        subjectDescription: "Database Management Systems",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "CS302",
        subjectDescription: "Software Engineering",
      },
    }),

    // Information Technology Subjects
    prisma.subject.create({
      data: {
        subjectCode: "IT101",
        subjectDescription: "Introduction to Information Technology",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "IT201",
        subjectDescription: "Web Development",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "IT202",
        subjectDescription: "Network Administration",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "IT301",
        subjectDescription: "Systems Analysis and Design",
      },
    }),

    // General Education Subjects
    prisma.subject.create({
      data: {
        subjectCode: "GE101",
        subjectDescription: "Mathematics in the Modern World",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "GE102",
        subjectDescription: "Purposive Communication",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "GE201",
        subjectDescription: "Ethics",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "PE101",
        subjectDescription: "Physical Education 1",
      },
    }),

    prisma.subject.create({
      data: {
        subjectCode: "NSTP101",
        subjectDescription: "National Service Training Program 1",
      },
    }),
  ]);

  // 8. Create Faculty-Subject Assignments
  console.log("👨‍🏫 Assigning subjects to faculty...");
  const userSubjectAssignments = await Promise.all([
    // Prof. Miguel Garcia (CS Faculty) - CS subjects
    prisma.userSubject.create({
      data: {
        userId: users[4].id, // Prof. Miguel Garcia
        subjectId: subjects[0].id, // CS101
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[4].id, // Prof. Miguel Garcia
        subjectId: subjects[1].id, // CS102
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[4].id, // Prof. Miguel Garcia
        subjectId: subjects[2].id, // CS201
      },
    }),

    // Prof. Roberto Dela Cruz (CS Faculty) - CS subjects
    prisma.userSubject.create({
      data: {
        userId: users[6].id, // Prof. Roberto Dela Cruz
        subjectId: subjects[3].id, // CS202
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[6].id, // Prof. Roberto Dela Cruz
        subjectId: subjects[4].id, // CS301
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[6].id, // Prof. Roberto Dela Cruz
        subjectId: subjects[5].id, // CS302
      },
    }),

    // Prof. Sarah Mendoza (IT Faculty) - IT subjects
    prisma.userSubject.create({
      data: {
        userId: users[5].id, // Prof. Sarah Mendoza
        subjectId: subjects[6].id, // IT101
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[5].id, // Prof. Sarah Mendoza
        subjectId: subjects[7].id, // IT201
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[5].id, // Prof. Sarah Mendoza
        subjectId: subjects[8].id, // IT202
      },
    }),

    // Prof. Lisa Fernandez (IT Faculty) - IT and GE subjects
    prisma.userSubject.create({
      data: {
        userId: users[7].id, // Prof. Lisa Fernandez
        subjectId: subjects[9].id, // IT301
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[7].id, // Prof. Lisa Fernandez
        subjectId: subjects[10].id, // GE101
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[7].id, // Prof. Lisa Fernandez
        subjectId: subjects[11].id, // GE102
      },
    }),

    // Additional assignments for variety
    prisma.userSubject.create({
      data: {
        userId: users[4].id, // Prof. Miguel Garcia
        subjectId: subjects[12].id, // GE201
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[5].id, // Prof. Sarah Mendoza
        subjectId: subjects[13].id, // PE101
      },
    }),

    prisma.userSubject.create({
      data: {
        userId: users[6].id, // Prof. Roberto Dela Cruz
        subjectId: subjects[14].id, // NSTP101
      },
    }),
  ]);

  // 2. Create Academic Programs
  console.log("🎓 Creating academic programs...");
  const programs = await Promise.all([
    prisma.academicProgram.create({
      data: {
        department: "College of Computing and Information Sciences",
        programCode: "BSCS",
        programName: "Bachelor of Science in Computer Science",
      },
    }),

    prisma.academicProgram.create({
      data: {
        department: "College of Computing and Information Sciences",
        programCode: "BSIT",
        programName: "Bachelor of Science in Information Technology",
      },
    }),

    prisma.academicProgram.create({
      data: {
        department: "College of Computing and Information Sciences",
        programCode: "BSIS",
        programName: "Bachelor of Science in Information Systems",
      },
    }),
  ]);

  // 3. Create Rooms
  console.log("🏫 Creating rooms...");
  const rooms = await Promise.all([
    prisma.room.create({ data: { name: "CS-101", capacity: 40 } }),
    prisma.room.create({ data: { name: "CS-102", capacity: 35 } }),
    prisma.room.create({ data: { name: "CS-103", capacity: 30 } }),
    prisma.room.create({ data: { name: "IT-201", capacity: 45 } }),
    prisma.room.create({ data: { name: "IT-202", capacity: 40 } }),
    prisma.room.create({ data: { name: "LAB-301", capacity: 25 } }),
    prisma.room.create({ data: { name: "LAB-302", capacity: 25 } }),
    prisma.room.create({ data: { name: "LAB-303", capacity: 30 } }),
    prisma.room.create({ data: { name: "MULTI-401", capacity: 100 } }),
    prisma.room.create({ data: { name: "AUDITORIUM", capacity: 200 } }),
  ]);

  // 4. Create Curriculum Courses
  console.log("📚 Creating curriculum courses...");
  const curriculumCourses = await Promise.all([
    // Computer Science Courses - 1st Year
    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSCS",
        programName: "Bachelor of Science in Computer Science",
        subjectCode: "CS101",
        subjectDescription: "Introduction to Computing",
        lec: 2,
        lab: 1,
        units: 3,
        hours: 3,
        period: "1st Semester",
        yearLevel: "1st Year",
      },
    }),

    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSCS",
        programName: "Bachelor of Science in Computer Science",
        subjectCode: "CS102",
        subjectDescription: "Computer Programming 1",
        lec: 2,
        lab: 1,
        units: 3,
        hours: 3,
        period: "1st Semester",
        yearLevel: "1st Year",
      },
    }),

    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSCS",
        programName: "Bachelor of Science in Computer Science",
        subjectCode: "MATH101",
        subjectDescription: "College Algebra",
        lec: 3,
        lab: 0,
        units: 3,
        hours: 3,
        period: "1st Semester",
        yearLevel: "1st Year",
      },
    }),

    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSCS",
        programName: "Bachelor of Science in Computer Science",
        subjectCode: "CS103",
        subjectDescription: "Computer Programming 2",
        lec: 2,
        lab: 1,
        units: 3,
        hours: 3,
        period: "2nd Semester",
        yearLevel: "1st Year",
      },
    }),

    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSCS",
        programName: "Bachelor of Science in Computer Science",
        subjectCode: "CS201",
        subjectDescription: "Data Structures and Algorithms",
        lec: 2,
        lab: 1,
        units: 3,
        hours: 3,
        period: "1st Semester",
        yearLevel: "2nd Year",
      },
    }),

    // Information Technology Courses - 1st Year
    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSIT",
        programName: "Bachelor of Science in Information Technology",
        subjectCode: "IT101",
        subjectDescription: "Introduction to Information Technology",
        lec: 2,
        lab: 1,
        units: 3,
        hours: 3,
        period: "1st Semester",
        yearLevel: "1st Year",
      },
    }),

    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSIT",
        programName: "Bachelor of Science in Information Technology",
        subjectCode: "IT102",
        subjectDescription: "Computer Programming Fundamentals",
        lec: 2,
        lab: 1,
        units: 3,
        hours: 3,
        period: "1st Semester",
        yearLevel: "1st Year",
      },
    }),

    prisma.curriculumCourse.create({
      data: {
        curriculumYear: "2024-2025",
        programCode: "BSIT",
        programName: "Bachelor of Science in Information Technology",
        subjectCode: "IT201",
        subjectDescription: "Web Development",
        lec: 2,
        lab: 1,
        units: 3,
        hours: 3,
        period: "1st Semester",
        yearLevel: "2nd Year",
      },
    }),
  ]);

  // 5. Create Course Offerings
  console.log("📋 Creating course offerings...");
  const courseOfferings = await Promise.all([
    // CS101 Sections
    prisma.courseOffering.create({
      data: {
        courseType: "Regular",
        curriculumId: curriculumCourses[0].id,
        description: "Introduction to Computing - Section A",
        sectionName: "CS101-A",
        yearLevel: "1st Year",
      },
    }),

    prisma.courseOffering.create({
      data: {
        courseType: "Regular",
        curriculumId: curriculumCourses[0].id,
        description: "Introduction to Computing - Section B",
        sectionName: "CS101-B",
        yearLevel: "1st Year",
      },
    }),

    // CS102 Sections
    prisma.courseOffering.create({
      data: {
        courseType: "Regular",
        curriculumId: curriculumCourses[1].id,
        description: "Computer Programming 1 - Section A",
        sectionName: "CS102-A",
        yearLevel: "1st Year",
      },
    }),

    // IT101 Sections
    prisma.courseOffering.create({
      data: {
        courseType: "Regular",
        curriculumId: curriculumCourses[5].id,
        description: "Introduction to Information Technology - Section A",
        sectionName: "IT101-A",
        yearLevel: "1st Year",
      },
    }),
  ]);

  // 6. Create Room Schedules
  console.log("📅 Creating room schedules...");
  const roomSchedules = await Promise.all([
    // Monday Schedules
    prisma.roomSchedules.create({
      data: {
        day: "Monday",
        timeStarts: "08:00",
        timeEnds: "10:00",
        room: "CS-101",
        offeringId: courseOfferings[0].id,
        instructorId: users[4].id, // Prof. Miguel Garcia
        isLoaded: 1,
      },
    }),

    prisma.roomSchedules.create({
      data: {
        day: "Monday",
        timeStarts: "10:00",
        timeEnds: "12:00",
        room: "CS-102",
        offeringId: courseOfferings[1].id,
        instructorId: users[6].id, // Prof. Roberto Dela Cruz
        isLoaded: 1,
      },
    }),

    // Tuesday Schedules
    prisma.roomSchedules.create({
      data: {
        day: "Tuesday",
        timeStarts: "08:00",
        timeEnds: "10:00",
        room: "IT-201",
        offeringId: courseOfferings[3].id,
        instructorId: users[5].id, // Prof. Sarah Mendoza
        isLoaded: 1,
      },
    }),

    // Wednesday Schedules
    prisma.roomSchedules.create({
      data: {
        day: "Wednesday",
        timeStarts: "14:00",
        timeEnds: "16:00",
        room: "LAB-301",
        offeringId: courseOfferings[2].id,
        instructorId: users[7].id, // Prof. Lisa Fernandez
        isLoaded: 1,
      },
    }),
  ]);

  // 7. Create Units Loads
  console.log("⚖️ Creating units loads...");
  const unitsLoads = await Promise.all([
    prisma.units_Loads.create({
      data: {
        instructorId: users[4].id, // Prof. Miguel Garcia
        units: 21,
      },
    }),

    prisma.units_Loads.create({
      data: {
        instructorId: users[5].id, // Prof. Sarah Mendoza
        units: 18,
      },
    }),

    prisma.units_Loads.create({
      data: {
        instructorId: users[6].id, // Prof. Roberto Dela Cruz
        units: 24,
      },
    }),

    prisma.units_Loads.create({
      data: {
        instructorId: users[7].id, // Prof. Lisa Fernandez
        units: 15,
      },
    }),
  ]);

  // 9. Create Notifications
  console.log("🔔 Creating notifications...");
  const notifications = await Promise.all([
    prisma.notifications.create({
      data: {
        content:
          "Welcome to the new Academic Year 2024-2025! Please review your schedules.",
      },
    }),

    prisma.notifications.create({
      data: {
        content:
          "Room CS-103 will be under maintenance on Friday. Classes will be moved to CS-101.",
      },
    }),

    prisma.notifications.create({
      data: {
        content:
          "Deadline for schedule adjustments is next week. Please submit requests early.",
      },
    }),

    prisma.notifications.create({
      data: {
        content:
          "New laboratory equipment has been installed in LAB-303. Training session scheduled for Monday.",
      },
    }),
  ]);

  console.log("✅ Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
