-- CreateTable
CREATE TABLE `faculty_subject_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facultyId` INTEGER NOT NULL,
    `subjectCode` VARCHAR(191) NOT NULL,
    `subjectDescription` VARCHAR(191) NOT NULL,
    `units` INTEGER NOT NULL,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NULL,
    `yearLevel` VARCHAR(191) NULL,
    `semester` VARCHAR(191) NULL,
    `section` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `faculty_subject_assignments` ADD CONSTRAINT `faculty_subject_assignments_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
