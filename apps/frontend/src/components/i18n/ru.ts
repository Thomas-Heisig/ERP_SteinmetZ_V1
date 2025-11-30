export default {
  dashboard: {
    title: "ERP SteinmetZ – Каталог функций",
    subtitle: "Обзор системы и функциональных модулей",

    // Состояние системы
    health: {
      status: {
        healthy: "Система работает нормально",
        degraded: "Система работает с ограничениями",
        unhealthy: "Система недоступна"
      }
    },

    // Категории
    categories: {
      title: "Разделы",
      count: "Доступно разделов: {{count}}",
      emptyTitle: "Разделы не найдены",
      emptyDescription: "Для выбранных условий нет доступных категорий."
    },

    online: "Система онлайн",
    degraded: "Система ограничена",
    error: "Ошибка соединения",
    checking: "Проверка статуса…",
    unknown: "Неизвестно",

    loading: {
      message: "Загрузка данных…"
    },

    search: {
      button: "Начать поиск",
      filter: "Фильтр поиска",
      filterCategory: "Категории",
      filterFunction: "Функции",
      placeholder: "Поиск по {{type}}…",
      input: "Поле поиска",
      loading: "Поиск…",
      noResults: "Ничего не найдено"
    },

    errorScreen: {
      title: "Ошибка при загрузке",
      retryButton: "Повторить"
    },

    navigation: {
      overview: "Обзор",
      catalog: "Функции",
      ai: "AI-аннотация",
      settings: "Настройки"
    },

    openChat: "Открыть чат",
    chat: {
      inputPlaceholder: "Введите сообщение…",
      send: "Отправить",
      newSession: "Новая сессия",
      loading: "Обработка ответа…"
    },

    models: {
      title: "Модели",
      provider: "Провайдер",
      capabilities: "Возможности",
      noModels: "Нет доступных моделей"
    },

    tools: {
      title: "Инструменты",
      run: "Выполнить",
      noTools: "Нет зарегистрированных инструментов"
    },

    system: {
      title: "Система",
      version: "Версия",
      uptime: "Время работы",
      memory: "Память",
      routes: "Зарегистрированные маршруты",
      environment: "Окружение",
      database: "База данных",
      diagnostics: "Диагностика",
      features: "Функции",
      resources: "Ресурсы",
      ai: "Статус ИИ",
      statusHealthy: "Работает",
      statusUnhealthy: "Недоступно",
      statusDegraded: "Ограничено"
    },

    languageSwitcher: "Выбор языка",

    ui: {
      confirm: "Подтвердить",
      cancel: "Отмена",
      close: "Закрыть",
      reload: "Обновить",
      details: "Детали",
      unknown: "Неизвестно"
    }
  }
};
