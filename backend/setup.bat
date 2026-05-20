@echo off
setlocal EnableDelayedExpansion

echo.
echo ============================================================
echo   SaaS Link Shortener -- Project Setup
echo ============================================================
echo.

REM ─── 1. Prerequisites ────────────────────────────────────────
echo [Step 1/5] Checking prerequisites...

php --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] PHP not found in PATH.
    echo   Install PHP 8.2+ from https://windows.php.net/download/
    echo   and add it to your system PATH, then re-run this script.
    pause
    exit /b 1
)
for /f "tokens=2 delims= " %%v in ('php --version 2^>nul ^| findstr /i "PHP"') do (
    set PHP_VER=%%v
    goto :found_php
)
:found_php
echo   PHP %PHP_VER% found.

composer --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] Composer not found in PATH.
    echo   Download from https://getcomposer.org/download/
    pause
    exit /b 1
)
echo   Composer found.
echo.

REM ─── 2. Install dependencies ─────────────────────────────────
echo [Step 2/5] Installing Composer dependencies...
echo   (This may take a few minutes on first run)
echo.

composer install --no-interaction --prefer-dist --optimize-autoloader
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] composer install failed. Check the output above.
    pause
    exit /b 1
)
echo.
echo   Dependencies installed.
echo.

REM ─── 3. Environment setup ────────────────────────────────────
echo [Step 3/5] Configuring environment...

if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo   .env created from .env.example.
    echo.
    echo   *** ACTION REQUIRED ***
    echo   Open backend\.env and set your PostgreSQL password:
    echo     DB_PASSWORD=your_actual_password
    echo.
    echo   Also change HASHIDS_SECRET to a long random string for production.
    echo.
    pause
) else (
    echo   .env already exists -- skipping copy.
)

php artisan key:generate --ansi
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] Could not generate application key.
    pause
    exit /b 1
)
echo.

REM ─── 4. Database check ───────────────────────────────────────
echo [Step 4/5] Checking database connection...
echo.

:retry_db
php -r "
try {
    \$pdo = new PDO(
        'pgsql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD'),
        [PDO::ATTR_TIMEOUT => 5]
    );
    echo 'ok';
} catch (Exception \$e) {
    echo 'fail:' . \$e->getMessage();
}
" > %TEMP%\db_check.txt 2>&1

set /p DB_RESULT=<%TEMP%\db_check.txt
del %TEMP%\db_check.txt >nul 2>&1

if "!DB_RESULT!" == "ok" (
    echo   Database connection: OK
    echo.
) else (
    echo   [WARNING] Cannot connect to PostgreSQL database!
    echo.
    echo   Error: !DB_RESULT!
    echo.
    echo   Make sure:
    echo     1. PostgreSQL is running
    echo     2. The database exists. Create it with:
    echo          psql -U postgres -c "CREATE DATABASE shortener;"
    echo     3. Your .env has the correct DB_PASSWORD
    echo.
    set /p RETRY="Press ENTER to retry, or type SKIP to continue anyway: "
    if /i "!RETRY!" == "SKIP" goto :skip_db_check
    goto :retry_db
)
:skip_db_check

REM ─── 5. Migrate & Seed ───────────────────────────────────────
echo [Step 5/5] Running migrations and seeders...
echo.

php artisan migrate:fresh --force --ansi
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] Migration failed. Check the output above and your DB settings.
    pause
    exit /b 1
)
echo.

php artisan db:seed --force --ansi
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] Seeding failed.
    pause
    exit /b 1
)
echo.

REM ─── Done ────────────────────────────────────────────────────
echo ============================================================
echo   Setup complete!
echo.
echo   Test accounts (password: Secret1234!):
echo     admin@example.com   (admin / Administrator)
echo     user@example.com    (johndoe / John Doe)
echo.
echo   Start the dev server:
echo     cd backend
echo     php artisan serve
echo.
echo   API base URL: http://127.0.0.1:8000/api
echo   Short-link redirect: http://127.0.0.1:8000/{unique_id}
echo.
echo   Quick API test (PowerShell):
echo     Invoke-RestMethod -Uri http://127.0.0.1:8000/api/auth/login ^
echo       -Method POST -ContentType application/json ^
echo       -Body '{"email":"admin@example.com","password":"Secret1234!"}'
echo ============================================================
echo.
pause
