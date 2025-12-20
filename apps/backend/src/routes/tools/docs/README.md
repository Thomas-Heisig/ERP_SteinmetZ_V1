# Tools System

Das Tools-System bietet eine modulare und erweiterbare Architektur für die Registrierung und Verwaltung verschiedener Backend-Tools.

## Übersicht

### 📁 Verzeichnisstruktur

```t
src/routes/tools/
├── listRoutesTool.ts          # Tool: Liest alle Express-Routen auf
├── registry.ts                # ToolRegistry: Zentrales Registrierungssystem
└── docs/
    └── README.md              # Diese Datei
```

## Tools

### 📋 listRoutesTool

**Zweck:** Inspiziert alle registrierten Express-Routen aus der Express-Anwendung.

**Verwendung:**

```typescript
import { listRoutesTool } from "../tools/listRoutesTool";
import { toolRegistry } from "../tools/registry";

// Tool registrieren
toolRegistry.register(listRoutesTool);

// Tool ausführen
const result = await toolRegistry.call("listRoutes");
// Ergebnis: { success: true, count: 42, routes: [...] }
```

**Rückgabewert:**

```typescript
interface Result {
  success: boolean; // Erfolgstatus
  count: number; // Anzahl der gefundenen Routen
  routes: RouteInfo[]; // Array mit Route und HTTP-Methoden
}

interface RouteInfo {
  path: string; // Route-Pfad (z.B. "/api/users")
  methods: string[]; // HTTP-Methoden (z.B. ["GET", "POST"])
}
```

## ToolRegistry

Zentrales Registrierungssystem für alle verfügbaren Tools.

### API

#### `register(tool: Tool)`

Registriert ein neues Tool im System.

```typescript
toolRegistry.register({
  name: "myTool",
  description: "Beschreibung des Tools",
  parameters: {
    /* Zod-Schema oder Parameter-Definition */
  },
  run: async (args) => {
    // Tool-Logik
    return result;
  },
});
```

#### `get(name: string): Tool | undefined`

Holt ein registriertes Tool nach Name.

```typescript
const tool = toolRegistry.get("listRoutes");
if (tool) {
  console.log(tool.description);
}
```

#### `has(name: string): boolean`

Prüft, ob ein Tool registriert ist.

```typescript
if (toolRegistry.has("listRoutes")) {
  console.log("Tool ist verfügbar");
}
```

#### `call(name: string, params?: Record<string, unknown>)`

Führt ein registriertes Tool aus.

```typescript
const result = await toolRegistry.call("listRoutes");
```

#### `list(): Tool[]`

Gibt alle registrierten Tools zurück.

```typescript
const allTools = toolRegistry.list();
console.log(`${allTools.length} Tools verfügbar`);
```

## Schnittstelle (Interface)

### Tool

```typescript
type Tool = {
  name: string; // Eindeutiger Tool-Name
  description?: string; // Optionale Beschreibung
  parameters?: Record<string, unknown>; // Optionales Parameter-Schema
  run: (args: Record<string, unknown>) => Promise<unknown> | unknown;
};
```

## Fehlerbehandlung

### Fehlerfall: Tool nicht gefunden

```typescript
try {
  await toolRegistry.call("nonExistentTool");
} catch (error) {
  // Error: "Unbekanntes Tool: nonExistentTool"
}
```

### Fehlerfall: Fehlende Tool-Registrierung

```typescript
try {
  toolRegistry.register({ name: "" } as any);
} catch (error) {
  // Error: "Tool muss einen Namen haben"
}
```

## Best Practices

1. **Eindeutige Namen:** Nutze aussagekräftige, eindeutige Tool-Namen

   ```typescript
   // ✅ Gut
   name: "listRoutes";
   name: "analyzePerformance";

   // ❌ Schlecht
   name: "tool";
   name: "t1";
   ```

2. **Beschreibungen:** Immer eine Beschreibung bereitstellen

   ```typescript
   description: "Liest alle registrierten Express-Routen aus";
   ```

3. **Error Handling:** Tools sollten aussagekräftige Fehler werfen

   ```typescript
   if (!data) {
     throw new Error("Erforderliche Daten nicht vorhanden");
   }
   ```

4. **Logging:** Nutze strukturiertes Logging

   ```typescript
   const logger = createLogger("myTool");
   logger.info({ toolName: "myTool" }, "Tool ausgeführt");
   ```

## Erweiterung

### Neues Tool hinzufügen

**Schritt 1:** Neue Datei erstellen (`src/routes/tools/myNewTool.ts`)

```typescript
// SPDX-License-Identifier: MIT
import type { Tool } from "./registry";
import { createLogger } from "../../utils/logger";

const logger = createLogger("myNewTool");

export const myNewTool: Tool = {
  name: "myNewTool",
  description: "Macht etwas Sinnvolles",
  parameters: {
    input: "string",
  },
  async run(args: Record<string, unknown>) {
    const input = args.input as string;
    logger.info({ input }, "Tool wird ausgeführt");

    // Logik hier...
    return { success: true, result: "Ergebnis" };
  },
};
```

**Schritt 2:** Tool registrieren (z.B. in `src/index.ts`)

```typescript
import { myNewTool } from "./routes/tools/myNewTool";
import { toolRegistry } from "./routes/tools/registry";

toolRegistry.register(myNewTool);
```

**Schritt 3:** Tool verwenden

```typescript
const result = await toolRegistry.call("myNewTool", { input: "test" });
```

## Integration mit Express

Tools können über einen Endpoint verfügbar gemacht werden:

```typescript
// src/routes/tools-router.ts
import { Router, Request, Response } from "express";
import { toolRegistry } from "./tools/registry";
import { createLogger } from "../utils/logger";

const logger = createLogger("tools-router");
const router = Router();

router.get("/tools", (req: Request, res: Response) => {
  const tools = toolRegistry.list();
  res.json({
    success: true,
    count: tools.length,
    tools: tools.map((t) => ({ name: t.name, description: t.description })),
  });
});

router.post("/tools/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!toolRegistry.has(name)) {
      return res
        .status(404)
        .json({ success: false, error: "Tool nicht gefunden" });
    }
    const result = await toolRegistry.call(name, req.body);
    res.json({ success: true, result });
  } catch (error) {
    logger.error({ error }, "Tool-Ausführung fehlgeschlagen");
    res.status(500).json({ success: false, error: "Interner Fehler" });
  }
});

export default router;
```

## Typensicherheit

Das System ist vollständig typsicher:

```typescript
// ✅ Typsicherheit
const result = await toolRegistry.call('listRoutes');
if (typeof result === 'object' && 'routes' in result) {
  const routes = (result as RouteInfo[]).forEach(...);
}
```

## Performance

- **Lazy Loading:** Tools werden bei der Registrierung nicht geladen
- **Caching:** ToolRegistry speichert Tools in einer Map für schnelle Zugriffe
- **Async Support:** Tools können synchron oder asynchron sein

## Zusammenhang

Das Tools-System wird verwendet von:

- **systemInfoService:** Ruft `listRoutesTool` auf um Routen zu analysieren
- **Dashboard API:** Stellt Tools über REST-Endpoints bereit
- **Monitoring:** Überwacht Ausführungen und Fehler

## Weitere Ressourcen

- [Registry API Dokumentation](#toolregistry)
- [Tool Schnittstelle Dokumentation](#schnittstelle-interface)
- [Copilot Instructions](../../../../.github/copilot-instructions.md)
