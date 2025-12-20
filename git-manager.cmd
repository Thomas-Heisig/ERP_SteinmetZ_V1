@echo off
REM git-manager.cmd
REM Erweiterte Git-Management-Script mit Backup und Sicherheitsfunktionen
REM Funktioniert auf CMD und PowerShell
REM Verwendung: git-manager.cmd  oder  .\git-manager.cmd

setlocal enabledelayedexpansion

REM Repository-Pfad
set "repoPath=F:\ERP_SteinmetZ_V1"
set "backupPath=F:\ERP_SteinmetZ_V1_Backups"

REM Zeitstempel-Format
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set "datepart=%%c%%a%%b"
)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (
    set "timepart=%%a%%b"
)

goto main

:main
cls
echo.
echo ======================================
echo    Git Manager - ERP Steinmetz
echo ======================================
echo.

REM Repository prüfen
if not exist "%repoPath%" (
    echo FEHLER: Repository nicht gefunden: %repoPath%
    pause
    exit /b 1
)

REM Backup-Verzeichnis erstellen
if not exist "%backupPath%" (
    mkdir "%backupPath%"
)

REM Branch ermitteln
pushd "%repoPath%" >nul 2>&1
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"
if "!branch!"=="" set "branch=UNKNOWN"
popd >nul 2>&1

echo Branch: !branch!
echo.
echo ======================================
echo.
echo 1) Pull - Anderungen holen
echo 2) Force Pull - Hard Reset zu Remote
echo 3) Push - Anderungen hochladen
echo 4) Force Push - VORSICHT!
echo 5) Backup erstellen
echo 6) Status anzeigen
echo 7) Synchronisieren (Pull + Push)
echo 8) Beenden
echo.
set /p choice="Auswahl (1-8): "
echo.

if "%choice%"=="1" (
    call :GitPull 0
    pause
) else if "%choice%"=="2" (
    echo.
    echo ACHTUNG: Force Pull ueberschreibt lokale Anderungen!
    set /p confirm="Fortfahren? (J/N): "
    if /i "!confirm!"=="J" (
        call :GitPull 1
    )
    pause
) else if "%choice%"=="3" (
    call :GitPush 0
    pause
) else if "%choice%"=="4" (
    echo.
    echo ACHTUNG: Force Push kann Historie ueberschreiben!
    set /p confirm="Fortfahren? (J/N): "
    if /i "!confirm!"=="J" (
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
    echo Repository-Status:
    echo.
    pushd "%repoPath%"
    git status
    echo.
    echo Letzte 10 Commits:
    git log --oneline --graph -10
    popd
    pause
) else if "%choice%"=="7" (
    echo.
    echo Synchronisiere Repository...
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
    echo Ungueltige Auswahl!
    timeout /t 1 /nobreak
)

goto main

:NewBackup
setlocal
set "backupType=%~1"
if "!backupType!"=="" set "backupType=auto"

REM Zeitstempel erstellen
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set "timestamp=%%c%%a%%b"
)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (
    set "timestamp=!timestamp!_%%a%%b"
)

set "backupDir=!backupPath!\!backupType!_!timestamp!"

echo.
echo Erstelle Backup: !backupDir!
echo.

if not exist "!backupDir!" (
    mkdir "!backupDir!" >nul 2>&1
)

REM Wichtige Verzeichnisse kopieren
for %%i in (src apps data docs) do (
    if exist "%repoPath%\%%i" (
        echo - Kopiere %%i...
        xcopy "%repoPath%\%%i" "!backupDir!\%%i" /E /I /Y /Q >nul 2>&1
    )
)

REM Wichtige Dateien kopieren
for %%i in (package.json package-lock.json) do (
    if exist "%repoPath%\%%i" (
        echo - Kopiere %%i...
        copy "%repoPath%\%%i" "!backupDir!" >nul 2>&1
    )
)

REM Git-Status speichern
echo - Speichere Git-Status...
pushd "%repoPath%" >nul 2>&1
git status > "!backupDir!\git-status.txt" 2>&1
git log --oneline -20 > "!backupDir!\git-log.txt" 2>&1
git diff > "!backupDir!\git-diff.txt" 2>&1
popd >nul 2>&1

echo.
echo Backup erstellt: !backupDir!
echo.

endlocal
exit /b 0

:GitPull
setlocal
set "force=%~1"

echo.
echo Starte Git Pull...
echo.

pushd "%repoPath%"

REM Backup-Angebot
set /p createBackup="Backup vor Pull erstellen? (J/N): "
if /i "!createBackup!"=="J" (
    call :NewBackup "pre-pull"
)

REM Status prüfen
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    echo.
    echo Lokale Anderungen gefunden!
    echo.
    echo 1) Anderungen stashen (temporaer speichern)
    echo 2) Anderungen verwerfen
    echo 3) Abbrechen
    echo.
    set /p choice="Auswahl (1-3): "
    
    if "!choice!"=="1" (
        echo.
        echo Stashe Anderungen...
        git stash push -m "Stash vor Pull %date% %time%"
        set "gestasht=1"
    ) else if "!choice!"=="2" (
        echo.
        echo ACHTUNG: Alle Anderungen werden geloescht!
        set /p confirm="Wirklich fortfahren? (J/N): "
        if /i "!confirm!"=="J" (
            git reset --hard HEAD
            git clean -fd
        ) else (
            echo Abgebrochen
            popd
            endlocal
            exit /b 1
        )
    ) else (
        echo Abgebrochen
        popd
        endlocal
        exit /b 1
    )
)

REM Fetch
echo.
echo Hole Anderungen von Remote...
git fetch origin --prune --tags

REM Pull/Reset
echo.
if "%force%"=="1" (
    echo Force Pull (Reset zu origin)...
    for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"
    git reset --hard "origin/!branch!"
) else (
    echo Merge Anderungen...
    for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"
    git pull origin !branch!
)

REM Stash zurückgeben
if "%gestasht%"=="1" (
    echo.
    echo Hole gestashte Anderungen zurueck...
    git stash pop
)

echo.
echo Pull erfolgreich!
echo.
echo Aktueller Status:
git status --short --branch
echo.
echo Letzte 5 Commits:
git log --oneline -5 --graph

popd
endlocal
exit /b 0

:GitPush
setlocal
set "force=%~1"

echo.
echo Starte Git Push...
echo.

pushd "%repoPath%"

REM Uncommitted Changes prüfen
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    echo.
    echo Uncommitted Changes gefunden!
    echo.
    git status --short
    echo.
    
    set /p commitNow="Jetzt committen? (J/N): "
    if /i "!commitNow!"=="J" (
        set /p commitMsg="Commit Message: "
        if "!commitMsg!"=="" (
            set "commitMsg=Update %date% %time%"
        )
        
        echo.
        echo Fuege alle Anderungen hinzu...
        git add -A
        
        echo Erstelle Commit...
        git commit -m "!commitMsg!"
    ) else (
        echo.
        echo Abgebrochen - Bitte erst committen
        popd
        endlocal
        exit /b 1
    )
)

REM Remote prüfen
echo.
echo Pruefe Remote-Status...
git fetch origin

REM Backup-Angebot
echo.
set /p createBackup="Backup vor Push erstellen? (J/N): "
if /i "!createBackup!"=="J" (
    call :NewBackup "pre-push"
)

REM Push
echo.
echo Pushe zu Remote...
echo.

for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "branch=%%i"

if "%force%"=="1" (
    git push origin !branch! --force
) else (
    git push origin !branch!
)

if not errorlevel 1 (
    echo.
    echo Push erfolgreich!
) else (
    echo.
    echo Push fehlgeschlagen!
)

echo.
echo Aktueller Status:
git status --short --branch

popd
endlocal
exit /b 0

endlocal
