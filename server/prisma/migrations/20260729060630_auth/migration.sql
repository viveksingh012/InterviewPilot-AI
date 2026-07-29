/*
  Warnings:

  - You are about to drop the column `avatar` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "avatar",
DROP COLUMN "role",
ADD COLUMN     "refresh_token" TEXT;
