@echo off
setlocal
echo Stopping process using port 8080 (if any) ...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
  taskkill /PID %%p /F
)
echo Done.
endlocal
