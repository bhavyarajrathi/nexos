@echo off
setlocal
echo Stopping frontend process on port 8080 (if any) ...
set KILLED_8080=
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
  taskkill /PID %%p /F >nul 2>&1
  set KILLED_8080=1
)
if defined KILLED_8080 (
  echo Frontend stopped.
) else (
  echo No frontend process found on port 8080.
)

echo Stopping backend process on port 3001 (if any) ...
set KILLED_3001=
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
  taskkill /PID %%p /F >nul 2>&1
  set KILLED_3001=1
)
if defined KILLED_3001 (
  echo Backend stopped.
) else (
  echo No backend process found on port 3001.
)

echo Done.
endlocal
