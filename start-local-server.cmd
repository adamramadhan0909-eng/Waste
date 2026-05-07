@echo off
setlocal
cd /d "%~dp0"
echo Menjalankan server lokal...
start "" "http://127.0.0.1:4173/test.html"
node serve-local.js
