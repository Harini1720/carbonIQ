@echo off
title CarbonIQ - Carbon Footprint Intelligence Platform
echo ========================================================
echo   Starting CarbonIQ (PS05) Platform...
echo   Opening http://localhost:3000 in your browser...
echo ========================================================
cd /d "%~dp0"
timeout /t 2 /nobreak >nul
start http://localhost:3000
npm run dev
pause
