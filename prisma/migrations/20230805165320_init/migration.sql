/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Shareholder` table. All the data in the column will be lost.
  - You are about to drop the column `movieId` on the `Shareholder` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Shareholder` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `movieId` on the `Transfer` table. All the data in the column will be lost.
  - Added the required column `address` to the `Shareholder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Shareholder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iban` to the `Shareholder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Shareholder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movie_id` to the `Shareholder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movie_id` to the `Transfer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Shareholder" DROP CONSTRAINT "Shareholder_movieId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_movieId_fkey";

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Shareholder" DROP COLUMN "createdAt",
DROP COLUMN "movieId",
DROP COLUMN "title",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "iban" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "movie_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transfer" DROP COLUMN "createdAt",
DROP COLUMN "movieId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "movie_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Shareholder" ADD CONSTRAINT "Shareholder_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
