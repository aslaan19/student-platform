-- AlterTable: add is_active flag to profiles (all existing profiles default to active)
ALTER TABLE "profiles" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterEnum: add ADMIN value to InviteType
-- Postgres requires this outside a transaction
ALTER TYPE "InviteType" ADD VALUE 'ADMIN';
