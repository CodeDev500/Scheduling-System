/*
  Warnings:

  - You are about to drop the column `maxTeachingLoad` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `unavailableDays` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `maxTeachingLoad`,
    DROP COLUMN `unavailableDays`,
    ADD COLUMN `availableDays` JSON NULL;
