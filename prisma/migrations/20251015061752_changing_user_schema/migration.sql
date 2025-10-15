/*
  Warnings:

  - You are about to drop the column `clientType` on the `LoginHistory` table. All the data in the column will be lost.
  - You are about to drop the column `clientType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."LoginHistory" DROP COLUMN "clientType";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "clientType",
ADD COLUMN     "isRadioStation" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "public"."ClientType";
