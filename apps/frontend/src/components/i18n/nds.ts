export default {
  dashboard: {
    title: "ERP SteinmetZ – Funkschoonskatalog",
    subtitle: "Översicht över’t System un de Funkschoonsrebeden",

    // Systemstatus
    health: {
      status: {
        healthy: "System löppt normaal",
        degraded: "System hett Inskränkungen",
        unhealthy: "System funktscheert nich"
      }
    },

    // Kategorien
    categories: {
      title: "Funkschoonsrebeden",
      count: "{{count}} Rebeden verfögbar",
      emptyTitle: "Keen Kategorien funnen",
      emptyDescription: "För düsse Utsöök gifft dat keen Kategorien."
    },

    online: "System löppt",
    degraded: "System hett Inskränkungen",
    error: "Verbinnenfehler",
    checking: "Status warrt pröövt…",
    unknown: "Nich bekannt",

    loading: {
      message: "Daten warrt laadt…"
    },

    search: {
      button: "Söök starten",
      filter: "Söökfilter",
      filterCategory: "Kategorien",
      filterFunction: "Funkschoonen",
      placeholder: "Söök na {{type}}…",
      input: "Söökfeld",
      loading: "Söök löppt…",
      noResults: "Keen Resultaten funnen"
    },

    errorScreen: {
      title: "Fehler bi't Laden",
      retryButton: "Nieg versöken"
    },

    navigation: {
      overview: "Översicht",
      catalog: "Funkschoonen",
      ai: "AI-Annotator",
      settings: "Instellens"
    },

    openChat: "Chat opmaken",
    chat: {
      inputPlaceholder: "Naricht ingeven…",
      send: "Sennen",
      newSession: "Nieg Sessie",
      loading: "Antwoord warrt verarbeidt…"
    },

    models: {
      title: "Modellen",
      provider: "Anbieter",
      capabilities: "Möglichkeiten",
      noModels: "Keen Modellen verfögbar"
    },

    tools: {
      title: "Warktüüch",
      run: "Utföhren",
      noTools: "Keen Warktüüch ingraadt"
    },

    system: {
      title: "Systeminformatschonen",
      version: "Version",
      uptime: "Lööptied",
      memory: "Speeker",
      routes: "Ingraade Routen",
      environment: "Ömgeven",
      database: "Datenbank",
      diagnostics: "Diagnos",
      features: "Funktschoonen",
      resources: "Ressourcen",
      ai: "AI-Status",
      statusHealthy: "Funkschonen",
      statusUnhealthy: "Nich funkschonen",
      statusDegraded: "Inskränkt"
    },

    languageSwitcher: "Spraak utsöken",

    ui: {
      confirm: "Bestätigen",
      cancel: "Afbreken",
      close: "Tomaaken",
      reload: "Nieg laden",
      details: "Details",
      unknown: "Nich bekannt"
    }
  }
};
