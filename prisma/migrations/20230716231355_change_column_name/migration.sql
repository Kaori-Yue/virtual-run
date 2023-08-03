/*
  Warnings:

  - You are about to drop the column `kilometer` on the `Event_Logs` table. All the data in the column will be lost.
  - Added the required column `distance` to the `Event_Logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
/*
ALTER TABLE `Event_Logs` DROP COLUMN `kilometer`,
    ADD COLUMN `distance` INTEGER NOT NULL;
*/

ALTER TABLE `Event_Logs` RENAME COLUMN `kilometer` TO `distance`