-- DuelPlayer: oyunculardan biri 2 dakika hiç cevap vermezse düelloyu iptal edebilmek için
-- son cevap zamanı tutulur.
ALTER TABLE "DuelPlayer" ADD COLUMN "lastAnswerAt" TIMESTAMP(3);
