/*
  Warnings:

  - You are about to drop the column `credits` on the `subject_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `subject_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `subject_schedules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `subject_schedules` DROP COLUMN `credits`,
    DROP COLUMN `section`,
    DROP COLUMN `type`,
    ADD COLUMN `lab` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lec` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `recommendedFaculty` JSON NULL;
