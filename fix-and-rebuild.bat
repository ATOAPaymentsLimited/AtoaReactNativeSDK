@echo off
echo ========================================
echo COMPREHENSIVE FIX AND REBUILD SCRIPT
echo ========================================
echo.

echo [1/10] Stopping all Node processes...
powershell -Command "Stop-Process -Name node -Force -ErrorAction SilentlyContinue"
timeout /t 2 >nul

echo [2/10] Cleaning SDK lib folder...
cd /d "%~dp0"
if exist "lib" rd /s /q "lib"

echo [3/10] Rebuilding SDK library...
call npm run prepare
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: SDK build failed!
    pause
    exit /b 1
)

echo [4/10] Cleaning example node_modules...
cd /d "%~dp0example"
if exist "node_modules" rd /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

echo [5/10] Reinstalling example dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo [6/10] Cleaning Android build...
cd /d "%~dp0example\android"
call gradlew.bat clean
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Gradle clean failed!
    pause
    exit /b 1
)

echo [7/10] Building and installing Android app...
call gradlew.bat app:installDebug
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Android build failed!
    pause
    exit /b 1
)

echo [8/10] Setting up adb port forwarding...
adb reverse tcp:8081 tcp:8081

echo [9/10] Starting Metro bundler...
cd /d "%~dp0example"
start "Metro Bundler" cmd /k "npm start -- --reset-cache"
timeout /t 10 >nul

echo [10/10] Launching app...
adb shell am force-stop com.example
timeout /t 2 >nul
adb shell am start -n com.example/.MainActivity

echo.
echo ========================================
echo REBUILD COMPLETE!
echo ========================================
echo Metro bundler is running in a separate window.
echo Check the emulator for the app.
echo.
pause
