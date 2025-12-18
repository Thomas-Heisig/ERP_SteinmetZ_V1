export default {
  // ===== DASHBOARD & SYSTEM =====
  dashboard: {
    title: "ERP SteinmetZ – Funktschoonskatalog",
    subtitle: "Översicht över’t System un de Funktschoonsrebeden",
    welcome: "Willkamen trüch, {{name}}",

    // Statusanwiesers
    status: {
      online: "System löppt",
      degraded: "System hett Inskränkungen",
      offline: "System ut",
      maintenance: "Warungsmodus",
      syncing: "Daten warrt gliektogen...",
    },

    // Snellakschonen
    quickActions: {
      title: "Snellakschonen",
      newInvoice: "Nieg Rekening",
      newCustomer: "Nieg Kunn",
      newEmployee: "Nieg Medarbeider",
      newProject: "Nieg Projekt",
      runReport: "Bericht maken",
      exportData: "Daten rutgeven",
      importData: "Daten rinhalen",
    },

    // Systemöverwachung
    health: {
      title: "Systemtostand",
      status: {
        healthy: "All Systeme löppt normaal",
        degraded: "Deelwies Inskränkungen",
        unhealthy: "Kritsch Fehler faststellt",
      },
      components: {
        database: "Datenbank",
        api: "API-Gateway",
        auth: "Togangsrecht",
        storage: "Dateispeeker",
        websocket: "WebSocket",
        cache: "Cache",
      },
      metrics: {
        uptime: "Lööptied",
        responseTime: "Antwoordtied",
        memoryUsage: "Speekernutzen",
        cpuLoad: "CPU-Lasten",
      },
    },

    // Bescheedmakers
    notifications: {
      title: "Bescheeden",
      empty: "Keen ne’e Bescheeden",
      markAllRead: "All as lesen markeren",
      clearAll: "All wegdoon",
      types: {
        info: "Informatschoon",
        warning: "Warnen",
        error: "Fehler",
        success: "Klappt",
      },
    },

    // Lütt Aktivitäten
    recentActivity: {
      title: "Lütt Aktivitäten",
      types: {
        login: "Brukeranmellen",
        create: "Maakt",
        update: "Aktualiseert",
        delete: "Wegdoon",
        export: "Rutgeven",
        import: "Rinhalen",
      },
      empty: "Keen lütt Aktivitäten",
    },
  },

  // ===== KATALOG & FUNKTSCHOONEN =====
  catalog: {
    title: "Funktschoonskatalog",
    subtitle: "Dörblädern vun verfögbore Systemfunktschonen",

    categories: {
      title: "Funktschoonsrebeden",
      count: "{{count}} Rebeden verfögboor",
      count_one: "{{count}} Rebeed verfögboor",
      count_other: "{{count}} Rebeden verfögboor",
      emptyTitle: "Keen Kategorien funnen",
      emptyDescription: "För düsse Utsöök gifft dat keen Funktschoonsrebeden.",
      filter: {
        all: "All Kategorien",
        favorites: "Bloots Favoriten",
        recent: "Toletzt bruukt",
      },
    },

    functions: {
      title: "Verfögbore Funktschonen",
      search: {
        placeholder: "Funktschonen söken...",
        button: "Söken",
        advanced: "Utwiedert Söken",
        filters: "Filter",
        clear: "Söök wegdoon",
      },
      view: {
        grid: "Rasteransicht",
        list: "Listansicht",
        details: "Detailansicht",
      },
      actions: {
        execute: "Utföhren",
        favorite: "To Favoriten tofögen",
        unfavorite: "Ut Favoriten rutnehmen",
        details: "Details anwiesen",
        export: "Funkschoon rutgeven",
        duplicate: "Kopieren",
      },
      metadata: {
        version: "Version",
        author: "Schriever",
        lastModified: "Toletzt ännert",
        dependencies: "Afhangigkeiten",
        tags: "Kennmarken",
      },
    },
  },

  // ===== SÖKEN =====
  search: {
    global: {
      placeholder: "Överall in’t ERP-System söken...",
      button: "Söken",
      advanced: "Utwiedert Söken",
      clear: "Wegdoon",
    },

    filters: {
      title: "Söökfilter",
      category: "Kategorie",
      type: "Typ",
      status: "Status",
      dateRange: "Tiedruum",
      amount: "Betragsruum",
      clearAll: "All Filter wegdoon",
      apply: "Filter anwennen",
    },

    results: {
      title: "Söökresultaten",
      loading: "Söök löppt...",
      noResults: "Keen Resultaten funnen",
      tryAgain: "Annere Söökwöör versöken",
      showing: "Wiest {{count}} vun {{total}} Resultaten",
      relevance: "Bedeuten",
      newest: "Neeste to’n Eersten",
      oldest: "Öllste to’n Eersten",
    },

    modules: {
      all: "All Module",
      crm: "CRM",
      finance: "Finanzen",
      hr: "Personal",
      inventory: "Lager",
      projects: "Projekten",
      documents: "Dokumenten",
      ai: "KI-Funktschonen",
    },
  },

  // ===== NAVIGATSCHOON & SIDEBAR =====
  sidebar: {
    title: "Navigatschoon",
    collapse: "Sidebar toklappen",
    expand: "Sidebar utklappen",
    pin: "Sidebar fastmaken",
    unpin: "Sidebar losmaken",

    // Hööftrebeden
    sections: {
      main: "Hööftrebeed",
      business: "Geschäftsverwalten",
      finance: "Finanzen & Controlling",
      sales: "Verkoop & Marketing",
      procurement: "Inkoop & Beschaffen",
      production: "Produkschoon & Herstellen",
      warehouse: "Lager & Logistik",
      hr: "Personal & HR",
      reporting: "Reporting & Analytics",
      communication: "Kommunikatschoon",
      system: "System & Verwaltung",
      ai: "KI & Automatiseren",
      tools: "Warktüüch",
    },

    // Navigatschoonselementen mit Icons
    navItems: {
      dashboard: "Dashboard",
      catalog: "Funktschoonskatalog",
      calendar: "Kalender",
      company: "Ünnernehmen",
      processes: "Prozess-Management",
      risk: "Risk & Compliance",

      // Finanzen
      accounting: "Bookholten",
      controlling: "Controlling",
      treasury: "Treasury",
      taxes: "Stüern",
      invoices: "Rekeningen",
      expenses: "Utgaven",

      // CRM & Verkoop
      crm: "Kunnenverwalten",
      customers: "Kunnen",
      leads: "Leads",
      opportunities: "Verkoopschanzen",
      marketing: "Marketing",
      sales: "Verkoop",
      orders: "Opdrääg",
      fulfillment: "Opdragafwickeln",

      // Inkoop
      purchasing: "Inkoop",
      receiving: "Wareningang",
      suppliers: "Leferanten",
      contracts: "Verdrääg",

      // Produkschoon
      planning: "Produkschoonsplanen",
      manufacturing: "Herstellen",
      quality: "Qualitätsmanagement",
      maintenance: "Warung",

      // Lager
      inventory: "Lagerbestand",
      picking: "Kommissionern",
      logistics: "Logistik",
      shipping: "Verschicken",

      // Personal
      personnel: "Personal",
      timeTracking: "Tietnahwiesen",
      payroll: "Löhn",
      development: "Entwicklung",
      recruiting: "Recruiting",

      // Reporting
      reports: "Berichten",
      analytics: "Analysen",
      dashboards: "Dashboards",
      exports: "Datenutgaven",

      // Kommunikatschoon
      email: "E-Mail",
      messaging: "Narichten",
      social: "Social Media",
      calls: "Telefonaten",

      // System
      users: "Brukers",
      roles: "Rollen",
      permissions: "Rechten",
      settings: "Instellens",
      logs: "System-Logs",
      backups: "Backups",

      // KI & Warktüüch
      aiAnnotator: "KI-Annotator",
      batchProcessing: "Stapelverarbeiden",
      modelManagement: "KI-Modellen",
      advancedFilters: "Utwiedert Filter",
      innovation: "Innovatschoonslabor",

      // Annerswat
      documents: "Dokumenten",
      projects: "Projekten",
      help: "Hülp & Ünnerstütten",
      about: "Över dat System",
    },

    // Brukermenü
    user: {
      profile: "Mien Profil",
      settings: "Mien Instellens",
      logout: "Afmellen",
      switchAccount: "Konto wesseln",
    },

    // Footer
    footer: {
      version: "Version {{version}}",
      lastUpdate: "Lütt Ännern: {{date}}",
      copyright: "© {{year}} ERP SteinmetZ",
    },
  },

  // ===== KI & AUTOMATISEREN =====
  ai: {
    title: "KI & Automatiseren",
    annotator: {
      title: "KI-Annotator",
      subtitle: "Slim Dokumentverarbeiden",
      upload: "Dokument rinhalen",
      analyze: "Mit KI analyseren",
      extract: "Daten rutmaken",
      validate: "Resultaten pröven",
      export: "Annottatschonen rutgeven",
      supportedFormats: "Stütt Formaten: PDF, DOCX, Biller",
    },

    models: {
      title: "KI-Modellen",
      provider: "Anbieder",
      capabilities: "Möglichkeiten",
      status: "Status",
      active: "Aktiv",
      inactive: "Inaktiv",
      loading: "Warrt laadt",
      select: "Modell utsöken",
      configure: "Inrichten",
      test: "Modell testen",
    },

    chat: {
      title: "KI-Hölper",
      inputPlaceholder: "Frag mi wat över dat ERP-System...",
      send: "Sennen",
      newSession: "Nieg Snacken",
      clear: "Chat wegdoon",
      thinking: "Denkt na...",
      examples: {
        title: "Bispelfragen",
        q1: "Wo maak ik en Rekening?",
        q2: "Wies överfallig Betahlen",
        q3: "Maak Verkoopsbericht för Q4",
        q4: "Hülp bi Medarbeider-Onboarding",
      },
    },

    batch: {
      title: "Stapelverarbeiden",
      create: "Stapeljob maken",
      monitor: "Fortgang överwaken",
      history: "Job-Historie",
      schedule: "Planen",
      cancel: "Job afbreken",
      retry: "Fehlslagen nochmal maken",
    },
  },

  // ===== CRM MODUL =====
  crm: {
    title: "Kunnenbeziehungsmanagement",

    customers: {
      title: "Kunnen",
      list: "Kunnenlist",
      details: "Kunnendetails",
      new: "Nieg Kunn",
      edit: "Kunn bearbeiden",
      delete: "Kunn wegdoon",
      import: "Kunnen rinhalen",
      export: "Kunnen rutgeven",
    },

    leads: {
      title: "Leads",
      convert: "To Kunn maken",
      assign: "Verkoop toordnen",
      followUp: "Folgen planen",
    },

    opportunities: {
      title: "Verkoopschanzen",
      stages: {
        prospecting: "Akquise",
        qualification: "Qualifizeren",
        proposal: "Anbod",
        negotiation: "Verhanneln",
        closedWon: "Wunnen",
        closedLost: "Verleern",
      },
    },

    contacts: {
      title: "Kontakten",
      add: "Kontakt tofögen",
      primary: "Hööftanspreker",
      communication: "Kommunikatschoonsprotokoll",
    },

    activities: {
      title: "Aktivitäten",
      logCall: "Telefonat opschrieven",
      scheduleMeeting: "Meeting planen",
      sendEmail: "E-Mail sennen",
      addNote: "Notitz tofögen",
    },
  },

  // ===== FINANZMODUL =====
  finance: {
    title: "Finanzen & Bookholten",

    invoices: {
      title: "Rekeningen",
      create: "Rekening maken",
      send: "Rekening sennen",
      markPaid: "As betahlt markeren",
      reminder: "Mahnung sennen",
      cancel: "Rekening afseggen",
      duplicate: "Kopieren",
    },

    status: {
      draft: "Entwarf",
      sent: "Sennen",
      paid: "Betahlt",
      overdue: "Överfallig",
      cancelled: "Afseggt",
      partiallyPaid: "Deelwies betahlt",
    },

    reports: {
      title: "Finanzberichten",
      profitLoss: "Winn- un Verlustreken",
      balanceSheet: "Bilanz",
      cashFlow: "Cashflow",
      agedReceivables: "Forderungsöllern",
      agedPayables: "Verplichtensöllern",
    },

    banking: {
      title: "Bankwesen",
      reconcile: "Konto afgleken",
      importStatement: "Konto-Utdruck rinhalen",
      matchTransactions: "Transaktschonen toordnen",
    },
  },

  // ===== PERSONALMODUL =====
  hr: {
    title: "Personalwesen",

    employees: {
      title: "Medarbeiders",
      new: "Nieg Medarbeider",
      edit: "Medarbeider bearbeiden",
      terminate: "Anstellen beenden",
      reactivate: "Wedder anstellen",
      documents: "Medarbeiderdokumenten",
    },

    departments: {
      title: "Afdelen",
      assign: "Afdelen toordnen",
      transfer: "Medarbeider versetten",
    },

    attendance: {
      title: "Anwesen",
      clockIn: "Stempeln (Start)",
      clockOut: "Stempeln (Ende)",
      timesheet: "Tietnahwiesen",
      approve: "Stunnen goodheten",
    },

    payroll: {
      title: "Löhn",
      run: "Löhn maken",
      review: "Löhn nakieken",
      approve: "Löhn goodheten",
      export: "För Bank rutgeven",
    },
  },

  // ===== UI-KOMPONENTEN =====
  ui: {
    common: {
      confirm: "Bestätigen",
      cancel: "Afbreken",
      save: "Spiekern",
      delete: "Wegdoon",
      edit: "Bearbeiden",
      add: "Tofögen",
      view: "Anwiesen",
      close: "Tomaken",
      back: "Trüch",
      next: "Wieder",
      previous: "Vörige",
      search: "Söken",
      filter: "Filter",
      sort: "Sorteren",
      refresh: "Frisch maken",
      download: "Runnermaken",
      upload: "Rinhalen",
      print: "Drucken",
      export: "Rutgeven",
      import: "Rinhalen",
      help: "Hülp",
      settings: "Instellens",
      more: "Mehr",
      less: "Minder",
      expand: "Utklappen",
      collapse: "Toklappen",
      enable: "Anmaken",
      disable: "Utmaken",
      activate: "Anmaken",
      deactivate: "Utmaken",
      selectAll: "All utsöken",
      deselectAll: "Utwahl wegdoon",
      clear: "Wegdoon",
      reset: "Trüchsetten",
      submit: "Afgeven",
      continue: "Wieder",
      finish: "Fardig",
      ok: "OK",
      yes: "Ja",
      no: "Nee",
    },

    status: {
      loading: "Warrt laadt...",
      saving: "Warrt spiekert...",
      processing: "Warrt verarbeidt...",
      uploading: "Warrt rinhollen...",
      downloading: "Warrt runnermookt...",
      success: "Klappt!",
      error: "Fehler!",
      warning: "Warnen!",
      info: "Informatschoon",
      unknown: "Nich bekannt",
    },

    validation: {
      required: "Dit Feld is nödig",
      invalidEmail: "Unrecht E-Mail-Adress",
      invalidPhone: "Unrecht Telefonnummer",
      minLength: "Minstens {{count}} Tekens nödig",
      maxLength: "Höchstens {{count}} Tekens tolaat",
      passwordMismatch: "Passwöör passt nich",
      invalidFormat: "Unrecht Formaat",
      duplicate: "Düssen Weert gifft dat al",
    },

    emptyStates: {
      noData: "Keen Daten verfögboor",
      noResults: "Keen Resultaten funnen",
      emptyList: "De List is leddig",
      notConfigured: "Noch nich inricht",
      comingSoon: "Kümmt bald",
    },

    dates: {
      today: "Hüüt",
      yesterday: "Güstern",
      tomorrow: "Mörn",
      thisWeek: "Disse Week",
      lastWeek: "Lüüt Week",
      nextWeek: "Kümmt Week",
      thisMonth: "Düssen Maand",
      lastMonth: "Lüüt Maand",
      nextMonth: "Kümmt Maand",
      thisQuarter: "Dütt Quartal",
      lastQuarter: "Lüüt Quartal",
      nextQuarter: "Kümmt Quartal",
      thisYear: "Dütt Johr",
      lastYear: "Lüüt Johr",
      nextYear: "Kümmt Johr",
      customRange: "Egenschapp Ruum",
      selectDate: "Datum utsöken",
    },

    time: {
      now: "Nu",
      minutes: "Minuten",
      hours: "Stünnen",
      days: "Daag",
      weeks: "Weken",
      months: "Maanden",
      years: "Johren",
      ago: "vör",
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
    network: "Netzwarkfehler. Prööv jüst de Verbinnen.",
    server: "Serverfehler. Versöök later nochmal.",
    timeout: "Tied is um. Versöök nochmal.",
    unauthorized: "Du hest keen Recht för düsse Akschoon.",
    forbidden: "Togang afseggt. Nich noog Rechten.",
    notFound: "Wat du söchst, gifft dat nich.",
    validation: "Prööv jüst din Ingaav un versöök nochmal.",
    duplicate: "Düssen Indrag gifft dat al.",
    constraint: "Kann nich weg, wegen Afhangigkeiten.",
    fileTooLarge: "Datei to groot.",
    invalidFileType: "Unrecht Dateityp.",
    quotaExceeded: "Speekerplatz opbruukt.",

    specific: {
      loginFailed: "Anmellen fehlslaan. Prööv jüst de Daten.",
      sessionExpired: "Din Sessie is dood. Mell di nochmal an.",
      passwordWeak: "Passwoord to swack.",
      emailInUse: "E-Mail-Adress warrt al bruukt.",
      invalidToken: "Unrecht oder dood Token.",
    },

    retry: "Nochmal versöken",
    contactSupport: "Hülp fragen",
    goBack: "Trüch",
    reloadPage: "Siet frisch maken",
  },

  // ===== KLAPPT-MELDUNGEN =====
  success: {
    saved: "Ännern spiekert!",
    created: "Maakt!",
    updated: "Ännert!",
    deleted: "Wegdoon!",
    uploaded: "Rinhollen!",
    exported: "Rutgeven!",
    imported: "Rinhollen!",
    sent: "Sennen!",
    processed: "Verarbeidt!",
    configured: "Inricht!",
    activated: "Anmaakt!",
    deactivated: "Utmaakt!",

    actions: {
      close: "Tomaken",
      view: "Anwiesen",
      continue: "Wieder",
      new: "Nieg maken",
    },
  },

  // ===== SEKERHEITSFRAGEN =====
  confirm: {
    delete: {
      title: "Wegdoon sekern?",
      message: "Willst du dat wirklick wegdoon? Geiht nich trüch.",
      single: "Düt wegdoon?",
      multiple: "{{count}} utsöken wegmaken?",
      permanent: "Dat is denn för immer weg.",
    },

    logout: {
      title: "Afmellen sekern?",
      message: "Willst du wirklick afmellen?",
    },

    cancel: {
      title: "Afbreken sekern?",
      message: "Willst du afbreken? Nich spiekert Ännern sünd denn weg.",
    },

    discard: {
      title: "Ännern wegdoon?",
      message: "Du hest nich spiekert Ännern. Willst du se wirklick wegdoon?",
    },

    overwrite: {
      title: "Överschrieven sekern?",
      message: "Dat överschrifft ole Daten. Seker?",
    },

    buttons: {
      proceed: "Wiedermaken",
      keep: "Behollen",
      discard: "Wegdoon",
      cancel: "Afbreken",
    },
  },

  // ===== FORMULARE & INGAVEN =====
  forms: {
    labels: {
      name: "Naam",
      email: "E-Mail",
      phone: "Telefon",
      address: "Adress",
      city: "Stadt",
      zipCode: "Postleettall",
      country: "Land",
      description: "Beskrieven",
      notes: "Notizen",
      comments: "Kommentaren",
      quantity: "Tall",
      price: "Pries",
      amount: "Betrag",
      total: "Alltohoop",
      discount: "Rabatt",
      tax: "Stüür",
      subtotal: "Twüschensumm",
      status: "Status",
      type: "Typ",
      category: "Kategorie",
      tags: "Kennmarken",
      priority: "Wichtig",
      dueDate: "Fällig an",
      startDate: "Anfang an",
      endDate: "End an",
      createdAt: "Maakt an",
      updatedAt: "Ännert an",
      createdBy: "Maakt vun",
      updatedBy: "Ännert vun",
    },

    placeholders: {
      select: "Utsöken...",
      searchSelect: "Tipp to söken...",
      typeHere: "Hier ingeven...",
      chooseFile: "Datei utsöken...",
      dragDrop: "Dateien hierhen slepen",
      optional: "Freewillig",
      required: "Nödig",
    },

    hints: {
      minCharacters: "Minstens {{count}} Tekens",
      maxCharacters: "Höchstens {{count}} Tekens",
      requiredField: "Nödig Feld",
      optionalField: "Freewillig Feld",
    },
  },

  // ===== TABELL & DATENRUTER =====
  table: {
    actions: {
      title: "Akschonen",
      edit: "Bearbeiden",
      delete: "Wegdoon",
      view: "Anwiesen",
      duplicate: "Kopieren",
      export: "Rutgeven",
      more: "Mehr Akschonen",
    },

    selection: {
      selected: "{{count}} utsöken",
      selectAll: "All utsöken",
      clear: "Utwahl wegdoon",
    },

    pagination: {
      page: "Siet",
      of: "vun",
      rowsPerPage: "Reegen per Siet",
      showing: "Wiest {{from}} bit {{to}} vun {{total}} Indrääg",
      first: "Eerste",
      previous: "Vörige",
      next: "Nächste",
      last: "Leste",
    },

    sorting: {
      sortBy: "Sorteren na",
      ascending: "Opstiegen",
      descending: "Dalgahen",
      clear: "Sorteren wegdoon",
    },

    filtering: {
      filter: "Filter",
      clearFilters: "Filter wegdoon",
      apply: "Anwennen",
    },

    empty: {
      noData: "Keen Daten verfögboor",
      noResults: "Keen Resultaten funnen",
      loading: "Daten warrt laadt...",
      error: "Fehler bi't Laden",
    },
  },

  // ===== MODALE & SNACKEN =====
  modal: {
    close: "Tomaken",
    maximize: "Grötter maken",
    minimize: "Lütter maken",
    fullscreen: "Heelbild",
    exitFullscreen: "Heelbild verlaten",
  },

  // ===== DATEIVERWALTEN =====
  files: {
    upload: "Dateien rinhollen",
    download: "Runnermaken",
    preview: "Vörschau",
    rename: "Naam ännern",
    move: "Verleggen",
    copy: "Kopieren",
    delete: "Wegdoon",
    share: "Deelen",
    properties: "Egenschappen",

    types: {
      image: "Bild",
      document: "Dokument",
      pdf: "PDF",
      spreadsheet: "Tabellen",
      presentation: "Vörstellen",
      archive: "Archiv",
      audio: "Audio",
      video: "Video",
      other: "Annere",
    },

    status: {
      uploading: "Warrt rinhollen...",
      processing: "Warrt verarbeidt...",
      complete: "Fardig",
      failed: "Fehlslaan",
      queued: "In de Reeg",
    },
  },

  // ===== DRUCKEN & RUTGEVEN =====
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
      currentPage: "Disse Siet",
      allPages: "All Sieden",
      selectedRows: "Utsöken Reegen",
      customRange: "Egenschapp Ruum",
    },

    status: {
      generating: "Rutgeven warrt maakt...",
      ready: "Rutgeven fardig",
      failed: "Rutgeven fehlslaan",
    },
  },

  // ===== SYSTEM & ADMIN =====
  system: {
    settings: {
      title: "Systeminstellens",
      general: "Allgemeen",
      appearance: "Utsehn",
      notifications: "Bescheeden",
      security: "Sekern",
      integrations: "Verbinnen",
      backup: "Backup & Wedderherstellen",
      logs: "System-Logs",
      maintenance: "Warung",
    },

    users: {
      title: "Brukerverwalten",
      newUser: "Nieg Bruker",
      editUser: "Bruker bearbeiden",
      resetPassword: "Passwoord trüchsetten",
      deactivate: "Utmaken",
      activate: "Anmaken",
      roles: "Rollen toordnen",
    },

    roles: {
      title: "Rollen & Rechten",
      create: "Rolle maken",
      edit: "Rolle bearbeiden",
      delete: "Rolle wegdoon",
      permissions: "Rechten verwalten",
    },

    logs: {
      title: "System-Logs",
      clear: "Logs wegdoon",
      export: "Logs rutgeven",
      filter: "Logs filter",
      severity: {
        debug: "Debug",
        info: "Info",
        warning: "Warnen",
        error: "Fehler",
        critical: "Kritsch",
      },
    },

    maintenance: {
      title: "Warung",
      backup: "Backup maken",
      restore: "Backup wedderhalen",
      cleanup: "Daten opruumen",
      optimize: "Datenbank beter maken",
      update: "System-Update",
    },
  },

  // ===== TIED & DATUMS =====
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
      justNow: "jüst",
      secondsAgo: "vör {{count}} Sekunnen",
      secondsAgo_one: "vör 1 Sekunn",
      minutesAgo: "vör {{count}} Minuten",
      minutesAgo_one: "vör 1 Minuut",
      hoursAgo: "vör {{count}} Stünnen",
      hoursAgo_one: "vör 1 Stünn",
      daysAgo: "vör {{count}} Daag",
      daysAgo_one: "vör 1 Dag",
      weeksAgo: "vör {{count}} Weken",
      weeksAgo_one: "vör 1 Week",
      monthsAgo: "vör {{count}} Maanden",
      monthsAgo_one: "vör 1 Maand",
      yearsAgo: "vör {{count}} Johren",
      yearsAgo_one: "vör 1 Johr",

      inSeconds: "in {{count}} Sekunnen",
      inSeconds_one: "in 1 Sekunn",
      inMinutes: "in {{count}} Minuten",
      inMinutes_one: "in 1 Minuut",
      inHours: "in {{count}} Stünnen",
      inHours_one: "in 1 Stünn",
      inDays: "in {{count}} Daag",
      inDays_one: "in 1 Dag",
      inWeeks: "in {{count}} Weken",
      inWeeks_one: "in 1 Week",
      inMonths: "in {{count}} Maanden",
      inMonths_one: "in 1 Maand",
      inYears: "in {{count}} Johren",
      inYears_one: "in 1 Johr",
    },

    units: {
      second: "Sekunn",
      second_one: "{{count}} Sekunn",
      second_other: "{{count}} Sekunnen",
      minute: "Minuut",
      minute_one: "{{count}} Minuut",
      minute_other: "{{count}} Minuten",
      hour: "Stünn",
      hour_one: "{{count}} Stünn",
      hour_other: "{{count}} Stünnen",
      day: "Dag",
      day_one: "{{count}} Dag",
      day_other: "{{count}} Daag",
      week: "Week",
      week_one: "{{count}} Week",
      week_other: "{{count}} Weken",
      month: "Maand",
      month_one: "{{count}} Maand",
      month_other: "{{count}} Maanden",
      year: "Johr",
      year_one: "{{count}} Johr",
      year_other: "{{count}} Johren",
    },
  },

  // ===== MEHRTALLREGELN =====
  pluralization: {
    items: {
      item: "Indrag",
      item_one: "{{count}} Indrag",
      item_other: "{{count}} Indrääg",
      record: "Datensatz",
      record_one: "{{count}} Datensatz",
      record_other: "{{count}} Datensätz",
      file: "Datei",
      file_one: "{{count}} Datei",
      file_other: "{{count}} Dateien",
      user: "Bruker",
      user_one: "{{count}} Bruker",
      user_other: "{{count}} Brukers",
      customer: "Kunn",
      customer_one: "{{count}} Kunn",
      customer_other: "{{count}} Kunnen",
      employee: "Medarbeider",
      employee_one: "{{count}} Medarbeider",
      employee_other: "{{count}} Medarbeiders",
      invoice: "Rekening",
      invoice_one: "{{count}} Rekening",
      invoice_other: "{{count}} Rekeningen",
      product: "Produkt",
      product_one: "{{count}} Produkt",
      product_other: "{{count}} Produkten",
      order: "Opdrag",
      order_one: "{{count}} Opdrag",
      order_other: "{{count}} Opdrääg",
      project: "Projekt",
      project_one: "{{count}} Projekt",
      project_other: "{{count}} Projekten",
      document: "Dokument",
      document_one: "{{count}} Dokument",
      document_other: "{{count}} Dokumenten",
    },

    time: {
      day: "Dag",
      day_one: "{{count}} Dag",
      day_other: "{{count}} Daag",
      hour: "Stünn",
      hour_one: "{{count}} Stünn",
      hour_other: "{{count}} Stünnen",
      minute: "Minuut",
      minute_one: "{{count}} Minuut",
      minute_other: "{{count}} Minuten",
      second: "Sekunn",
      second_one: "{{count}} Sekunn",
      second_other: "{{count}} Sekunnen",
    },
  },
} as const;
