/*
  Warnings:

  - You are about to drop the column `password` on the `Share` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Share` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Share_password_key";

-- AlterTable
ALTER TABLE "Share" DROP COLUMN "password",
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Share_url_key" ON "Share"("url");
