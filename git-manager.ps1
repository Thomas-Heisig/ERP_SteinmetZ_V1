# git-manager.ps1
# Erweiterte Git-Management-Script mit Backup und Sicherheitsfunktionen
# Verwendung: powershell -ExecutionPolicy Bypass -File git-manager.ps1

# Repository-Pfad
$repoPath = "F:\ERP_SteinmetZ_V1"
$backupPath = "F:\ERP_SteinmetZ_V1_Backups"

# Funktion: Backup erstellen
function New-Backup {
    param(
        [string]$backupType = "auto"
    )
    
    try {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupDir = Join-Path $backupPath "$backupType`_$timestamp"
        
        Write-Host "💾 Erstelle Backup: $backupDir" -ForegroundColor Cyan
        
        # Backup-Verzeichnis erstellen
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        # Wichtige Dateien und Ordner kopieren
        $itemsToBackup = @(
            "src",
            "apps",
            "data",
            "docs",
            "package.json",
            "package-lock.json",
            ".env*"
        )
        
        foreach ($item in $itemsToBackup) {
            $source = Join-Path $repoPath $item
            if (Test-Path $source) {
                $dest = Join-Path $backupDir $item
                Copy-Item -Path $source -Destination $dest -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        
        # Git-Status speichern
        Push-Location $repoPath
        git status > (Join-Path $backupDir "git-status.txt")
        git log --oneline -10 > (Join-Path $backupDir "git-log.txt")
        git diff > (Join-Path $backupDir "git-diff.txt")
        Pop-Location
        
        Write-Host "✅ Backup erstellt: $backupDir" -ForegroundColor Green
        
        # Alte Backups aufräumen (älter als 7 Tage)
        $oldBackups = Get-ChildItem -Path $backupPath -Directory | Where-Object {
            $_.CreationTime -lt (Get-Date).AddDays(-7)
        }
        
        if ($oldBackups) {
            Write-Host "🧹 Räume alte Backups auf (älter als 7 Tage)..." -ForegroundColor Yellow
            $oldBackups | Remove-Item -Recurse -Force
        }
        
        return $backupDir
    }
    catch {
        Write-Host "❌ Fehler beim Backup: $_" -ForegroundColor Red
        return $null
    }
}

# Funktion: Repository-Status prüfen
function Get-RepoStatus {
    Push-Location $repoPath
    
    $branch = git branch --show-current
    $hasChanges = $null -ne (git status --porcelain)
    $hasUnpushedCommits = $null -ne (git log "origin/$branch..$branch" --oneline 2>$null)
    $hasUnpulledCommits = $null -ne (git log "$branch..origin/$branch" --oneline 2>$null)
    
    Pop-Location
    
    return @{
        Branch = $branch
        HasChanges = $hasChanges
        HasUnpushedCommits = $hasUnpushedCommits
        HasUnpulledCommits = $hasUnpulledCommits
    }
}

# Funktion: Git Pull
function Invoke-GitPull {
    param(
        [bool]$force = $false
    )
    
    Write-Host "`n🔽 Starte Git Pull..." -ForegroundColor Cyan
    
    $status = Get-RepoStatus
    Write-Host "📁 Branch: $($status.Branch)" -ForegroundColor Yellow
    
    # Backup erstellen
    $createBackup = Read-Host "💾 Backup vor Pull erstellen? (J/N)"
    if ($createBackup -match "^[Jj]") {
        $backupDir = New-Backup -backupType "pre-pull"
        if (-not $backupDir) {
            Write-Host "⚠️  Backup fehlgeschlagen. Fortfahren? (J/N)" -ForegroundColor Yellow
            $continue = Read-Host
            if ($continue -notmatch "^[Jj]") {
                return
            }
        }
    }
    
    Push-Location $repoPath
    
    try {
        # Ungespeicherte Änderungen behandeln
        if ($status.HasChanges) {
            Write-Host "⚠️  Lokale Änderungen gefunden!" -ForegroundColor Yellow
            Write-Host "1) Änderungen stashen (temporär speichern)"
            Write-Host "2) Änderungen verwerfen"
            Write-Host "3) Abbrechen"
            
            $choice = Read-Host "Auswahl (1-3)"
            
            switch ($choice) {
                "1" {
                    Write-Host "💾 Stashe Änderungen..." -ForegroundColor Cyan
                    git stash push -m "Stash vor Pull $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                    $gestasht = $true
                }
                "2" {
                    Write-Host "⚠️  ACHTUNG: Alle Änderungen werden gelöscht!" -ForegroundColor Red
                    $confirm = Read-Host "Wirklich fortfahren? (J/N)"
                    if ($confirm -notmatch "^[Jj]") {
                        Write-Host "❌ Abgebrochen" -ForegroundColor Red
                        return
                    }
                    git reset --hard HEAD
                    git clean -fd
                }
                default {
                    Write-Host "❌ Abgebrochen" -ForegroundColor Red
                    return
                }
            }
        }
        
        # Fetch
        Write-Host "📡 Hole Änderungen von Remote..." -ForegroundColor Cyan
        git fetch origin --prune --tags
        
        if ($force) {
            Write-Host "🔄 Force Pull (Reset zu origin/$($status.Branch))..." -ForegroundColor Cyan
            git reset --hard "origin/$($status.Branch)"
        }
        else {
            Write-Host "🔄 Merge Änderungen..." -ForegroundColor Cyan
            git pull origin $status.Branch
        }
        
        # Stash zurückholen
        if ($gestasht) {
            Write-Host "🔄 Hole gestashte Änderungen zurück..." -ForegroundColor Cyan
            $stashResult = git stash pop 2>&1
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "⚠️  Konflikte beim Stash Pop!" -ForegroundColor Yellow
                Write-Host $stashResult
            }
        }
        
        Write-Host "✅ Pull erfolgreich!" -ForegroundColor Green
        
        # Status anzeigen
        Write-Host "`n📊 Aktueller Status:" -ForegroundColor Cyan
        git status --short --branch
        
        Write-Host "`n🌳 Letzte 5 Commits:" -ForegroundColor Cyan
        git log --oneline -5 --graph
    }
    catch {
        Write-Host "❌ Fehler beim Pull: $_" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

# Funktion: Git Push
function Invoke-GitPush {
    param(
        [bool]$force = $false
    )
    
    Write-Host "`n🔼 Starte Git Push..." -ForegroundColor Cyan
    
    $status = Get-RepoStatus
    Write-Host "📁 Branch: $($status.Branch)" -ForegroundColor Yellow
    
    # Prüfen ob es etwas zu pushen gibt
    if (-not $status.HasUnpushedCommits -and -not $status.HasChanges) {
        Write-Host "ℹ️  Nichts zu pushen!" -ForegroundColor Yellow
        return
    }
    
    Push-Location $repoPath
    
    try {
        # Uncommitted Changes
        if ($status.HasChanges) {
            Write-Host "⚠️  Uncommitted Changes gefunden!" -ForegroundColor Yellow
            git status --short
            
            $commitNow = Read-Host "`nJetzt committen? (J/N)"
            if ($commitNow -match "^[Jj]") {
                $commitMsg = Read-Host "Commit Message"
                if ([string]::IsNullOrWhiteSpace($commitMsg)) {
                    $commitMsg = "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                }
                
                Write-Host "📝 Füge alle Änderungen hinzu..." -ForegroundColor Cyan
                git add -A
                
                Write-Host "💾 Erstelle Commit..." -ForegroundColor Cyan
                git commit -m $commitMsg
            }
            else {
                Write-Host "❌ Abgebrochen - Bitte erst committen" -ForegroundColor Red
                return
            }
        }
        
        # Remote-Änderungen prüfen
        Write-Host "📡 Prüfe Remote-Status..." -ForegroundColor Cyan
        git fetch origin
        
        if ($status.HasUnpulledCommits) {
            Write-Host "⚠️  Remote hat neue Commits!" -ForegroundColor Yellow
            Write-Host "Bitte erst pullen bevor du pushst." -ForegroundColor Yellow
            
            $pullFirst = Read-Host "Jetzt pullen? (J/N)"
            if ($pullFirst -match "^[Jj]") {
                Pop-Location
                Invoke-GitPull
                return
            }
            else {
                Write-Host "❌ Abgebrochen" -ForegroundColor Red
                return
            }
        }
        
        # Backup erstellen
        $createBackup = Read-Host "💾 Backup vor Push erstellen? (J/N)"
        if ($createBackup -match "^[Jj]") {
            New-Backup -backupType "pre-push" | Out-Null
        }
        
        # Push
        Write-Host "🚀 Pushe zu Remote..." -ForegroundColor Cyan
        
        if ($force) {
            Write-Host "⚠️  Force Push - VORSICHT!" -ForegroundColor Red
            $confirm = Read-Host "Force Push bestätigen? (J/N)"
            if ($confirm -notmatch "^[Jj]") {
                Write-Host "❌ Abgebrochen" -ForegroundColor Red
                return
            }
            git push origin $status.Branch --force
        }
        else {
            git push origin $status.Branch
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Push erfolgreich!" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Push fehlgeschlagen!" -ForegroundColor Red
        }
        
        # Status anzeigen
        Write-Host "`n📊 Aktueller Status:" -ForegroundColor Cyan
        git status --short --branch
    }
    catch {
        Write-Host "❌ Fehler beim Push: $_" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

# Hauptmenü
function Show-Menu {
    Clear-Host
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   🚀 Git Manager - ERP Steinmetz      ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $status = Get-RepoStatus
    Write-Host "📁 Branch: $($status.Branch)" -ForegroundColor Yellow
    Write-Host "📝 Lokale Änderungen: $(if($status.HasChanges){'Ja ⚠️'}else{'Nein ✅'})" -ForegroundColor $(if($status.HasChanges){'Yellow'}else{'Green'})
    Write-Host "🔼 Unpushed Commits: $(if($status.HasUnpushedCommits){'Ja ⚠️'}else{'Nein ✅'})" -ForegroundColor $(if($status.HasUnpushedCommits){'Yellow'}else{'Green'})
    Write-Host "🔽 Unpulled Commits: $(if($status.HasUnpulledCommits){'Ja ⚠️'}else{'Nein ✅'})" -ForegroundColor $(if($status.HasUnpulledCommits){'Yellow'}else{'Green'})
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1) 🔽 Pull - Änderungen holen" -ForegroundColor White
    Write-Host "2) 🔽 Force Pull - Hard Reset zu Remote" -ForegroundColor White
    Write-Host "3) 🔼 Push - Änderungen hochladen" -ForegroundColor White
    Write-Host "4) 🔼 Force Push - VORSICHT!" -ForegroundColor White
    Write-Host "5) 💾 Backup erstellen" -ForegroundColor White
    Write-Host "6) 📊 Status anzeigen" -ForegroundColor White
    Write-Host "7) 🔄 Repository synchronisieren (Pull + Push)" -ForegroundColor White
    Write-Host "8) ❌ Beenden" -ForegroundColor White
    Write-Host ""
}

# Hauptschleife
$aktuellesVerzeichnis = Get-Location

try {
    # Prüfen ob Repository existiert
    if (-not (Test-Path $repoPath)) {
        Write-Host "❌ Repository nicht gefunden: $repoPath" -ForegroundColor Red
        exit
    }
    
    # Backup-Verzeichnis erstellen falls nicht vorhanden
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        Write-Host "📁 Backup-Verzeichnis erstellt: $backupPath" -ForegroundColor Green
    }
    
    do {
        Show-Menu
        $choice = Read-Host "Auswahl (1-8)"
        Write-Host ""
        
        switch ($choice) {
            "1" {
                Invoke-GitPull -force $false
                Read-Host "`nEnter drücken zum Fortfahren"
            }
            "2" {
                Write-Host "⚠️  ACHTUNG: Force Pull überschreibt lokale Änderungen!" -ForegroundColor Red
                $confirm = Read-Host "Fortfahren? (J/N)"
                if ($confirm -match "^[Jj]") {
                    Invoke-GitPull -force $true
                }
                Read-Host "`nEnter drücken zum Fortfahren"
            }
            "3" {
                Invoke-GitPush -force $false
                Read-Host "`nEnter drücken zum Fortfahren"
            }
            "4" {
                Write-Host "⚠️  ACHTUNG: Force Push kann Historie überschreiben!" -ForegroundColor Red
                $confirm = Read-Host "Fortfahren? (J/N)"
                if ($confirm -match "^[Jj]") {
                    Invoke-GitPush -force $true
                }
                Read-Host "`nEnter drücken zum Fortfahren"
            }
            "5" {
                $backupType = Read-Host "Backup-Typ (manual/auto) [manual]"
                if ([string]::IsNullOrWhiteSpace($backupType)) {
                    $backupType = "manual"
                }
                New-Backup -backupType $backupType
                Read-Host "`nEnter drücken zum Fortfahren"
            }
            "6" {
                Push-Location $repoPath
                Write-Host "📊 Repository-Status:" -ForegroundColor Cyan
                git status
                Write-Host "`n🌳 Letzte 10 Commits:" -ForegroundColor Cyan
                git log --oneline --graph -10
                Pop-Location
                Read-Host "`nEnter drücken zum Fortfahren"
            }
            "7" {
                Write-Host "🔄 Synchronisiere Repository..." -ForegroundColor Cyan
                Invoke-GitPull -force $false
                Start-Sleep -Seconds 2
                Invoke-GitPush -force $false
                Read-Host "`nEnter drücken zum Fortfahren"
            }
            "8" {
                Write-Host "👋 Auf Wiedersehen!" -ForegroundColor Green
                break
            }
            default {
                Write-Host "❌ Ungültige Auswahl!" -ForegroundColor Red
                Start-Sleep -Seconds 1
            }
        }
        
    } while ($choice -ne "8")
    
}
catch {
    Write-Host "❌ Kritischer Fehler: $_" -ForegroundColor Red
}
finally {
    Set-Location $aktuellesVerzeichnis
}
