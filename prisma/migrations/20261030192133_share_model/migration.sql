-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "deleteTimestamp" TIMESTAMP(3) NOT NULL,
    "folderId" INTEGER NOT NULL,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Share_password_key" ON "Share"("password");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
