-- Soru havuzu ayırımı: quiz ve kaçış soruları farklı havuzlarda
ALTER TABLE "Question" ADD COLUMN "kullanim" TEXT NOT NULL DEFAULT 'quiz';
