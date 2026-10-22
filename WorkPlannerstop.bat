@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not available in PATH.
  exit /b 1
)
node "%~dp0server.mjs" stop
exit /b %errorlevel%
