@echo off
title Push CarbonIQ to GitHub
echo ========================================================
echo   Pushing CarbonIQ to https://github.com/Harinikrishna20/CarbonIQ
echo ========================================================
cd /d "%~dp0"
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESS! CarbonIQ pushed to GitHub successfully!
    echo ========================================================
) else (
    echo ========================================================
    echo   If prompted, please sign in to GitHub above.
    echo ========================================================
)
echo.
pause
