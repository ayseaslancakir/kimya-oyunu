-- DuelPlayer: aynı soruya tekrar cevap vererek skor şişirmeyi önler
ALTER TABLE "DuelPlayer" ADD COLUMN "answeredIds" TEXT NOT NULL DEFAULT '[]';
