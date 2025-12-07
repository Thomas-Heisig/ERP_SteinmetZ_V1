export default {
  dashboard: {
    title: "ERP SteinmetZ – Fonksiyon Kataloğu",
    subtitle: "Sistem durumu ve fonksiyonel alanların genel görünümü",

    // Sistem sağlığı
    health: {
      status: {
        healthy: "Sistem çalışıyor",
        degraded: "Sistem sınırlı",
        unhealthy: "Sistem hatası",
      },
    },

    // Kategoriler
    categories: {
      title: "Fonksiyonel Alanlar",
      count: "{{count}} alan mevcut",
      count_one: "{{count}} alan mevcut",
      count_other: "{{count}} alan mevcut",
      emptyTitle: "Kategori bulunamadı",
      emptyDescription: "Eşleşen kategori bulunamadı.",
    },

    // Genel durumlar
    online: "Sistem çevrimiçi",
    degraded: "Sistem sınırlı",
    error: "Bağlantı hatası",
    checking: "Durum kontrol ediliyor…",
    unknown: "Bilinmiyor",

    // Yükleme
    loading: {
      message: "Veriler yükleniyor…",
    },

    // Arama
    search: {
      button: "Aramayı başlat",
      filter: "Arama filtresi",
      filterCategory: "Kategoriler",
      filterFunction: "Fonksiyonlar",
      placeholder: "{{type}} ara…",
      input: "Arama alanı",
      loading: "Aranıyor…",
      noResults: "Sonuç bulunamadı",
    },

    // Hata ekranı
    errorScreen: {
      title: "Yüklenirken hata",
      retryButton: "Tekrar dene",
    },

    // Navigasyon
    navigation: {
      overview: "Genel Bakış",
      catalog: "Fonksiyonlar",
      ai: "AI Açıklayıcısı",
      settings: "Ayarlar",
    },

    // Sohbet
    openChat: "Sohbeti aç",
    chat: {
      inputPlaceholder: "Mesaj girin…",
      send: "Gönder",
      newSession: "Yeni oturum",
      loading: "Yanıt işleniyor…",
    },

    // Modeller
    models: {
      title: "Modeller",
      provider: "Sağlayıcı",
      capabilities: "Yetenekler",
      noModels: "Model mevcut değil",
    },

    // Araçlar
    tools: {
      title: "Araçlar",
      run: "Çalıştır",
      noTools: "Kayıtlı araç yok",
    },

    // Sistem bilgisi
    system: {
      title: "Sistem Bilgileri",
      version: "Sürüm",
      uptime: "Çalışma süresi",
      memory: "Bellek",
      routes: "Kayıtlı rotalar",
      environment: "Ortam",
      database: "Veritabanı",
      diagnostics: "Tanılama",
      features: "Özellikler",
      resources: "Kaynaklar",
      ai: "AI durumu",
      statusHealthy: "Çalışıyor",
      statusUnhealthy: "Çalışmıyor",
      statusDegraded: "Sınırlı",
    },

    // Dil seçici
    languageSwitcher: "Dil seçin",

    // Genel kullanıcı arayüzü
    ui: {
      confirm: "Onayla",
      cancel: "İptal",
      close: "Kapat",
      reload: "Yeniden yükle",
      details: "Detaylar",
      unknown: "Bilinmiyor",
      save: "Kaydet",
      delete: "Sil",
      edit: "Düzenle",
      add: "Ekle",
      back: "Geri",
      next: "İleri",
      previous: "Önceki",
      loading: "Yükleniyor...",
      error: "Hata",
      success: "Başarılı",
      warning: "Uyarı",
      info: "Bilgi",
    },

    // Ortak öğeler için çoğul formlar
    items: {
      result: "Sonuç",
      result_one: "{{count}} sonuç",
      result_other: "{{count}} sonuç",
      file: "Dosya",
      file_one: "{{count}} dosya",
      file_other: "{{count}} dosya",
      user: "Kullanıcı",
      user_one: "{{count}} kullanıcı",
      user_other: "{{count}} kullanıcı",
      message: "Mesaj",
      message_one: "{{count}} mesaj",
      message_other: "{{count}} mesaj",
      item: "Öğe",
      item_one: "{{count}} öğe",
      item_other: "{{count}} öğe",
    },

    // Tarih ve saat biçimlendirme
    datetime: {
      today: "Bugün",
      yesterday: "Dün",
      tomorrow: "Yarın",
      now: "Şimdi",
      minutesAgo: "{{count}} dakika önce",
      minutesAgo_one: "1 dakika önce",
      hoursAgo: "{{count}} saat önce",
      hoursAgo_one: "1 saat önce",
      daysAgo: "{{count}} gün önce",
      daysAgo_one: "1 gün önce",
    },

    // Para birimi ve sayılar
    format: {
      currency: "{{value, currency:TRY}}",
      percent: "{{value, percent}}",
      decimal: "{{value, decimal}}",
    },
  },
};
