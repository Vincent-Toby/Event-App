/*
  Warnings:

  - Added the required column `category` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('MUSIC', 'NIGHTLIFE', 'ARTS', 'HOLIDAYS', 'DATING', 'HOBBIES', 'BUSINESS', 'FOOD_DRINK');

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "category" "EventCategory" NOT NULL;

-- CreateIndex
CREATE INDEX "event_category_idx" ON "event"("category");
