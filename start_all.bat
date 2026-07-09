@echo off
echo ==========================================
echo   VIRK Tools - Starting All Services
echo ==========================================

echo.
echo [1/3] Starting MySQL Database on port 3306...
start "MySQL Database" "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --console --datadir="D:\website\creation\mysql_data" --port=3306 --bind-address=127.0.0.1

echo Waiting 4 seconds for MySQL to initialize...
timeout /t 4 /nobreak > nul

echo.
echo [2/3] Starting Backend API Server (port 5000)...
cd /d "D:\website\creation"
start "Backend Server (port 5000)" cmd /k "npm run dev"

echo Waiting 3 seconds for backend to connect...
timeout /t 3 /nobreak > nul

echo.
echo [3/3] Starting Frontend React App (port 3000)...
cd /d "D:\website\creation\client"
start "Frontend React App (port 3000)" cmd /k "npm run dev"

echo.
echo ==========================================
echo   All 3 services started successfully!
echo ==========================================
echo.
echo  Leave these 3 windows open while working:
echo  - MySQL Database
echo  - Backend Server (port 5000)
echo  - Frontend React App (port 3000)
echo.
echo  Your site: http://localhost:3000
echo  Admin: http://localhost:3000/admin/login
echo    Email: admin@virktools.com
echo    Password: admin123
echo.
pause
