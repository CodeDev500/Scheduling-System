// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - remove if you want to keep existing data)
  await prisma.notifications.deleteMany();
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
        courseCode: "CS101",
        courseName: "Introduction to Computing",
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
        courseCode: "CS102",
        courseName: "Computer Programming 1",
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
        courseCode: "MATH101",
        courseName: "College Algebra",
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
        courseCode: "CS103",
        courseName: "Computer Programming 2",
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
        courseCode: "CS201",
        courseName: "Data Structures and Algorithms",
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
        courseCode: "IT101",
        courseName: "Introduction to Information Technology",
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
        courseCode: "IT102",
        courseName: "Computer Programming Fundamentals",
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
        courseCode: "IT201",
        courseName: "Web Development",
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
        isActive: true,
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
        isActive: true,
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
        isActive: true,
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
        isActive: true,
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

  // 8. Create Notifications
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
