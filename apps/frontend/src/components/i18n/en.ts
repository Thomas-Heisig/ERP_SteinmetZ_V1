export default {
  dashboard: {
    title: "ERP SteinmetZ – Function Catalog",
    subtitle: "Overview of system status and functional areas",

    // System health
    health: {
      status: {
        healthy: "System operational",
        degraded: "System degraded",
        unhealthy: "System failure"
      }
    },

    // Categories
    categories: {
      title: "Functional Areas",
      count: "{{count}} areas available",
      emptyTitle: "No categories found",
      emptyDescription: "No matching categories could be displayed."
    },

    // General status
    online: "System online",
    degraded: "System degraded",
    error: "Connection error",
    checking: "Checking status…",
    unknown: "Unknown",

    // Loading
    loading: {
      message: "Loading data…"
    },

    // Search module
    search: {
      button: "Start search",
      filter: "Search filter",
      filterCategory: "Categories",
      filterFunction: "Functions",
      placeholder: "Search for {{type}}…",
      input: "Search field",
      loading: "Searching…",
      noResults: "No results found"
    },

    // Error screen
    errorScreen: {
      title: "Error while loading",
      retryButton: "Try again"
    },

    // Navigation
    navigation: {
      overview: "Overview",
      catalog: "Functions",
      ai: "AI Annotator",
      settings: "Settings"
    },

    // Chat
    openChat: "Open chat",
    chat: {
      inputPlaceholder: "Enter message…",
      send: "Send",
      newSession: "New session",
      loading: "Processing response…"
    },

    // Models
    models: {
      title: "Models",
      provider: "Provider",
      capabilities: "Capabilities",
      noModels: "No models available"
    },

    // Tools
    tools: {
      title: "Tools",
      run: "Execute",
      noTools: "No tools registered"
    },

    // System info
    system: {
      title: "System Information",
      version: "Version",
      uptime: "Uptime",
      memory: "Memory",
      routes: "Registered routes",
      environment: "Environment",
      database: "Database",
      diagnostics: "Diagnostics",
      features: "Features",
      resources: "Resources",
      ai: "AI status",
      statusHealthy: "Operational",
      statusUnhealthy: "Not operational",
      statusDegraded: "Limited"
    },

    // Language selection
    languageSwitcher: "Select language",

    // General UI
    ui: {
      confirm: "Confirm",
      cancel: "Cancel",
      close: "Close",
      reload: "Reload",
      details: "Details",
      unknown: "Unknown"
    }
  }
};
