@echo off
setlocal
cd /d "%~dp0"
echo Starting NexOS local server on http://localhost:8080 ...
cmd /c npm run dev -- --host 0.0.0.0 --port 8080
endlocal
