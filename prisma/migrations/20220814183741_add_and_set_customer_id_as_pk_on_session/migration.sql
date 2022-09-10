/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `customerId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "pk_session",
ADD COLUMN     "customerId" INTEGER NOT NULL,
ADD CONSTRAINT "pk_session" PRIMARY KEY ("customerId");
