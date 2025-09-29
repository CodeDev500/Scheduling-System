-- CreateTable
CREATE TABLE `program_priorities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `programCode` VARCHAR(191) NOT NULL,
    `programName` VARCHAR(191) NOT NULL,
    `priority` INTEGER NOT NULL,
    `department` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `program_priorities_programCode_key`(`programCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
