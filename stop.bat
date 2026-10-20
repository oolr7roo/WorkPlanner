@echo off
setlocal
cd /d "%~dp0"
node "%~dp0server.mjs" stop
exit /b %errorlevel%
