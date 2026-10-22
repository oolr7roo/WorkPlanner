@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not available in PATH.
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0WorkPlannerStart.ps1"
exit /b %errorlevel%
