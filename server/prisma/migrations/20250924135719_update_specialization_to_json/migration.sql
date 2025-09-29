-- AlterTable
-- Step 1: Add a new temporary column for JSON array
ALTER TABLE `users` ADD COLUMN `specialization_new` JSON NULL;

-- Step 2: Convert existing string data to JSON array format
-- If specialization is not null, wrap it in a JSON array, otherwise keep it null
UPDATE `users` 
SET `specialization_new` = CASE 
    WHEN `specialization` IS NOT NULL AND `specialization` != '' 
    THEN JSON_ARRAY(`specialization`)
    ELSE NULL 
END;

-- Step 3: Drop the old column
ALTER TABLE `users` DROP COLUMN `specialization`;

-- Step 4: Rename the new column to the original name
ALTER TABLE `users` CHANGE COLUMN `specialization_new` `specialization` JSON NULL;