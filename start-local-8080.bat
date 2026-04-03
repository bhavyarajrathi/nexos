@echo off
setlocal
cd /d "%~dp0"
set "BACKEND_PID="

echo Checking backend on port 3001...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do set BACKEND_PID=%%p

if defined BACKEND_PID goto backend_running

echo Starting backend server on http://localhost:3001 ...
start "NexOS Backend" cmd /k "cd /d "%~dp0" & npm.cmd run dev:backend"
goto start_frontend

:backend_running
echo Backend is already running on port 3001.

:start_frontend

echo Starting frontend server on http://localhost:8080 ...
cmd /c npm.cmd run dev -- --host 0.0.0.0 --port 8080
endlocal
