@echo off
REM =====================================================
REM Script d'installation des optimisations - WINDOWS
REM Dashboard BCR - Recensement Général
REM Batch Script
REM =====================================================

echo.
echo ==================================================
echo    Installation des Optimisations - Dashboard BCR
echo                   WINDOWS
echo ==================================================
echo.

REM Vérifier si on est dans le bon répertoire
if not exist "package.json" (
    echo [ERREUR] Ce script doit etre execute depuis le repertoire racine de l'application
    pause
    exit /b 1
)

echo [ETAPE 1/4] Verification des prerequis...
echo.

REM Vérifier Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe
    echo Telechargez Node.js depuis: https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo [OK] Node.js installe

REM Vérifier npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installe
    pause
    exit /b 1
)
npm -v
echo [OK] npm installe

echo.
echo [ETAPE 2/4] Redis sur Windows...
echo.
echo IMPORTANT: Redis necessite une des options suivantes:
echo.
echo Option 1 - Memurai (RECOMMANDE):
echo   1. Telecharger: https://www.memurai.com/get-memurai
echo   2. Installer Memurai Developer (gratuit)
echo   3. Redis sera disponible sur localhost:6379
echo.
echo Option 2 - WSL (Windows Subsystem for Linux):
echo   1. Installer WSL: wsl --install
echo   2. Dans WSL: sudo apt-get install redis-server
echo   3. Demarrer: sudo service redis-server start
echo.
echo Option 3 - Docker Desktop:
echo   1. Installer Docker Desktop
echo   2. Executer: docker run -d -p 6379:6379 redis
echo.
pause

echo.
echo [ETAPE 3/4] Installation des dependances Node.js...
echo.

call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Erreur lors de l'installation des dependances
    pause
    exit /b 1
)
echo [OK] Dependances installees

echo.
echo [ETAPE 4/4] Configuration MySQL...
echo.
echo Pour creer les index MySQL, executez manuellement:
echo mysql -u root -p menage ^< migrations\01_create_indexes.sql
echo.
echo ATTENTION: Cette operation peut prendre 30-60 minutes
echo.

echo.
echo ==================================================
echo Installation terminee!
echo ==================================================
echo.
echo Prochaines etapes:
echo.
echo 1. Installer Redis (voir options ci-dessus)
echo 2. Creer les index: mysql -u root -p menage ^< migrations\01_create_indexes.sql
echo 3. Demarrer: npm start
echo.
echo Consulter OPTIMIZATIONS.md pour plus de details
echo.
pause
