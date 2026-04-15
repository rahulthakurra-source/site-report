@echo off
echo ================================================
echo   Site Monitoring Software - Quick Start
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: No .env file found!
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env file and add your Anthropic API key!
    echo Get your API key from: https://console.anthropic.com/
    echo.
    pause
)

REM Start the server
echo Starting backend server...
echo.
call npm start
