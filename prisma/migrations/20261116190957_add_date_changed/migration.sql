-- AlterTable
ALTER TABLE "event" ADD COLUMN     "dateChangedAt" TIMESTAMP(3),
ADD COLUMN     "previousStartsAt" TIMESTAMP(3);
