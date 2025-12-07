export default {
  dashboard: {
    title: "ERP SteinmetZ – Catalogo delle funzioni",
    subtitle: "Panoramica dello stato del sistema e delle aree funzionali",

    // Stato del sistema
    health: {
      status: {
        healthy: "Sistema operativo",
        degraded: "Sistema degradato",
        unhealthy: "Errore del sistema",
      },
    },

    // Categorie
    categories: {
      title: "Aree funzionali",
      count: "{{count}} aree disponibili",
      count_one: "{{count}} area disponibile",
      count_other: "{{count}} aree disponibili",
      emptyTitle: "Nessuna categoria trovata",
      emptyDescription: "Nessuna categoria corrispondente trovata.",
    },

    // Stati generali
    online: "Sistema online",
    degraded: "Sistema limitato",
    error: "Errore di connessione",
    checking: "Verifica dello stato…",
    unknown: "Sconosciuto",

    // Caricamento
    loading: {
      message: "Caricamento dei dati…",
    },

    // Ricerca
    search: {
      button: "Avvia ricerca",
      filter: "Filtro di ricerca",
      filterCategory: "Categorie",
      filterFunction: "Funzioni",
      placeholder: "Cerca {{type}}…",
      input: "Campo di ricerca",
      loading: "Ricerca in corso…",
      noResults: "Nessun risultato trovato",
    },

    // Schermata di errore
    errorScreen: {
      title: "Errore durante il caricamento",
      retryButton: "Riprova",
    },

    // Navigazione
    navigation: {
      overview: "Panoramica",
      catalog: "Funzioni",
      ai: "Annotatore IA",
      settings: "Impostazioni",
    },

    // Chat
    openChat: "Apri chat",
    chat: {
      inputPlaceholder: "Inserisci messaggio…",
      send: "Invia",
      newSession: "Nuova sessione",
      loading: "Elaborazione risposta…",
    },

    // Modelli
    models: {
      title: "Modelli",
      provider: "Fornitore",
      capabilities: "Capacità",
      noModels: "Nessun modello disponibile",
    },

    // Strumenti
    tools: {
      title: "Strumenti",
      run: "Esegui",
      noTools: "Nessuno strumento registrato",
    },

    // Informazioni di sistema
    system: {
      title: "Informazioni di sistema",
      version: "Versione",
      uptime: "Tempo di attività",
      memory: "Memoria",
      routes: "Route registrate",
      environment: "Ambiente",
      database: "Database",
      diagnostics: "Diagnostica",
      features: "Funzionalità",
      resources: "Risorse",
      ai: "Stato IA",
      statusHealthy: "Operativo",
      statusUnhealthy: "Non operativo",
      statusDegraded: "Limitato",
    },

    // Selettore lingua
    languageSwitcher: "Seleziona lingua",

    // Interfaccia utente generale
    ui: {
      confirm: "Conferma",
      cancel: "Annulla",
      close: "Chiudi",
      reload: "Ricarica",
      details: "Dettagli",
      unknown: "Sconosciuto",
      save: "Salva",
      delete: "Elimina",
      edit: "Modifica",
      add: "Aggiungi",
      back: "Indietro",
      next: "Avanti",
      previous: "Precedente",
      loading: "Caricamento...",
      error: "Errore",
      success: "Successo",
      warning: "Avviso",
      info: "Informazione",
    },

    // Forme plurali per elementi comuni
    items: {
      result: "Risultato",
      result_one: "{{count}} risultato",
      result_other: "{{count}} risultati",
      file: "File",
      file_one: "{{count}} file",
      file_other: "{{count}} file",
      user: "Utente",
      user_one: "{{count}} utente",
      user_other: "{{count}} utenti",
      message: "Messaggio",
      message_one: "{{count}} messaggio",
      message_other: "{{count}} messaggi",
      item: "Elemento",
      item_one: "{{count}} elemento",
      item_other: "{{count}} elementi",
    },

    // Formattazione data e ora
    datetime: {
      today: "Oggi",
      yesterday: "Ieri",
      tomorrow: "Domani",
      now: "Ora",
      minutesAgo: "{{count}} minuti fa",
      minutesAgo_one: "1 minuto fa",
      hoursAgo: "{{count}} ore fa",
      hoursAgo_one: "1 ora fa",
      daysAgo: "{{count}} giorni fa",
      daysAgo_one: "1 giorno fa",
    },

    // Valute e numeri
    format: {
      currency: "{{value, currency:EUR}}",
      percent: "{{value, percent}}",
      decimal: "{{value, decimal}}",
    },
  },
};
