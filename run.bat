@echo off
echo.
echo ============================================================
echo   SaaS Link Shortener -- Starting Dev Servers
echo ============================================================
echo.

start "Backend - Laravel" cmd /k "cd /d "%~dp0backend" && php artisan serve"
start "Frontend - Next.js" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo   Backend:   http://127.0.0.1:8000
echo   Frontend:  http://localhost:3000
echo.
echo   Both servers are starting in separate windows.
echo   Close those windows to stop the servers.
echo.
