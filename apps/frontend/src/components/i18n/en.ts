export default {
  dashboard: {
    title: "ERP SteinmetZ – Function Catalog",
    subtitle: "Overview of system status and functional areas",

    // System health
    health: {
      status: {
        healthy: "System operational",
        degraded: "System degraded",
        unhealthy: "System failure",
      },
    },

    // Categories
    categories: {
      title: "Functional Areas",
      count: "{{count}} areas available",
      count_one: "{{count}} area available",
      count_other: "{{count}} areas available",
      emptyTitle: "No categories found",
      emptyDescription: "No matching categories could be displayed.",
    },

    // General status
    online: "System online",
    degraded: "System degraded",
    error: "Connection error",
    checking: "Checking status…",
    unknown: "Unknown",

    // Loading
    loading: {
      message: "Loading data…",
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
      noResults: "No results found",
    },

    // Error screen
    errorScreen: {
      title: "Error while loading",
      retryButton: "Try again",
    },

    // Navigation
    navigation: {
      overview: "Overview",
      catalog: "Functions",
      ai: "AI Annotator",
      settings: "Settings",
    },

    // Chat
    openChat: "Open chat",
    chat: {
      inputPlaceholder: "Enter message…",
      send: "Send",
      newSession: "New session",
      loading: "Processing response…",
    },

    // Models
    models: {
      title: "Models",
      provider: "Provider",
      capabilities: "Capabilities",
      noModels: "No models available",
    },

    // Tools
    tools: {
      title: "Tools",
      run: "Execute",
      noTools: "No tools registered",
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
      statusDegraded: "Limited",
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
      unknown: "Unknown",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      back: "Back",
      next: "Next",
      previous: "Previous",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information",
    },
    
    // Plural forms for common items
    items: {
      result: "Result",
      result_one: "{{count}} result",
      result_other: "{{count}} results",
      file: "File",
      file_one: "{{count}} file",
      file_other: "{{count}} files",
      user: "User",
      user_one: "{{count}} user",
      user_other: "{{count}} users",
      message: "Message",
      message_one: "{{count}} message",
      message_other: "{{count}} messages",
      item: "Item",
      item_one: "{{count}} item",
      item_other: "{{count}} items",
    },
    
    // Date and time formatting
    datetime: {
      today: "Today",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      now: "Now",
      minutesAgo: "{{count}} minutes ago",
      minutesAgo_one: "1 minute ago",
      hoursAgo: "{{count}} hours ago",
      hoursAgo_one: "1 hour ago",
      daysAgo: "{{count}} days ago",
      daysAgo_one: "1 day ago",
    },
    
    // Currency and numbers
    format: {
      currency: "{{value, currency:USD}}",
      percent: "{{value, percent}}",
      decimal: "{{value, decimal}}",
    },
  },
};
