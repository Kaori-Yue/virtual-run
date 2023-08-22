/*
  Warnings:

  - Added the required column `assigned_at` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ActivitiesOnEvents` MODIFY `status` ENUM('Reject', 'Pending', 'Approved') NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE `Activity` ADD COLUMN `assigned_at` DATETIME(3) NOT NULL;
