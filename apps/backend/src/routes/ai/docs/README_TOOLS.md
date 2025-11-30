Basierend auf der analysierten `calculationTools.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧮 **Calculation Tools - Hauptfunktionen**

### **Registrierte Tools**
- `calculate` - Allgemeiner mathematischer Rechner
- `statistics` - Statistische Kennzahlen
- `percent` - Prozentrechner
- `convert_unit` - Einheitenkonverter
- `solve_equation` - Gleichungslöser
- `batch_calculate` - Batch-Berechnungen

## 🔧 **Tool Interface**

### **Hauptexport**
```typescript
export function registerTools(toolRegistry: { register: (name: string, fn: ToolFunction) => void })
```

## 📋 **Tool-Details**

### **1. Calculate Tool**
```typescript
calculate({ expression: string })
```
**Beschreibung**: Führt sichere mathematische Berechnungen durch  
**Unterstützte Operatoren**: 
- Grundrechenarten: `+ - * /`
- Potenzen: `^` 
- Wurzeln: `√`
- Konstanten: `π`, `e`
- Prozente: `%`

**Response**:
```typescript
{
  success: boolean,
  expression: string,
  parsed: string,
  result: number,
  formatted: string,
  type: string
}
```

### **2. Statistics Tool**
```typescript
statistics({ values: number[] })
```
**Berechnete Kennzahlen**:
- Count, Sum, Mean (Mittelwert)
- Median, Min, Max
- Variance (Varianz), Standard Deviation

**Response**:
```typescript
{
  success: boolean,
  count: number,
  sum: number,
  mean: number,
  median: number,
  min: number,
  max: number,
  variance: number,
  stdDev: number
}
```

### **3. Percent Tool**
```typescript
percent({ value: number, percent: number, mode: 'of' | 'increase' | 'decrease' })
```
**Modi**:
- `of` - Prozent von Wert berechnen
- `increase` - Prozentuale Erhöhung
- `decrease` - Prozentuale Verringerung

**Response**:
```typescript
{
  success: boolean,
  value: number,
  percent: number,
  mode: string,
  result: number,
  formatted: string
}
```

### **4. Convert Unit Tool**
```typescript
convert_unit({ value: number, from: string, to: string })
```
**Unterstützte Einheiten**:
- Meter: `m`, `cm`, `mm`, `km`
- Imperiale Einheiten: `inch`, `ft`, `yd`

**Response**:
```typescript
{
  success: boolean,
  value: number,
  from: string,
  to: string,
  result: number,
  formatted: string
}
```

### **5. Solve Equation Tool**
```typescript
solve_equation({ equation: string })
```
**Funktionalität**: 
- Löst algebraische Gleichungen mit einer Variable
- Verwendet Newton-Raphson Methode
- Automatische Variablen-Erkennung

**Beispiel**: `"2*x+4=10"` → `x ≈ 3.000000`

**Response**:
```typescript
{
  success: boolean,
  equation: string,
  variable: string,
  solution: number,
  formatted: string
}
```

### **6. Batch Calculate Tool**
```typescript
batch_calculate({ expressions: string[] })
```
**Funktionalität**:
- Verarbeitet mehrere Ausdrücke gleichzeitig
- Gleiche Engine wie `calculate`
- Effiziente Bulk-Verarbeitung

**Response**:
```typescript
{
  success: boolean,
  count: number,
  results: Array<{ expression: string, result: number }>
}
```

## 🛡️ **Sicherheitsfeatures**

### **Expression Sanitization**
- **Eingabevalidierung**: Entfernt gefährliche Zeichen
- **Safe Evaluation**: Verwendet `Function()` statt `eval()`
- **Strict Mode**: Verhindert unerwünschte Zugriffe

### **Error Handling**
- **Strukturierte Fehler**: Konsistente Error-Responses
- **Type Validation**: Parameter-Typüberprüfung
- **Graceful Degradation**: Fehlertolerante Berechnungen

## 📊 **Tool-Metadaten**

### **Kategorien**
- `calculations` - Allgemeine Berechnungen
- `financial` - Finanzmathematik
- `conversions` - Einheitenumrechnung
- `algebra` - Algebraische Operationen

### **Versionierung**
- Tools sind versioniert (z.B. `version: '2.1'`)
- Einfache Erweiterbarkeit und Updates

## 🔄 **Integration**

### **Registry Integration**
- Automatische Registrierung via `registerTools()`
- Kompatibel mit globaler ToolRegistry
- Standardisiertes ToolFunction Interface

### **Response-Standardisierung**
- **Einheitliches Format**: `{ success, ...data, error? }`
- **Formatted Output**: Benutzerfreundliche Darstellung
- **Error Consistency**: Strukturierte Fehlermeldungen

## 🎯 **Use Cases**

### **Mathematische Berechnungen**
- Komplexe Formelauswertungen
- Wissenschaftliche Berechnungen
- Technische Anwendungen

### **Datenanalyse**
- Statistische Auswertungen
- Kennzahlen-Berechnung
- Qualitätskontrolle

### **Finanzwesen**
- Prozentrechnung
- Zinsberechnungen
- Wirtschaftliche Analysen

### **Engineering**
- Einheitenumrechnung
- Gleichungslösungen
- Batch-Verarbeitung

Die Calculation Tools bieten eine umfassende mathematische Tool-Sammlung mit robustem Fehlerhandling und sicherer Ausdrucksauswertung für das ERP-KI-System.

Basierend auf der analysierten `databaseTools.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🗄️ **Database Tools - Hauptfunktionen**

### **Registrierte Tools**
- `scan_databases` - Scan nach Datenbanken
- `inspect_database` - Datenbank-Metadaten
- `query_database` - Flexible Datenbankabfragen
- `check_indices` - Index-Überprüfung
- `analyze_database` - Performance-Analyse

## 🔧 **Tool Interface**

### **Hauptexport**
```typescript
export function registerTools(toolRegistry: { register: (name: string, fn: ToolFunction) => void })
```

## 📋 **Tool-Details**

### **1. Scan Databases Tool**
```typescript
scan_databases({ directory?: string })
```
**Funktionalität**: Durchsucht Verzeichnisse rekursiv nach Datenbanken  
**Unterstützte Formate**:
- SQLite: `.db`, `.sqlite`, `.sqlite3`
- JSON: `.json`
- CSV: `.csv`

**Response**:
```typescript
{
  success: boolean,
  directory: string,
  databases: string[],
  count: number
}
```

### **2. Inspect Database Tool**
```typescript
inspect_database({ file: string })
```
**Unterstützte Datenbanktypen**:

#### **SQLite**
- Tabellenliste
- Spalteninformationen
- Index-Metadaten

#### **JSON**
- Schlüssel-Struktur
- Beispiel-Datensatz

#### **CSV**
- Spalten-Header
- Dateistruktur

**Response**:
```typescript
{
  success: boolean,
  file: string,
  meta: Record<string, any>,
  tableCount?: number,
  type?: string,
  keys?: string[],
  sample?: any,
  columns?: string[]
}
```

### **3. Query Database Tool**
```typescript
query_database({ 
  file?: string, 
  query: string, 
  params?: any[], 
  connectionString?: string, 
  type?: 'sqlite' | 'postgres' | 'mysql' | 'json' 
})
```
**Unterstützte Datenbanksysteme**:

#### **SQLite**
- Dateibasierte Abfragen
- Parameterisierte Queries

#### **PostgreSQL**
- Connection String Unterstützung
- Native pg Treiber

#### **MySQL**
- MySQL2 Treiber
- Promise-basierte API

#### **JSON**
- Einfache SELECT-Operationen
- Direkte JSON-Verarbeitung

**Response**:
```typescript
{
  success: boolean,
  count: number,
  results: any[]  // Begrenzt auf 100 Datensätze
}
```

### **4. Check Indices Tool**
```typescript
check_indices({ file: string })
```
**Funktionalität** (nur SQLite):
- Tabellen-Indizes auflisten
- Spaltenanzahl pro Tabelle
- Index-Statistiken

**Response**:
```typescript
{
  success: boolean,
  results: Array<{
    table: string,
    indices: any[],
    columnCount: number
  }>,
  totalIndices: number
}
```

### **5. Analyze Database Tool**
```typescript
analyze_database({ file: string })
```
**Performance-Metriken** (nur SQLite):
- Datenbank-Statistiken
- Page Size und Page Count
- Freelist Information
- Geschätzte Datenbankgröße

**Response**:
```typescript
{
  success: boolean,
  stats: any[],
  pageSize: number,
  pageCount: number,
  freelist: number,
  approxSizeMB: string
}
```

## 🔌 **Datenbank-Treiber Unterstützung**

### **Dynamische Treiber-Ladung**
- **SQLite**: `better-sqlite3` (priorisiert) oder `sqlite3`
- **PostgreSQL**: `pg` Treiber
- **MySQL**: `mysql2/promise` Treiber

### **Graceful Degradation**
- Fehlende Treiber werfen informative Fehler
- Tools funktionieren auch ohne alle Treiber
- Flexible Abhängigkeitsverwaltung

## 🛡️ **Sicherheitsfeatures**

### **SQL Injection Protection**
- **Parameterized Queries**: Unterstützung für Prepared Statements
- **Read-Only Mode**: SQLite-Datenbanken werden read-only geöffnet
- **Query Validation**: Eingabevalidierung

### **Dateisystem-Sicherheit**
- **Path Resolution**: Absolute Pfad-Konvertierung
- **File Type Validation**: Datenbank-Format-Erkennung
- **Error Handling**: Robuste Fehlerbehandlung

## 🔍 **Datenbank-Erkennung**

### **SQLite Detection**
```typescript
isSQLiteDatabase(filePath: string): boolean
```
- **Magic Number Check**: Prüft SQLite Header
- **File Signature**: Erkennt echte SQLite-Dateien

### **Format-Erkennung**
- Dateiendungs-basierte Erkennung
- Content-basierte Validierung
- Flexible Typ-Inferenz

## 📊 **Metadaten-Extraktion**

### **SQLite Metadaten**
- `sqlite_master` Tabelle
- `PRAGMA table_info()`
- `PRAGMA index_list()`

### **JSON Strukturanalyse**
- Automatische Schlüssel-Erkennung
- Beispiel-Datensatz Extraktion
- Array vs. Object Unterscheidung

### **CSV Header-Parsing**
- Spaltennamen-Extraktion
- Erste Zeilen-Analyse
- Format-Validierung

## 🎯 **Use Cases**

### **Datenbank-Exploration**
- Automatische Datenbank-Erkennung
- Schema-Analyse und -Dokumentation
- Datenbank-Inventur

### **Datenanalyse**
- Flexible Abfragen über multiple Datenbanktypen
- Ad-hoc Datenbankoperationen
- Performance-Monitoring

### **Development & Debugging**
- Datenbank-Struktur-Verifikation
- Index-Optimierung
- Query-Performance-Analyse

### **Data Migration**
- Cross-Database Kompatibilität
- Schema-Vergleiche
- Datenbank-Health-Checks

## 🔄 **Integration**

### **Tool Registry Compatibility**
- Standardisiertes ToolFunction Interface
- Konsistente Response-Formate
- Einheitliche Error-Handling

### **Multi-Database Support**
- **SQLite**: Vollständige Unterstützung
- **PostgreSQL**: Basis-Operationen
- **MySQL**: Basis-Operationen
- **JSON/CSV**: Einfache Dateibasierte Operationen

Die Database Tools bieten eine umfassende Datenbank-Management-Lösung mit Multi-Database-Unterstützung, robustem Fehlerhandling und erweiterten Analyse-Funktionen für das ERP-KI-System.

Basierend auf der analysierten `erpTools.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🏢 **ERP Tools - Hauptfunktionen**

### **Registrierte Tools**
- `create_order` - Bestellung anlegen
- `list_orders` - Bestellungen abrufen
- `check_inventory` - Lagerbestand prüfen
- `list_invoices` - Rechnungen abrufen
- `create_invoice` - Rechnung erstellen

## 🔧 **Tool Interface**

### **Hauptexport**
```typescript
export function registerTools(toolRegistryInstance: typeof toolRegistry)
```

## 📋 **Tool-Details**

### **1. Create Order Tool**
```typescript
create_order({ 
  customer: string, 
  products: Array<{ name: string; price: number; quantity: number }>, 
  deliveryDate?: string, 
  database?: string, 
  status?: string 
})
```

**Funktionalität**:
- Legt neue Bestellung in ERP-Datenbank an
- Berechnet automatisch Gesamtsumme
- Erstellt Orders-Tabelle falls nicht vorhanden

**Response**:
```typescript
{
  success: boolean,
  message: string,
  total: number,
  products: Array,
  status: string,
  createdAt: string,
  database: string
}
```

### **2. List Orders Tool**
```typescript
list_orders({ 
  database?: string, 
  limit?: number, 
  status?: string 
})
```

**Funktionalität**:
- Listet Bestellungen ab
- Optional nach Status filtern
- Standard-Limit: 25 Einträge

**Response**:
```typescript
{
  success: boolean,
  orders: Array,
  count: number,
  filter: { status?: string },
  database: string
}
```

### **3. Check Inventory Tool**
```typescript
check_inventory({ 
  product: string, 
  database?: string 
})
```

**Funktionalität**:
- Sucht Produkte im Lagerbestand
- Unterstützt Teilbegriff-Suche
- Erstellt Inventory-Tabelle falls nicht vorhanden

**Response**:
```typescript
{
  success: boolean,
  matches: Array,
  count: number,
  product: string,
  database: string
}
```

### **4. List Invoices Tool**
```typescript
list_invoices({ 
  database?: string, 
  status?: string 
})
```

**Funktionalität**:
- Listet Rechnungen ab
- Optional nach Status filtern
- Sortiert nach Datum (neueste zuerst)

**Response**:
```typescript
{
  success: boolean,
  invoices: Array,
  count: number,
  database: string
}
```

### **5. Create Invoice Tool**
```typescript
create_invoice({ 
  orderId: number, 
  amount: number, 
  status?: string, 
  database?: string 
})
```

**Funktionalität**:
- Erstellt Rechnung zu bestehendem Auftrag
- Automatische Zeitstempel-Erfassung
- Erstellt Invoices-Tabelle falls nicht vorhanden

**Response**:
```typescript
{
  success: boolean,
  message: string,
  amount: number,
  status: string,
  date: string,
  database: string
}
```

## 🏗️ **Datenbank-Schema**

### **Orders Tabelle**
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer TEXT,
  total REAL,
  status TEXT,
  delivery_date TEXT,
  created_at TEXT
);
```

### **Inventory Tabelle**
```sql
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product TEXT,
  stock INTEGER,
  updated_at TEXT
);
```

### **Invoices Tabelle**
```sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  amount REAL,
  status TEXT,
  date TEXT
);
```

## 🔄 **Automatische Tabellen-Erstellung**

### **Ensure Table Funktion**
```typescript
ensureTable(dbFile: string, tableName: string, ddl: string): Promise<void>
```

**Funktionalität**:
- Prüft Tabellen-Existenz
- Erstellt Tabelle falls nicht vorhanden
- Verwendet Tool Registry für Datenbankoperationen

## 🔍 **Datenbank-Discovery**

### **Primary Database Detection**
```typescript
findPrimaryDatabase(): Promise<string | null>
```

**Suchlogik**:
- Durchsucht `./data/` Verzeichnis
- Findet erste SQLite-Datei (`.db`, `.sqlite`, `.sqlite3`)
- Fallback auf benutzerdefinierte Datenbank-Pfade

## ⚙️ **Standardwerte & Konfiguration**

### **Order Status Werte**
- `offen` - Standardstatus
- `abgeschlossen` - Abgeschlossene Bestellung
- `storniert` - Stornierte Bestellung

### **Invoice Status Werte**
- `offen` - Standardstatus
- `bezahlt` - Bezahlte Rechnung

### **Limit Settings**
- `limit: 25` - Standard für List-Operations

## 🛡️ **Validierung & Fehlerbehandlung**

### **Input Validation**
- **Customer**: Pflichtfeld
- **Products**: Nicht-leeres Array erforderlich
- **OrderId**: Numerische ID erforderlich
- **Amount**: Numerischer Betrag erforderlich

### **Error Handling**
- **Datenbank nicht gefunden**: Klare Fehlermeldung
- **Tabellen-Erstellung**: Automatisches Fallback
- **Parameter-Validierung**: Strukturierte Fehlerresponses

## 🔄 **Tool Registry Integration**

### **Database Tool Dependency**
- Nutzt `query_database` Tool für alle DB-Operationen
- Konsistente Error-Handling über Registry
- Einheitliche Response-Formate

### **Response Standardisierung**
```typescript
{
  success: boolean,
  data?: any,
  error?: string,
  message?: string,
  database?: string
}
```

## 🎯 **ERP Use Cases**

### **Bestellmanagement**
- Neue Kundenaufträge erfassen
- Bestellstatus verwalten
- Liefertermine tracken

### **Lagerverwaltung**
- Produktverfügbarkeit prüfen
- Lagerbestände abfragen
- Inventar-Management

### **Rechnungsstellung**
- Rechnungen zu Aufträgen erstellen
- Rechnungsstatus verwalten
- Finanztransaktionen tracken

### **Reporting & Analytics**
- Bestellübersichten
- Rechnungslisten
- Lagerbestandsreports

## 📊 **Business Logic**

### **Automatische Berechnungen**
- **Order Total**: `price * quantity` Summierung
- **Timestamps**: Automatische Erfassung von created_at/updated_at
- **Status Management**: Konsistente Status-Werte

### **Datenintegrität**
- **Foreign Key Relationships**: Order-ID in Rechnungen
- **Consistent Formatting**: ISO-Datumsformate
- **Data Validation**: Pflichtfeld-Prüfungen

Die ERP Tools bieten eine vollständige ERP-Funktionalität mit Fokus auf Bestellmanagement, Lagerverwaltung und Rechnungsstellung, integriert in das KI-System mit robustem Fehlerhandling und automatischer Datenbank-Initialisierung.

Basierend auf der analysierten `fileTools.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 📁 **File Tools - Hauptfunktionen**

### **Registrierte Tools**
- `read_file` - Datei lesen
- `write_file` - Datei schreiben
- `list_files` - Dateien auflisten
- `file_info` - Datei-Informationen
- `delete_file` - Datei löschen
- `parse_file` - Datei analysieren
- `compress_file` - Datei komprimieren
- `file_permissions` - Berechtigungen anzeigen

## 🔧 **Tool Interface**

### **Hauptexport**
```typescript
export function registerTools(toolRegistry: { register: (name: string, fn: ToolFunction) => void })
```

## 📋 **Tool-Details**

### **1. Read File Tool**
```typescript
read_file({ filepath: string, encoding?: BufferEncoding })
```

**Funktionalität**:
- Liest Datei-Inhalt
- Liefert Metadaten (Größe, Änderungsdatum)
- Unterstützt verschiedene Encodings

**Response**:
```typescript
{
  success: boolean,
  filepath: string,
  encoding: string,
  size: number,
  modified: Date,
  content: string | Buffer
}
```

### **2. Write File Tool**
```typescript
write_file({ 
  filepath: string, 
  content: string | Buffer, 
  encoding?: BufferEncoding, 
  append?: boolean 
})
```

**Funktionalität**:
- Schreibt oder appended Datei-Inhalt
- Erstellt Verzeichnisse automatisch
- Liefert Schreib-Statistiken

**Response**:
```typescript
{
  success: boolean,
  filepath: string,
  mode: 'write' | 'append',
  size: number,
  modified: Date
}
```

### **3. List Files Tool**
```typescript
list_files({ 
  directory: string, 
  recursive?: boolean, 
  pattern?: string, 
  includeHidden?: boolean 
})
```

**Funktionalität**:
- Rekursives Datei-Scanning
- Regex-Filterung
- Versteckte Dateien optional

**Response**:
```typescript
{
  success: boolean,
  directory: string,
  count: number,
  files: string[]
}
```

### **4. File Info Tool**
```typescript
file_info({ filepath: string, hash?: boolean })
```

**Funktionalität**:
- Detaillierte Datei-Metadaten
- Optional SHA-256 Checksumme
- Dateityp-Erkennung

**Response**:
```typescript
{
  success: boolean,
  filepath: string,
  size: number,
  created: Date,
  modified: Date,
  isDirectory: boolean,
  isFile: boolean,
  checksum?: string
}
```

### **5. Delete File Tool**
```typescript
delete_file({ filepath: string })
```

**Funktionalität**:
- Sicheres Datei-Löschen
- Pfad-Validierung
- Erfolgsbestätigung

**Response**:
```typescript
{
  success: boolean,
  filepath: string,
  message: string
}
```

### **6. Parse File Tool**
```typescript
parse_file({ filepath: string })
```

**Funktionalität**:
- Automatische Format-Erkennung
- JSON-Parsing
- CSV-Erkennung
- Text-Fallback

**Response**:
```typescript
{
  success: boolean,
  filepath: string,
  type: 'json' | 'csv_like' | 'text',
  data: any
}
```

### **7. Compress File Tool**
```typescript
compress_file({ filepath: string })
```

**Funktionalität**:
- Gzip-Kompression
- Kompressions-Ratio Berechnung
- `.gz` Datei-Erstellung

**Response**:
```typescript
{
  success: boolean,
  filepath: string,  // Komprimierte Datei
  original: string,  // Original-Datei
  ratio: string      // Kompressionsverhältnis
}
```

### **8. File Permissions Tool**
```typescript
file_permissions({ filepath: string })
```

**Funktionalität**:
- Berechtigungen im Octal-Format
- Lese-/Schreib-Rechte Prüfung
- Besitzer-Information

**Response**:
```typescript
{
  success: boolean,
  filepath: string,
  permissions: string,  // z.B. "644"
  owner: string,
  readable: boolean,
  writable: boolean
}
```

## 🛡️ **Sicherheitsfeatures**

### **Path Security**
- **Path Resolution**: `path.resolve()` für absolute Pfade
- **Directory Traversal Protection**: Verhindert ../ Angriffe
- **Access Validation**: Prüfung von Lese-/Schreib-Rechten

### **Input Validation**
- **File Existence**: Prüfung vor Operationen
- **Encoding Support**: Flexible Zeichenkodierungen
- **Buffer Handling**: Binärdaten Unterstützung

## 🔄 **Erweiterte Funktionalitäten**

### **Rekursives Directory Scanning**
- **Tiefe Verzeichnis-Durchsuchung**
- **Performance-optimiert**: Asynchrone Verarbeitung
- **Flexible Filter**: Regex und Hidden Files

### **Automatische Format-Erkennung**
- **JSON Detection**: `{...}` oder `[...]` Patterns
- **CSV Detection**: Komma/Semikolon-getrennte Daten
- **Text Fallback**: Plain Text als Default

### **Checksum & Hashing**
- **SHA-256 Support**: Sichere Hash-Berechnung
- **Integrity Verification**: Datei-Integritätsprüfung
- **Binary Safe**: Arbeitet mit allen Dateitypen

## 📊 **Metadaten-Erfassung**

### **File Statistics**
- **Size**: Dateigröße in Bytes
- **Timestamps**: Creation & Modification Dates
- **File Type**: Directory/File Unterscheidung

### **Permissions & Ownership**
- **Octal Permissions**: Unix-style Berechtigungen
- **Access Rights**: Read/Write Verfügbarkeit
- **Owner Info**: System-Benutzerinformation

## 🎯 **Use Cases**

### **Datei-Management**
- Automatische Datei-Operationen
- Batch-Verarbeitung von Dateien
- Verzeichnis-Organisation

### **Daten-Import/Export**
- JSON/CSV Datei-Parsing
- Datenkonvertierung
- Format-Transformation

### **System-Administration**
- Berechtigungs-Management
- Datei-Integritätsprüfung
- Storage-Optimierung durch Kompression

### **Backup & Archiving**
- Automatische Kompression
- Checksum-Validierung
- Datei-Sicherung

## 🔧 **Technische Integration**

### **Node.js Core Modules**
- `fs`: Dateisystem-Operationen
- `path`: Pfad-Manipulation
- `crypto`: Hash-Berechnungen
- `zlib`: Kompressions-Funktionalität
- `os`: System-Informationen

### **Performance Optimizations**
- **Async/Await**: Nicht-blockierende Operationen
- **Streaming Ready**: Für große Dateien erweiterbar
- **Memory Efficient**: Buffer-basierte Verarbeitung

### **Error Handling**
- **Structured Errors**: Konsistente Fehlerresponses
- **Graceful Degradation**: Fehlertolerante Operationen
- **Detailed Logging**: Umfassende Fehlerinformationen

Die File Tools bieten eine umfassende Dateisystem-Management-Lösung mit erweiterten Analyse-Funktionen, robustem Sicherheitsdesign und flexibler Integration in das ERP-KI-System.

Basierend auf der analysierten `helpers.ts` Datei, hier sind die erkannten Funktionen und Routen:

Basierend auf der analysierten `tools/index.ts` Datei, hier sind die erkannten Funktionen und Features:

## 🧰 **Tools Index System - Hauptfunktionen**

### **Tool-Loading Kernfunktionen**
- `loadAllTools()` - Lädt alle Tools automatisch
- `scanToolFiles()` - Rekursives Datei-Scanning
- `importToolModule()` - Dynamisches Modul-Import
- `isToolModule()` - Tool-Datei-Validierung

### **Registry Management**
- `toolRegistry` - Zentrale Tool-Registrierung

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Automatisches Tool-Loading**
```typescript
loadAllTools(filter?: string[], recursive = true)
```
**Features**:
- **Filter-Option**: Lädt nur bestimmte Module (z.B. `['file', 'erp']`)
- **Rekursiv-Scan**: Durchsucht Unterverzeichnisse
- **Progress-Logging**: Anzahl geladener Module
- **Registry-Rückgabe**: ToolRegistry Instanz

### **2. Intelligentes Datei-Scanning**
```typescript
scanToolFiles(dir: string, recursive = true): Promise<string[]>
```
**Filterkriterien**:
- Dateiendungen: `.ts` oder `.js`
- Ausschluss: `registry`, `index`, versteckte Dateien
- Rekursiv: Optionale Unterverzeichnis-Durchsuchung

### **3. Dynamisches Modul-Import**
```typescript
importToolModule(filePath: string)
```
**Anforderungen**:
- Muss `registerTools()` Funktion exportieren
- Erhält `toolRegistry` als Parameter
- Fehlertolerantes Loading mit Error-Handling

### **4. Tool-Modul-Validierung**
```typescript
isToolModule(filename: string): boolean
```
**Ausschlusskriterien**:
- `registry.*` - Registry-Dateien
- `index.*` - Index-Dateien  
- `.*` - Versteckte Dateien
- Nur `.ts` und `.js` Dateien

## ⚙️ **Konfiguration & Umgebungsvariablen**

### **Loading-Verhalten**
- `AI_AUTOLOAD_TOOLS="0"` - Deaktiviert automatisches Loading
- Standard: Automatisches Loading aktiv

### **Development Features**
- `NODE_ENV="development"` + `AI_HOT_RELOAD="1"` - Aktiviert Hot-Reload
- `AI_HOT_RELOAD_INTERVAL` - Reload-Intervall (Default: 10000ms)

## 🔄 **Hot-Reload System**

### **Development-Modus**
```typescript
setInterval(async () => {
  toolRegistry.clear();
  await loadAllTools();
}, reloadInterval);
```
**Features**:
- **Registry-Clearing**: Vor jedem Reload
- **Neuladen**: Alle Tools werden reloaded
- **Intervall-basiert**: Konfigurierbare Frequenz

## 🎯 **Use Cases**

### **Produktions-Bootstrapping**
- Automatisches Tool-Registration beim Server-Start
- Filterung nach Tool-Typen (z.B. nur ERP-Tools)
- Statische Tool-Loading ohne Hot-Reload

### **Development Workflow**
- Hot-Reload bei Code-Änderungen
- Schnelles Testing neuer Tools
- Dynamische Tool-Entwicklung

### **Modulare Tool-Architektur**
- Plug-and-Play Tool-Erweiterungen
- Unabhängige Tool-Entwicklung
- Automatische Discovery

## 🔧 **Integration**

### **Tool-Modul-Standard**
```typescript
// Jedes Tool-Modul muss exportieren:
export function registerTools(registry: ToolRegistry) {
  registry.register('tool-name', toolFunction);
}
```

### **Registry-Kompatibilität**
- Direkte `toolRegistry` Integration
- Konsistente Registrierungs-API
- TypeScript volle Unterstützung

### **Build-System Kompatibilität**
- **ESM Support**: `import.meta.url` für Pfad-Auflösung
- **TypeScript**: `.ts` und `.js` Dateien
- **Cross-Platform**: URL/Pfad-Konvertierung

## 📊 **Monitoring & Logging**

### **Lade-Statistiken**
- Anzahl gefundener Tool-Dateien
- Erfolgreich geladene Module
- Fehlgeschlagene Imports
- Finale Tool-Count

### **Fehlerbehandlung**
- Graceful Degradation bei Fehlern
- Detailierte Fehlermeldungen
- Weiterbetrieb bei partiellen Fehlern

Das Tools Index System bietet ein robustes, dynamisches Loading-System für KI-Tools mit Support für Entwicklung-Workflows, Produktions-Betrieb und modulare Erweiterbarkeit im ERP-KI-Backend.

Basierend auf der analysierten `registry.ts` Datei, hier sind die erkannten Funktionen und Features:

## 🧰 **Tool Registry System - Hauptfunktionen**

### **Tool-Management Kernfunktionen**
- `register()` - Registriert Tools mit Metadaten
- `unregister()` - Entfernt Tools
- `has()` - Prüft Tool-Existenz
- `get()` - Ruft Tool-Funktion ab
- `clear()` - Löscht gesamte Registry
- `count()` - Gibt Tool-Anzahl zurück
- `list()` - Listet alle Tool-Namen

### **Tool-Ausführung & Sicherheit**
- `call()` - Führt Tools sicher aus (mit Timeout)
- `routeAnyToAny()` - Any-to-Any Routing zwischen Tools

### **Tool-Discovery & Metadaten**
- `getToolDefinitions()` - Alle Tool-Definitionen
- `getToolsByCategory()` - Tools nach Kategorien gruppiert
- `findTools()` - Sucht Tools nach Keywords
- `getAliases()` - Gibt Alias-Mapping zurück

### **Event-System & Hooks**
- `on()` - Event-Listener registrieren
- `emit()` - Events auslösen

### **Import/Export & Persistenz**
- `exportRegistry()` - Exportiert Registry-Zustand
- `importRegistry()` - Importiert Registry-Zustand

### **Debugging & Monitoring**
- `debugPrint()` - Konsolenausgabe aller Tools
- `getRegistryInfo()` - Registry-Statistiken

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Tool-Registrierung**
```typescript
register(name: string, fn: ToolFunction, alias?: string | string[]): void
```
**Metadaten-Support**:
- `description` - Tool-Beschreibung
- `parameters` - Parameter-Definition
- `category` - Tool-Kategorie
- `version` - Versionsnummer
- `restricted` - Zugriffsbeschränkung
- `registeredAt` - Registrierungszeitpunkt

### **2. Sichere Tool-Ausführung**
```typescript
call(name: string, params: Record<string, any> = {}, opts: { timeout?: number; sandbox?: boolean; source?: string } = {}): Promise<any>
```
**Sicherheitsfeatures**:
- **Timeout-Support**: Verhindert hängende Tools
- **Alias-Auflösung**: Unterstützt Tool-Aliase
- **Event-Hooks**: `beforeCall` und `afterCall` Events
- **Error-Handling**: Strukturierte Fehlerbehandlung

### **3. Event-System**
**Unterstützte Events**:
- `register` - Bei Tool-Registrierung
- `unregister` - Bei Tool-Entfernung
- `beforeCall` - Vor Tool-Ausführung
- `afterCall` - Nach Tool-Ausführung
- `clear` - Bei Registry-Clear

### **4. Tool-Discovery & Suche**
```typescript
findTools(keyword: string): string[]
```
**Suchkriterien**:
- Tool-Name
- Beschreibung
- Kategorie
- Case-Insensitive

### **5. Any-to-Any Routing**
```typescript
routeAnyToAny(source: string, target: string, payload: any)
```
**Use Case**: Tool-Komposition und Workflows

## 🏗️ **Typdefinitionen**

### **ToolFunction Type**
```typescript
type ToolFunction = ((params?: Record<string, any>) => Promise<any>) & {
  description?: string;
  parameters?: Record<string, any>;
  category?: string;
  version?: string;
  restricted?: boolean;
  registeredAt?: string;
};
```

### **ToolMetadata Interface**
```typescript
interface ToolMetadata {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  category?: string;
  version?: string;
  restricted?: boolean;
  registeredAt?: string | null;
}
```

## ⚙️ **Registry-Metadaten**

### **System-Informationen**
- `version`: "2.7" (Registry-Version)
- `lastUpdated`: ISO-Zeitstempel der letzten Änderung

## 🔧 **Erweiterte Features**

### **Alias-Support**
- Mehrere Aliase pro Tool möglich
- Alias-Auflösung bei Aufrufen
- Getrennte Alias-Verwaltung

### **Asynchrone Registrierung**
```typescript
registerAsync(name: string, fnPromise: Promise<ToolFunction>, alias?: string): Promise<void>
```
Für dynamische Tool-Loading-Szenarien

### **Kategorie-Management**
- Automatische Gruppierung nach Kategorien
- Default-Kategorie: "general"
- Uncategorized Fallback

## 🛡️ **Sicherheitsfeatures**

### **Tool-Validierung**
- Funktions-Typ-Prüfung bei Registrierung
- Parameter-Validierung
- Restricted-Flag für Zugriffskontrolle

### **Ausführungs-Sicherheit**
- Timeout-Protection
- Error-Boundaries
- Sandbox-Option (vorbereitet)

## 📊 **Monitoring & Debugging**

### **Strukturierte Informationen**
```typescript
getRegistryInfo(): {
  totalTools: number;
  lastUpdated: string;
  version: string;
  categories: string[];
  aliases: Record<string, string>;
}
```

### **Debug-Ausgabe**
- Tabellarische Konsolenausgabe
- Tool-Übersicht mit allen Metadaten
- Fehlermeldungen bei leerer Registry

## 🔄 **Persistenz & Migration**

### **Export/Import Format**
```typescript
exportRegistry(): {
  meta: { version: string; lastUpdated: string };
  tools: ToolMetadata[];
  aliases: Record<string, string>;
}
```

### **Import-Kompatibilität**
- Validierung des Import-Formats
- Metadaten-Erhaltung
- Alias-Wiederherstellung

## 🎯 **Use Cases**

### **KI-Tool-Management**
- Dynamische Tool-Registrierung
- Tool-Metadaten für KI-Prompts
- Sichere Tool-Ausführung

### **Workflow-Integration**
- Tool-Chaining über Any-to-Any
- Event-basierte Workflows
- Tool-Komposition

### **Developer Experience**
- Hot-Reload Support
- Debugging-Tools
- Metadaten-Export für Dokumentation

Die Tool Registry bietet ein umfassendes, sicheres und erweiterbares Tool-Management-System für das ERP-KI-Backend mit Fokus auf Developer Experience, Sicherheit und Integration.

Basierend auf der analysierten `systemTools.ts` Datei, hier sind die erkannten Funktionen und Features:

## 🖥️ **System Tools - Registrierte Tools**

### **System-Information & Monitoring**
- `get_system_info` - Vollständige Systeminformationen
- `get_system_load` - CPU- und Speicherlast-Analyse
- `system_summary` - Kompakte System-Zusammenfassung

### **Prozess-Diagnose & Laufzeit**
- `runtime_diagnostics` - Prozesslaufzeit- und Speichermetriken
- `list_top_processes` - Laufende Prozesse mit CPU/RAM-Auslastung

### **Sicherheit & Integrität**
- `check_system_permissions` - Benutzer- und Schreibrechte-Prüfung
- `system_health_check` - Allgemeiner Systemzustand (Health Check)

## 📋 **Detailierte Tool-Beschreibungen**

### **1. Get System Info**
```typescript
get_system_info(params?: { section?: string })
```
**Unterstützte Sections**:
- `cpu` - CPU-Informationen und Load Average
- `memory` - Speicher-Informationen
- `network` - Netzwerk-Interfaces
- `process` - Prozess-Informationen
- `os` - Betriebssystem-Details

**Ausgabe**: Vollständige Systemmetriken oder gefilterte Sections

### **2. System Load Analysis**
```typescript
get_system_load()
```
**Gelieferte Metriken**:
- CPU-Modell und Anzahl
- Load Average (1, 5, 15 Minuten)
- Speicher-Auslastung in Prozent
- Status-Bewertung (ok/hoch/kritisch)

### **3. Runtime Diagnostics**
```typescript
runtime_diagnostics()
```
**Prozess-Informationen**:
- PID und Node.js Version
- Uptime und Executable-Pfad
- Detaillierte Speichernutzung (RSS, Heap, External)
- CPU-Verbrauch (User/System)

### **4. System Permissions Check**
```typescript
check_system_permissions()
```
**Geprüfte Rechte**:
- Benutzer-Information (Username, UID, GID)
- Home-Verzeichnis und Shell
- Schreibrechte im Temp-Verzeichnis

### **5. System Health Check**
```typescript
system_health_check()
```
**Health-Bewertung**:
- `healthy`: Boolean (Gesamtstatus)
- `metrics`: Load, Memory, Disk, Uptime
- `status`: ok/hoch/kritisch

### **6. System Summary**
```typescript
system_summary()
```
**Kompakte Übersicht**:
- System-Typ und Version
- Hostname und CPU-Count
- Load Average und Memory Usage
- Uptime in Stunden

### **7. Top Processes List**
```typescript
list_top_processes()
```
**Plattform-spezifisch**:
- **Windows**: `tasklist` Befehl
- **Unix/Linux**: `ps -eo pid,comm,%cpu,%mem` (Top 10)
- **Fehlerbehandlung**: Graceful Degradation

## 🛡️ **Sicherheitsfeatures**

### **Sensible Daten-Filterung**
- **Umgebungsvariablen**: Automatisches Filtern von Passwörtern, Tokens, Secrets
- **Benutzerinformationen**: Sichere Darstellung ohne kritische Daten

### **Permission Checking**
- **Schreibrechte-Test**: Praktische Prüfung mit Testdatei
- **Temp-Dir Zugriff**: Validierung des temporären Dateizugriffs

## 📊 **Monitoring & Metriken**

### **CPU-Monitoring**
- Load Average Interpretation
- CPU-Count basierte Thresholds
- Prozess-spezifische CPU-Nutzung

### **Memory-Monitoring**
- Gesamtspeicher vs. Freier Speicher
- Prozess-spezifische Heap-Nutzung
- Prozentuale Auslastungsberechnung

### **System-Health Scoring**
- **Memory Threshold**: 90% kritisch, 70% hoch
- **Load Threshold**: CPU-Count * 2
- **Disk Health**: Temp-Verzeichnis Existenz

## 🔧 **Plattform-Kompatibilität**

### **Cross-Platform Support**
- **OS Detection**: `process.platform` für Windows/Unix
- **Command Adaptation**: Unterschiedliche Befehle für Prozessliste
- **Path Handling**: Konsistente Pfadtrennung

### **Node.js Integration**
- `os` Modul für Systeminformationen
- `process` Modul für Laufzeitmetriken
- `fs` Modul für Dateisystem-Checks

## 🎯 **Use Cases**

### **KI-System Monitoring**
- Resource-Usage für KI-Modelle
- Memory-Limits für große Language Models
- CPU-Auslastung für Parallel-Verarbeitung

### **DevOps & Deployment**
- Health-Checks für Container
- Resource-Monitoring für Skalierung
- Permission-Validation für Services

### **Debugging & Troubleshooting**
- Performance-Probleme identifizieren
- Resource-Bottlenecks erkennen
- System-Konfiguration validieren

## 📈 **Metriken & Status-Bewertung**

### **Automatische Status-Bewertung**
```typescript
status: {
  cpu: load[0] > cpus.length ? "hoch" : "normal",
  memory: memUsed > 85 ? "kritisch" : memUsed > 70 ? "hoch" : "ok"
}
```

### **Health Check Logik**
```typescript
healthy: memUsage < 90 && load < os.cpus().length * 2 && diskOk
```

Die System Tools bieten ein umfassendes Monitoring- und Diagnose-Toolset für das ERP-KI-Backend mit Fokus auf Performance-Überwachung, Sicherheitschecks und System-Integrität.

