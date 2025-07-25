-- CreateTable
CREATE TABLE `subjects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectCode` VARCHAR(191) NOT NULL,
    `subjectDescription` VARCHAR(191) NOT NULL,
    `lec` INTEGER NOT NULL DEFAULT 0,
    `lab` INTEGER NOT NULL DEFAULT 0,
    `units` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subjects_subjectCode_key`(`subjectCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
