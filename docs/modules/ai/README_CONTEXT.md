# ConversationContext - Datenladung & Konfiguration

## 📁 Struktur

```tree
context/
├── conversationContext.ts          # Hauptklasse
├── test-context-loading.ts         # Test-Script
├── data/                            # Kontext-Daten (JSON)
│   ├── 01_reflections.json         # Wort-Reflexionen (ich→Sie, etc.)
│   ├── 02_rules_greetings.json     # Begrüßungs-Regeln
│   ├── 03_rules_system_commands.json
│   ├── 04_rules_data_operations.json
│   ├── 05_rules_security.json
│   ├── 06_rules_user_management.json
│   ├── 07_rules_data_structures.json
│   ├── 08_rules_algorithms.json
│   ├── 09_rules_hash_techniques.json
│   ├── 10_rules_advanced_structures.json
│   ├── 11_rules_optimization.json
│   ├── 12_rules_ai_techniques.json
│   ├── 13_rules_miscellaneous.json
│   ├── 14_rules_smalltalk.json
│   ├── 15_rules_communication.json
│   ├── 16_rules_humor.json
│   └── 17_rules_conversation.json
└── README_CONTEXT.md               # Diese Datei
```

## 🔄 Wie funktioniert das Laden?

### 1. Initialisierung

```typescript
const context = new ConversationContext();
// Lädt automatisch alle Daten aus data/
```

### 2. Lade-Prozess

1. **Verzeichnis-Suche**: Sucht nach `data/`-Ordner relativ zur TypeScript-Datei
2. **Datei-Filterung**: Filtert alle `*.json` Dateien
3. **Sortierung**: Sortiert nach Präfix-Nummer (01, 02, 03, ...)

4. **Laden & Validierung**:
   - Liest jede Datei
   - Parst JSON
   - Validiert Struktur
   - Merged Daten zusammen

5. **Fallback**: Falls Fehler → Fallback-Kontext mit minimalen Regeln

### 3. Validierung

Jede Datei wird validiert:

- ✅ Muss `reflections` ODER `eliza_rules` enthalten
- ✅ Reflections müssen ein Objekt sein
- ✅ Rules müssen ein Array sein
- ✅ Jede Rule braucht:
  - `pattern`: String (valides RegEx)
  - `replies`: Array mit mindestens 1 String
- ✅ Optional: `action`, `priority`, `enabled`, `params`

## 📝 JSON-Datei Formate

### Reflections-Datei

```json
{
  "reflections": {
    "ich": "Sie",
    "mein": "Ihr",
    "mir": "Ihnen"
  }
}
```

### Rules-Datei

```json
{
  "eliza_rules": [
    {
      "pattern": "\\b(hallo|hi|hey)\\b",
      "replies": ["Hallo! Wie kann ich helfen?", "Guten Tag!"],
      "action": "greeting",
      "priority": 1,
      "enabled": true
    }
  ]
}
```

### Kombinierte Datei

```json
{
  "reflections": {
    "ich": "Sie"
  },
  "eliza_rules": [
    {
      "pattern": "...",
      "replies": ["..."]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "description": "Meine Regeln"
  }
}
```

## 🧪 Testing

### Test ausführen

```bash
# Im Backend-Verzeichnis
cd apps/backend
npm run test:context

# Oder direkt mit tsx
npx tsx src/routes/ai/context/test-context-loading.ts
```

### Was wird getestet?

- ✅ Daten erfolgreich geladen
- ✅ Kein Fallback-Modus
- ✅ Anzahl Rules & Reflections
- ✅ Regel-Matching mit Beispielen
- ✅ Context-State

## 🔍 Diagnose

### Context-Diagnose abrufen

```typescript
const context = new ConversationContext();
const diag = context.getDiagnostics();

console.log(diag);
```

### Diagnose-Informationen

```typescript
{
  context_size: number; // Anzahl Context-Einträge
  rules_loaded: number; // Geladene Regeln
  active_rules: number; // Aktive Regeln
  disabled_rules: number; // Deaktivierte Regeln
  reflections_loaded: number; // Geladene Reflexionen
  loading_info: {
    fallback_mode: boolean; // ⚠️ Fallback aktiv?
    loaded_files: number; // Anzahl geladener Dateien
    load_timestamp: string; // Wann geladen?
  }
  // ... weitere Infos
}
```

## ⚠️ Troubleshooting

### Problem: Fallback-Modus aktiv

**Symptome:**

```text
diagnostics.loading_info.fallback_mode === true
```

**Ursachen & Lösungen:**

1. **data/-Ordner fehlt**

   ```bash
   # Prüfen
   ls apps/backend/src/routes/ai/context/data/

   # Lösung: Ordner erstellen
   mkdir -p apps/backend/src/routes/ai/context/data/
   ```

2. **Keine JSON-Dateien**

   ```bash
   # Prüfen
   ls apps/backend/src/routes/ai/context/data/*.json

   # Lösung: JSON-Dateien hinzufügen
   ```

3. **Invalide JSON**

   ```bash
   # Prüfen mit jq
   jq . apps/backend/src/routes/ai/context/data/01_reflections.json

   # Oder mit Node
   node -e "console.log(JSON.parse(require('fs').readFileSync('...')))"
   ```

4. **Falsche Struktur**
   - Prüfe ob `reflections` oder `eliza_rules` vorhanden
   - Prüfe Array-Struktur bei rules
   - Prüfe pattern & replies

5. **Berechtigungen**

   ```bash
   # Windows
   icacls apps/backend/src/routes/ai/context/data/

   # Linux/Mac
   ls -la apps/backend/src/routes/ai/context/data/
   ```

### Problem: Regeln matchen nicht

**Debug-Schritte:**

1. **Regel-Pattern prüfen**

   ```typescript
   const match = context.matchRules("Hallo Welt");
   console.log(match); // null = kein Match
   ```

2. **Pattern testen**

   ```javascript
   const pattern = /\b(hallo|hi)\b/i;
   console.log(pattern.test("Hallo Welt")); // true?
   ```

3. **Regex-Escaping**

   ```json
   // FALSCH:
   "pattern": "\b(hallo)\b"

   // RICHTIG:
   "pattern": "\\b(hallo)\\b"
   ```

4. **Case-Sensitivity**

   ```json
   // Case-insensitive mit (?i)
   "pattern": "(?i)\\b(hallo|hi)\\b"
   ```

### Problem: Reflexionen funktionieren nicht

**Prüfen:**

```typescript
const context = new ConversationContext();
const diag = context.getDiagnostics();
console.log("Reflections:", diag.reflections_loaded);
// Sollte > 0 sein
```

**Testen:**

```typescript
// Intern wird applyReflections() verwendet
// Bei "ich bin müde" → "Sie sind müde"
```

## 📊 Logging

### Log-Level einstellen

```typescript
// In logger.ts oder .env
LOG_LEVEL = debug;
```

### Wichtige Log-Messages

```list
[ConversationContext] Starting to load context data
[ConversationContext] Found JSON context files (count: X)
[ConversationContext] Loading file (file: XX_...)
[ConversationContext] Loaded reflections (count: X)
[ConversationContext] Loaded rules (count: X)
[ConversationContext] Context data loading completed
```

### Bei Fehlern

```list
[ConversationContext] Error loading file
[ConversationContext] Validation failed
[ConversationContext] Invalid data: ...
[ConversationContext] Initializing fallback context
```

## 🚀 Best Practices

### 1. Nummerierung

- Nutze führende Nullen: `01_`, `02_`, ...
- Sortierung ist wichtig für Override-Logik

### 2. Dateiorganisation

- Thematische Gruppierung
- `01_reflections.json` immer zuerst
- Greetings/Basics vor komplexen Regeln

### 3. Pattern-Design

```json
{
  "pattern": "(?i)\\b(keyword1|keyword2)\\b"
  // (?i) = case-insensitive
  // \\b = Wortgrenze
  // (a|b) = Alternative
}
```

### 4. Reply-Varianten

```json
{
  "replies": [
    "Kurze Antwort",
    "Längere, detailliertere Antwort",
    "Alternative Formulierung"
  ]
  // System wählt zufällig
}
```

### 5. Priority

```json
{
  "priority": 0, // Sehr niedrig (Fallback)
  "priority": 1, // Normal (Greetings)
  "priority": 2, // Hoch (Spezifisch)
  "priority": 3 // Sehr hoch (Kritisch)
}
```

## 📚 Weitere Ressourcen

- **types.ts**: TypeScript-Interfaces
- **ELIZA-Pattern**: //en.wikipedia.org/wiki/ELIZA
- **RegEx-Tester**: //regex101.com/

## ✅ Checkliste für neue Dateien

- [ ] Korrekte Nummerierung (`XX_name.json`)
- [ ] Valides JSON-Format
- [ ] `reflections` ODER `eliza_rules` vorhanden
- [ ] Alle `pattern` sind valide RegEx
- [ ] Alle `replies` sind nicht-leere Arrays
- [ ] Strings sind korrekt escaped (`\\b` nicht `\b`)
- [ ] Test durchgeführt
- [ ] Keine Konflikte mit bestehenden Patterns

---

**Letzte Aktualisierung:** 2025-12-17  
**Version:** 1.0.0
