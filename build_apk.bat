@echo off
title SOCIETRA ERP - Mobile App Builder
echo.
echo ===================================================
echo   SOCIETRA ERP - Android APK Builder
echo ===================================================
echo.

:: Set JDK 17 (compatible with Gradle)
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: Verify Java
echo [1/4] Checking Java...
java -version 2>&1 | findstr "version"
if errorlevel 1 (
    echo ERROR: Java 17 not found at C:\Program Files\Java\jdk-17
    echo Please install JDK 17 from https://adoptium.net/
    pause
    exit /b 1
)
echo Java OK!

:: Go to frontend
cd /d "d:\Apps\CHS APP\frontend"

:: Build React app
echo.
echo [2/4] Building React web app...
call npm run build
if errorlevel 1 (
    echo ERROR: npm build failed!
    pause
    exit /b 1
)
echo React build OK!

:: Sync Capacitor
echo.
echo [3/4] Syncing Capacitor Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo Capacitor sync OK!

:: Build APK
echo.
echo [4/4] Building Android APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo ERROR: APK build failed!
    echo Make sure Android Studio has downloaded the Android SDK.
    echo Open Android Studio once and let it complete setup.
    pause
    exit /b 1
)

:: Success!
echo.
echo ===================================================
echo   SUCCESS! APK built at:
echo   d:\Apps\CHS APP\frontend\android\app\build\outputs\apk\debug\app-debug.apk
echo ===================================================
echo.

:: Open the folder
explorer "d:\Apps\CHS APP\frontend\android\app\build\outputs\apk\debug"
pause
