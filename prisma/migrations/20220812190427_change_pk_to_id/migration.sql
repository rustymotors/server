/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "pk_session",
ADD CONSTRAINT "pk_session" PRIMARY KEY ("connectionId");
