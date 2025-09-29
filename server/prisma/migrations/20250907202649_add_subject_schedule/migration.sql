-- CreateTable
CREATE TABLE `subject_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curriculumId` INTEGER NOT NULL,
    `instructorId` INTEGER NULL,
    `roomId` INTEGER NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `days` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `academicYear` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subject_schedules` ADD CONSTRAINT `subject_schedules_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum_courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_schedules` ADD CONSTRAINT `subject_schedules_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_schedules` ADD CONSTRAINT `subject_schedules_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
