# GitHub Copilot Konfiguration – ERP SteinmetZ

**Version:** 1.0.0  
**Zweck:** Kontext und Richtlinien für GitHub Copilot

---

## 📋 Projekt-Kontext

### System-Übersicht

- **Projekt**: ERP SteinmetZ – Enterprise Resource Planning System
- **Zielgruppe**: Steinmetz-Betriebe und ähnliche Handwerksunternehmen
- **Version**: 0.3.0
- **Status**: Aktive Entwicklung

### Technologie-Stack

**Frontend:**

- React 19 mit TypeScript
- Vite als Build-Tool
- React Router v7 für Routing
- CSS-Variablen für Theming (Light, Dark, LCARS, High Contrast)
- react-i18next für Internationalisierung (7 Sprachen)
- Vitest + React Testing Library für Tests

**Backend:**

- Node.js 18+ mit Express 5
- TypeScript
- SQLite (Development) / PostgreSQL (Production)
- Socket.IO für WebSocket-Kommunikation
- Pino für strukturiertes Logging
- Zod für Input-Validierung

**AI-Integration:**

- OpenAI API
- Ollama (lokale Modelle)
- Anthropic Claude
- Automatisches Fallback-System

---

## 🎯 Coding-Standards

### TypeScript

**Verwende explizite Typen:**

```typescript
// ✅ Gut
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // Implementation
}

// ❌ Schlecht
function getUser(id): any {
  // Implementation
}
```

**Vermeide `any`:**

- Verwende `unknown` für unbekannte Typen
- Nutze Type Guards für Runtime-Checks
- Definiere Interfaces für komplexe Objekte

### Error-Handling

**Backend: Standardisierte APIError-Klassen**

```typescript
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../middleware/errors/apiErrors";

// Beispiel: Resource not found
if (!user) {
  throw new NotFoundError("User not found", { userId: id });
}

// Beispiel: Validation error
if (!isValidEmail(email)) {
  throw new ValidationError("Invalid email format", { email });
}
```

**Standardisiertes Error-Response-Format:**

```typescript
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "User not found",
    details: { userId: "123" },
    timestamp: "2025-12-06T14:00:00Z",
    path: "/api/users/123"
  }
}
```

### Input-Validierung

**Verwende Zod für alle API-Endpoints:**

```typescript
import { z } from "zod";
import { validate } from "../middleware/validate";

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

router.post(
  "/users",
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    // req.body ist garantiert valide
    const user = await userService.create(req.body);
    res.json({ success: true, data: user });
  }),
);
```

### Logging

**Backend: Pino statt console.log**

```typescript
import logger from "../utils/logger";

// ✅ Gut: Strukturiertes Logging
logger.info({ userId, action: "login" }, "User logged in");
logger.warn({ endpoint, duration }, "Slow API response");
logger.error({ err, context }, "Operation failed");

// ❌ Schlecht: Console-Logging
console.log("User logged in:", userId);
```

**Log-Levels:**

- `info`: Normale Operationen
- `warn`: Warnungen
- `error`: Fehler
- `debug`: Debug-Informationen (nur Development)

**Niemals sensible Daten loggen:**

- Keine Passwörter
- Keine API-Tokens
- Keine vollständigen Email-Adressen (masken: `user@*****.com`)
- Keine Kreditkarteninformationen

---

## 🏗️ Architektur-Patterns

### Backend-Struktur

```
apps/backend/src/
├── routes/          # API-Routen (Express Router)
├── services/        # Business Logic (Services)
├── middleware/      # Express Middleware (Auth, Error-Handling)
├── utils/           # Hilfsfunktionen
└── types/           # TypeScript-Typen
```

**Route-Handler-Pattern:**

```typescript
import { asyncHandler } from "../middleware/asyncHandler";

router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);

    if (!user) {
      throw new NotFoundError("User not found", { userId: req.params.id });
    }

    res.json({ success: true, data: user });
  }),
);
```

### Frontend-Struktur

```
apps/frontend/src/
├── components/      # React-Komponenten
│   ├── ui/         # Wiederverwendbare UI-Komponenten
│   ├── features/   # Feature-spezifische Komponenten
│   └── pages/      # Top-Level Pages
├── contexts/       # React Contexts (Theme, Auth)
├── hooks/          # Custom React Hooks
├── styles/         # CSS und Theme-Variablen
└── routes.tsx      # Zentrale Route-Konfiguration
```

**Component-Pattern:**

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const { t } = useTranslation();

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={() => onEdit(user)}>
          {t('common.edit')}
        </button>
      )}
    </div>
  );
};
```

---

## 🧪 Testing

### Test-Anforderungen

- Neue Features benötigen Tests (Coverage > 80%)
- Bugfixes benötigen Regression-Tests
- Kritische Funktionen: Coverage > 90%

### Test-Pattern (Vitest)

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe("getById", () => {
    it("should return user when found", async () => {
      // Arrange
      const userId = "123";

      // Act
      const user = await userService.getById(userId);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
    });

    it("should return null when user not found", async () => {
      // Act
      const user = await userService.getById("nonexistent");

      // Assert
      expect(user).toBeNull();
    });
  });
});
```

---

## 🎨 Frontend-Spezifische Richtlinien

### Theme-System

**Verwende CSS-Variablen:**

```css
/* ✅ Gut: CSS-Variablen */
.my-component {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* ❌ Schlecht: Hardcoded Farben */
.my-component {
  background-color: #ffffff;
  color: #000000;
}
```

**Verfügbare Themes:**

- Light (Standard)
- Dark
- LCARS (Star Trek-inspiriert)
- High Contrast (Barrierefreiheit)

### Internationalisierung

**Alle UI-Texte übersetzen:**

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

**Unterstützte Sprachen:**

- Deutsch (DE)
- Englisch (EN)
- Spanisch (ES)
- Französisch (FR)
- Italienisch (IT)
- Polnisch (PL)
- Türkisch (TR)

### Responsive Design

**Breakpoints:**

```css
/* Mobile First */
.container {
  width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}

/* Desktop */
@media (min-width: 1280px) {
  .container {
    width: 1200px;
  }
}
```

**Touch-Targets:**

- Mindestens 44px × 44px
- Ausreichend Abstand zwischen interaktiven Elementen

---

## 📚 Dokumentation

### Code-Kommentare (TSDoc)

````typescript
/**
 * Erstellt einen neuen Benutzer im System.
 *
 * @param userData - Die Benutzerdaten
 * @returns Der erstellte Benutzer mit generierter ID
 * @throws {ValidationError} Wenn die Benutzerdaten ungültig sind
 * @throws {ConflictError} Wenn die Email bereits existiert
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: 'Max Mustermann',
 *   email: 'max@example.com'
 * });
 * ```
 */
async function createUser(userData: CreateUserDto): Promise<User> {
  // Implementation
}
````

### API-Dokumentation

Für neue API-Endpoints:

1. Aktualisiere `docs/api/openapi.yaml`
2. Füge Beispiele hinzu in `docs/api/API_DOCUMENTATION.md`
3. Update Postman Collection: `docs/api/postman-collection.json`

---

## 🔐 Sicherheit

### Best Practices

**Input-Validierung:**

- Immer Client- UND Server-seitig validieren
- Verwende Zod für Type-safe Validierung
- Sanitize Inputs gegen XSS

**Authentifizierung:**

- JWT-Tokens für API-Auth
- Sichere Token-Speicherung (httpOnly Cookies)
- Rate-Limiting für Login-Endpoints

**Sensible Daten:**

- Niemals in Logs ausgeben
- Verschlüsselt speichern (z.B. Passwörter mit bcrypt)
- Niemals in Frontend-Code hardcoden

---

## 📋 Commit-Messages

**Format (Conventional Commits):**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: Neue Funktion
- `fix`: Bugfix
- `docs`: Dokumentation
- `style`: Formatierung
- `refactor`: Code-Umstrukturierung
- `perf`: Performance-Verbesserung
- `test`: Tests
- `build`: Build-System
- `ci`: CI-Konfiguration
- `chore`: Wartungsarbeiten

**Beispiele:**

```
feat(hr): add employee time tracking endpoint
fix(frontend): resolve theme toggle bug in dark mode
docs(api): update finance module documentation
refactor(backend): simplify error handling middleware
```

---

## 🚀 Deployment

### Build-Commands

```bash
# Development
npm run dev              # Frontend + Backend
npm run dev:frontend     # Nur Frontend
npm run dev:backend      # Nur Backend

# Production
npm run build            # TypeScript kompilieren
npm start                # Production Server starten

# Testing
npm test                 # Alle Tests
npm run lint             # Linting
```

### Environment Variables

**Backend (.env):**

```
NODE_ENV=development
PORT=3000
DATABASE_URL=./data/erp.db
OPENAI_API_KEY=sk-...
SESSION_SECRET=your-secret
```

**Frontend (.env):**

```
VITE_API_URL=http://localhost:3000
```

---

## 🔗 Wichtige Ressourcen

### Projektdokumentation

- [COPILOT_RULESET.md](../COPILOT_RULESET.md) - Vollständige Entwicklungsrichtlinien
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution Guidelines
- [TODO.md](../TODO.md) - Aufgabenliste
- [ISSUES.md](../ISSUES.md) - Aktive Issues

### Technische Dokumentation

- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System-Architektur
- [docs/ERROR_HANDLING.md](../docs/ERROR_HANDLING.md) - Error-Handling
- [docs/DEVELOPER_ONBOARDING.md](../docs/DEVELOPER_ONBOARDING.md) - Setup-Guide
- [docs/CODE_CONVENTIONS.md](../docs/CODE_CONVENTIONS.md) - Code-Standards

### API-Dokumentation

- [docs/api/README.md](../docs/api/README.md) - API-Hub
- [docs/api/openapi.yaml](../docs/api/openapi.yaml) - OpenAPI Spec

---

## 💡 Copilot-Tipps

### Gute Prompts

**✅ Spezifisch und kontextreich:**

```
// Erstelle einen API-Endpoint für das Abrufen von Mitarbeitern
// mit Paginierung, Filterung nach Abteilung und Suchfunktion.
// Verwende Zod-Validierung und standardisiertes Error-Handling.
```

**❌ Zu vage:**

```
// Hole Mitarbeiter
```

### Code-Vervollständigung nutzen

- Schreibe aussagekräftige Kommentare vor Funktionen
- Beginne Funktionsnamen mit klaren Verben (get, create, update, delete)
- Verwende TypeScript-Interfaces als Dokumentation

### Review Copilot-Vorschläge

- Prüfe auf Security-Issues
- Validiere Error-Handling
- Stelle sicher, dass Tests vorhanden sind
- Überprüfe auf konsistente Formatierung

---

**Letzte Aktualisierung**: 6. Dezember 2025  
**Version**: 1.0.0  
**Maintainer**: Thomas Heisig

Für vollständige Entwicklungsrichtlinien siehe [COPILOT_RULESET.md](../COPILOT_RULESET.md).
