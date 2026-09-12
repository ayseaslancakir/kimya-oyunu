-- CreateTable
CREATE TABLE "QuestionMastery" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masteryAt" TIMESTAMP(3),

    CONSTRAINT "QuestionMastery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionMastery_userId_questionId_key" ON "QuestionMastery"("userId", "questionId");

-- CreateIndex
CREATE INDEX "QuestionMastery_userId_idx" ON "QuestionMastery"("userId");

-- AddForeignKey
ALTER TABLE "QuestionMastery" ADD CONSTRAINT "QuestionMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMastery" ADD CONSTRAINT "QuestionMastery_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
