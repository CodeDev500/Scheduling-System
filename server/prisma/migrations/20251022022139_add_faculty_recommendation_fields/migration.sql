-- AlterTable
ALTER TABLE `users` ADD COLUMN `maxTeachingLoad` INTEGER NULL,
    ADD COLUMN `preferredTimeSlots` JSON NULL,
    ADD COLUMN `previousSubjects` JSON NULL,
    ADD COLUMN `unavailableDays` JSON NULL,
    ADD COLUMN `yearsOfExperience` INTEGER NULL;
