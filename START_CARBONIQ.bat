@echo off
title CarbonIQ - Carbon Footprint Intelligence Platform
echo ========================================================
echo   Starting CarbonIQ Platform (Backend API + Frontend)
echo ========================================================
cd /d "%~dp0"

echo [1/2] Starting Backend Server (Port 3001)...
start "CarbonIQ Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Starting Frontend Vite Server (Port 3000)...
start "CarbonIQ Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul
echo Opening CarbonIQ in default browser...
start http://localhost:3000

echo.
echo ========================================================
echo   CarbonIQ is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo ========================================================
