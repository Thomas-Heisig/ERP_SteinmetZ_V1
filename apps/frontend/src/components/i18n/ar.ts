export default {
  dashboard: {
    title: "ERP SteinmetZ – دليل الوظائف",
    subtitle: "نظرة عامة على النظام والمجالات الوظيفية",

    // حالة النظام
    health: {
      status: {
        healthy: "النظام يعمل بشكل طبيعي",
        degraded: "النظام يعمل بشكل محدود",
        unhealthy: "خلل في النظام"
      }
    },

    // الفئات
    categories: {
      title: "مجالات الوظائف",
      count: "{{count}} مجالات متاحة",
      emptyTitle: "لا توجد فئات",
      emptyDescription: "لم يتم العثور على أي فئات مطابقة."
    },

    // الحالة العامة
    online: "النظام متاح",
    degraded: "النظام محدود",
    error: "خطأ في الاتصال",
    checking: "جارٍ التحقق من الحالة…",
    unknown: "غير معروف",

    // تحميل البيانات
    loading: {
      message: "جارٍ تحميل البيانات…"
    },

    // البحث
    search: {
      button: "بدء البحث",
      filter: "مرشح البحث",
      filterCategory: "الفئات",
      filterFunction: "الوظائف",
      placeholder: "ابحث عن {{type}}…",
      input: "حقل البحث",
      loading: "جارٍ البحث…",
      noResults: "لا توجد نتائج"
    },

    // شاشة الخطأ
    errorScreen: {
      title: "حدث خطأ أثناء التحميل",
      retryButton: "إعادة المحاولة"
    },

    // التنقل
    navigation: {
      overview: "نظرة عامة",
      catalog: "الوظائف",
      ai: "معالج الذكاء الاصطناعي",
      settings: "الإعدادات"
    },

    // الدردشة
    openChat: "فتح المحادثة",
    chat: {
      inputPlaceholder: "اكتب رسالة…",
      send: "إرسال",
      newSession: "جلسة جديدة",
      loading: "جارٍ معالجة الرد…"
    },

    // النماذج
    models: {
      title: "النماذج",
      provider: "المزود",
      capabilities: "القدرات",
      noModels: "لا توجد نماذج متاحة"
    },

    // الأدوات
    tools: {
      title: "الأدوات",
      run: "تشغيل",
      noTools: "لا توجد أدوات مسجلة"
    },

    // النظام
    system: {
      title: "معلومات النظام",
      version: "الإصدار",
      uptime: "مدة التشغيل",
      memory: "الذاكرة",
      routes: "المسارات المسجلة",
      environment: "البيئة",
      database: "قاعدة البيانات",
      diagnostics: "التشخيص",
      features: "الميزات",
      resources: "الموارد",
      ai: "حالة الذكاء الاصطناعي",
      statusHealthy: "يعمل",
      statusUnhealthy: "لا يعمل",
      statusDegraded: "محدود"
    },

    // تغيير اللغة
    languageSwitcher: "اختيار اللغة",

    // واجهة المستخدم
    ui: {
      confirm: "تأكيد",
      cancel: "إلغاء",
      close: "إغلاق",
      reload: "إعادة تحميل",
      details: "تفاصيل",
      unknown: "غير معروف"
    }
  }
};
