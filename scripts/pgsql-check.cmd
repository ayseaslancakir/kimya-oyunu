@echo off
rem Yerel PostgreSQL servis kontrolü
"C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h localhost -p 5432
