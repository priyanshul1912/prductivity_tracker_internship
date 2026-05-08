@echo off
echo ============================================
echo   ProTrack - Behavioral Productivity System
echo ============================================
echo.

REM Check Node.js
node --version >nul 2>&1
IF ERRORLEVEL 1 (
  echo [ERROR] Node.js is not installed.
  echo Please download and install Node.js from https://nodejs.org
  echo Then re-run this script.
  pause
  exit /b 1
)

echo [OK] Node.js found: 
node --version

REM Check MongoDB
echo.
echo [INFO] Make sure MongoDB is running on localhost:27017
echo        Download: https://www.mongodb.com/try/download/community
echo.

REM Install backend dependencies
echo [1/4] Installing backend dependencies...
cd /d "%~dp0backend"
npm install
IF ERRORLEVEL 1 ( echo [ERROR] Backend install failed. & pause & exit /b 1 )

REM Install frontend dependencies
echo.
echo [2/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
npm install
IF ERRORLEVEL 1 ( echo [ERROR] Frontend install failed. & pause & exit /b 1 )

echo.
echo [3/4] Starting backend server (port 5000)...
cd /d "%~dp0backend"
start "ProTrack Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [4/4] Starting frontend (port 3000)...
cd /d "%~dp0frontend"
start "ProTrack Frontend" cmd /k "npm start"

echo.
echo ============================================
echo   App is starting...
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000/api/health
echo ============================================
echo.
pause
