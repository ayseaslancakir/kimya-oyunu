@echo off
rem Node.js'in PATH'e eklenmesini sağlayan sarmalayıcı.
rem Kullanım (proje kökünden): .\tools\run.cmd <komut> [argümanlar...]
set PATH=C:\nodejs;%PATH%
cd /d "%~dp0..\web"
%*
