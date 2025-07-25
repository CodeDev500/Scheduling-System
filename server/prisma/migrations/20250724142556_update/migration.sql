-- AlterTable
ALTER TABLE `course_offerings` MODIFY `courseType` VARCHAR(191) NULL,
    MODIFY `curriculumId` INTEGER NULL,
    MODIFY `sectionName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `room_schedules` MODIFY `room` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `room_schedules` ADD CONSTRAINT `room_schedules_offeringId_fkey` FOREIGN KEY (`offeringId`) REFERENCES `course_offerings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
