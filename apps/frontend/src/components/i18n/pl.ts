export default {
  dashboard: {
    title: "ERP SteinmetZ – Katalog funkcji",
    subtitle: "Przegląd stanu systemu i obszarów funkcjonalnych",

    // Stan systemu
    health: {
      status: {
        healthy: "System działa prawidłowo",
        degraded: "System działa z ograniczeniami",
        unhealthy: "Błąd systemu",
      },
    },

    // Kategorie
    categories: {
      title: "Obszary funkcjonalne",
      count: "Dostępne obszary: {{count}}",
      count_one: "Dostępny {{count}} obszar",
      count_other: "Dostępne {{count}} obszary",
      emptyTitle: "Nie znaleziono kategorii",
      emptyDescription: "Nie znaleziono pasujących kategorii.",
    },

    // Ogólne statusy
    online: "System online",
    degraded: "System ograniczony",
    error: "Błąd połączenia",
    checking: "Sprawdzanie statusu…",
    unknown: "Nieznany",

    // Ładowanie
    loading: {
      message: "Ładowanie danych…",
    },

    // Wyszukiwanie
    search: {
      button: "Rozpocznij wyszukiwanie",
      filter: "Filtr wyszukiwania",
      filterCategory: "Kategorie",
      filterFunction: "Funkcje",
      placeholder: "Szukaj {{type}}…",
      input: "Pole wyszukiwania",
      loading: "Wyszukiwanie…",
      noResults: "Nie znaleziono wyników",
    },

    // Ekran błędu
    errorScreen: {
      title: "Błąd podczas ładowania",
      retryButton: "Spróbuj ponownie",
    },

    // Nawigacja
    navigation: {
      overview: "Przegląd",
      catalog: "Funkcje",
      ai: "Adnotator AI",
      settings: "Ustawienia",
    },

    // Chat
    openChat: "Otwórz czat",
    chat: {
      inputPlaceholder: "Wpisz wiadomość…",
      send: "Wyślij",
      newSession: "Nowa sesja",
      loading: "Przetwarzanie odpowiedzi…",
    },

    // Modele
    models: {
      title: "Modele",
      provider: "Dostawca",
      capabilities: "Możliwości",
      noModels: "Brak dostępnych modeli",
    },

    // Narzędzia
    tools: {
      title: "Narzędzia",
      run: "Wykonaj",
      noTools: "Brak zarejestrowanych narzędzi",
    },

    // Informacje systemowe
    system: {
      title: "Informacje systemowe",
      version: "Wersja",
      uptime: "Czas działania",
      memory: "Pamięć",
      routes: "Zarejestrowane ścieżki",
      environment: "Środowisko",
      database: "Baza danych",
      diagnostics: "Diagnostyka",
      features: "Funkcjonalności",
      resources: "Zasoby",
      ai: "Status AI",
      statusHealthy: "Działa",
      statusUnhealthy: "Nie działa",
      statusDegraded: "Ograniczony",
    },

    // Przełącznik języka
    languageSwitcher: "Wybierz język",

    // Ogólny interfejs użytkownika
    ui: {
      confirm: "Potwierdź",
      cancel: "Anuluj",
      close: "Zamknij",
      reload: "Odśwież",
      details: "Szczegóły",
      unknown: "Nieznany",
      save: "Zapisz",
      delete: "Usuń",
      edit: "Edytuj",
      add: "Dodaj",
      back: "Wstecz",
      next: "Dalej",
      previous: "Poprzedni",
      loading: "Ładowanie...",
      error: "Błąd",
      success: "Sukces",
      warning: "Ostrzeżenie",
      info: "Informacja",
    },

    // Formy liczby mnogiej dla wspólnych elementów
    items: {
      result: "Wynik",
      result_one: "{{count}} wynik",
      result_other: "{{count}} wyników",
      file: "Plik",
      file_one: "{{count}} plik",
      file_other: "{{count}} plików",
      user: "Użytkownik",
      user_one: "{{count}} użytkownik",
      user_other: "{{count}} użytkowników",
      message: "Wiadomość",
      message_one: "{{count}} wiadomość",
      message_other: "{{count}} wiadomości",
      item: "Element",
      item_one: "{{count}} element",
      item_other: "{{count}} elementów",
    },

    // Formatowanie daty i czasu
    datetime: {
      today: "Dziś",
      yesterday: "Wczoraj",
      tomorrow: "Jutro",
      now: "Teraz",
      minutesAgo: "{{count}} minut temu",
      minutesAgo_one: "1 minutę temu",
      hoursAgo: "{{count}} godzin temu",
      hoursAgo_one: "1 godzinę temu",
      daysAgo: "{{count}} dni temu",
      daysAgo_one: "1 dzień temu",
    },

    // Waluty i liczby
    format: {
      currency: "{{value, currency:PLN}}",
      percent: "{{value, percent}}",
      decimal: "{{value, decimal}}",
    },
  },
};
