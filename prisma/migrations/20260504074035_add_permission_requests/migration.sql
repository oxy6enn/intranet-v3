-- CreateTable
CREATE TABLE "PermissionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PermissionRequest_userId_status_idx" ON "PermissionRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "PermissionRequest_permissionId_status_idx" ON "PermissionRequest"("permissionId", "status");

-- AddForeignKey
ALTER TABLE "PermissionRequest" ADD CONSTRAINT "PermissionRequest_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionRequest" ADD CONSTRAINT "PermissionRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionRequest" ADD CONSTRAINT "PermissionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
