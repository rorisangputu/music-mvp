-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "verificationCode" DROP NOT NULL,
ALTER COLUMN "verificationCodeExpires" DROP NOT NULL;
