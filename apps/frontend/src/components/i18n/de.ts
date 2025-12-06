export default {
  dashboard: {
    title: "ERP SteinmetZ – Funktionskatalog",
    subtitle: "Systemübersicht und Funktionsbereiche",

    // Health / Systemstatus
    health: {
      status: {
        healthy: "System funktionsfähig",
        degraded: "System eingeschränkt",
        unhealthy: "Systemfehler",
      },
    },

    // Kategorienbereich
    categories: {
      title: "Funktionsbereiche",
      count: "{{count}} Bereiche verfügbar",
      count_one: "{{count}} Bereich verfügbar",
      count_other: "{{count}} Bereiche verfügbar",
      emptyTitle: "Keine Kategorien gefunden",
      emptyDescription: "Es wurden keine passenden Funktionsbereiche gefunden.",
    },

    // Suche
    search: {
      button: "Suche starten",
      filter: "Such-Filter",
      filterCategory: "Kategorien",
      filterFunction: "Funktionen",
      placeholder: "Suche nach {{type}}…",
      loading: "Suche läuft…",
      noResults: "Keine Ergebnisse gefunden",
      input: "Suchfeld",
    },

    // Navigation
    navigation: {
      overview: "Übersicht",
      catalog: "Funktionen",
      ai: "AI-Annotator",
      settings: "Einstellungen",
    },

    // Chat-Bereich
    openChat: "Chat öffnen",
    chat: {
      inputPlaceholder: "Nachricht eingeben…",
      send: "Senden",
      newSession: "Neue Sitzung",
      loading: "Antwort wird verarbeitet…",
    },

    // Modelle
    models: {
      title: "Modelle",
      provider: "Anbieter",
      capabilities: "Fähigkeiten",
      noModels: "Keine Modelle verfügbar",
    },

    // Tools
    tools: {
      title: "Tools",
      run: "Ausführen",
      noTools: "Keine Tools registriert",
    },

    // Systeminformationen
    system: {
      title: "Systeminformationen",
      version: "Version",
      uptime: "Laufzeit",
      memory: "Speicher",
      routes: "Registrierte Routen",
      environment: "Umgebung",
      database: "Datenbank",
      diagnostics: "Diagnose",
      features: "Funktionen",
      resources: "Ressourcen",
      ai: "AI-Status",
      statusHealthy: "Funktionsfähig",
      statusUnhealthy: "Nicht funktionsfähig",
      statusDegraded: "Eingeschränkt",
    },

    languageSwitcher: "Sprache wählen",

    ui: {
      confirm: "Bestätigen",
      cancel: "Abbrechen",
      close: "Schließen",
      reload: "Neu laden",
      details: "Details",
      unknown: "Unbekannt",
      save: "Speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      add: "Hinzufügen",
      back: "Zurück",
      next: "Weiter",
      previous: "Vorherige",
      loading: "Wird geladen...",
      error: "Fehler",
      success: "Erfolgreich",
      warning: "Warnung",
      info: "Information",
    },
    
    // Plural forms for common items
    items: {
      result: "Ergebnis",
      result_one: "{{count}} Ergebnis",
      result_other: "{{count}} Ergebnisse",
      file: "Datei",
      file_one: "{{count}} Datei",
      file_other: "{{count}} Dateien",
      user: "Benutzer",
      user_one: "{{count}} Benutzer",
      user_other: "{{count}} Benutzer",
      message: "Nachricht",
      message_one: "{{count}} Nachricht",
      message_other: "{{count}} Nachrichten",
      item: "Eintrag",
      item_one: "{{count}} Eintrag",
      item_other: "{{count}} Einträge",
    },
    
    // Date and time formatting
    datetime: {
      today: "Heute",
      yesterday: "Gestern",
      tomorrow: "Morgen",
      now: "Jetzt",
      minutesAgo: "vor {{count}} Minuten",
      minutesAgo_one: "vor einer Minute",
      hoursAgo: "vor {{count}} Stunden",
      hoursAgo_one: "vor einer Stunde",
      daysAgo: "vor {{count}} Tagen",
      daysAgo_one: "vor einem Tag",
    },
    
    // Currency and numbers
    format: {
      currency: "{{value, currency:EUR}}",
      percent: "{{value, percent}}",
      decimal: "{{value, decimal}}",
    },
  },
};
