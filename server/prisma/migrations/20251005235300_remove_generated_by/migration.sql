/*
  Warnings:

  - You are about to drop the column `generatedBy` on the `schedule_generations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `schedule_generations` DROP FOREIGN KEY `schedule_generations_generatedBy_fkey`;

-- DropIndex
DROP INDEX `schedule_generations_generatedBy_fkey` ON `schedule_generations`;

-- AlterTable
ALTER TABLE `schedule_generations` DROP COLUMN `generatedBy`;
