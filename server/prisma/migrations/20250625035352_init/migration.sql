-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `middleInitial` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('CAMPUS_ADMIN', 'REGISTRAR', 'DEPARTMENT_HEAD', 'FACULTY') NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'APPROVED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curriculumYear` VARCHAR(191) NOT NULL,
    `programCode` VARCHAR(191) NOT NULL,
    `programName` VARCHAR(191) NOT NULL,
    `courseCode` VARCHAR(191) NOT NULL,
    `courseName` VARCHAR(191) NOT NULL,
    `lec` INTEGER NULL,
    `lab` INTEGER NULL,
    `units` INTEGER NOT NULL,
    `hours` INTEGER NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `yearLevel` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_offerings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseType` VARCHAR(191) NOT NULL,
    `curriculumId` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `sectionName` VARCHAR(191) NOT NULL,
    `yearLevel` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` VARCHAR(191) NOT NULL,
    `timeStarts` VARCHAR(191) NOT NULL,
    `timeEnds` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NOT NULL,
    `offeringId` INTEGER NULL,
    `instructorId` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL,
    `isLoaded` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_programs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NULL,
    `programCode` VARCHAR(191) NULL,
    `programName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `otp` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units_loads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instructorId` INTEGER NULL,
    `units` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_offerings` ADD CONSTRAINT `course_offerings_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum_courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_schedules` ADD CONSTRAINT `room_schedules_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `units_loads` ADD CONSTRAINT `units_loads_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
