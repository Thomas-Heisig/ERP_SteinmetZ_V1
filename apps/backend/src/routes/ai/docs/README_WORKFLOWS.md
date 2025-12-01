Basierend auf der analysierten `workflowEngine.ts` Datei, hier sind die erkannten Funktionen und Features:

## ⚙️ **Workflow Engine System - Hauptfunktionen**

### **Workflow-Management**

- `registerWorkflow()` - Registriert Workflows mit Validierung
- `hasWorkflow()` - Prüft Workflow-Existenz
- `listWorkflows()` - Listet alle Workflow-Namen
- `getWorkflowDefinitions()` - Detaillierte Workflow-Informationen
- `clear()` - Löscht alle Workflows

### **Workflow-Ausführung**

- `executeWorkflow()` - Führt komplette Workflows aus
- `executeSingleStep()` - Führt einzelne Workflow-Schritte aus
- `executeSteps()` - Führt Schritt-Arrays aus (für verschachtelte Steps)

### **Import/Export & Persistenz**

- `exportWorkflows()` - Exportiert alle Workflows
- `importWorkflows()` - Importiert Workflows aus Daten

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Workflow-Registrierung mit Validierung**

```typescript
registerWorkflow(name: string, def: WorkflowDefinition): void
```

**Validierungsfeatures**:

- Schema-Validierung mit `validateSchema()`
- Steps-Array Pflichtprüfung
- Normalisierung und Legacy-Support
- Tolerante Fehlerbehandlung mit Warnungen

### **2. Workflow-Ausführung mit Error-Handling**

```typescript
executeWorkflow(name: string, input: Record<string, any>, debug = false): Promise<any>
```

**Error-Modi**:

- `stop` - Beendet Workflow bei Fehler (Standard)
- `skip` - Überspringt restliche Schritte
- `continue` - Setzt Workflow fort

### **3. Schritt-Typen Unterstützung**

#### **Tool Call Schritt**

```typescript
{ type: "tool_call", tool: "tool_name", params: {}, variable: "result_var" }
```

- Tool-Registry Integration
- Parameter-Interpolation
- Ergebnis-Variablen-Zuweisung

#### **Conditional Schritt (If)**

```typescript
{ type: "if", condition: "expression", steps: [...] }
```

- Bedingungsauswertung
- Verschachtelte Schritt-Ausführung
- Kontext-Variable-Integration

#### **Loop Schritt**

```typescript
{ type: "loop", params: { list: "{{context.array}}" }, steps: [...] }
```

- Listen-Iteration
- Index und Item Kontext-Variablen
- Verschachtelte Schritt-Wiederholung

#### **Subworkflow Aufruf**

```typescript
{ type: "workflow_call", tool: "sub_workflow_name", params: {} }
```

- Workflow-Rekursion
- Input-Parameter-Übergabe
- Ergebnis-Integration

#### **Context Update**

```typescript
{ type: "context_update", params: { key: "value" } }
```

- Kontext-Variable-Speicherung
- ConversationContext Integration
- Lokale und globale Kontext-Updates

#### **Log Schritt**

```typescript
{ type: "log", message: "Log-Nachricht {{variable}}" }
```

- Interpolierte Log-Nachrichten
- Sanitization für Sicherheit
- Debug-Modus Unterstützung

## 🔧 **Technische Features**

### **Parameter-Interpolation**

```typescript
interpolate(value: any, context: Record<string, any>): any
```

**Syntax**: `{{context.variable}}` oder `{{nested.object.property}}`

- String, Array und Object Unterstützung
- Sichere Fehlerbehandlung bei nicht-existierenden Pfaden
- Rekursive Verarbeitung

### **Bedingungsauswertung**

```typescript
evaluateCondition(expr: string, context: Record<string, any>): boolean
```

**Unterstützte Ausdrücke**:

- Boolean Literale: `true`, `false`, `1`, `0`
- Zahlenvergleiche: `>`, `>=`, `<`, `<=`, `==`
- Komplexe Ausdrücke (mit Security-Warnung)

### **Context-Management**

- **Lokaler Kontext**: Workflow-spezifische Variablen
- **Globaler Kontext**: ConversationContext Integration
- **Automatische Variablen**: `input`, `last_result`, `timestamp`

## 🛡️ **Sicherheitsfeatures**

### **Input-Sanitization**

- String-Sanitisierung für Log-Nachrichten
- Sichere Parameter-Interpolation
- Error-Boundaries für Schritt-Ausführung

### **Validierung & Normalisierung**

- Workflow-Schema-Validierung
- Legacy-Support (`action` → `tool` Konvertierung)
- Schritt-Struktur-Validierung

## 📊 **Monitoring & Debugging**

### **Debug-Modus**

```typescript
const dlog = (msg: string, data?: any) => {
  if (debug) console.log(`[WF:${name}] ${msg}`, data ?? "");
};
```

- Detaillierte Schritt-Protokollierung
- Performance-Monitoring
- Fehler-Tracing

### **Strukturierte Logging**

- Workflow-Start/Ende Events
- Schritt-für-Schritt Protokollierung
- Error-Kontext für Fehleranalyse

## 🔄 **Import/Export System**

### **Workflow-Persistenz**

```typescript
exportWorkflows(): any[]
importWorkflows(data: any[]): void
```

**Features**:

- Vollständiger Workflow-Export
- Toleranter Import mit Fehlerbehandlung
- Import-Statistiken (imported/skipped)

### **JSON Workflow Support**

- Automatisches Laden von `data_export.json`
- Externe Workflow-Definitionen
- Metadaten-Integration

## 🎯 **Use Cases**

### **KI-Pipelines**

- Sequenzielle Tool-Ausführung
- Bedingte Verzweigungen basierend auf KI-Ergebnissen
- Komplexe Datenverarbeitungsketten

### **Daten-Export Workflows**

- Strukturierte Daten-Extraktion
- Format-Konvertierung
- Benachrichtigungs-Integration

### **System-Automation**

- Wiederholbare Prozesse
- Fehlerbehandlungs-Routinen
- Resource-Management

## 🔧 **Integration**

### **Tool Registry Integration**

- Direkter Zugriff auf registrierte Tools
- Tool-Metadaten für Workflow-Design
- Sichere Tool-Ausführung mit Timeout

### **ConversationContext Integration**

- Persistenter Kontext über Workflows hinweg
- KI-Gesprächskontext-Verwaltung
- Cross-Workflow Daten-Sharing

Die Workflow Engine bietet eine leistungsstarke, sichere und flexible Automatisierungsplattform für das ERP-KI-Backend mit Unterstützung für komplexe Prozessketten, Bedingungslogik und Integration mit dem gesamten KI-Tool-Ökosystem.
