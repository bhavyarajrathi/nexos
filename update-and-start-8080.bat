@echo off
setlocal
cd /d "%~dp0"
echo Pulling latest code from origin/main ...
git pull origin main
if errorlevel 1 (
  echo.
  echo Git pull failed. Resolve issues and run again.
  pause
  exit /b 1
)
echo.
echo Installing/updating dependencies ...
cmd /c npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Fix dependency issues and run again.
  pause
  exit /b 1
)
echo.
echo Starting NexOS local server on http://localhost:8080 ...
cmd /c npm run dev -- --host 0.0.0.0 --port 8080
endlocal
