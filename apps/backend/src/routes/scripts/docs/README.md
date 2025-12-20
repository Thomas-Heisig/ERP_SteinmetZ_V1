# Backend Scripts - Admin User Management

**Location:** `apps/backend/src/scripts/`  
**Last Updated:** 2025-12-20

---

## 📋 Verfügbare Scripts

### 1. Create Admin User

**Datei:** `createAdminUser.ts`

**Zweck:** Erstellt einen neuen Admin-Benutzer mit Super Admin-Rechten

**Verwendung:**

```bash
# Option 1: Via npm script (empfohlen)
cd apps/backend
npm run script:create-admin

# Option 2: Direkt mit tsx
npx tsx src/scripts/createAdminUser.ts
```

**Features:**

- ✅ Erstellt Benutzer mit Username "admin"
- ✅ E-Mail: <admin@erp-steinmetz.local>
- ✅ Standard-Passwort: `Admin123!` (aus ENV oder default)
- ✅ Weist automatisch **super_admin** Rolle zu
- ✅ Markiert Benutzer als verifiziert
- ✅ Prüft ob Admin bereits existiert

**Umgebungsvariablen:**

```bash
# .env
ADMIN_PASSWORD=IhrSicheresPasswort123!
```

**Ausgabe:**

```text
Initializing database...
Initializing authentication tables...
Creating admin user...
Super Administrator role assigned successfully

✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: admin
Password: Admin123!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please change the password after first login!
```

---

### 2. Assign Admin Role

**Datei:** `assignAdminRole.ts`

**Zweck:** Weist einem existierenden Admin-Benutzer die Super Admin-Rolle zu

**Verwendung:**

```bash
# Option 1: Via npm script (empfohlen)
cd apps/backend
npm run script:assign-admin-role

# Option 2: Direkt mit tsx
npx tsx src/scripts/assignAdminRole.ts
```

**Features:**

- ✅ Findet existierenden Admin-Benutzer
- ✅ Prüft ob super_admin Rolle existiert
- ✅ Weist Rolle zu (falls nicht schon zugewiesen)
- ✅ Zeigt alle aktuellen Rollen an
- ✅ Vollständig typisiert (TypeScript)

**Ausgabe (wenn Rolle bereits zugewiesen):**

```text
🔍 Checking admin user...
✅ Found admin user: admin@dev.local
✅ Found role: Super Administrator
ℹ️  Super Admin role already assigned to admin user

📋 Current roles:
   - Super Administrator (super_admin)
```

**Ausgabe (bei Neuzuweisung):**

```text
🔍 Checking admin user...
✅ Found admin user: admin@dev.local
✅ Found role: Super Administrator
🔧 Assigning Super Admin role...

✅ Super Admin role assigned successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: admin (admin@dev.local)

📋 Assigned roles:
   ✓ Super Administrator (super_admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Admin user can now access all system functions!
```

---

## 🔧 TypeScript-Typen

Beide Scripts sind vollständig typisiert mit folgenden Interfaces:

```typescript
interface UserRecord {
  id: string;
  username: string;
  email: string;
}

interface RoleRecord {
  id: string;
  name: string;
  display_name: string;
}

interface UserRoleRecord {
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
}

interface RoleAssignment {
  username: string;
  role_name: string;
  display_name: string;
}
```

---

## 📊 Workflow-Szenarien

### Szenario 1: Erste Installation

```bash
# 1. Migrationen ausführen
npm run migrate

# 2. Admin-Benutzer erstellen
npm run script:create-admin

# 3. Anmelden mit:
#    Username: admin
#    Password: Admin123! (oder aus .env)
```

### Szenario 2: Admin ohne Rechte

```bash
# Wenn Admin-Benutzer existiert, aber keine Rolle hat:
npm run script:assign-admin-role

# Verifizieren in der Datenbank:
SELECT u.username, r.display_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';
```

### Szenario 3: Passwort vergessen

```bash
# Option A: Admin neu erstellen
# 1. Alten Admin in DB löschen
DELETE FROM users WHERE username = 'admin';

# 2. Neu erstellen
npm run script:create-admin

# Option B: Passwort zurücksetzen (manuell in DB)
# Siehe: docs/AUTHENTICATION.md
```

---

## 🚨 Fehlerbehebung

### Problem: "Admin user not found"

**Ursache:** Kein Admin-Benutzer in der Datenbank

**Lösung:**

```bash
npm run script:create-admin
```

### Problem: "Super Admin role not found"

**Ursache:** Datenbank-Migrationen wurden nicht ausgeführt

**Lösung:**

```bash
# Migrationen ausführen
npm run migrate

# Dann erneut versuchen
npm run script:assign-admin-role
```

### Problem: Script hängt bei Ausführung

**Ursache:** Datenbank-Connection nicht geschlossen

**Lösung:**

- ✅ Beide Scripts schließen jetzt automatisch die DB-Verbindung
- ✅ Verwenden Sie `process.exit(0)` am Ende
- ✅ Error-Handling schließt DB auch bei Fehler

---

## 🔐 Sicherheitshinweise

### Passwort-Sicherheit

⚠️ **Standard-Passwort ändern:**

```bash
# Setzen Sie ADMIN_PASSWORD in .env
echo "ADMIN_PASSWORD=MeinSehRsIcHeReSPaSSw0rd!" >> apps/backend/.env

# Dann Admin neu erstellen
npm run script:create-admin
```

### Produktions-Deployment

✅ **Best Practices:**

1. Nie Standard-Passwort in Produktion verwenden
2. Admin-Passwort aus sicherer Secret-Management-Lösung
3. Passwort-Rotation regelmäßig durchführen
4. 2FA für Admin-Accounts aktivieren (TODO)

---

## 📚 Verwandte Dokumentation

- [RBAC Implementation](../../docs/RBAC_IMPLEMENTATION.md)
- [Authentication Guide](../../docs/AUTHENTICATION.md)
- [Admin Rights Fix](../../docs/ADMIN_RIGHTS_FIX_2025_12_20.md)
- [Database Migration Standards](../../docs/DATABASE_MIGRATION_STANDARDS.md)

---

## ✅ Änderungsprotokoll

### 2025-12-20

- ✅ TypeScript-Typen hinzugefügt
- ✅ `async` entfernt aus `assignAdminRole()` (nicht benötigt)
- ✅ Proper Error-Handling mit DB-Close
- ✅ Rolle geändert von "Admin" zu "super_admin" in `createAdminUser.ts`
- ✅ npm Scripts hinzugefügt: `script:create-admin`, `script:assign-admin-role`
- ✅ JSDoc-Kommentare hinzugefügt
- ✅ Better-sqlite3 generic types verwendet

### Vorher (Probleme)

```typescript
// ❌ Unnötiges async
async function assignAdminRole() { ... }

// ❌ Keine Typen
const admin = db.prepare(...).get("admin");

// ❌ any Typen
roles.forEach((role: any) => { ... });

// ❌ Falsche Rolle
await db.get("SELECT * FROM roles WHERE name = ?", ["Admin"]);
```

### Nachher (Behoben)

```typescript
// ✅ Synchron (kein async needed)
function assignAdminRole(): void { ... }

// ✅ Generische Typen
const admin = db.prepare<string, UserRecord>(...).get("admin");

// ✅ Typisiert
roles.forEach((role: RoleDisplay) => { ... });

// ✅ Korrekte Rolle
await db.get<RoleRecord>("SELECT * FROM roles WHERE name = ?", ["super_admin"]);
```

---

**Maintainer:** GitHub Copilot  
**Contact:** Siehe README.md
