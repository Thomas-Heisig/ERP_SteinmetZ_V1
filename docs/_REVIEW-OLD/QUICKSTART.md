# Quick Start Guide - Backend-Setup

**Letzte Aktualisierung:** 20. Dezember 2025  
**Version:** 1.0.0  
**Zielgruppe:** Neue Entwickler

---

## ⚡ 5-Minuten Setup

### Voraussetzungen

```bash
# Node.js Version prüfen
node --version  # ✅ muss 18+ sein

# npm Version prüfen
npm --version   # ✅ muss 8+ sein
```

### Schritt 1: Repository klonen und Setup

```bash
# Repository klonen
git clone https://github.com/yourusername/ERP_SteinmetZ_V1.git
cd ERP_SteinmetZ_V1

# Alle Dependencies installieren
npm install

# Backend vorbereiten
cd apps/backend
npm install
```

### Schritt 2: Datenbank initialisieren

```bash
# Im backend-Verzeichnis
npm run db:reset    # Datenbank zurücksetzen
npm run db:migrate  # Alle Migrations durchführen
npm run db:seed     # Test-Daten laden
```

### Schritt 3: Server starten

```bash
# Im backend-Verzeichnis
npm run dev

# Output sollte sein:
# ✅ Server listening on http://localhost:3000
# ✅ Database: SQLite (./data/dev.sqlite3)
```

### Schritt 4: API testen

```bash
# In neuem Terminal
curl http://localhost:3000/api/health

# Erfolgreiche Response:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "latency": 2,
#     "driver": "sqlite",
#     "timestamp": "2025-12-20T10:00:00Z"
#   }
# }
```

**🎉 Fertig! Ihr Backend läuft!**

---

## 📚 Schnelle Referenz

### Häufigste Befehle

```bash
# Datenbank
npm run db:migrate       # Migrationen ausführen
npm run db:reset        # DB zurücksetzen
npm run db:seed         # Seed-Daten laden

# Development
npm run dev             # Dev Server mit Hot-Reload
npm run watch          # TypeScript Watch Mode
npm run build          # Production Build

# Testing & Linting
npm run test           # Unit Tests
npm run test:watch    # Tests im Watch-Modus
npm run lint          # ESLint prüfen
npm run lint:fix      # Auto-Fixes anwenden
```

### Umgebungsvariablen

**Datei:** `apps/backend/.env`

```bash
# Minimal Config für Entwicklung
PORT=3000
NODE_ENV=development
DB_DRIVER=sqlite
SQLITE_FILE=./data/dev.sqlite3
LOG_LEVEL=info
JWT_SECRET=dev-secret-key-change-in-production
```

### Datenbankzugriff

```bash
# SQLite CLI öffnen
sqlite3 data/dev.sqlite3

# Nützliche Befehle
.tables                      # Alle Tabellen auflisten
.schema users               # Schema anzeigen
SELECT COUNT(*) FROM users; # Datensätze zählen
.quit                       # Beenden
```

---

## 🚀 Erste API-Call

### Beispiel 1: Health Check

```bash
curl -X GET http://localhost:3000/api/health
```

### Beispiel 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Beispiel 3: Benutzer abrufen

```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔍 Troubleshooting

### Problem: Port 3000 bereits verwendet

```bash
# Lösung 1: Anderen Port verwenden
PORT=3001 npm run dev

# Lösung 2: Process beenden
lsof -ti:3000 | xargs kill -9
```

### Problem: Datenbank-Fehler

```bash
# Lösung: Datenbank zurücksetzen
npm run db:reset
npm run db:migrate
npm run db:seed
```

### Problem: TypeScript-Fehler

```bash
# Lösung: Neu bauen
npm run build

# Oder Type-Check durchführen
npm run type-check
```

### Problem: Modules nicht gefunden

```bash
# Lösung: Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Nächste Schritte

### Um mehr zu lernen:

1. **Backend-Architektur verstehen**
   - Lesen: `docs/BACKEND_ARCHITECTURE.md`

2. **Neue Services erstellen**
   - Muster: `apps/backend/src/service/UserService.ts`
   - Guide: `docs/BACKEND_ARCHITECTURE.md#service-architektur`

3. **Datenbanken-Migrationen**
   - Guide: `docs/DATABASE_MIGRATION_STANDARDS.md`
   - Beispiele: `apps/backend/src/migrations/`

4. **Error Handling**
   - Guide: `docs/BACKEND_ARCHITECTURE.md#error-handling`
   - Typen: `apps/backend/src/types/errors.ts`

5. **Frontend Integration**
   - Guide: `docs/FRONTEND_INTEGRATION.md`
   - Hooks: `apps/frontend/src/hooks/useApi.ts`

---

## 💡 Tipps für die Entwicklung

### Hot-Reload nutzen

```bash
# Terminal 1: TypeScript Compiler im Watch-Mode
npm run watch

# Terminal 2: Server mit Nodemon
npm run dev

# Änderungen werden automatisch heiß neu geladen
```

### Debug-Mode aktivieren

```bash
# Detailliertes Logging
LOG_LEVEL=debug npm run dev

# Datenbank-Queries sehen
DB_LOGGING=true npm run dev
```

### Logs in Datei speichern

```bash
# Logs in Datei schreiben
npm run dev > logs/app.log 2>&1

# Logs in Echtzeit beobachten
tail -f logs/app.log
```

### VSCode Extensions empfohlen

```
- REST Client (Human37) - Für API-Tests
- SQLite (alexcvzz.vscode-sqlite) - DB-Browser
- Thunder Client - Alternative zu Postman
- Prettier - Code Formatter
- ESLint - Linting
```

---

## 🔗 Wichtige Links

| Ressource                | Link                                   |
| ------------------------ | -------------------------------------- |
| **Backend-Architektur**  | `docs/BACKEND_ARCHITECTURE.md`         |
| **Frontend-Integration** | `docs/FRONTEND_INTEGRATION.md`         |
| **Database Standards**   | `docs/DATABASE_MIGRATION_STANDARDS.md` |
| **Error Codes**          | `apps/backend/src/types/errors.ts`     |
| **Services**             | `apps/backend/src/service/`            |
| **Types**                | `apps/backend/src/types/`              |

---

## ❓ FAQs

### F: Wie starte ich den Server?

**A:** `npm run dev` im `apps/backend` Verzeichnis.

### F: Wie resette ich die Datenbank?

**A:** `npm run db:reset` führt die Migration auf einer neuen Datenbank durch.

### F: Welchen Editor soll ich verwenden?

**A:** VSCode wird empfohlen mit Extensions für TypeScript, Prettier und ESLint.

### F: Wie kann ich die API testen?

**A:** Verwenden Sie REST Client Extension oder curl für Terminal-Tests.

### F: Wo sind die Migrations?

**A:** `apps/backend/src/migrations/` - Alle SQL-Dateien müssen SQLite-kompatibel sein.

### F: Wie füge ich neue Types hinzu?

**A:** In `apps/backend/src/types/` neue Datei erstellen und in `index.ts` exportieren.

### F: Wie erstelle ich einen neuen Service?

**A:** `apps/backend/src/service/MyService.ts` erstellen, in `index.ts` exportieren.

### F: Wie handelt man Errors?

**A:** Custom Error Classes aus `types/errors.ts` verwenden (z.B. `throw new NotFoundError(...)`).

---

**Zuletzt aktualisiert:** 20. Dezember 2025 ✍️
