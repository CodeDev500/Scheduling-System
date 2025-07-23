/*
  Warnings:

  - You are about to drop the column `courseCode` on the `curriculum_courses` table. All the data in the column will be lost.
  - You are about to drop the column `courseName` on the `curriculum_courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `curriculum_courses` DROP COLUMN `courseCode`,
    DROP COLUMN `courseName`,
    ADD COLUMN `subjectCode` VARCHAR(191) NULL,
    ADD COLUMN `subjectDescription` VARCHAR(191) NULL,
    MODIFY `curriculumYear` VARCHAR(191) NULL,
    MODIFY `programCode` VARCHAR(191) NULL,
    MODIFY `programName` VARCHAR(191) NULL,
    MODIFY `units` INTEGER NULL,
    MODIFY `hours` INTEGER NULL,
    MODIFY `period` VARCHAR(191) NULL,
    MODIFY `yearLevel` VARCHAR(191) NULL;
