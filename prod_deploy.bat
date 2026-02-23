@echo off
echo ==========================================
echo SOCIETRA ERP - Production Build Utility
echo ==========================================

REM Check for .env file
if not exist .env (
    echo [ERROR] .env file not found! 
    echo Please copy .env.example to .env and configure your secrets.
    exit /b 1
)

echo [1/3] Building Backend and Frontend Docker Images...
docker-compose -f docker-compose.prod.yml build

echo [2/3] Starting Services...
docker-compose -f docker-compose.prod.yml up -d

echo [3/3] Verification...
docker ps

echo ==========================================
echo Deployment Complete!
echo Access the app at http://localhost
echo ==========================================
pause
