@echo off
echo ========================================
echo  Spotify Vinyl Viz - Project Setup
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/2] Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/2] Setup complete!
echo.
echo ========================================
echo  To start the development server, run:
echo    npm run dev
echo ========================================
echo.
pause
