-- AlterTable
ALTER TABLE `issue` ADD COLUMN `isIndexed` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `issue_isIndexed_idx` ON `issue`(`isIndexed`);
