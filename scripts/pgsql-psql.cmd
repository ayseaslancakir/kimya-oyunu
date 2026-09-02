@echo off
rem Yerel PostgreSQL erişim sarmalayıcısı (geliştirme ortamı)
set PGPASSWORD=kimya123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres %*
