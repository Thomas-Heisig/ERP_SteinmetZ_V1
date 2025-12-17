export default {
  // ===== DASHBOARD & SYSTEM =====
  dashboard: {
    title: "ERP SteinmetZ – Funktionsübersicht",
    subtitle: "Zentrale Steuerung für Geschäftsabläufe",
    welcome: "Willkommen zurück, {{name}}",
    
    // Statusanzeigen
    status: {
      online: "System online",
      degraded: "System eingeschränkt",
      offline: "System offline",
      maintenance: "Wartungsmodus",
      syncing: "Daten werden synchronisiert...",
    },
    
    // Schnellaktionen
    quickActions: {
      title: "Schnellaktionen",
      newInvoice: "Neue Rechnung",
      newCustomer: "Neuer Kunde",
      newEmployee: "Neuer Mitarbeiter",
      newProject: "Neues Projekt",
      runReport: "Bericht ausführen",
      exportData: "Daten exportieren",
      importData: "Daten importieren",
    },
    
    // Systemüberwachung
    health: {
      title: "Systemzustand",
      status: {
        healthy: "Alle Systeme funktionsfähig",
        degraded: "Teilweise Einschränkungen",
        unhealthy: "Kritischer Fehler erkannt",
      },
      components: {
        database: "Datenbank",
        api: "API Gateway",
        auth: "Authentifizierung",
        storage: "Dateispeicher",
        websocket: "WebSocket",
        cache: "Cache",
      },
      metrics: {
        uptime: "Betriebszeit",
        responseTime: "Antwortzeit",
        memoryUsage: "Speichernutzung",
        cpuLoad: "CPU-Auslastung",
      },
    },
    
    // Benachrichtigungen
    notifications: {
      title: "Benachrichtigungen",
      empty: "Keine neuen Benachrichtigungen",
      markAllRead: "Alle als gelesen markieren",
      clearAll: "Alle löschen",
      types: {
        info: "Information",
        warning: "Warnung",
        error: "Fehler",
        success: "Erfolg",
      },
    },
    
    // Letzte Aktivitäten
    recentActivity: {
      title: "Letzte Aktivitäten",
      types: {
        login: "Benutzer-Login",
        create: "Erstellt",
        update: "Aktualisiert",
        delete: "Gelöscht",
        export: "Exportiert",
        import: "Importiert",
      },
      empty: "Keine aktuellen Aktivitäten",
    },
  },
  
  // ===== KATALOG & FUNKTIONEN =====
  catalog: {
    title: "Funktionskatalog",
    subtitle: "Durchsuchen verfügbarer Systemfunktionen",
    
    categories: {
      title: "Funktionsbereiche",
      count: "{{count}} Bereiche verfügbar",
      count_one: "{{count}} Bereich verfügbar",
      count_other: "{{count}} Bereiche verfügbar",
      emptyTitle: "Keine Kategorien gefunden",
      emptyDescription: "Es wurden keine passenden Funktionsbereiche gefunden.",
      filter: {
        all: "Alle Kategorien",
        favorites: "Nur Favoriten",
        recent: "Zuletzt verwendet",
      },
    },
    
    functions: {
      title: "Verfügbare Funktionen",
      search: {
        placeholder: "Funktionen suchen...",
        button: "Suchen",
        advanced: "Erweiterte Suche",
        filters: "Filter",
        clear: "Suche löschen",
      },
      view: {
        grid: "Rasteransicht",
        list: "Listenansicht",
        details: "Detailansicht",
      },
      actions: {
        execute: "Ausführen",
        favorite: "Zu Favoriten hinzufügen",
        unfavorite: "Aus Favoriten entfernen",
        details: "Details anzeigen",
        export: "Funktion exportieren",
        duplicate: "Duplizieren",
      },
      metadata: {
        version: "Version",
        author: "Autor",
        lastModified: "Zuletzt geändert",
        dependencies: "Abhängigkeiten",
        tags: "Tags",
      },
    },
  },
  
  // ===== SUCHE =====
  search: {
    global: {
      placeholder: "Im gesamten ERP-System suchen...",
      button: "Suchen",
      advanced: "Erweiterte Suche",
      clear: "Löschen",
    },
    
    filters: {
      title: "Suchfilter",
      category: "Kategorie",
      type: "Typ",
      status: "Status",
      dateRange: "Zeitraum",
      amount: "Betragsbereich",
      clearAll: "Alle Filter löschen",
      apply: "Filter anwenden",
    },
    
    results: {
      title: "Suchergebnisse",
      loading: "Suche läuft...",
      noResults: "Keine Ergebnisse gefunden",
      tryAgain: "Andere Suchbegriffe versuchen",
      showing: "Zeige {{count}} von {{total}} Ergebnissen",
      relevance: "Relevanz",
      newest: "Neueste zuerst",
      oldest: "Älteste zuerst",
    },
    
    modules: {
      all: "Alle Module",
      crm: "CRM",
      finance: "Finanzen",
      hr: "Personal",
      inventory: "Lager",
      projects: "Projekte",
      documents: "Dokumente",
      ai: "KI-Funktionen",
    },
  },
  
  // ===== NAVIGATION & SIDEBAR =====
  sidebar: {
    title: "Navigation",
    collapse: "Sidebar einklappen",
    expand: "Sidebar ausklappen",
    pin: "Sidebar fixieren",
    unpin: "Sidebar lösen",
    
    // Direct navigation items (used by MainNavigation)
    dashboard: "Dashboard",
    catalog: "Funktionskatalog",
    calendar: "Kalender",
    company: "Unternehmen",
    processes: "Prozess-Management",
    risk: "Risiko & Compliance",
    accounting: "Buchhaltung",
    controlling: "Controlling",
    treasury: "Treasury",
    taxes: "Steuern",
    crm: "Kunden (CRM)",
    marketing: "Marketing",
    sales: "Vertrieb",
    fulfillment: "Fulfillment",
    purchasing: "Beschaffung",
    receiving: "Wareneingang",
    suppliers: "Lieferanten",
    planning: "Produktionsplanung",
    manufacturing: "Fertigungssteuerung",
    quality: "Qualitätsmanagement",
    maintenance: "Wartung",
    inventory: "Lagerverwaltung",
    picking: "Kommissionierung",
    logistics: "Logistik",
    personnel: "Personalverwaltung",
    timeTracking: "Zeiterfassung",
    development: "Personalentwicklung",
    recruiting: "Recruiting",
    reports: "Standard-Reports",
    adhoc: "Ad-hoc-Analysen",
    aiAnalytics: "KI-Analytics",
    email: "E-Mail-Management",
    messaging: "Messaging",
    social: "Social Media",
    users: "Benutzerverwaltung",
    systemSettings: "Systemeinstellungen",
    integrations: "Integrationen",
    aiAnnotator: "AI-Annotator",
    batchProcessing: "Batch-Verarbeitung",
    qualityDashboard: "Qualität",
    modelManagement: "Modelle",
    advancedFilters: "Filter",
    documents: "Dokumente",
    projects: "Projekte",
    settings: "Einstellungen",
    help: "Hilfe",
    
    // Section titles
    main: "Hauptbereich",
    business: "Geschäftsverwaltung",
    finance: "Finanzen & Controlling",
    procurement: "Einkauf & Beschaffung",
    production: "Produktion & Fertigung",
    warehouse: "Lager & Logistik",
    hr: "Personal & HR",
    reporting: "Reporting & Analytics",
    communication: "Kommunikation & Social",
    system: "System & Administration",
    ai: "KI & Automatisierung",
    
    // Hauptbereiche
    sections: {
      main: "Hauptbereich",
      business: "Geschäftsverwaltung",
      finance: "Finanzen & Controlling",
      sales: "Vertrieb & Marketing",
      procurement: "Einkauf & Beschaffung",
      production: "Produktion & Fertigung",
      warehouse: "Lager & Logistik",
      hr: "Personal & HR",
      reporting: "Reporting & Analytics",
      communication: "Kommunikation",
      system: "System & Verwaltung",
      ai: "KI & Automatisierung",
      tools: "Werkzeuge",
    },
    
    // Navigationselemente mit Icons
    navItems: {
      dashboard: "Dashboard",
      catalog: "Funktionskatalog",
      calendar: "Kalender",
      company: "Unternehmen",
      processes: "Prozess-Management",
      risk: "Risiko & Compliance",
      
      // Finanzen
      accounting: "Buchhaltung",
      controlling: "Controlling",
      treasury: "Treasury",
      taxes: "Steuern",
      invoices: "Rechnungen",
      expenses: "Ausgaben",
      
      // CRM & Vertrieb
      crm: "Kundenverwaltung",
      customers: "Kunden",
      leads: "Leads",
      opportunities: "Verkaufschancen",
      marketing: "Marketing",
      sales: "Vertrieb",
      orders: "Aufträge",
      fulfillment: "Auftragsabwicklung",
      
      // Einkauf
      purchasing: "Einkauf",
      receiving: "Wareneingang",
      suppliers: "Lieferanten",
      contracts: "Verträge",
      
      // Produktion
      planning: "Produktionsplanung",
      manufacturing: "Fertigung",
      quality: "Qualitätsmanagement",
      maintenance: "Wartung",
      
      // Lager
      inventory: "Lagerbestand",
      picking: "Kommissionierung",
      logistics: "Logistik",
      shipping: "Versand",
      
      // Personal
      personnel: "Personal",
      timeTracking: "Zeiterfassung",
      payroll: "Gehaltsabrechnung",
      development: "Entwicklung",
      recruiting: "Recruiting",
      
      // Reporting
      reports: "Berichte",
      analytics: "Analysen",
      dashboards: "Dashboards",
      exports: "Datenexporte",
      
      // Kommunikation
      email: "E-Mail",
      messaging: "Nachrichten",
      social: "Social Media",
      calls: "Telefonate",
      
      // System
      users: "Benutzer",
      roles: "Rollen",
      permissions: "Berechtigungen",
      settings: "Einstellungen",
      logs: "System-Logs",
      backups: "Backups",
      
      // KI & Tools
      aiAnnotator: "KI-Annotator",
      batchProcessing: "Stapelverarbeitung",
      modelManagement: "KI-Modelle",
      advancedFilters: "Erweiterte Filter",
      innovation: "Innovations-Labor",
      
      // Sonstiges
      documents: "Dokumente",
      projects: "Projekte",
      help: "Hilfe & Support",
      about: "Über das System",
    },
    
    // Benutzermenü
    user: {
      profile: "Mein Profil",
      settings: "Meine Einstellungen",
      logout: "Abmelden",
      switchAccount: "Konto wechseln",
    },
    
    // Footer
    footer: {
      version: "Version {{version}}",
      lastUpdate: "Letzte Aktualisierung: {{date}}",
      copyright: "© {{year}} ERP SteinmetZ",
    },
  },
  
  // ===== KI & AUTOMATISIERUNG =====
  ai: {
    title: "KI & Automatisierung",
    annotator: {
      title: "KI-Annotator",
      subtitle: "Intelligente Dokumentenverarbeitung",
      upload: "Dokument hochladen",
      analyze: "Mit KI analysieren",
      extract: "Daten extrahieren",
      validate: "Ergebnisse validieren",
      export: "Annotationen exportieren",
      supportedFormats: "Unterstützte Formate: PDF, DOCX, Bilder",
    },
    
    models: {
      title: "KI-Modelle",
      provider: "Anbieter",
      capabilities: "Fähigkeiten",
      status: "Status",
      active: "Aktiv",
      inactive: "Inaktiv",
      loading: "Wird geladen",
      select: "Modell auswählen",
      configure: "Konfigurieren",
      test: "Modell testen",
    },
    
    chat: {
      title: "KI-Assistent",
      inputPlaceholder: "Fragen Sie mich alles über das ERP-System...",
      send: "Senden",
      newSession: "Neue Unterhaltung",
      clear: "Chat löschen",
      thinking: "Denke nach...",
      examples: {
        title: "Beispielfragen",
        q1: "Wie erstelle ich eine Rechnung?",
        q2: "Zeige überfällige Zahlungen",
        q3: "Erstelle Verkaufsbericht für Q4",
        q4: "Hilfe bei Mitarbeiter-Onboarding",
      },
    },
    
    batch: {
      title: "Stapelverarbeitung",
      create: "Stapeljob erstellen",
      monitor: "Fortschritt überwachen",
      history: "Job-Historie",
      schedule: "Planen",
      cancel: "Job abbrechen",
      retry: "Fehlgeschlagenen wiederholen",
    },
  },
  
  // ===== CRM MODUL =====
  crm: {
    title: "Kundenbeziehungsmanagement",
    
    customers: {
      title: "Kunden",
      list: "Kundenliste",
      details: "Kundendetails",
      new: "Neuer Kunde",
      edit: "Kunde bearbeiten",
      delete: "Kunde löschen",
      import: "Kunden importieren",
      export: "Kunden exportieren",
    },
    
    leads: {
      title: "Leads",
      convert: "Zu Kunde konvertieren",
      assign: "Vertrieb zuweisen",
      followUp: "Follow-up planen",
    },
    
    opportunities: {
      title: "Verkaufschancen",
      stages: {
        prospecting: "Akquise",
        qualification: "Qualifizierung",
        proposal: "Angebot",
        negotiation: "Verhandlung",
        closedWon: "Gewonnen",
        closedLost: "Verloren",
      },
    },
    
    contacts: {
      title: "Kontakte",
      add: "Kontakt hinzufügen",
      primary: "Hauptansprechpartner",
      communication: "Kommunikationsprotokoll",
    },
    
    activities: {
      title: "Aktivitäten",
      logCall: "Telefonat protokollieren",
      scheduleMeeting: "Meeting planen",
      sendEmail: "E-Mail senden",
      addNote: "Notiz hinzufügen",
    },
  },
  
  // ===== FINANZMODUL =====
  finance: {
    title: "Finanzen & Buchhaltung",
    
    invoices: {
      title: "Rechnungen",
      create: "Rechnung erstellen",
      send: "Rechnung senden",
      markPaid: "Als bezahlt markieren",
      reminder: "Mahnung senden",
      cancel: "Rechnung stornieren",
      duplicate: "Duplizieren",
    },
    
    status: {
      draft: "Entwurf",
      sent: "Versendet",
      paid: "Bezahlt",
      overdue: "Überfällig",
      cancelled: "Storniert",
      partiallyPaid: "Teilweise bezahlt",
    },
    
    reports: {
      title: "Finanzberichte",
      profitLoss: "Gewinn- und Verlustrechnung",
      balanceSheet: "Bilanz",
      cashFlow: "Cashflow",
      agedReceivables: "Forderungsalterung",
      agedPayables: "Verbindlichkeitsalterung",
    },
    
    banking: {
      title: "Bankwesen",
      reconcile: "Konto abstimmen",
      importStatement: "Kontoauszug importieren",
      matchTransactions: "Transaktionen zuordnen",
    },
  },
  
  // ===== PERSONALMODUL =====
  hr: {
    title: "Personalwesen",
    
    employees: {
      title: "Mitarbeiter",
      new: "Neuer Mitarbeiter",
      edit: "Mitarbeiter bearbeiten",
      terminate: "Beschäftigung beenden",
      reactivate: "Reaktivieren",
      documents: "Mitarbeiterdokumente",
    },
    
    departments: {
      title: "Abteilungen",
      assign: "Abteilung zuweisen",
      transfer: "Mitarbeiter versetzen",
    },
    
    attendance: {
      title: "Anwesenheit",
      clockIn: "Stempeln (Start)",
      clockOut: "Stempeln (Ende)",
      timesheet: "Zeiterfassung",
      approve: "Stunden genehmigen",
    },
    
    payroll: {
      title: "Gehaltsabrechnung",
      run: "Abrechnung durchführen",
      review: "Abrechnung prüfen",
      approve: "Abrechnung genehmigen",
      export: "Für Bank exportieren",
    },
  },
  
  // ===== UI-KOMPONENTEN =====
  ui: {
    common: {
      confirm: "Bestätigen",
      cancel: "Abbrechen",
      save: "Speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      add: "Hinzufügen",
      view: "Anzeigen",
      close: "Schließen",
      back: "Zurück",
      next: "Weiter",
      previous: "Vorherige",
      search: "Suchen",
      filter: "Filtern",
      sort: "Sortieren",
      refresh: "Aktualisieren",
      download: "Herunterladen",
      upload: "Hochladen",
      print: "Drucken",
      export: "Exportieren",
      import: "Importieren",
      help: "Hilfe",
      settings: "Einstellungen",
      more: "Mehr",
      less: "Weniger",
      expand: "Aufklappen",
      collapse: "Zuklappen",
      enable: "Aktivieren",
      disable: "Deaktivieren",
      activate: "Aktivieren",
      deactivate: "Deaktivieren",
      selectAll: "Alle auswählen",
      deselectAll: "Auswahl aufheben",
      clear: "Löschen",
      reset: "Zurücksetzen",
      submit: "Absenden",
      continue: "Weiter",
      finish: "Beenden",
      ok: "OK",
      yes: "Ja",
      no: "Nein",
    },
    
    status: {
      loading: "Wird geladen...",
      saving: "Wird gespeichert...",
      processing: "Wird verarbeitet...",
      uploading: "Wird hochgeladen...",
      downloading: "Wird heruntergeladen...",
      success: "Erfolgreich!",
      error: "Fehler!",
      warning: "Warnung!",
      info: "Information",
      unknown: "Unbekannt",
    },
    
    validation: {
      required: "Dieses Feld ist erforderlich",
      invalidEmail: "Ungültige E-Mail-Adresse",
      invalidPhone: "Ungültige Telefonnummer",
      minLength: "Mindestens {{count}} Zeichen erforderlich",
      maxLength: "Maximal {{count}} Zeichen erlaubt",
      passwordMismatch: "Passwörter stimmen nicht überein",
      invalidFormat: "Ungültiges Format",
      duplicate: "Dieser Wert existiert bereits",
    },
    
    emptyStates: {
      noData: "Keine Daten verfügbar",
      noResults: "Keine Ergebnisse gefunden",
      emptyList: "Die Liste ist leer",
      notConfigured: "Noch nicht konfiguriert",
      comingSoon: "Demnächst verfügbar",
    },
    
    dates: {
      today: "Heute",
      yesterday: "Gestern",
      tomorrow: "Morgen",
      thisWeek: "Diese Woche",
      lastWeek: "Letzte Woche",
      nextWeek: "Nächste Woche",
      thisMonth: "Dieser Monat",
      lastMonth: "Letzter Monat",
      nextMonth: "Nächster Monat",
      thisQuarter: "Dieses Quartal",
      lastQuarter: "Letztes Quartal",
      nextQuarter: "Nächstes Quartal",
      thisYear: "Dieses Jahr",
      lastYear: "Letztes Jahr",
      nextYear: "Nächstes Jahr",
      customRange: "Benutzerdefinierter Bereich",
      selectDate: "Datum auswählen",
    },
    
    time: {
      now: "Jetzt",
      minutes: "Minuten",
      hours: "Stunden",
      days: "Tage",
      weeks: "Wochen",
      months: "Monate",
      years: "Jahre",
      ago: "vor",
      fromNow: "in",
    },
    
    numbers: {
      currency: "{{value}} €",
      percent: "{{value}} %",
      decimal: "{{value}}",
      integer: "{{value}}",
      thousand: "{{value}} Tsd.",
      million: "{{value}} Mio.",
      billion: "{{value}} Mrd.",
    },
    
    units: {
      pieces: "Stk.",
      kilograms: "kg",
      grams: "g",
      liters: "l",
      meters: "m",
      squareMeters: "m²",
      cubicMeters: "m³",
      hours: "h",
      minutes: "min",
      seconds: "s",
    },
  },
  
  // ===== FEHLERMELDUNGEN =====
  errors: {
    network: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
    server: "Serverfehler. Bitte versuchen Sie es später erneut.",
    timeout: "Zeitüberschreitung. Bitte versuchen Sie es erneut.",
    unauthorized: "Sie sind nicht autorisiert, diese Aktion auszuführen.",
    forbidden: "Zugriff verweigert. Unzureichende Berechtigungen.",
    notFound: "Die angeforderte Ressource wurde nicht gefunden.",
    validation: "Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
    duplicate: "Dieser Datensatz existiert bereits.",
    constraint: "Kann aufgrund bestehender Abhängigkeiten nicht gelöscht werden.",
    fileTooLarge: "Dateigröße überschreitet das Maximum.",
    invalidFileType: "Ungültiger Dateityp.",
    quotaExceeded: "Speicherkontingent überschritten.",
    
    specific: {
      loginFailed: "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.",
      sessionExpired: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      passwordWeak: "Passwort ist zu schwach.",
      emailInUse: "E-Mail-Adresse wird bereits verwendet.",
      invalidToken: "Ungültiges oder abgelaufenes Token.",
    },
    
    retry: "Erneut versuchen",
    contactSupport: "Support kontaktieren",
    goBack: "Zurück",
    reloadPage: "Seite neu laden",
  },
  
  // ===== ERFOLGSMELDUNGEN =====
  success: {
    saved: "Änderungen erfolgreich gespeichert!",
    created: "Erfolgreich erstellt!",
    updated: "Erfolgreich aktualisiert!",
    deleted: "Erfolgreich gelöscht!",
    uploaded: "Erfolgreich hochgeladen!",
    exported: "Erfolgreich exportiert!",
    imported: "Erfolgreich importiert!",
    sent: "Erfolgreich gesendet!",
    processed: "Erfolgreich verarbeitet!",
    configured: "Erfolgreich konfiguriert!",
    activated: "Erfolgreich aktiviert!",
    deactivated: "Erfolgreich deaktiviert!",
    
    actions: {
      close: "Schließen",
      view: "Anzeigen",
      continue: "Weiter",
      new: "Neu erstellen",
    },
  },
  
  // ===== BESTÄTIGUNGSDIALOGE =====
  confirm: {
    delete: {
      title: "Löschen bestätigen",
      message: "Möchten Sie dieses Element wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
      single: "Dieses Element löschen?",
      multiple: "{{count}} ausgewählte Elemente löschen?",
      permanent: "Dies löscht das Element dauerhaft.",
    },
    
    logout: {
      title: "Abmeldung bestätigen",
      message: "Möchten Sie sich wirklich abmelden?",
    },
    
    cancel: {
      title: "Abbruch bestätigen",
      message: "Möchten Sie wirklich abbrechen? Nicht gespeicherte Änderungen gehen verloren.",
    },
    
    discard: {
      title: "Änderungen verwerfen",
      message: "Sie haben nicht gespeicherte Änderungen. Möchten Sie diese wirklich verwerfen?",
    },
    
    overwrite: {
      title: "Überschreiben bestätigen",
      message: "Dadurch werden bestehende Daten überschrieben. Sind Sie sicher?",
    },
    
    buttons: {
      proceed: "Fortfahren",
      keep: "Behalten",
      discard: "Verwerfen",
      cancel: "Abbrechen",
    },
  },
  
  // ===== FORMULARE & EINGABEN =====
  forms: {
    labels: {
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      address: "Adresse",
      city: "Stadt",
      zipCode: "PLZ",
      country: "Land",
      description: "Beschreibung",
      notes: "Notizen",
      comments: "Kommentare",
      quantity: "Menge",
      price: "Preis",
      amount: "Betrag",
      total: "Gesamt",
      discount: "Rabatt",
      tax: "Steuer",
      subtotal: "Zwischensumme",
      status: "Status",
      type: "Typ",
      category: "Kategorie",
      tags: "Tags",
      priority: "Priorität",
      dueDate: "Fälligkeitsdatum",
      startDate: "Startdatum",
      endDate: "Enddatum",
      createdAt: "Erstellt am",
      updatedAt: "Aktualisiert am",
      createdBy: "Erstellt von",
      updatedBy: "Aktualisiert von",
    },
    
    placeholders: {
      select: "Auswählen...",
      searchSelect: "Zum Suchen tippen...",
      typeHere: "Hier eingeben...",
      chooseFile: "Datei auswählen...",
      dragDrop: "Dateien hierher ziehen",
      optional: "Optional",
      required: "Erforderlich",
    },
    
    hints: {
      minCharacters: "Mindestens {{count}} Zeichen",
      maxCharacters: "Maximal {{count}} Zeichen",
      requiredField: "Pflichtfeld",
      optionalField: "Optionales Feld",
    },
  },
  
  // ===== TABELLE & DATENGRID =====
  table: {
    actions: {
      title: "Aktionen",
      edit: "Bearbeiten",
      delete: "Löschen",
      view: "Anzeigen",
      duplicate: "Duplizieren",
      export: "Exportieren",
      more: "Weitere Aktionen",
    },
    
    selection: {
      selected: "{{count}} ausgewählt",
      selectAll: "Alle auswählen",
      clear: "Auswahl aufheben",
    },
    
    pagination: {
      page: "Seite",
      of: "von",
      rowsPerPage: "Zeilen pro Seite",
      showing: "Zeige {{from}} bis {{to}} von {{total}} Einträgen",
      first: "Erste",
      previous: "Vorherige",
      next: "Nächste",
      last: "Letzte",
    },
    
    sorting: {
      sortBy: "Sortieren nach",
      ascending: "Aufsteigend",
      descending: "Absteigend",
      clear: "Sortierung löschen",
    },
    
    filtering: {
      filter: "Filter",
      clearFilters: "Filter löschen",
      apply: "Anwenden",
    },
    
    empty: {
      noData: "Keine Daten verfügbar",
      noResults: "Keine Ergebnisse gefunden",
      loading: "Daten werden geladen...",
      error: "Fehler beim Laden der Daten",
    },
  },
  
  // ===== MODALE & DIALOGE =====
  modal: {
    close: "Schließen",
    maximize: "Maximieren",
    minimize: "Minimieren",
    fullscreen: "Vollbild",
    exitFullscreen: "Vollbild verlassen",
  },
  
  // ===== DATEIVERWALTUNG =====
  files: {
    upload: "Dateien hochladen",
    download: "Herunterladen",
    preview: "Vorschau",
    rename: "Umbenennen",
    move: "Verschieben",
    copy: "Kopieren",
    delete: "Löschen",
    share: "Teilen",
    properties: "Eigenschaften",
    
    types: {
      image: "Bild",
      document: "Dokument",
      pdf: "PDF",
      spreadsheet: "Tabellenkalkulation",
      presentation: "Präsentation",
      archive: "Archiv",
      audio: "Audio",
      video: "Video",
      other: "Sonstiges",
    },
    
    status: {
      uploading: "Wird hochgeladen...",
      processing: "Wird verarbeitet...",
      complete: "Abgeschlossen",
      failed: "Fehlgeschlagen",
      queued: "In Warteschlange",
    },
  },
  
  // ===== DRUCKEN & EXPORT =====
  export: {
    formats: {
      pdf: "PDF",
      excel: "Excel",
      csv: "CSV",
      json: "JSON",
      xml: "XML",
      print: "Drucken",
    },
    
    options: {
      currentPage: "Aktuelle Seite",
      allPages: "Alle Seiten",
      selectedRows: "Ausgewählte Zeilen",
      customRange: "Benutzerdefinierter Bereich",
    },
    
    status: {
      generating: "Export wird erstellt...",
      ready: "Export bereit",
      failed: "Export fehlgeschlagen",
    },
  },
  
  // ===== SYSTEM & ADMIN =====
  system: {
    settings: {
      title: "Systemeinstellungen",
      general: "Allgemein",
      appearance: "Erscheinungsbild",
      notifications: "Benachrichtigungen",
      security: "Sicherheit",
      integrations: "Integrationen",
      backup: "Backup & Wiederherstellung",
      logs: "System-Logs",
      maintenance: "Wartung",
    },
    
    users: {
      title: "Benutzerverwaltung",
      newUser: "Neuer Benutzer",
      editUser: "Benutzer bearbeiten",
      resetPassword: "Passwort zurücksetzen",
      deactivate: "Deaktivieren",
      activate: "Aktivieren",
      roles: "Rollen zuweisen",
    },
    
    roles: {
      title: "Rollen & Berechtigungen",
      create: "Rolle erstellen",
      edit: "Rolle bearbeiten",
      delete: "Rolle löschen",
      permissions: "Berechtigungen verwalten",
    },
    
    logs: {
      title: "System-Logs",
      clear: "Logs löschen",
      export: "Logs exportieren",
      filter: "Logs filtern",
      severity: {
        debug: "Debug",
        info: "Info",
        warning: "Warnung",
        error: "Fehler",
        critical: "Kritisch",
      },
    },
    
    maintenance: {
      title: "Wartung",
      backup: "Backup erstellen",
      restore: "Backup wiederherstellen",
      cleanup: "Daten bereinigen",
      optimize: "Datenbank optimieren",
      update: "System-Update",
    },
  },
  
  // ===== ZEIT & DATUM-FORMATIERUNG =====
  datetime: {
    formats: {
      shortDate: "DD.MM.YYYY",
      mediumDate: "DD. MMM YYYY",
      longDate: "DD. MMMM YYYY",
      fullDate: "dddd, DD. MMMM YYYY",
      shortTime: "HH:mm",
      mediumTime: "HH:mm:ss",
      longTime: "HH:mm:ss.SSS",
      fullTime: "HH:mm:ss zzzz",
      shortDateTime: "DD.MM.YYYY HH:mm",
      mediumDateTime: "DD. MMM YYYY HH:mm:ss",
      longDateTime: "DD. MMMM YYYY HH:mm:ss z",
      fullDateTime: "dddd, DD. MMMM YYYY HH:mm:ss zzzz",
    },
    
    relative: {
      justNow: "gerade eben",
      secondsAgo: "vor {{count}} Sekunden",
      secondsAgo_one: "vor 1 Sekunde",
      minutesAgo: "vor {{count}} Minuten",
      minutesAgo_one: "vor 1 Minute",
      hoursAgo: "vor {{count}} Stunden",
      hoursAgo_one: "vor 1 Stunde",
      daysAgo: "vor {{count}} Tagen",
      daysAgo_one: "vor 1 Tag",
      weeksAgo: "vor {{count}} Wochen",
      weeksAgo_one: "vor 1 Woche",
      monthsAgo: "vor {{count}} Monaten",
      monthsAgo_one: "vor 1 Monat",
      yearsAgo: "vor {{count}} Jahren",
      yearsAgo_one: "vor 1 Jahr",
      
      inSeconds: "in {{count}} Sekunden",
      inSeconds_one: "in 1 Sekunde",
      inMinutes: "in {{count}} Minuten",
      inMinutes_one: "in 1 Minute",
      inHours: "in {{count}} Stunden",
      inHours_one: "in 1 Stunde",
      inDays: "in {{count}} Tagen",
      inDays_one: "in 1 Tag",
      inWeeks: "in {{count}} Wochen",
      inWeeks_one: "in 1 Woche",
      inMonths: "in {{count}} Monaten",
      inMonths_one: "in 1 Monat",
      inYears: "in {{count}} Jahren",
      inYears_one: "in 1 Jahr",
    },
    
    units: {
      second: "Sekunde",
      second_one: "{{count}} Sekunde",
      second_other: "{{count}} Sekunden",
      minute: "Minute",
      minute_one: "{{count}} Minute",
      minute_other: "{{count}} Minuten",
      hour: "Stunde",
      hour_one: "{{count}} Stunde",
      hour_other: "{{count}} Stunden",
      day: "Tag",
      day_one: "{{count}} Tag",
      day_other: "{{count}} Tage",
      week: "Woche",
      week_one: "{{count}} Woche",
      week_other: "{{count}} Wochen",
      month: "Monat",
      month_one: "{{count}} Monat",
      month_other: "{{count}} Monate",
      year: "Jahr",
      year_one: "{{count}} Jahr",
      year_other: "{{count}} Jahre",
    },
  },
  
  // ===== PLURALISIERUNGSREGELN =====
  pluralization: {
    items: {
      item: "Element",
      item_one: "{{count}} Element",
      item_other: "{{count}} Elemente",
      record: "Datensatz",
      record_one: "{{count}} Datensatz",
      record_other: "{{count}} Datensätze",
      file: "Datei",
      file_one: "{{count}} Datei",
      file_other: "{{count}} Dateien",
      user: "Benutzer",
      user_one: "{{count}} Benutzer",
      user_other: "{{count}} Benutzer",
      customer: "Kunde",
      customer_one: "{{count}} Kunde",
      customer_other: "{{count}} Kunden",
      employee: "Mitarbeiter",
      employee_one: "{{count}} Mitarbeiter",
      employee_other: "{{count}} Mitarbeiter",
      invoice: "Rechnung",
      invoice_one: "{{count}} Rechnung",
      invoice_other: "{{count}} Rechnungen",
      product: "Produkt",
      product_one: "{{count}} Produkt",
      product_other: "{{count}} Produkte",
      order: "Auftrag",
      order_one: "{{count}} Auftrag",
      order_other: "{{count}} Aufträge",
      project: "Projekt",
      project_one: "{{count}} Projekt",
      project_other: "{{count}} Projekte",
      document: "Dokument",
      document_one: "{{count}} Dokument",
      document_other: "{{count}} Dokumente",
    },
    
    time: {
      day: "Tag",
      day_one: "{{count}} Tag",
      day_other: "{{count}} Tage",
      hour: "Stunde",
      hour_one: "{{count}} Stunde",
      hour_other: "{{count}} Stunden",
      minute: "Minute",
      minute_one: "{{count}} Minute",
      minute_other: "{{count}} Minuten",
      second: "Sekunde",
      second_one: "{{count}} Sekunde",
      second_other: "{{count}} Sekunden",
    },
  },
} as const;