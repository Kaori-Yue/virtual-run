/*
  Warnings:

  - Added the required column `duraion` to the `Event_Logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Event_Logs` ADD COLUMN `duraion` MEDIUMINT NOT NULL;
