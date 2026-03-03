@echo off
set "JAVA_HOME=c:\SOCIETRA ERP\tools\jdk\jdk-17.0.8.1+1"
set "MAVEN_HOME=c:\SOCIETRA ERP\tools\maven\fresh\apache-maven-3.9.6"
set "NODE_HOME=c:\SOCIETRA ERP\tools\node\fresh\node-v20.11.1-win-x64"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%NODE_HOME%;%PATH%"

echo Starting SOCIETRA ERP - Local Dev Mode
echo.

start "SOCIETRA Backend" cmd /c "cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests"
timeout /t 15

start "SOCIETRA Frontend" cmd /c "cd frontend && npm run dev"

echo All services are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
pause
