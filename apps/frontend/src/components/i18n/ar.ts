export default {
  // ===== لوحة التحكم والنظام =====
  dashboard: {
    title: "ERP SteinmetZ – دليل الوظائف",
    subtitle: "لوحة التحكم المركزية للعمليات التجارية",
    welcome: "أهلاً بعودتك، {{name}}",
    
    // مؤشرات الحالة
    status: {
      online: "النظام متصل",
      degraded: "النظام يعمل بشكل محدود",
      offline: "النظام غير متصل",
      maintenance: "وضع الصيانة",
      syncing: "جارٍ مزامنة البيانات...",
    },
    
    // الإجراءات السريعة
    quickActions: {
      title: "إجراءات سريعة",
      newInvoice: "فاتورة جديدة",
      newCustomer: "عميل جديد",
      newEmployee: "موظف جديد",
      newProject: "مشروع جديد",
      runReport: "تشغيل تقرير",
      exportData: "تصدير البيانات",
      importData: "استيراد البيانات",
    },
    
    // مراقبة صحة النظام
    health: {
      title: "صحة النظام",
      status: {
        healthy: "جميع الأنظمة تعمل بشكل طبيعي",
        degraded: "قيود جزئية",
        unhealthy: "تم اكتشاف خطأ حرج",
      },
      components: {
        database: "قاعدة البيانات",
        api: "بوابة API",
        auth: "المصادقة",
        storage: "تخزين الملفات",
        websocket: "WebSocket",
        cache: "ذاكرة التخزين المؤقت",
      },
      metrics: {
        uptime: "وقت التشغيل",
        responseTime: "وقت الاستجابة",
        memoryUsage: "استخدام الذاكرة",
        cpuLoad: "حمل المعالج",
      },
    },
    
    // الإشعارات
    notifications: {
      title: "الإشعارات",
      empty: "لا توجد إشعارات جديدة",
      markAllRead: "تحديد الكل كمقروء",
      clearAll: "مسح الكل",
      types: {
        info: "معلومات",
        warning: "تحذير",
        error: "خطأ",
        success: "نجاح",
      },
    },
    
    // الأنشطة الأخيرة
    recentActivity: {
      title: "الأنشطة الأخيرة",
      types: {
        login: "تسجيل دخول المستخدم",
        create: "تم الإنشاء",
        update: "تم التحديث",
        delete: "تم الحذف",
        export: "تم التصدير",
        import: "تم الاستيراد",
      },
      empty: "لا توجد أنشطة حديثة",
    },
  },
  
  // ===== الدليل والوظائف =====
  catalog: {
    title: "دليل الوظائف",
    subtitle: "تصفح وظائف النظام المتاحة",
    
    categories: {
      title: "مجالات الوظائف",
      count: "{{count}} مجال متاح",
      count_one: "{{count}} مجال متاح",
      count_other: "{{count}} مجالات متاحة",
      emptyTitle: "لم يتم العثور على فئات",
      emptyDescription: "لم يتم العثور على مجالات وظيفية مطابقة.",
      filter: {
        all: "جميع الفئات",
        favorites: "المفضلة فقط",
        recent: "المستخدمة مؤخراً",
      },
    },
    
    functions: {
      title: "الوظائف المتاحة",
      search: {
        placeholder: "ابحث عن وظائف...",
        button: "بحث",
        advanced: "بحث متقدم",
        filters: "مرشحات",
        clear: "مسح البحث",
      },
      view: {
        grid: "عرض الشبكة",
        list: "عرض القائمة",
        details: "عرض التفاصيل",
      },
      actions: {
        execute: "تنفيذ",
        favorite: "إضافة إلى المفضلة",
        unfavorite: "إزالة من المفضلة",
        details: "عرض التفاصيل",
        export: "تصدير الوظيفة",
        duplicate: "نسخ",
      },
      metadata: {
        version: "الإصدار",
        author: "المؤلف",
        lastModified: "آخر تعديل",
        dependencies: "التبعيات",
        tags: "العلامات",
      },
    },
  },
  
  // ===== البحث =====
  search: {
    global: {
      placeholder: "ابحث في جميع أنحاء نظام ERP...",
      button: "بحث",
      advanced: "بحث متقدم",
      clear: "مسح",
    },
    
    filters: {
      title: "مرشحات البحث",
      category: "الفئة",
      type: "النوع",
      status: "الحالة",
      dateRange: "النطاق الزمني",
      amount: "نطاق المبلغ",
      clearAll: "مسح جميع المرشحات",
      apply: "تطبيق المرشحات",
    },
    
    results: {
      title: "نتائج البحث",
      loading: "جارٍ البحث...",
      noResults: "لم يتم العثور على نتائج",
      tryAgain: "جرب كلمات أخرى",
      showing: "عرض {{count}} من {{total}} نتيجة",
      relevance: "الأكثر صلة",
      newest: "الأحدث أولاً",
      oldest: "الأقدم أولاً",
    },
    
    modules: {
      all: "جميع الوحدات",
      crm: "إدارة العلاقات مع العملاء",
      finance: "المالية",
      hr: "الموارد البشرية",
      inventory: "المخزون",
      projects: "المشاريع",
      documents: "المستندات",
      ai: "وظائف الذكاء الاصطناعي",
    },
  },
  
  // ===== التنقل والشريط الجانبي =====
  sidebar: {
    title: "التنقل",
    collapse: "طي الشريط الجانبي",
    expand: "توسيع الشريط الجانبي",
    pin: "تثبيت الشريط الجانبي",
    unpin: "إلغاء تثبيت الشريط الجانبي",
    
    // الأقسام الرئيسية
    sections: {
      main: "المنطقة الرئيسية",
      business: "إدارة الأعمال",
      finance: "المالية والتحكم",
      sales: "المبيعات والتسويق",
      procurement: "المشتريات",
      production: "الإنتاج والتصنيع",
      warehouse: "المستودع واللوجستيات",
      hr: "الموارد البشرية",
      reporting: "التقارير والتحليلات",
      communication: "الاتصالات",
      system: "النظام والإدارة",
      ai: "الذكاء الاصطناعي والأتمتة",
      tools: "الأدوات",
    },
    
    // عناصر التنقل مع الرموز
    navItems: {
      dashboard: "لوحة التحكم",
      catalog: "دليل الوظائف",
      calendar: "التقويم",
      company: "الشركة",
      processes: "إدارة العمليات",
      risk: "المخاطر والامتثال",
      
      // المالية
      accounting: "المحاسبة",
      controlling: "التحكم",
      treasury: "الخزينة",
      taxes: "الضرائب",
      invoices: "الفواتير",
      expenses: "المصروفات",
      
      // CRM والمبيعات
      crm: "إدارة العملاء",
      customers: "العملاء",
      leads: "الفرص المحتملة",
      opportunities: "فرص المبيعات",
      marketing: "التسويق",
      sales: "المبيعات",
      orders: "الطلبات",
      fulfillment: "تنفيذ الطلبات",
      
      // المشتريات
      purchasing: "المشتريات",
      receiving: "استلام البضائع",
      suppliers: "الموردين",
      contracts: "العقود",
      
      // الإنتاج
      planning: "تخطيط الإنتاج",
      manufacturing: "التصنيع",
      quality: "إدارة الجودة",
      maintenance: "الصيانة",
      
      // المستودع
      inventory: "المخزون",
      picking: "الاستلام",
      logistics: "اللوجستيات",
      shipping: "الشحن",
      
      // الموارد البشرية
      personnel: "الموظفين",
      timeTracking: "تتبع الوقت",
      payroll: "كشوف المرتبات",
      development: "التطوير",
      recruiting: "التوظيف",
      
      // التقارير
      reports: "التقارير",
      analytics: "التحليلات",
      dashboards: "لوحات التحكم",
      exports: "تصدير البيانات",
      
      // الاتصالات
      email: "البريد الإلكتروني",
      messaging: "الرسائل",
      social: "وسائل التواصل الاجتماعي",
      calls: "المكالمات الهاتفية",
      
      // النظام
      users: "المستخدمين",
      roles: "الأدوار",
      permissions: "الأذونات",
      settings: "الإعدادات",
      logs: "سجلات النظام",
      backups: "النسخ الاحتياطية",
      
      // الذكاء الاصطناعي والأدوات
      aiAnnotator: "معالج الذكاء الاصطناعي",
      batchProcessing: "المعالجة الدفعية",
      modelManagement: "نماذج الذكاء الاصطناعي",
      advancedFilters: "مرشحات متقدمة",
      innovation: "مختبر الابتكار",
      
      // أخرى
      documents: "المستندات",
      projects: "المشاريع",
      help: "المساعدة والدعم",
      about: "حول النظام",
    },
    
    // قائمة المستخدم
    user: {
      profile: "ملفي الشخصي",
      settings: "إعداداتي",
      logout: "تسجيل الخروج",
      switchAccount: "تبديل الحساب",
    },
    
    // التذييل
    footer: {
      version: "الإصدار {{version}}",
      lastUpdate: "آخر تحديث: {{date}}",
      copyright: "© {{year}} ERP SteinmetZ",
    },
  },
  
  // ===== الذكاء الاصطناعي والأتمتة =====
  ai: {
    title: "الذكاء الاصطناعي والأتمتة",
    annotator: {
      title: "معالج الذكاء الاصطناعي",
      subtitle: "معالجة المستندات الذكية",
      upload: "تحميل المستند",
      analyze: "التحليل باستخدام الذكاء الاصطناعي",
      extract: "استخراج البيانات",
      validate: "التحقق من النتائج",
      export: "تصدير التعليقات التوضيحية",
      supportedFormats: "الصيغ المدعومة: PDF، DOCX، الصور",
    },
    
    models: {
      title: "نماذج الذكاء الاصطناعي",
      provider: "المزود",
      capabilities: "القدرات",
      status: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      loading: "جارٍ التحميل",
      select: "اختيار النموذج",
      configure: "تكوين",
      test: "اختبار النموذج",
    },
    
    chat: {
      title: "مساعد الذكاء الاصطناعي",
      inputPlaceholder: "اسألني أي شيء عن نظام ERP...",
      send: "إرسال",
      newSession: "محادثة جديدة",
      clear: "مسح المحادثة",
      thinking: "جارٍ التفكير...",
      examples: {
        title: "أسئلة مثال",
        q1: "كيف أنشئ فاتورة؟",
        q2: "عرض المدفوعات المتأخرة",
        q3: "إنشاء تقرير مبيعات للربع الرابع",
        q4: "المساعدة في دمج الموظفين",
      },
    },
    
    batch: {
      title: "المعالجة الدفعية",
      create: "إنشاء مهمة دفعية",
      monitor: "مراقبة التقدم",
      history: "سجل المهام",
      schedule: "جدولة",
      cancel: "إلغاء المهمة",
      retry: "إعادة المحاولة",
    },
  },
  
  // ===== وحدة CRM =====
  crm: {
    title: "إدارة العلاقات مع العملاء",
    
    customers: {
      title: "العملاء",
      list: "قائمة العملاء",
      details: "تفاصيل العميل",
      new: "عميل جديد",
      edit: "تعديل العميل",
      delete: "حذف العميل",
      import: "استيراد العملاء",
      export: "تصدير العملاء",
    },
    
    leads: {
      title: "الفرص المحتملة",
      convert: "تحويل إلى عميل",
      assign: "تعيين للمبيعات",
      followUp: "جدولة المتابعة",
    },
    
    opportunities: {
      title: "فرص المبيعات",
      stages: {
        prospecting: "التنقيب",
        qualification: "التأهيل",
        proposal: "العرض",
        negotiation: "المفاوضات",
        closedWon: "تم الإغلاق (ربح)",
        closedLost: "تم الإغلاق (خسارة)",
      },
    },
    
    contacts: {
      title: "جهات الاتصال",
      add: "إضافة جهة اتصال",
      primary: "جهة الاتصال الرئيسية",
      communication: "سجل الاتصالات",
    },
    
    activities: {
      title: "الأنشطة",
      logCall: "تسجيل مكالمة هاتفية",
      scheduleMeeting: "جدولة اجتماع",
      sendEmail: "إرسال بريد إلكتروني",
      addNote: "إضافة ملاحظة",
    },
  },
  
  // ===== وحدة المالية =====
  finance: {
    title: "المالية والمحاسبة",
    
    invoices: {
      title: "الفواتير",
      create: "إنشاء فاتورة",
      send: "إرسال الفاتورة",
      markPaid: "وضع علامة كمقبوضة",
      reminder: "إرسال تذكير",
      cancel: "إلغاء الفاتورة",
      duplicate: "نسخ",
    },
    
    status: {
      draft: "مسودة",
      sent: "تم الإرسال",
      paid: "تم الدفع",
      overdue: "متأخرة",
      cancelled: "ملغاة",
      partiallyPaid: "مدفوعة جزئياً",
    },
    
    reports: {
      title: "التقارير المالية",
      profitLoss: "قائمة الدخل",
      balanceSheet: "الميزانية العمومية",
      cashFlow: "قائمة التدفقات النقدية",
      agedReceivables: "تقييم الذمم المدينة",
      agedPayables: "تقييم الذمم الدائنة",
    },
    
    banking: {
      title: "الخدمات المصرفية",
      reconcile: "تسوية الحساب",
      importStatement: "استيراد كشف الحساب",
      matchTransactions: "مطابقة المعاملات",
    },
  },
  
  // ===== وحدة الموارد البشرية =====
  hr: {
    title: "الموارد البشرية",
    
    employees: {
      title: "الموظفين",
      new: "موظف جديد",
      edit: "تعديل الموظف",
      terminate: "إنهاء الخدمة",
      reactivate: "إعادة التنشيط",
      documents: "مستندات الموظفين",
    },
    
    departments: {
      title: "الأقسام",
      assign: "تعيين القسم",
      transfer: "نقل الموظف",
    },
    
    attendance: {
      title: "الحضور",
      clockIn: "تسجيل الدخول",
      clockOut: "تسجيل الخروج",
      timesheet: "جدول الوقت",
      approve: "الموافقة على الساعات",
    },
    
    payroll: {
      title: "كشوف المرتبات",
      run: "تشغيل الرواتب",
      review: "مراجعة الرواتب",
      approve: "الموافقة على الرواتب",
      export: "تصدير للبنك",
    },
  },
  
  // ===== مكونات واجهة المستخدم =====
  ui: {
    common: {
      confirm: "تأكيد",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة",
      view: "عرض",
      close: "إغلاق",
      back: "رجوع",
      next: "التالي",
      previous: "السابق",
      search: "بحث",
      filter: "تصفية",
      sort: "ترتيب",
      refresh: "تحديث",
      download: "تحميل",
      upload: "رفع",
      print: "طباعة",
      export: "تصدير",
      import: "استيراد",
      help: "مساعدة",
      settings: "إعدادات",
      more: "المزيد",
      less: "أقل",
      expand: "توسيع",
      collapse: "طي",
      enable: "تفعيل",
      disable: "تعطيل",
      activate: "تفعيل",
      deactivate: "تعطيل",
      selectAll: "تحديد الكل",
      deselectAll: "إلغاء تحديد الكل",
      clear: "مسح",
      reset: "إعادة تعيين",
      submit: "إرسال",
      continue: "متابعة",
      finish: "إنهاء",
      ok: "موافق",
      yes: "نعم",
      no: "لا",
    },
    
    status: {
      loading: "جارٍ التحميل...",
      saving: "جارٍ الحفظ...",
      processing: "جارٍ المعالجة...",
      uploading: "جارٍ الرفع...",
      downloading: "جارٍ التحميل...",
      success: "نجاح!",
      error: "خطأ!",
      warning: "تحذير!",
      info: "معلومات",
      unknown: "غير معروف",
    },
    
    validation: {
      required: "هذا الحقل مطلوب",
      invalidEmail: "عنوان بريد إلكتروني غير صالح",
      invalidPhone: "رقم هاتف غير صالح",
      minLength: "مطلوب {{count}} أحرف على الأقل",
      maxLength: "يسمح بـ {{count}} أحرف كحد أقصى",
      passwordMismatch: "كلمات المرور غير متطابقة",
      invalidFormat: "تنسيق غير صالح",
      duplicate: "هذه القيمة موجودة بالفعل",
    },
    
    emptyStates: {
      noData: "لا توجد بيانات متاحة",
      noResults: "لم يتم العثور على نتائج",
      emptyList: "القائمة فارغة",
      notConfigured: "لم يتم التكوين بعد",
      comingSoon: "قريباً",
    },
    
    dates: {
      today: "اليوم",
      yesterday: "أمس",
      tomorrow: "غداً",
      thisWeek: "هذا الأسبوع",
      lastWeek: "الأسبوع الماضي",
      nextWeek: "الأسبوع القادم",
      thisMonth: "هذا الشهر",
      lastMonth: "الشهر الماضي",
      nextMonth: "الشهر القادم",
      thisQuarter: "هذا الربع",
      lastQuarter: "الربع الماضي",
      nextQuarter: "الربع القادم",
      thisYear: "هذا العام",
      lastYear: "العام الماضي",
      nextYear: "العام القادم",
      customRange: "نطاق مخصص",
      selectDate: "اختيار التاريخ",
    },
    
    time: {
      now: "الآن",
      minutes: "دقائق",
      hours: "ساعات",
      days: "أيام",
      weeks: "أسابيع",
      months: "أشهر",
      years: "سنوات",
      ago: "منذ",
      fromNow: "من الآن",
    },
    
    numbers: {
      currency: "{{value}} ر.س",
      percent: "{{value}}٪",
      decimal: "{{value}}",
      integer: "{{value}}",
      thousand: "{{value}} ألف",
      million: "{{value}} مليون",
      billion: "{{value}} مليار",
    },
    
    units: {
      pieces: "قطعة",
      kilograms: "كجم",
      grams: "جرام",
      liters: "لتر",
      meters: "متر",
      squareMeters: "م²",
      cubicMeters: "م³",
      hours: "ساعة",
      minutes: "دقيقة",
      seconds: "ثانية",
    },
  },
  
  // ===== رسائل الخطأ =====
  errors: {
    network: "خطأ في الشبكة. يرجى التحقق من اتصالك.",
    server: "خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.",
    timeout: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
    unauthorized: "غير مصرح لك بتنفيذ هذا الإجراء.",
    forbidden: "تم رفض الوصول. أذونات غير كافية.",
    notFound: "لم يتم العثور على المورد المطلوب.",
    validation: "يرجى التحقق من المدخلات والمحاولة مرة أخرى.",
    duplicate: "هذا السجل موجود بالفعل.",
    constraint: "لا يمكن الحذف بسبب التبعيات الموجودة.",
    fileTooLarge: "حجم الملف يتجاوز الحد الأقصى.",
    invalidFileType: "نوع ملف غير صالح.",
    quotaExceeded: "تم تجاوز حصة التخزين.",
    
    specific: {
      loginFailed: "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.",
      sessionExpired: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.",
      passwordWeak: "كلمة المرور ضعيفة جداً.",
      emailInUse: "عنوان البريد الإلكتروني مستخدم بالفعل.",
      invalidToken: "رمز غير صالح أو منتهي الصلاحية.",
    },
    
    retry: "إعادة المحاولة",
    contactSupport: "الاتصال بالدعم",
    goBack: "العودة",
    reloadPage: "إعادة تحميل الصفحة",
  },
  
  // ===== رسائل النجاح =====
  success: {
    saved: "تم حفظ التغييرات بنجاح!",
    created: "تم الإنشاء بنجاح!",
    updated: "تم التحديث بنجاح!",
    deleted: "تم الحذف بنجاح!",
    uploaded: "تم الرفع بنجاح!",
    exported: "تم التصدير بنجاح!",
    imported: "تم الاستيراد بنجاح!",
    sent: "تم الإرسال بنجاح!",
    processed: "تمت المعالجة بنجاح!",
    configured: "تم التكوين بنجاح!",
    activated: "تم التفعيل بنجاح!",
    deactivated: "تم التعطيل بنجاح!",
    
    actions: {
      close: "إغلاق",
      view: "عرض",
      continue: "متابعة",
      new: "إنشاء جديد",
    },
  },
  
  // ===== مربعات حوار التأكيد =====
  confirm: {
    delete: {
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
      single: "حذف هذا العنصر؟",
      multiple: "حذف {{count}} عناصر محددة؟",
      permanent: "سيتم حذف العنصر بشكل دائم.",
    },
    
    logout: {
      title: "تأكيد تسجيل الخروج",
      message: "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
    },
    
    cancel: {
      title: "تأكيد الإلغاء",
      message: "هل أنت متأكد من رغبتك في الإلغاء؟ ستفقد التغييرات غير المحفوظة.",
    },
    
    discard: {
      title: "تجاهل التغييرات",
      message: "لديك تغييرات غير محفوظة. هل أنت متأكد من رغبتك في تجاهلها؟",
    },
    
    overwrite: {
      title: "تأكيد الكتابة فوق",
      message: "سيتم الكتابة فوق البيانات الموجودة. هل أنت متأكد؟",
    },
    
    buttons: {
      proceed: "متابعة",
      keep: "الاحتفاظ",
      discard: "تجاهل",
      cancel: "إلغاء",
    },
  },
  
  // ===== النماذج والإدخالات =====
  forms: {
    labels: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      city: "المدينة",
      zipCode: "الرمز البريدي",
      country: "الدولة",
      description: "الوصف",
      notes: "ملاحظات",
      comments: "تعليقات",
      quantity: "الكمية",
      price: "السعر",
      amount: "المبلغ",
      total: "الإجمالي",
      discount: "الخصم",
      tax: "الضريبة",
      subtotal: "المجموع الفرعي",
      status: "الحالة",
      type: "النوع",
      category: "الفئة",
      tags: "العلامات",
      priority: "الأولوية",
      dueDate: "تاريخ الاستحقاق",
      startDate: "تاريخ البدء",
      endDate: "تاريخ الانتهاء",
      createdAt: "تم الإنشاء في",
      updatedAt: "تم التحديث في",
      createdBy: "تم الإنشاء بواسطة",
      updatedBy: "تم التحديث بواسطة",
    },
    
    placeholders: {
      select: "اختر...",
      searchSelect: "اكتب للبحث...",
      typeHere: "اكتب هنا...",
      chooseFile: "اختر ملفاً...",
      dragDrop: "اسحب وأفلت الملفات هنا",
      optional: "اختياري",
      required: "مطلوب",
    },
    
    hints: {
      minCharacters: "{{count}} أحرف على الأقل",
      maxCharacters: "{{count}} أحرف كحد أقصى",
      requiredField: "حقل مطلوب",
      optionalField: "حقل اختياري",
    },
  },
  
  // ===== الجدول وشبكة البيانات =====
  table: {
    actions: {
      title: "الإجراءات",
      edit: "تعديل",
      delete: "حذف",
      view: "عرض",
      duplicate: "نسخ",
      export: "تصدير",
      more: "المزيد من الإجراءات",
    },
    
    selection: {
      selected: "تم تحديد {{count}}",
      selectAll: "تحديد الكل",
      clear: "مسح التحديد",
    },
    
    pagination: {
      page: "الصفحة",
      of: "من",
      rowsPerPage: "صفوف في كل صفحة",
      showing: "عرض {{from}} إلى {{to}} من إجمالي {{total}} إدخال",
      first: "الأولى",
      previous: "السابق",
      next: "التالي",
      last: "الأخيرة",
    },
    
    sorting: {
      sortBy: "ترتيب حسب",
      ascending: "تصاعدياً",
      descending: "تنازلياً",
      clear: "مسح الترتيب",
    },
    
    filtering: {
      filter: "تصفية",
      clearFilters: "مسح المرشحات",
      apply: "تطبيق",
    },
    
    empty: {
      noData: "لا توجد بيانات متاحة",
      noResults: "لم يتم العثور على نتائج",
      loading: "جارٍ تحميل البيانات...",
      error: "خطأ في تحميل البيانات",
    },
  },
  
  // ===== النوافذ المنبثقة والحوارات =====
  modal: {
    close: "إغلاق",
    maximize: "تكبير",
    minimize: "تصغير",
    fullscreen: "ملء الشاشة",
    exitFullscreen: "خروج من ملء الشاشة",
  },
  
  // ===== إدارة الملفات =====
  files: {
    upload: "رفع الملفات",
    download: "تحميل",
    preview: "معاينة",
    rename: "إعادة تسمية",
    move: "نقل",
    copy: "نسخ",
    delete: "حذف",
    share: "مشاركة",
    properties: "خصائص",
    
    types: {
      image: "صورة",
      document: "مستند",
      pdf: "PDF",
      spreadsheet: "جدول بيانات",
      presentation: "عرض تقديمي",
      archive: "أرشيف",
      audio: "صوت",
      video: "فيديو",
      other: "أخرى",
    },
    
    status: {
      uploading: "جارٍ الرفع...",
      processing: "جارٍ المعالجة...",
      complete: "مكتمل",
      failed: "فشل",
      queued: "في قائمة الانتظار",
    },
  },
  
  // ===== الطباعة والتصدير =====
  export: {
    formats: {
      pdf: "PDF",
      excel: "Excel",
      csv: "CSV",
      json: "JSON",
      xml: "XML",
      print: "طباعة",
    },
    
    options: {
      currentPage: "الصفحة الحالية",
      allPages: "جميع الصفحات",
      selectedRows: "الصفوف المحددة",
      customRange: "نطاق مخصص",
    },
    
    status: {
      generating: "جارٍ إنشاء التصدير...",
      ready: "التصدير جاهز",
      failed: "فشل التصدير",
    },
  },
  
  // ===== النظام والإدارة =====
  system: {
    settings: {
      title: "إعدادات النظام",
      general: "عام",
      appearance: "المظهر",
      notifications: "الإشعارات",
      security: "الأمان",
      integrations: "التكاملات",
      backup: "النسخ الاحتياطي والاستعادة",
      logs: "سجلات النظام",
      maintenance: "الصيانة",
    },
    
    users: {
      title: "إدارة المستخدمين",
      newUser: "مستخدم جديد",
      editUser: "تعديل المستخدم",
      resetPassword: "إعادة تعيين كلمة المرور",
      deactivate: "تعطيل",
      activate: "تفعيل",
      roles: "تعيين الأدوار",
    },
    
    roles: {
      title: "الأدوار والصلاحيات",
      create: "إنشاء دور",
      edit: "تعديل الدور",
      delete: "حذف الدور",
      permissions: "إدارة الصلاحيات",
    },
    
    logs: {
      title: "سجلات النظام",
      clear: "مسح السجلات",
      export: "تصدير السجلات",
      filter: "تصفية السجلات",
      severity: {
        debug: "تصحيح",
        info: "معلومات",
        warning: "تحذير",
        error: "خطأ",
        critical: "حرج",
      },
    },
    
    maintenance: {
      title: "الصيانة",
      backup: "إنشاء نسخة احتياطية",
      restore: "استعادة النسخة الاحتياطية",
      cleanup: "تنظيف البيانات",
      optimize: "تحسين قاعدة البيانات",
      update: "تحديث النظام",
    },
  },
  
  // ===== تنسيق الوقت والتاريخ =====
  datetime: {
    formats: {
      shortDate: "DD/MM/YYYY",
      mediumDate: "DD MMM YYYY",
      longDate: "DD MMMM YYYY",
      fullDate: "dddd، DD MMMM YYYY",
      shortTime: "HH:mm",
      mediumTime: "HH:mm:ss",
      longTime: "HH:mm:ss.SSS",
      fullTime: "HH:mm:ss zzzz",
      shortDateTime: "DD/MM/YYYY HH:mm",
      mediumDateTime: "DD MMM YYYY HH:mm:ss",
      longDateTime: "DD MMMM YYYY HH:mm:ss z",
      fullDateTime: "dddd، DD MMMM YYYY HH:mm:ss zzzz",
    },
    
    relative: {
      justNow: "الآن",
      secondsAgo: "منذ {{count}} ثانية",
      secondsAgo_one: "منذ 1 ثانية",
      minutesAgo: "منذ {{count}} دقيقة",
      minutesAgo_one: "منذ 1 دقيقة",
      hoursAgo: "منذ {{count}} ساعة",
      hoursAgo_one: "منذ 1 ساعة",
      daysAgo: "منذ {{count}} يوم",
      daysAgo_one: "منذ 1 يوم",
      weeksAgo: "منذ {{count}} أسبوع",
      weeksAgo_one: "منذ 1 أسبوع",
      monthsAgo: "منذ {{count}} شهر",
      monthsAgo_one: "منذ 1 شهر",
      yearsAgo: "منذ {{count}} سنة",
      yearsAgo_one: "منذ 1 سنة",
      
      inSeconds: "خلال {{count}} ثانية",
      inSeconds_one: "خلال 1 ثانية",
      inMinutes: "خلال {{count}} دقيقة",
      inMinutes_one: "خلال 1 دقيقة",
      inHours: "خلال {{count}} ساعة",
      inHours_one: "خلال 1 ساعة",
      inDays: "خلال {{count}} يوم",
      inDays_one: "خلال 1 يوم",
      inWeeks: "خلال {{count}} أسبوع",
      inWeeks_one: "خلال 1 أسبوع",
      inMonths: "خلال {{count}} شهر",
      inMonths_one: "خلال 1 شهر",
      inYears: "خلال {{count}} سنة",
      inYears_one: "خلال 1 سنة",
    },
    
    units: {
      second: "ثانية",
      second_one: "{{count}} ثانية",
      second_other: "{{count}} ثانية",
      minute: "دقيقة",
      minute_one: "{{count}} دقيقة",
      minute_other: "{{count}} دقيقة",
      hour: "ساعة",
      hour_one: "{{count}} ساعة",
      hour_other: "{{count}} ساعة",
      day: "يوم",
      day_one: "{{count}} يوم",
      day_other: "{{count}} يوم",
      week: "أسبوع",
      week_one: "{{count}} أسبوع",
      week_other: "{{count}} أسبوع",
      month: "شهر",
      month_one: "{{count}} شهر",
      month_other: "{{count}} شهر",
      year: "سنة",
      year_one: "{{count}} سنة",
      year_other: "{{count}} سنة",
    },
  },
  
  // ===== قواعد الجمع =====
  pluralization: {
    items: {
      item: "عنصر",
      item_one: "{{count}} عنصر",
      item_other: "{{count}} عناصر",
      record: "سجل",
      record_one: "{{count}} سجل",
      record_other: "{{count}} سجلات",
      file: "ملف",
      file_one: "{{count}} ملف",
      file_other: "{{count}} ملفات",
      user: "مستخدم",
      user_one: "{{count}} مستخدم",
      user_other: "{{count}} مستخدمين",
      customer: "عميل",
      customer_one: "{{count}} عميل",
      customer_other: "{{count}} عملاء",
      employee: "موظف",
      employee_one: "{{count}} موظف",
      employee_other: "{{count}} موظفين",
      invoice: "فاتورة",
      invoice_one: "{{count}} فاتورة",
      invoice_other: "{{count}} فواتير",
      product: "منتج",
      product_one: "{{count}} منتج",
      product_other: "{{count}} منتجات",
      order: "طلب",
      order_one: "{{count}} طلب",
      order_other: "{{count}} طلبات",
      project: "مشروع",
      project_one: "{{count}} مشروع",
      project_other: "{{count}} مشاريع",
      document: "مستند",
      document_one: "{{count}} مستند",
      document_other: "{{count}} مستندات",
    },
    
    time: {
      day: "يوم",
      day_one: "{{count}} يوم",
      day_other: "{{count}} يوم",
      hour: "ساعة",
      hour_one: "{{count}} ساعة",
      hour_other: "{{count}} ساعة",
      minute: "دقيقة",
      minute_one: "{{count}} دقيقة",
      minute_other: "{{count}} دقيقة",
      second: "ثانية",
      second_one: "{{count}} ثانية",
      second_other: "{{count}} ثانية",
    },
  },
} as const;