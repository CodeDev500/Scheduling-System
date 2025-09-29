/*
  Warnings:

  - You are about to drop the column `isActive` on the `room_schedules` table. All the data in the column will be lost.
  - You are about to drop the `subject_schedules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `subject_schedules` DROP FOREIGN KEY `subject_schedules_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `subject_schedules` DROP FOREIGN KEY `subject_schedules_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `subject_schedules` DROP FOREIGN KEY `subject_schedules_roomId_fkey`;

-- AlterTable
ALTER TABLE `room_schedules` DROP COLUMN `isActive`;

-- DropTable
DROP TABLE `subject_schedules`;
