# Git Manager Scripts - Anleitung

Zwei Skripte zur Git-Verwaltung mit Backup und Sicherheitsfunktionen:

## 📋 Verfügbare Skripte

### 1. **git-manager.ps1** (PowerShell)

Erweiterte Version mit vollständigen Funktionen.

**Aufruf:**

```powershell
# Methode 1: Direct (bei aktivem ExecutionPolicy)
./git-manager.ps1

# Methode 2: Mit Policy-Override
powershell -ExecutionPolicy Bypass -File git-manager.ps1
```

**Voraussetzung:**

- PowerShell 5.0+
- ExecutionPolicy muss mindestens `RemoteSigned` sein

---

### 2. **git-manager.cmd** (Batch/CMD)

Native Batch-Version, funktioniert auf CMD **und** PowerShell.

**Aufruf aus CMD:**

```cmd
git-manager.cmd

REM oder mit vollständiger Pfadangabe:
F:\ERP_SteinmetZ_V1\git-manager.cmd
```

**Aufruf aus PowerShell:**

```powershell
# Muss mit .\ präfixiert werden in PowerShell!
.\git-manager.cmd

# oder
& 'F:\ERP_SteinmetZ_V1\git-manager.cmd'
```

---

## 🎯 Funktionen

Beide Skripte bieten das gleiche Menü mit 8 Optionen:

```
1) Pull - Anderungen holen
   - Einfacher Git Pull mit optionalem Backup
   - Behandelt lokale Änderungen durch Stashing

2) Force Pull - Hard Reset zu Remote
   - Überschreibt alle lokalen Änderungen
   - WARNUNG: Lokal ungespeicherte Änderungen gehen verloren!

3) Push - Anderungen hochladen
   - Pusht lokale Commits zu Remote
   - Erstellt automatisch Commits aus uncommitted changes

4) Force Push - VORSICHT!
   - Force Push zu Remote
   - WARNUNG: Kann Projekt-Historie verändern!

5) Backup erstellen
   - Manuelle Backup-Erstellung
   - Sichert src, apps, data, docs, package.json

6) Status anzeigen
   - Aktueller Git-Status
   - Letzte 10 Commits anzeigen

7) Synchronisieren (Pull + Push)
   - Automatische Synchronisation
   - Pull gefolgt von Push

8) Beenden
   - Programm beenden
```

---

## 🛡️ Sicherheitsfeatures

### Backup-System

- **Automatische Backups** vor Pull/Push
- Speicherung in: `F:\ERP_SteinmetZ_V1_Backups`
- Format: `pre-pull_YYYYMMDD_HHMMSS`, `pre-push_YYYYMMDD_HHMMSS`, `manual_YYYYMMDD_HHMMSS`
- Enthält:
  - src/, apps/, data/, docs/ Verzeichnisse
  - package.json, package-lock.json
  - git status (als Text)
  - git log (letzte 20 Commits)
  - git diff (Unterschiede)

### Alte Backups

- PowerShell-Version: Automatisches Löschen von Backups älter als 7 Tage
- Batch-Version: Manuelle Cleanup möglich

### Bestätigungen

- Warnung vor Force Pull/Push
- Abfrage bei lokalen Änderungen
- Stashing-Optionen vor Pull

---

## ⚙️ Konfiguration

Pfade anpassen in der Datei:

**git-manager.ps1 (Zeile 9-10):**

```powershell
$repoPath = "F:\ERP_SteinmetZ_V1"
$backupPath = "F:\ERP_SteinmetZ_V1_Backups"
```

**git-manager.cmd (Zeile 10-11):**

```batch
set "repoPath=F:\ERP_SteinmetZ_V1"
set "backupPath=F:\ERP_SteinmetZ_V1_Backups"
```

---

## 🚀 Quick Start

### Aus CMD:

```cmd
cd F:\ERP_SteinmetZ_V1
git-manager.cmd
```

### Aus PowerShell:

```powershell
cd F:\ERP_SteinmetZ_V1
.\git-manager.cmd

# oder mit PowerShell-Version:
.\git-manager.ps1
```

---

## ⚠️ Wichtige Hinweise

1. **Git muss installiert sein** und in PATH verfügbar
2. **Backups sind wichtig** - Nutzen Sie die Backup-Funktion vor großen Operationen
3. **Force-Operationen mit Vorsicht** - können Projektstatus beeinträchtigen
4. **Administrator-Rechte** - möglicherweise notwendig für bestimmte Operationen

---

## 🐛 Fehlerbehebung

### "Befehl nicht gefunden"

- **In CMD:** Führe `git-manager.cmd` direkt aus oder nutze den vollständigen Pfad
- **In PowerShell:** Nutze `.\git-manager.cmd` oder `.\git-manager.ps1`

### "Git nicht erkannt"

- Git ist nicht in PATH installiert
- Installiere Git from git-scm.com
- Starten Sie die Shell neu nach Installation

### "Zugriff verweigert"

- Möglicherweise fehlen Schreibrechte im Verzeichnis
- Führe die Datei als Administrator aus (Rechtsklick > Als Administrator ausführen)

---

## 📝 Lizenz

SPDX-License-Identifier: MIT

Diese Skripte wurden für ERP Steinmetz erstellt.
