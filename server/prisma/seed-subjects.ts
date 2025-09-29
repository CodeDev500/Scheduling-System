// prisma/seed-subjects.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting subjects and faculty seeding...");

  // Clear existing data
  await prisma.userSubject.deleteMany();
  await prisma.subject.deleteMany();

  // Create Subjects
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

  // Get existing faculty users
  console.log("👥 Finding faculty users...");
  const facultyUsers = await prisma.user.findMany({
    where: {
      role: "FACULTY"
    }
  });

  if (facultyUsers.length === 0) {
    console.log("⚠️ No faculty users found. Please run the main seed first to create users.");
    return;
  }

  // Create Faculty-Subject Assignments
  console.log("👨‍🏫 Assigning subjects to faculty...");
  const assignments = [];
  
  // Assign subjects to each faculty member (distribute evenly)
  for (let i = 0; i < subjects.length; i++) {
    const facultyIndex = i % facultyUsers.length;
    assignments.push(
      prisma.userSubject.create({
        data: {
          userId: facultyUsers[facultyIndex].id,
          subjectId: subjects[i].id,
        },
      })
    );
  }

  await Promise.all(assignments);

  console.log(`✅ Successfully created ${subjects.length} subjects and ${assignments.length} faculty assignments!`);
  console.log(`📊 Faculty members: ${facultyUsers.length}`);
  facultyUsers.forEach((faculty, index) => {
    const assignedSubjects = subjects.filter((_, i) => i % facultyUsers.length === index);
    console.log(`   - ${faculty.firstname} ${faculty.lastname}: ${assignedSubjects.map(s => s.subjectCode).join(', ')}`);
  });
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