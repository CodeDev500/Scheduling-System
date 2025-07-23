-- DropForeignKey
ALTER TABLE `course_offerings` DROP FOREIGN KEY `course_offerings_curriculumId_fkey`;

-- DropIndex
DROP INDEX `course_offerings_curriculumId_fkey` ON `course_offerings`;

-- AddForeignKey
ALTER TABLE `course_offerings` ADD CONSTRAINT `course_offerings_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum_courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
