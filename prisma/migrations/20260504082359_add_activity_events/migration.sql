-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "subjectUserId" TEXT,
    "subjectName" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityEvent_subjectUserId_createdAt_idx" ON "ActivityEvent"("subjectUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_eventType_createdAt_idx" ON "ActivityEvent"("eventType", "createdAt");
