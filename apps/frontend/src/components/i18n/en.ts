export default {
  // ===== DASHBOARD & SYSTEM =====
  dashboard: {
    title: "ERP SteinmetZ – Functional Overview",
    subtitle: "Central control panel for business operations",
    welcome: "Welcome back, {{name}}",

    // Status indicators
    status: {
      online: "System online",
      degraded: "System degraded",
      offline: "System offline",
      maintenance: "Maintenance mode",
      syncing: "Syncing data...",
    },

    // Quick actions
    quickActions: {
      title: "Quick Actions",
      newInvoice: "New invoice",
      newCustomer: "New customer",
      newEmployee: "New employee",
      newProject: "New project",
      runReport: "Run report",
      exportData: "Export data",
      importData: "Import data",
    },

    // Health monitoring
    health: {
      title: "System Health",
      status: {
        healthy: "All systems operational",
        degraded: "Partial degradation",
        unhealthy: "Critical failure detected",
      },
      components: {
        database: "Database",
        api: "API Gateway",
        auth: "Authentication",
        storage: "File Storage",
        websocket: "WebSocket",
        cache: "Cache",
      },
      metrics: {
        uptime: "Uptime",
        responseTime: "Response time",
        memoryUsage: "Memory usage",
        cpuLoad: "CPU load",
      },
    },

    // Notifications
    notifications: {
      title: "Notifications",
      empty: "No new notifications",
      markAllRead: "Mark all as read",
      clearAll: "Clear all",
      types: {
        info: "Information",
        warning: "Warning",
        error: "Error",
        success: "Success",
      },
    },

    // Recent activity
    recentActivity: {
      title: "Recent Activity",
      types: {
        login: "User login",
        create: "Created",
        update: "Updated",
        delete: "Deleted",
        export: "Exported",
        import: "Imported",
      },
      empty: "No recent activity",
    },
  },

  // ===== CATALOG & FUNCTIONS =====
  catalog: {
    title: "Function Catalog",
    subtitle: "Browse available system functions",

    categories: {
      title: "Functional Areas",
      count: "{{count}} areas available",
      count_one: "{{count}} area available",
      count_other: "{{count}} areas available",
      emptyTitle: "No categories found",
      emptyDescription: "No matching categories could be displayed.",
      filter: {
        all: "All categories",
        favorites: "Favorites only",
        recent: "Recently used",
      },
    },

    functions: {
      title: "Available Functions",
      search: {
        placeholder: "Search functions...",
        button: "Search",
        advanced: "Advanced search",
        filters: "Filters",
        clear: "Clear search",
      },
      view: {
        grid: "Grid view",
        list: "List view",
        details: "Details view",
      },
      actions: {
        execute: "Execute",
        favorite: "Add to favorites",
        unfavorite: "Remove from favorites",
        details: "View details",
        export: "Export function",
        duplicate: "Duplicate",
      },
      metadata: {
        version: "Version",
        author: "Author",
        lastModified: "Last modified",
        dependencies: "Dependencies",
        tags: "Tags",
      },
    },
  },

  // ===== SEARCH =====
  search: {
    global: {
      placeholder: "Search across ERP system...",
      button: "Search",
      advanced: "Advanced search",
      clear: "Clear",
    },

    filters: {
      title: "Search Filters",
      category: "Category",
      type: "Type",
      status: "Status",
      dateRange: "Date range",
      amount: "Amount range",
      clearAll: "Clear all filters",
      apply: "Apply filters",
    },

    results: {
      title: "Search Results",
      loading: "Searching...",
      noResults: "No results found",
      tryAgain: "Try different keywords",
      showing: "Showing {{count}} of {{total}} results",
      relevance: "Relevance",
      newest: "Newest first",
      oldest: "Oldest first",
    },

    modules: {
      all: "All modules",
      crm: "CRM",
      finance: "Finance",
      hr: "Human Resources",
      inventory: "Inventory",
      projects: "Projects",
      documents: "Documents",
      ai: "AI Functions",
    },
  },

  // ===== NAVIGATION & SIDEBAR =====
  sidebar: {
    title: "Navigation",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    pin: "Pin sidebar",
    unpin: "Unpin sidebar",

    // Direct navigation items (used by MainNavigation)
    dashboard: "Dashboard",
    catalog: "Function Catalog",
    calendar: "Calendar",
    company: "Company",
    processes: "Process Management",
    risk: "Risk & Compliance",
    accounting: "Accounting",
    controlling: "Controlling",
    treasury: "Treasury",
    taxes: "Taxes",
    crm: "Customers (CRM)",
    marketing: "Marketing",
    sales: "Sales",
    fulfillment: "Fulfillment",
    purchasing: "Purchasing",
    receiving: "Goods Receipt",
    suppliers: "Suppliers",
    planning: "Production Planning",
    manufacturing: "Manufacturing Control",
    quality: "Quality Management",
    maintenance: "Maintenance",
    inventory: "Inventory Management",
    picking: "Picking",
    logistics: "Logistics",
    personnel: "Personnel Management",
    timeTracking: "Time Tracking",
    development: "Personnel Development",
    recruiting: "Recruiting",
    reports: "Standard Reports",
    adhoc: "Ad-hoc Analysis",
    aiAnalytics: "AI Analytics",
    email: "Email Management",
    messaging: "Messaging",
    social: "Social Media",
    users: "User Management",
    systemSettings: "System Settings",
    integrations: "Integrations",
    aiAnnotator: "AI Annotator",
    batchProcessing: "Batch Processing",
    qualityDashboard: "Quality",
    modelManagement: "Models",
    advancedFilters: "Filters",
    documents: "Documents",
    projects: "Projects",
    settings: "Settings",
    help: "Help",

    // Section titles
    main: "Main Area",
    business: "Business Management",
    finance: "Finance & Controlling",
    procurement: "Procurement",
    production: "Production & Manufacturing",
    warehouse: "Warehouse & Logistics",
    hr: "Human Resources",
    reporting: "Reporting & Analytics",
    communication: "Communication & Social",
    system: "System & Administration",
    ai: "AI & Automation",

    // Main sections
    sections: {
      main: "Main Area",
      business: "Business Management",
      finance: "Finance & Controlling",
      sales: "Sales & Marketing",
      procurement: "Procurement",
      production: "Production & Manufacturing",
      warehouse: "Warehouse & Logistics",
      hr: "Human Resources",
      reporting: "Reporting & Analytics",
      communication: "Communication",
      system: "System & Admin",
      ai: "AI & Automation",
      tools: "Tools",
    },

    // Navigation items with icons
    navItems: {
      dashboard: "Dashboard",
      catalog: "Function Catalog",
      calendar: "Calendar",
      company: "Company",
      processes: "Process Management",
      risk: "Risk & Compliance",

      // Finance
      accounting: "Accounting",
      controlling: "Controlling",
      treasury: "Treasury",
      taxes: "Taxes",
      invoices: "Invoices",
      expenses: "Expenses",

      // CRM & Sales
      crm: "Customer Management",
      customers: "Customers",
      leads: "Leads",
      opportunities: "Opportunities",
      marketing: "Marketing",
      sales: "Sales",
      orders: "Orders",
      fulfillment: "Fulfillment",

      // Procurement
      purchasing: "Purchasing",
      receiving: "Goods Receipt",
      suppliers: "Suppliers",
      contracts: "Contracts",

      // Production
      planning: "Production Planning",
      manufacturing: "Manufacturing",
      quality: "Quality Management",
      maintenance: "Maintenance",

      // Warehouse
      inventory: "Inventory",
      picking: "Picking",
      logistics: "Logistics",
      shipping: "Shipping",

      // HR
      personnel: "Personnel",
      timeTracking: "Time Tracking",
      payroll: "Payroll",
      development: "Development",
      recruiting: "Recruiting",

      // Reporting
      reports: "Reports",
      analytics: "Analytics",
      dashboards: "Dashboards",
      exports: "Data Exports",

      // Communication
      email: "Email",
      messaging: "Messaging",
      social: "Social Media",
      calls: "Phone Calls",

      // System
      users: "Users",
      roles: "Roles",
      permissions: "Permissions",
      settings: "Settings",
      logs: "System Logs",
      backups: "Backups",

      // AI & Tools
      aiAnnotator: "AI Annotator",
      batchProcessing: "Batch Processing",
      modelManagement: "AI Models",
      advancedFilters: "Advanced Filters",
      innovation: "Innovation Lab",

      // Miscellaneous
      documents: "Documents",
      projects: "Projects",
      help: "Help & Support",
      about: "About System",
    },

    // User menu
    user: {
      profile: "My Profile",
      settings: "My Settings",
      logout: "Logout",
      switchAccount: "Switch Account",
    },

    // Footer
    footer: {
      version: "Version {{version}}",
      lastUpdate: "Last updated: {{date}}",
      copyright: "© {{year}} ERP SteinmetZ",
    },
  },

  // ===== AI & AUTOMATION =====
  ai: {
    title: "AI & Automation",
    annotator: {
      title: "AI Annotator",
      subtitle: "Intelligent document processing",
      upload: "Upload document",
      analyze: "Analyze with AI",
      extract: "Extract data",
      validate: "Validate results",
      export: "Export annotations",
      supportedFormats: "Supported formats: PDF, DOCX, images",
    },

    models: {
      title: "AI Models",
      provider: "Provider",
      capabilities: "Capabilities",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      loading: "Loading",
      select: "Select model",
      configure: "Configure",
      test: "Test model",
    },

    chat: {
      title: "AI Assistant",
      inputPlaceholder: "Ask me anything about the ERP system...",
      send: "Send",
      newSession: "New conversation",
      clear: "Clear chat",
      thinking: "Thinking...",
      examples: {
        title: "Example questions",
        q1: "How do I create an invoice?",
        q2: "Show me overdue payments",
        q3: "Generate sales report for Q4",
        q4: "Help with employee onboarding",
      },
    },

    batch: {
      title: "Batch Processing",
      create: "Create batch job",
      monitor: "Monitor progress",
      history: "Job history",
      schedule: "Schedule",
      cancel: "Cancel job",
      retry: "Retry failed",
    },
  },

  // ===== CRM MODULE =====
  crm: {
    title: "Customer Relationship Management",

    customers: {
      title: "Customers",
      list: "Customer List",
      details: "Customer Details",
      new: "New Customer",
      edit: "Edit Customer",
      delete: "Delete Customer",
      import: "Import Customers",
      export: "Export Customers",
    },

    leads: {
      title: "Leads",
      convert: "Convert to customer",
      assign: "Assign to sales",
      followUp: "Schedule follow-up",
    },

    opportunities: {
      title: "Opportunities",
      stages: {
        prospecting: "Prospecting",
        qualification: "Qualification",
        proposal: "Proposal",
        negotiation: "Negotiation",
        closedWon: "Closed Won",
        closedLost: "Closed Lost",
      },
    },

    contacts: {
      title: "Contacts",
      add: "Add contact",
      primary: "Primary contact",
      communication: "Communication log",
    },

    activities: {
      title: "Activities",
      logCall: "Log phone call",
      scheduleMeeting: "Schedule meeting",
      sendEmail: "Send email",
      addNote: "Add note",
    },
  },

  // ===== FINANCE MODULE =====
  finance: {
    title: "Finance & Accounting",

    invoices: {
      title: "Invoices",
      create: "Create Invoice",
      send: "Send Invoice",
      markPaid: "Mark as Paid",
      reminder: "Send Reminder",
      cancel: "Cancel Invoice",
      duplicate: "Duplicate",
    },

    status: {
      draft: "Draft",
      sent: "Sent",
      paid: "Paid",
      overdue: "Overdue",
      cancelled: "Cancelled",
      partiallyPaid: "Partially Paid",
    },

    reports: {
      title: "Financial Reports",
      profitLoss: "Profit & Loss",
      balanceSheet: "Balance Sheet",
      cashFlow: "Cash Flow",
      agedReceivables: "Aged Receivables",
      agedPayables: "Aged Payables",
    },

    banking: {
      title: "Banking",
      reconcile: "Reconcile Account",
      importStatement: "Import Statement",
      matchTransactions: "Match Transactions",
    },
  },

  // ===== HR MODULE =====
  hr: {
    title: "Human Resources",

    employees: {
      title: "Employees",
      new: "New Employee",
      edit: "Edit Employee",
      terminate: "Terminate Employment",
      reactivate: "Reactivate",
      documents: "Employee Documents",
    },

    departments: {
      title: "Departments",
      assign: "Assign to Department",
      transfer: "Transfer Employee",
    },

    attendance: {
      title: "Attendance",
      clockIn: "Clock In",
      clockOut: "Clock Out",
      timesheet: "Timesheet",
      approve: "Approve Hours",
    },

    payroll: {
      title: "Payroll",
      run: "Run Payroll",
      review: "Review Payroll",
      approve: "Approve Payroll",
      export: "Export for Bank",
    },
  },

  // ===== UI COMPONENTS =====
  ui: {
    common: {
      confirm: "Confirm",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      view: "View",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      refresh: "Refresh",
      download: "Download",
      upload: "Upload",
      print: "Print",
      export: "Export",
      import: "Import",
      help: "Help",
      settings: "Settings",
      more: "More",
      less: "Less",
      expand: "Expand",
      collapse: "Collapse",
      enable: "Enable",
      disable: "Disable",
      activate: "Activate",
      deactivate: "Deactivate",
      selectAll: "Select all",
      deselectAll: "Deselect all",
      clear: "Clear",
      reset: "Reset",
      submit: "Submit",
      continue: "Continue",
      finish: "Finish",
      ok: "OK",
      yes: "Yes",
      no: "No",
    },

    status: {
      loading: "Loading...",
      saving: "Saving...",
      processing: "Processing...",
      uploading: "Uploading...",
      downloading: "Downloading...",
      success: "Success!",
      error: "Error!",
      warning: "Warning!",
      info: "Information",
      unknown: "Unknown",
    },

    validation: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      invalidPhone: "Invalid phone number",
      minLength: "Minimum {{count}} characters required",
      maxLength: "Maximum {{count}} characters allowed",
      passwordMismatch: "Passwords do not match",
      invalidFormat: "Invalid format",
      duplicate: "This value already exists",
    },

    emptyStates: {
      noData: "No data available",
      noResults: "No results found",
      emptyList: "The list is empty",
      notConfigured: "Not configured yet",
      comingSoon: "Coming soon",
    },

    dates: {
      today: "Today",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      thisWeek: "This week",
      lastWeek: "Last week",
      nextWeek: "Next week",
      thisMonth: "This month",
      lastMonth: "Last month",
      nextMonth: "Next month",
      thisQuarter: "This quarter",
      lastQuarter: "Last quarter",
      nextQuarter: "Next quarter",
      thisYear: "This year",
      lastYear: "Last year",
      nextYear: "Next year",
      customRange: "Custom range",
      selectDate: "Select date",
    },

    time: {
      now: "Now",
      minutes: "minutes",
      hours: "hours",
      days: "days",
      weeks: "weeks",
      months: "months",
      years: "years",
      ago: "ago",
      fromNow: "from now",
    },

    numbers: {
      currency: "${{value}}",
      percent: "{{value}}%",
      decimal: "{{value}}",
      integer: "{{value}}",
      thousand: "{{value}}K",
      million: "{{value}}M",
      billion: "{{value}}B",
    },

    units: {
      pieces: "pcs",
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

  // ===== ERROR MESSAGES =====
  errors: {
    network: "Network error. Please check your connection.",
    server: "Server error. Please try again later.",
    timeout: "Request timed out. Please try again.",
    unauthorized: "You are not authorized to perform this action.",
    forbidden: "Access denied. Insufficient permissions.",
    notFound: "The requested resource was not found.",
    validation: "Please check your input and try again.",
    duplicate: "This record already exists.",
    constraint: "Cannot delete because of existing dependencies.",
    fileTooLarge: "File size exceeds maximum limit.",
    invalidFileType: "Invalid file type.",
    quotaExceeded: "Storage quota exceeded.",

    specific: {
      loginFailed: "Login failed. Please check your credentials.",
      sessionExpired: "Your session has expired. Please login again.",
      passwordWeak: "Password is too weak.",
      emailInUse: "Email address is already in use.",
      invalidToken: "Invalid or expired token.",
    },

    retry: "Retry",
    contactSupport: "Contact Support",
    goBack: "Go Back",
    reloadPage: "Reload Page",
  },

  // ===== SUCCESS MESSAGES =====
  success: {
    saved: "Changes saved successfully!",
    created: "Created successfully!",
    updated: "Updated successfully!",
    deleted: "Deleted successfully!",
    uploaded: "Uploaded successfully!",
    exported: "Exported successfully!",
    imported: "Imported successfully!",
    sent: "Sent successfully!",
    processed: "Processed successfully!",
    configured: "Configured successfully!",
    activated: "Activated successfully!",
    deactivated: "Deactivated successfully!",

    actions: {
      close: "Close",
      view: "View",
      continue: "Continue",
      new: "Create New",
    },
  },

  // ===== CONFIRMATION DIALOGS =====
  confirm: {
    delete: {
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",
      single: "Delete this item?",
      multiple: "Delete {{count}} selected items?",
      permanent: "This will permanently delete the item.",
    },

    logout: {
      title: "Confirm Logout",
      message: "Are you sure you want to logout?",
    },

    cancel: {
      title: "Confirm Cancellation",
      message: "Are you sure you want to cancel? Unsaved changes will be lost.",
    },

    discard: {
      title: "Discard Changes",
      message:
        "You have unsaved changes. Are you sure you want to discard them?",
    },

    overwrite: {
      title: "Confirm Overwrite",
      message: "This will overwrite existing data. Are you sure?",
    },

    buttons: {
      proceed: "Proceed",
      keep: "Keep",
      discard: "Discard",
      cancel: "Cancel",
    },
  },

  // ===== FORMS & INPUTS =====
  forms: {
    labels: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      city: "City",
      zipCode: "Zip Code",
      country: "Country",
      description: "Description",
      notes: "Notes",
      comments: "Comments",
      quantity: "Quantity",
      price: "Price",
      amount: "Amount",
      total: "Total",
      discount: "Discount",
      tax: "Tax",
      subtotal: "Subtotal",
      status: "Status",
      type: "Type",
      category: "Category",
      tags: "Tags",
      priority: "Priority",
      dueDate: "Due Date",
      startDate: "Start Date",
      endDate: "End Date",
      createdAt: "Created At",
      updatedAt: "Updated At",
      createdBy: "Created By",
      updatedBy: "Updated By",
    },

    placeholders: {
      select: "Select...",
      searchSelect: "Type to search...",
      typeHere: "Type here...",
      chooseFile: "Choose file...",
      dragDrop: "Drag and drop files here",
      optional: "Optional",
      required: "Required",
    },

    hints: {
      minCharacters: "Minimum {{count}} characters",
      maxCharacters: "Maximum {{count}} characters",
      requiredField: "Required field",
      optionalField: "Optional field",
    },
  },

  // ===== TABLE & DATA GRID =====
  table: {
    actions: {
      title: "Actions",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      duplicate: "Duplicate",
      export: "Export",
      more: "More actions",
    },

    selection: {
      selected: "{{count}} selected",
      selectAll: "Select all",
      clear: "Clear selection",
    },

    pagination: {
      page: "Page",
      of: "of",
      rowsPerPage: "Rows per page",
      showing: "Showing {{from}} to {{to}} of {{total}} entries",
      first: "First",
      previous: "Previous",
      next: "Next",
      last: "Last",
    },

    sorting: {
      sortBy: "Sort by",
      ascending: "Ascending",
      descending: "Descending",
      clear: "Clear sorting",
    },

    filtering: {
      filter: "Filter",
      clearFilters: "Clear filters",
      apply: "Apply",
    },

    empty: {
      noData: "No data available",
      noResults: "No results found",
      loading: "Loading data...",
      error: "Error loading data",
    },
  },

  // ===== MODALS & DIALOGS =====
  modal: {
    close: "Close",
    maximize: "Maximize",
    minimize: "Minimize",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
  },

  // ===== FILE MANAGEMENT =====
  files: {
    upload: "Upload Files",
    download: "Download",
    preview: "Preview",
    rename: "Rename",
    move: "Move",
    copy: "Copy",
    delete: "Delete",
    share: "Share",
    properties: "Properties",

    types: {
      image: "Image",
      document: "Document",
      pdf: "PDF",
      spreadsheet: "Spreadsheet",
      presentation: "Presentation",
      archive: "Archive",
      audio: "Audio",
      video: "Video",
      other: "Other",
    },

    status: {
      uploading: "Uploading...",
      processing: "Processing...",
      complete: "Complete",
      failed: "Failed",
      queued: "Queued",
    },
  },

  // ===== PRINT & EXPORT =====
  export: {
    formats: {
      pdf: "PDF",
      excel: "Excel",
      csv: "CSV",
      json: "JSON",
      xml: "XML",
      print: "Print",
    },

    options: {
      currentPage: "Current page",
      allPages: "All pages",
      selectedRows: "Selected rows",
      customRange: "Custom range",
    },

    status: {
      generating: "Generating export...",
      ready: "Export ready",
      failed: "Export failed",
    },
  },

  // ===== SYSTEM & ADMIN =====
  system: {
    settings: {
      title: "System Settings",
      general: "General",
      appearance: "Appearance",
      notifications: "Notifications",
      security: "Security",
      integrations: "Integrations",
      backup: "Backup & Restore",
      logs: "System Logs",
      maintenance: "Maintenance",
    },

    users: {
      title: "User Management",
      newUser: "New User",
      editUser: "Edit User",
      resetPassword: "Reset Password",
      deactivate: "Deactivate",
      activate: "Activate",
      roles: "Assign Roles",
    },

    roles: {
      title: "Roles & Permissions",
      create: "Create Role",
      edit: "Edit Role",
      delete: "Delete Role",
      permissions: "Manage Permissions",
    },

    logs: {
      title: "System Logs",
      clear: "Clear Logs",
      export: "Export Logs",
      filter: "Filter Logs",
      severity: {
        debug: "Debug",
        info: "Info",
        warning: "Warning",
        error: "Error",
        critical: "Critical",
      },
    },

    maintenance: {
      title: "Maintenance",
      backup: "Create Backup",
      restore: "Restore Backup",
      cleanup: "Cleanup Data",
      optimize: "Optimize Database",
      update: "System Update",
    },
  },

  // ===== TIME & DATE FORMATTING =====
  datetime: {
    formats: {
      shortDate: "MM/DD/YYYY",
      mediumDate: "MMM DD, YYYY",
      longDate: "MMMM DD, YYYY",
      fullDate: "dddd, MMMM DD, YYYY",
      shortTime: "HH:mm",
      mediumTime: "HH:mm:ss",
      longTime: "HH:mm:ss.SSS",
      fullTime: "HH:mm:ss zzzz",
      shortDateTime: "MM/DD/YYYY HH:mm",
      mediumDateTime: "MMM DD, YYYY HH:mm:ss",
      longDateTime: "MMMM DD, YYYY HH:mm:ss z",
      fullDateTime: "dddd, MMMM DD, YYYY HH:mm:ss zzzz",
    },

    relative: {
      justNow: "just now",
      secondsAgo: "{{count}} seconds ago",
      secondsAgo_one: "1 second ago",
      minutesAgo: "{{count}} minutes ago",
      minutesAgo_one: "1 minute ago",
      hoursAgo: "{{count}} hours ago",
      hoursAgo_one: "1 hour ago",
      daysAgo: "{{count}} days ago",
      daysAgo_one: "1 day ago",
      weeksAgo: "{{count}} weeks ago",
      weeksAgo_one: "1 week ago",
      monthsAgo: "{{count}} months ago",
      monthsAgo_one: "1 month ago",
      yearsAgo: "{{count}} years ago",
      yearsAgo_one: "1 year ago",

      inSeconds: "in {{count}} seconds",
      inSeconds_one: "in 1 second",
      inMinutes: "in {{count}} minutes",
      inMinutes_one: "in 1 minute",
      inHours: "in {{count}} hours",
      inHours_one: "in 1 hour",
      inDays: "in {{count}} days",
      inDays_one: "in 1 day",
      inWeeks: "in {{count}} weeks",
      inWeeks_one: "in 1 week",
      inMonths: "in {{count}} months",
      inMonths_one: "in 1 month",
      inYears: "in {{count}} years",
      inYears_one: "in 1 year",
    },

    units: {
      second: "second",
      second_one: "{{count}} second",
      second_other: "{{count}} seconds",
      minute: "minute",
      minute_one: "{{count}} minute",
      minute_other: "{{count}} minutes",
      hour: "hour",
      hour_one: "{{count}} hour",
      hour_other: "{{count}} hours",
      day: "day",
      day_one: "{{count}} day",
      day_other: "{{count}} days",
      week: "week",
      week_one: "{{count}} week",
      week_other: "{{count}} weeks",
      month: "month",
      month_one: "{{count}} month",
      month_other: "{{count}} months",
      year: "year",
      year_one: "{{count}} year",
      year_other: "{{count}} years",
    },
  },

  // ===== PLURALIZATION RULES =====
  pluralization: {
    items: {
      item: "item",
      item_one: "{{count}} item",
      item_other: "{{count}} items",
      record: "record",
      record_one: "{{count}} record",
      record_other: "{{count}} records",
      file: "file",
      file_one: "{{count}} file",
      file_other: "{{count}} files",
      user: "user",
      user_one: "{{count}} user",
      user_other: "{{count}} users",
      customer: "customer",
      customer_one: "{{count}} customer",
      customer_other: "{{count}} customers",
      employee: "employee",
      employee_one: "{{count}} employee",
      employee_other: "{{count}} employees",
      invoice: "invoice",
      invoice_one: "{{count}} invoice",
      invoice_other: "{{count}} invoices",
      product: "product",
      product_one: "{{count}} product",
      product_other: "{{count}} products",
      order: "order",
      order_one: "{{count}} order",
      order_other: "{{count}} orders",
      project: "project",
      project_one: "{{count}} project",
      project_other: "{{count}} projects",
      document: "document",
      document_one: "{{count}} document",
      document_other: "{{count}} documents",
    },

    time: {
      day: "day",
      day_one: "{{count}} day",
      day_other: "{{count}} days",
      hour: "hour",
      hour_one: "{{count}} hour",
      hour_other: "{{count}} hours",
      minute: "minute",
      minute_one: "{{count}} minute",
      minute_other: "{{count}} minutes",
      second: "second",
      second_one: "{{count}} second",
      second_other: "{{count}} seconds",
    },
  },

  // ===== QUICKCHAT =====
  quickchat: {
    title: "QuickChat",
    subtitle: "AI Assistant",

    tabs: {
      chat: "Chat",
      sessions: "Sessions",
      models: "Models",
      settings: "Settings",
      info: "Info",
    },

    status: {
      connected: "Connected",
      loading: "Loading...",
      processing: "Processing...",
      error: "Error",
      ready: "Ready",
    },

    actions: {
      send: "Send",
      newSession: "New Session",
      clearChat: "Clear Chat",
      minimize: "Minimize",
      maximize: "Maximize",
      close: "Close",
      open: "Open QuickChat",
    },

    placeholder: {
      message: "Enter message or / for commands...",
      model: "e.g. qwen2.5:3b",
    },

    empty: {
      title: "Welcome to QuickChat",
      subtitle: "Start a conversation or enter a command with /",
    },

    settings: {
      title: "Settings",
      provider: "Default Provider",
      model: "Default Model",
      temperature: "Temperature",
      temperatureHelp:
        "Low values (0-0.5) = precise, High values (0.8-2) = creative",
      maxTokens: "Max Tokens",
      providerHelp: "Ollama is used as primary provider, Eliza as fallback",
    },

    info: {
      title: "System Information",
      providerConfig: "Provider Configuration",
      primary: "Primary",
      fallback: "Fallback",
      model: "Model",
      availableProviders: "Available Providers",
      ollamaDesc: "Local Models (recommended)",
      elizaDesc: "Rule-based Fallback",
      openaiDesc: "Cloud API",
      anthropicDesc: "Cloud API",
      azureDesc: "Cloud API",
      localDesc: "GGUF Models",
    },

    commands: {
      title: "Available Commands",
      rechnung: "Create invoice",
      angebot: "Create quote",
      bericht: "Generate report",
      idee: "Park idea",
      termin: "Create appointment",
      suche: "Search system",
      hilfe: "Show help",
      new: "Start new session",
      clear: "Clear messages",
    },

    sessions: {
      title: "Sessions",
      open: "Open",
      delete: "Delete",
      empty: "No sessions available",
    },

    models: {
      title: "Available Models",
      empty: "No models available",
    },

    errors: {
      loadSessions: "Failed to load sessions",
      createSession: "Failed to create session",
      sendMessage: "Failed to send message",
      loadModels: "Failed to load models",
      updateSettings: "Failed to update settings",
      timeout: "Request timeout",
      unknown: "Unknown error",
      emptyMessage: "Message cannot be empty",
    },
  },
} as const;
