@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not available in PATH.
  exit /b 1
)
node "%~dp0server.mjs" status >nul 2>nul
if not errorlevel 1 (
  echo CalendarApp is already running.
  node "%~dp0server.mjs" wait --open
  exit /b %errorlevel%
)
set "CALENDARAPP_ROOT=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $root=$env:CALENDARAPP_ROOT; $node=(Get-Command node).Source; Start-Process -FilePath $node -ArgumentList 'server.mjs' -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'postgresql\supervisor.log') -RedirectStandardError (Join-Path $root 'postgresql\supervisor-error.log')"
if errorlevel 1 exit /b 1
node "%~dp0server.mjs" wait --open
exit /b %errorlevel%
