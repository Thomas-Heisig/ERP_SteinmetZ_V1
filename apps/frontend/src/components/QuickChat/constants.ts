import { QuickAction, Settings } from "./types";

/* ==================== QUICK ACTIONS ==================== */
export const QUICK_ACTIONS: QuickAction[] = [
  // Text-Aufgaben
  {
    id: "summarize",
    name: "Zusammenfassen",
    prompt:
      "Bitte fasse den folgenden Text prägnant zusammen und hebe die Kernaussagen hervor:",
    category: "text",
    icon: "📝",
    description: "Komplexen Text zu Kernpunkten reduzieren",
    tags: ["text", "analysis", "compression"],
    popularity: 95,
    usageCount: 0,
    variables: [
      {
        name: "length",
        type: "string",
        description: "Länge der Zusammenfassung",
        required: false,
        default: "mittel",
      },
    ],
  },
  {
    id: "rewrite",
    name: "Umschreiben",
    prompt:
      "Bitte formuliere den folgenden Text professionell um, behalte die Bedeutung bei aber verbessere Ausdruck und Struktur:",
    category: "text",
    icon: "✍️",
    description: "Text stilistisch verbessern",
    tags: ["text", "writing", "style"],
    popularity: 85,
    usageCount: 0,
    variables: [
      {
        name: "style",
        type: "string",
        description: "Schreibstil",
        required: false,
        default: "professionell",
      },
    ],
  },
  {
    id: "expand",
    name: "Erweitern",
    prompt:
      "Bitte erweitere den folgenden Text um zusätzliche Details, Beispiele und Erklärungen:",
    category: "text",
    icon: "🔍",
    description: "Mehr Tiefe in den Text bringen",
    tags: ["text", "expansion", "details"],
    popularity: 75,
    usageCount: 0,
  },

  // Analyse-Aufgaben
  {
    id: "analyze",
    name: "Analysieren",
    prompt:
      "Analysiere den folgenden Text kritisch und identifiziere Hauptargumente, Schwächen, Stärken und mögliche Verbesserungen:",
    category: "analysis",
    icon: "🔎",
    description: "Tiefgehende Textanalyse",
    tags: ["analysis", "critical", "evaluation"],
    popularity: 80,
    usageCount: 0,
  },
  {
    id: "sentiment",
    name: "Stimmung analysieren",
    prompt:
      "Analysiere die emotionale Stimmung und den Unterton im folgenden Text:",
    category: "analysis",
    icon: "😊",
    description: "Emotionale Bewertung",
    tags: ["analysis", "emotion", "sentiment"],
    popularity: 70,
    usageCount: 0,
  },
  {
    id: "structure",
    name: "Strukturieren",
    prompt:
      "Strukturiere den folgenden Text in eine klare Gliederung mit Haupt- und Unterpunkten:",
    category: "analysis",
    icon: "📊",
    description: "Logische Gliederung erzeugen",
    tags: ["structure", "organization", "outline"],
    popularity: 65,
    usageCount: 0,
  },

  // Kreative Aufgaben
  {
    id: "brainstorm",
    name: "Brainstorming",
    prompt:
      "Generiere kreative Ideen und innovative Lösungsansätze für das folgende Thema:",
    category: "creative",
    icon: "💡",
    description: "Ideenfindung",
    tags: ["creative", "ideas", "innovation"],
    popularity: 90,
    usageCount: 0,
    variables: [
      {
        name: "ideaCount",
        type: "number",
        description: "Anzahl der Ideen",
        required: false,
        default: 5,
        min: 1,
        max: 20,
      },
    ],
  },
  {
    id: "story",
    name: "Geschichte schreiben",
    prompt:
      "Verwandle die folgenden Informationen in eine fesselnde Geschichte oder Erzählung:",
    category: "creative",
    icon: "📖",
    description: "Narratives Schreiben",
    tags: ["creative", "story", "narrative"],
    popularity: 60,
    usageCount: 0,
  },

  // Business-Aufgaben
  {
    id: "swot",
    name: "SWOT-Analyse",
    prompt:
      "Führe eine SWOT-Analyse (Stärken, Schwächen, Chancen, Risiken) für das folgende Vorhaben durch:",
    category: "business",
    icon: "📈",
    description: "Strategische Analyse",
    tags: ["business", "analysis", "strategy"],
    popularity: 85,
    usageCount: 0,
    suggestedModels: ["gpt-4", "gpt-4o"],
  },
  {
    id: "proposal",
    name: "Vorschlag erstellen",
    prompt:
      "Erstelle einen professionellen Geschäfts- bzw. Projektvorschlag basierend auf:",
    category: "business",
    icon: "💼",
    description: "Formeller Vorschlag",
    tags: ["business", "proposal", "professional"],
    popularity: 75,
    usageCount: 0,
  },

  // ERP-spezifisch
  {
    id: "erp-process",
    name: "ERP-Prozess beschreiben",
    prompt:
      "Beschreibe den optimalen ERP-Prozess für die nachfolgende Geschäftsanforderung:",
    category: "business",
    icon: "🏢",
    description: "ERP-Prozessoptimierung",
    tags: ["erp", "business", "process"],
    popularity: 70,
    usageCount: 0,
    suggestedModels: ["gpt-4", "gpt-4o"],
  },
  {
    id: "data-analysis",
    name: "Daten analysieren",
    prompt:
      "Analysiere die nachfolgenden Daten und identifiziere Muster, Trends und Erkenntnisse:",
    category: "analysis",
    icon: "📊",
    description: "Daten-Insights",
    tags: ["data", "analysis", "insights"],
    popularity: 80,
    usageCount: 0,
  },
  {
    id: "inventory-check",
    name: "Lagerbestand prüfen",
    prompt:
      "Überprüfe den Lagerbestand für folgende Produkte und schlage Bestellungen vor:",
    category: "business",
    icon: "📦",
    description: "Lagerverwaltung",
    tags: ["erp", "inventory", "business"],
    popularity: 65,
    usageCount: 0,
  },
  {
    id: "order-analysis",
    name: "Bestellungen analysieren",
    prompt:
      "Analysiere die folgenden Bestelldaten und identifiziere Trends, Muster und Optimierungspotential:",
    category: "business",
    icon: "📋",
    description: "Bestellanalyse",
    tags: ["erp", "orders", "analysis"],
    popularity: 70,
    usageCount: 0,
  },

  // Technische Aufgaben
  {
    id: "explain",
    name: "Technisch erklären",
    prompt:
      "Erkläre das folgende Konzept in einfachen, verständlichen Worten für ein Nicht-Techniker-Publikum:",
    category: "technical",
    icon: "⚙️",
    description: "Komplexes verständlich machen",
    tags: ["technical", "explanation", "simplify"],
    popularity: 85,
    usageCount: 0,
  },
  {
    id: "compare",
    name: "Vergleichen",
    prompt:
      "Vergleiche die folgenden Technologien und liste Vor- und Nachteile auf:",
    category: "technical",
    icon: "⚖️",
    description: "Technologie-Vergleich",
    tags: ["technical", "comparison", "evaluation"],
    popularity: 70,
    usageCount: 0,
  },
  {
    id: "tutorial",
    name: "Anleitung erstellen",
    prompt: "Erstelle eine Schritt-für-Schritt-Anleitung für folgende Aufgabe:",
    category: "technical",
    icon: "📋",
    description: "Detaillierte Anleitung",
    tags: ["technical", "tutorial", "guide"],
    popularity: 75,
    usageCount: 0,
  },
];

/* ==================== KATEGORIEN ==================== */
export const CATEGORIES = [
  {
    id: "all",
    name: "Alle Aktionen",
    icon: "⭐",
    description: "Alle verfügbaren Quick Actions",
    color: "#3B82F6",
    actions: QUICK_ACTIONS,
  },
  {
    id: "text",
    name: "Text",
    icon: "📝",
    description: "Textbearbeitung und -verbesserung",
    color: "#10B981",
    actions: QUICK_ACTIONS.filter((action) => action.category === "text"),
  },
  {
    id: "analysis",
    name: "Analyse",
    icon: "🔍",
    description: "Analytische Aufgaben und Bewertungen",
    color: "#8B5CF6",
    actions: QUICK_ACTIONS.filter((action) => action.category === "analysis"),
  },
  {
    id: "creative",
    name: "Kreativ",
    icon: "💡",
    description: "Kreative Ideen und Lösungen",
    color: "#F59E0B",
    actions: QUICK_ACTIONS.filter((action) => action.category === "creative"),
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    description: "Geschäftliche Anwendungen",
    color: "#EF4444",
    actions: QUICK_ACTIONS.filter((action) => action.category === "business"),
  },
  {
    id: "technical",
    name: "Technisch",
    icon: "⚙️",
    description: "Technische Erklärungen und Anleitungen",
    color: "#6B7280",
    actions: QUICK_ACTIONS.filter((action) => action.category === "technical"),
  },
];

/* ==================== STANDARD EINSTELLUNGEN ==================== */
export const DEFAULT_SETTINGS: Settings = {
  // === Model-Einstellungen ===
  defaultModel: "gpt-4o-mini",
  defaultProvider: "openai",
  maxTokens: 4000,
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,

  // === Feature-Einstellungen ===
  audioEnabled: true,
  translationEnabled: true,
  visionEnabled: true,
  streamingEnabled: true,
  autoSave: true,
  toolExecutionEnabled: true,
  workflowExecutionEnabled: false,

  // === Sprache & Region ===
  language: "de-DE",
  timezone: "Europe/Berlin",
  dateFormat: "DD.MM.YYYY",
  timeFormat: "HH:mm",

  // === UI-Einstellungen ===
  theme: "auto",
  fontSize: "medium",
  density: "comfortable",
  sidebarPosition: "left",

  // === Privacy & Sicherheit ===
  dataRetentionDays: 30,
  autoClearHistory: false,
  analyticsEnabled: false,
  errorReportingEnabled: true,

  // === Erweiterte Einstellungen ===
  apiTimeout: 60000,
  maxConcurrentRequests: 3,
  cacheEnabled: true,
  cacheTTL: 3600,
  fallbackProviderEnabled: true,

  // === Notification-Einstellungen ===
  notifications: {
    enabled: true,
    soundEnabled: true,
    desktopEnabled: true,
    emailEnabled: false,
    activityAlertsEnabled: true,
  },

  // === Backup & Export ===
  autoBackup: false,
  backupInterval: 24,
  exportFormat: "json" as const,
};

/* ==================== BACKEND URL ==================== */
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/* ==================== MODELL-VOREINSTELLUNGEN ==================== */
export const MODEL_PRESETS = {
  "gpt-4o-mini": {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
  },
  "gpt-4o": {
    temperature: 0.7,
    maxTokens: 8000,
    topP: 1,
  },
  "gpt-4": {
    temperature: 0.7,
    maxTokens: 8000,
    topP: 1,
  },
  "claude-3-5-sonnet": {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
  },
  "gemini-1.5-pro": {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
  },
};

/* ==================== SPRACHEN ==================== */
export const SUPPORTED_LANGUAGES = [
  { code: "de-DE", name: "Deutsch", nativeName: "Deutsch" },
  { code: "en-US", name: "Englisch", nativeName: "English" },
  { code: "fr-FR", name: "Französisch", nativeName: "Français" },
  { code: "es-ES", name: "Spanisch", nativeName: "Español" },
  { code: "it-IT", name: "Italienisch", nativeName: "Italiano" },
];

/* ==================== THEMEN ==================== */
export const THEMES = [
  { id: "light", name: "Hell", description: "Helles Farbschema" },
  { id: "dark", name: "Dunkel", description: "Dunkles Farbschema" },
  { id: "auto", name: "Automatisch", description: "Systemeinstellung folgen" },
];

/* ==================== DATEIFORMATE ==================== */
export const SUPPORTED_FILE_FORMATS = {
  images: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
  documents: [".pdf", ".txt", ".md", ".doc", ".docx"],
};

/* ==================== ERROR MESSAGES ==================== */
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.",
  API_ERROR: "API-Fehler. Bitte versuchen Sie es später erneut.",
  TIMEOUT_ERROR: "Zeitüberschreitung. Die Anfrage hat zu lange gedauert.",
  AUDIO_ERROR: "Audio-Fehler. Mikrofonzugriff nicht verfügbar.",
  FILE_ERROR: "Datei-Fehler. Datei konnte nicht verarbeitet werden.",
  SESSION_ERROR: "Session-Fehler. Bitte starten Sie eine neue Konversation.",
};

/* ==================== SUCCESS MESSAGES ==================== */
export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: "Einstellungen erfolgreich gespeichert.",
  SESSION_CREATED: "Neue Session erstellt.",
  MESSAGE_SENT: "Nachricht erfolgreich gesendet.",
  FILE_UPLOADED: "Datei erfolgreich hochgeladen.",
  AUDIO_PROCESSED: "Audio erfolgreich verarbeitet.",
};
