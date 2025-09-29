-- AlterTable
ALTER TABLE `users` ADD COLUMN `specialization` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `specializations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `specializations_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_constraints` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NOT NULL,
    `constraintType` ENUM('TIME_PREFERENCE', 'ROOM_REQUIREMENT', 'FACULTY_AVAILABILITY', 'SUBJECT_SEQUENCE', 'BREAK_DURATION', 'MAXIMUM_DAILY_HOURS', 'DEPARTMENT_POLICY') NOT NULL,
    `constraintValue` VARCHAR(191) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `generation_preferences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NOT NULL,
    `optimizationGoal` ENUM('MINIMIZE_CONFLICTS', 'MAXIMIZE_EFFICIENCY', 'BALANCED', 'FACULTY_PREFERENCE', 'ROOM_UTILIZATION') NOT NULL DEFAULT 'BALANCED',
    `maxConsecutiveHours` INTEGER NOT NULL DEFAULT 4,
    `preferredTimeSlots` VARCHAR(191) NULL,
    `avoidTimeSlots` VARCHAR(191) NULL,
    `roomPreferences` VARCHAR(191) NULL,
    `facultyPreferences` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_generations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NOT NULL,
    `academicYear` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `yearLevel` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `generatedBy` INTEGER NOT NULL,
    `constraintsUsed` VARCHAR(191) NULL,
    `conflictsFound` VARCHAR(191) NULL,
    `scheduleData` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_conflicts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `generationId` INTEGER NOT NULL,
    `conflictType` ENUM('TIME_OVERLAP', 'ROOM_DOUBLE_BOOKING', 'FACULTY_OVERLOAD', 'CONSTRAINT_VIOLATION', 'RESOURCE_UNAVAILABLE') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `affectedItems` VARCHAR(191) NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `resolution` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedule_generations` ADD CONSTRAINT `schedule_generations_generatedBy_fkey` FOREIGN KEY (`generatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_conflicts` ADD CONSTRAINT `schedule_conflicts_generationId_fkey` FOREIGN KEY (`generationId`) REFERENCES `schedule_generations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
