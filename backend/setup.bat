@echo off
setlocal EnableDelayedExpansion

set "BDIR=%~dp0"
set "FDIR=%~dp0..\frontend"

echo.
echo ============================================================
echo   SaaS Link Shortener - Project Setup
echo ============================================================
echo.

REM ---- Step 1: Prerequisites ----------------------------------
echo [Step 1/6] Checking prerequisites...

where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] PHP not found. Install PHP 8.2+ from https://windows.php.net/download/
    pause
    exit /b 1
)
echo   PHP found.

where composer >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Composer not found. Download from https://getcomposer.org/download/
    pause
    exit /b 1
)
echo   Composer found.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)
echo   Node.js found.

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] npm not found. Reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo   npm found.
echo.

REM ---- Step 1b: Enable ext-fileinfo if missing ----------------
echo   Checking PHP extensions...
for /f "delims=" %%i in ('php -r "echo php_ini_loaded_file();" 2^>nul') do set PHP_INI=%%i

php -r "exit(extension_loaded('fileinfo')&&extension_loaded('pdo_pgsql')&&extension_loaded('pgsql')?0:1);" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :ext_ok

if not exist "!PHP_INI!" (
    echo   php.ini not found. Enable pdo_pgsql, pgsql and fileinfo manually.
    goto :ext_ok
)

echo   Enabling required extensions in: !PHP_INI!
powershell -NoProfile -Command "(Get-Content '!PHP_INI!') -replace '^;extension=fileinfo','extension=fileinfo' -replace '^;extension=pdo_pgsql','extension=pdo_pgsql' -replace '^;extension=pgsql','extension=pgsql' | Set-Content '!PHP_INI!'"
echo   Extensions enabled. Verifying...

php -r "exit(extension_loaded('pdo_pgsql')?0:1);" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] pdo_pgsql still not loaded after editing php.ini.
    echo   Please enable it manually in: !PHP_INI!
    echo     extension=pdo_pgsql
    echo     extension=pgsql
    echo     extension=fileinfo
    echo.
    pause
    exit /b 1
)

:ext_ok
echo   Extensions OK.
echo.

REM ---- Step 2: Composer install -------------------------------
echo [Step 2/6] Installing Composer dependencies...
echo   (First run may take a few minutes)
echo.

cd /d "%BDIR%"
if not exist "bootstrap\cache" mkdir "bootstrap\cache"
call composer install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-req=ext-fileinfo
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] composer install failed. See output above.
    pause
    exit /b 1
)
echo.
echo   Dependencies installed.
echo.

REM ---- Step 3: Environment ------------------------------------
echo [Step 3/6] Configuring environment...

if not exist "%BDIR%.env" (
    copy "%BDIR%.env.example" "%BDIR%.env" >nul
    echo   .env created from .env.example.
    echo.
    echo   *** ACTION REQUIRED ***
    echo   Open backend\.env and set:
    echo     DB_PASSWORD=your_postgres_password
    echo     HASHIDS_SECRET=a_long_random_secret
    echo.
    pause
) else (
    echo   .env exists, skipping copy.
)

php artisan key:generate --ansi
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Key generation failed.
    pause
    exit /b 1
)
echo.

REM ---- Step 4: Database check ---------------------------------
echo [Step 4/6] Checking database connection...
echo.

set "DBC=%TEMP%\sdbchk.txt"

:retry_db
php -r "try{$d='pgsql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE');new PDO($d,getenv('DB_USERNAME'),getenv('DB_PASSWORD'),[PDO::ATTR_TIMEOUT=>5]);echo 'ok';}catch(Exception $e){echo 'fail:'.$e->getMessage();}" >"%DBC%" 2>&1
set /p DBRES=<"%DBC%"
del "%DBC%" >nul 2>&1

if "!DBRES!" == "ok" goto :db_ok

echo   [WARNING] Cannot connect to PostgreSQL.
echo.
echo   Error: !DBRES!
echo.
echo   Make sure:
echo     1. PostgreSQL is running
echo     2. Database exists: psql -U postgres -c "CREATE DATABASE shortener;"
echo     3. DB_PASSWORD is correct in backend\.env
echo.
set /p RETRY="Press ENTER to retry, or type SKIP to continue anyway: "
if /i "!RETRY!" == "SKIP" goto :db_ok
goto :retry_db

:db_ok
echo   Database: OK
echo.

REM ---- Step 5: Migrate and seed -------------------------------
echo [Step 5/6] Running migrations and seeders...
echo.

php artisan migrate:fresh --force --ansi
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Migration failed. See output above.
    pause
    exit /b 1
)
echo.

php artisan db:seed --force --ansi
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Seeding failed. See output above.
    pause
    exit /b 1
)
echo.

REM ---- Step 6: Frontend (Next.js) -----------------------------
echo [Step 6/6] Installing frontend dependencies...
echo.

if not exist "%FDIR%\package.json" (
    echo   [WARNING] "%FDIR%\package.json" not found. Skipping frontend setup.
    echo.
    goto :done
)

cd /d "%FDIR%"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] npm install failed. See output above.
    cd /d "%BDIR%"
    pause
    exit /b 1
)
echo.
echo   Frontend dependencies installed.
echo.

REM ---- Done ---------------------------------------------------
:done
cd /d "%BDIR%"
echo ============================================================
echo   Setup complete.
echo.
echo   Test accounts (password: Secret1234^^!):
echo     admin@example.com   (admin / Administrator)
echo     user@example.com    (johndoe / John Doe)
echo.
echo   Start the servers:
echo     Backend  (Terminal 1):  cd backend  ^&^& php artisan serve
echo     Frontend (Terminal 2):  cd frontend ^&^& npm run dev
echo.
echo   Or double-click run.bat from the project root.
echo.
echo   API:      http://127.0.0.1:8000/api
echo   Frontend: http://localhost:3000
echo ============================================================
echo.
pause
