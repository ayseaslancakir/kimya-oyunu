@echo off
rem Yerel PostgreSQL'i konsoldan ayrık (detached) başlatır
start "" "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D C:\pgsql\data
echo PostgreSQL baslatildi (PID kontrolu: pgsql-check.cmd)
