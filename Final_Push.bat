@echo off
setlocal
cd /d "d:\Apps\CHS APP"

echo ========================================
echo   SOCIETRA ERP - GitHub Sync (Debug Mode)
echo ========================================
echo.

set LOGFILE="d:\push_log.txt"
echo Git Sync Log - %DATE% %TIME% > %LOGFILE%

echo [Step 1/3] Adding files...
"C:\Program Files\Git\cmd\git.exe" add . >> %LOGFILE% 2>&1

echo [Step 2/3] Committing changes...
"C:\Program Files\Git\cmd\git.exe" commit -m "fix: final Render blueprint and paths" >> %LOGFILE% 2>&1

echo [Step 3/3] Pushing to GitHub...
echo (Check for any popup windows)
"C:\Program Files\Git\cmd\git.exe" push origin main --force >> %LOGFILE% 2>&1

if %ERRORLEVEL% equ 0 (
    echo.
    echo SUCCESS! Your code was uploaded.
    echo ========================================
) else (
    echo.
    echo ERROR: Something went wrong. 
    echo Please check the file "d:\push_log.txt" for details.
    echo ========================================
    type %LOGFILE%
)

pause
