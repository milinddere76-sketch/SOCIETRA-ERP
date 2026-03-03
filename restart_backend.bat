@echo off
set "JAVA_HOME=c:\SOCIETRA ERP\tools\jdk\jdk-17.0.8.1+1"
set "MAVEN_HOME=c:\SOCIETRA ERP\tools\maven\fresh\apache-maven-3.9.6"
set "NODE_HOME=c:\SOCIETRA ERP\tools\node\fresh\node-v20.11.1-win-x64"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%NODE_HOME%;%PATH%"

echo ===================================
echo  SOCIETRA ERP - Restart Script
echo  Backend: http://localhost:8080
echo  Frontend: http://localhost:3000
echo ===================================
echo.

echo [1/2] Starting Backend on port 8080...
start "SOCIETRA Backend (8080)" cmd /k "cd /d d:\Apps\CHS APP\backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests"

echo Waiting for backend to start (35 seconds)...
timeout /t 35 /nobreak

echo [2/2] Restarting Frontend...
start "SOCIETRA Frontend" cmd /k "cd /d d:\Apps\CHS APP\frontend && npm run dev"

echo.
echo All services starting!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080
pause
