@echo off
REM git-manager.bat
REM Erweiterte Git-Management-Script mit Backup und Sicherheitsfunktionen
REM Verwendung: git-manager.bat

setlocal enabledelayedexpansion

REM Repository-Pfad
set "repoPath=F:\ERP_SteinmetZ_V1"
set "backupPath=F:\ERP_SteinmetZ_V1_Backups"

REM Farben definieren (simuliert)
REM Hinweis: In CMD sind Farben limitiert, wir verwenden ASCII-Codes

:main
cls
call :ShowMenu
set /p choice="Auswahl (1-8): "
echo.

if "%choice%"=="1" (
    call :GitPull 0
    pause
) else if "%choice%"=="2" (
    color 0C
    echo.
    echo ^^! ACHTUNG: Force Pull uberschreibt lokale Anderungen!
    color 0F
    set /p confirm="Fortfahren? (J/N): "
    if /i "%confirm%"=="J" (
        call :GitPull 1
    )
    pause
) else if "%choice%"=="3" (
    call :GitPush 0
    pause
) else if "%choice%"=="4" (
    color 0C
    echo.
    echo ^^! ACHTUNG: Force Push kann Historie uberschreiben!
    color 0F
    set /p confirm="Fortfahren? (J/N): "
    if /i "%confirm%"=="J" (
        call :GitPush 1
    )
    pause
) else if "%choice%"=="5" (
    set /p backupType="Backup-Typ (manual/auto) [manual]: "
    if "!backupType!"=="" set "backupType=manual"
    call :NewBackup "!backupType!"
    pause
) else if "%choice%"=="6" (
    echo.
    echo [97m
    echo Repository-Status:
    color 0F
    pushd "%repoPath%"
    git status
    echo.
    echo [97mLetzte 10 Commits:
    git log --oneline --graph -10
    popd
    pause
) else if "%choice%"=="7" (
    echo.
    echo Repository synchronisieren...
    call :GitPull 0
    timeout /t 2 /nobreak
    call :GitPush 0
    pause
) else if "%choice%"=="8" (
    echo.
    echo Auf Wiedersehen!
    exit /b 0
) else (
    echo.
    echo [91mUngultige Auswahl!
    color 0F
    timeout /t 1 /nobreak
)

goto main

:ShowMenu
cls
echo.
echo [96m==========================================
echo [96m   Git Manager - ERP Steinmetz
echo [96m==========================================
color 0F
echo.

call :GetRepoStatus

echo.
echo [96m==========================================
color 0F
echo.
echo 1) Git Pull - Anderungen holen
echo 2) Force Pull - Hard Reset zu Remote
echo 3) Git Push - Anderungen hochladen
echo 4) Force Push - VORSICHT!
echo 5) Backup erstellen
echo 6) Repository-Status anzeigen
echo 7) Repository synchronisieren
echo 8) Beenden
echo.
exit /b 0

:GetRepoStatus
pushd "%repoPath%" >nul 2>&1
if errorlevel 1 (
    echo [91mRepository nicht gefunden: %repoPath%
    color 0F
    exit /b 1
)

for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"
if "!branch!"=="" set "branch=UNKNOWN"

echo [93mBranch: !branch!
color 0F

git status --porcelain >nul 2>&1
if errorlevel 0 (
    echo Lokale Anderungen: Ja
) else (
    echo Lokale Anderungen: Nein
)

popd >nul 2>&1
exit /b 0

:NewBackup
setlocal
set "backupType=%~1"
if "!backupType!"=="" set "backupType=auto"

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set "timestamp=%%c%%a%%b_!time:~0,2!!time:~3,2!!time:~6,2!"
)

set "backupDir=!backupPath!\!backupType!_!timestamp!"

echo.
echo Erstelle Backup: !backupDir!

if not exist "!backupPath!" (
    mkdir "!backupPath!" >nul 2>&1
)

if not exist "!backupDir!" (
    mkdir "!backupDir!" >nul 2>&1
)

REM Verzeichnisse kopieren
for %%i in (src apps data docs) do (
    if exist "%repoPath%\%%i" (
        xcopy "%repoPath%\%%i" "!backupDir!\%%i" /E /I /Y >nul 2>&1
    )
)

REM Dateien kopieren
for %%i in (package.json package-lock.json) do (
    if exist "%repoPath%\%%i" (
        copy "%repoPath%\%%i" "!backupDir!" >nul 2>&1
    )
)

REM Git-Status speichern
pushd "%repoPath%" >nul 2>&1
git status > "!backupDir!\git-status.txt" 2>&1
git log --oneline -10 > "!backupDir!\git-log.txt" 2>&1
git diff > "!backupDir!\git-diff.txt" 2>&1
popd >nul 2>&1

echo Backup erstellt: !backupDir!

endlocal
exit /b 0

:GitPull
setlocal
set "force=%~1"

echo.
echo Starte Git Pull...

pushd "%repoPath%" >nul 2>&1

REM Backup-Angebot
set /p createBackup="Backup vor Pull erstellen? (J/N): "
if /i "%createBackup%"=="J" (
    call :NewBackup "pre-pull"
)

REM Git Fetch
echo.
echo Hole Anderungen von Remote...
git fetch origin --prune --tags

REM Git Pull/Reset
if "%force%"=="1" (
    echo.
    echo Force Pull ^(Reset zu origin^)...
    for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"
    git reset --hard "origin/!branch!" 2>nul
) else (
    echo.
    echo Merge Anderungen...
    for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"
    git pull origin !branch! 2>nul
)

if errorlevel 0 (
    echo.
    echo Pull erfolgreich!
    echo.
    echo Aktueller Status:
    git status --short --branch
    echo.
    echo Letzte 5 Commits:
    git log --oneline -5 --graph
) else (
    echo.
    echo Fehler beim Pull!
)

popd >nul 2>&1
endlocal
exit /b 0

:GitPush
setlocal
set "force=%~1"

echo.
echo Starte Git Push...

pushd "%repoPath%" >nul 2>&1

git status --porcelain >nul 2>&1
if errorlevel 0 (
    echo.
    echo Uncommitted Changes gefunden!
    
    set /p commitNow="Jetzt committen? (J/N): "
    if /i "!commitNow!"=="J" (
        set /p commitMsg="Commit Message: "
        if "!commitMsg!"=="" (
            for /f "tokens=*" %%i in ('powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do (
                set "commitMsg=Update %%i"
            )
        )
        
        echo.
        echo Fuige alle Anderungen hinzu...
        git add -A
        
        echo Erstelle Commit...
        git commit -m "!commitMsg!"
    ) else (
        echo.
        echo Abgebrochen - Bitte erst committen
        popd >nul 2>&1
        endlocal
        exit /b 1
    )
)

REM Remote prüfen
echo.
echo Prufe Remote-Status...
git fetch origin 2>nul

REM Backup-Angebot
echo.
set /p createBackup="Backup vor Push erstellen? (J/N): "
if /i "%createBackup%"=="J" (
    call :NewBackup "pre-push"
)

REM Git Push
echo.
echo Pushe zu Remote...

for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"

if "%force%"=="1" (
    git push origin !branch! --force 2>nul
) else (
    git push origin !branch! 2>nul
)

if errorlevel 0 (
    echo.
    echo Push erfolgreich!
) else (
    echo.
    echo Push fehlgeschlagen!
)

echo.
echo Aktueller Status:
git status --short --branch

popd >nul 2>&1
endlocal
exit /b 0

REM Fehlerbehandlung
:error
echo.
echo Fehler: %~1
exit /b 1

REM Ende
:eof
endlocal
