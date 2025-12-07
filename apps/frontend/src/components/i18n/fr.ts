export default {
  dashboard: {
    title: "ERP SteinmetZ – Catalogue des fonctions",
    subtitle: "Aperçu de l'état du système et des domaines fonctionnels",

    // État du système
    health: {
      status: {
        healthy: "Système opérationnel",
        degraded: "Système dégradé",
        unhealthy: "Système en échec",
      },
    },

    // Catégories
    categories: {
      title: "Domaines fonctionnels",
      count: "{{count}} domaines disponibles",
      count_one: "{{count}} domaine disponible",
      count_other: "{{count}} domaines disponibles",
      emptyTitle: "Aucune catégorie trouvée",
      emptyDescription: "Aucune catégorie correspondante n'a pu être affichée.",
    },

    // Statuts généraux
    online: "Système en ligne",
    degraded: "Système limité",
    error: "Erreur de connexion",
    checking: "Vérification du statut…",
    unknown: "Inconnu",

    // Chargement
    loading: {
      message: "Chargement des données…",
    },

    // Recherche
    search: {
      button: "Lancer la recherche",
      filter: "Filtre de recherche",
      filterCategory: "Catégories",
      filterFunction: "Fonctions",
      placeholder: "Rechercher {{type}}…",
      input: "Champ de recherche",
      loading: "Recherche en cours…",
      noResults: "Aucun résultat trouvé",
    },

    // Écran d'erreur
    errorScreen: {
      title: "Erreur lors du chargement",
      retryButton: "Réessayer",
    },

    // Navigation
    navigation: {
      overview: "Vue d'ensemble",
      catalog: "Fonctions",
      ai: "Annotateur IA",
      settings: "Paramètres",
    },

    // Chat
    openChat: "Ouvrir le chat",
    chat: {
      inputPlaceholder: "Saisir un message…",
      send: "Envoyer",
      newSession: "Nouvelle session",
      loading: "Traitement de la réponse…",
    },

    // Modèles
    models: {
      title: "Modèles",
      provider: "Fournisseur",
      capabilities: "Fonctionnalités",
      noModels: "Aucun modèle disponible",
    },

    // Outils
    tools: {
      title: "Outils",
      run: "Exécuter",
      noTools: "Aucun outil enregistré",
    },

    // Informations système
    system: {
      title: "Informations système",
      version: "Version",
      uptime: "Durée de fonctionnement",
      memory: "Mémoire",
      routes: "Routes enregistrées",
      environment: "Environnement",
      database: "Base de données",
      diagnostics: "Diagnostics",
      features: "Fonctionnalités",
      resources: "Ressources",
      ai: "Statut IA",
      statusHealthy: "Opérationnel",
      statusUnhealthy: "Non opérationnel",
      statusDegraded: "Limité",
    },

    // Sélecteur de langue
    languageSwitcher: "Choisir la langue",

    // Interface utilisateur
    ui: {
      confirm: "Confirmer",
      cancel: "Annuler",
      close: "Fermer",
      reload: "Recharger",
      details: "Détails",
      unknown: "Inconnu",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      add: "Ajouter",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      warning: "Avertissement",
      info: "Information",
    },

    // Formes plurielles pour les éléments courants
    items: {
      result: "Résultat",
      result_one: "{{count}} résultat",
      result_other: "{{count}} résultats",
      file: "Fichier",
      file_one: "{{count}} fichier",
      file_other: "{{count}} fichiers",
      user: "Utilisateur",
      user_one: "{{count}} utilisateur",
      user_other: "{{count}} utilisateurs",
      message: "Message",
      message_one: "{{count}} message",
      message_other: "{{count}} messages",
      item: "Élément",
      item_one: "{{count}} élément",
      item_other: "{{count}} éléments",
    },

    // Formatage de date et heure
    datetime: {
      today: "Aujourd'hui",
      yesterday: "Hier",
      tomorrow: "Demain",
      now: "Maintenant",
      minutesAgo: "il y a {{count}} minutes",
      minutesAgo_one: "il y a 1 minute",
      hoursAgo: "il y a {{count}} heures",
      hoursAgo_one: "il y a 1 heure",
      daysAgo: "il y a {{count}} jours",
      daysAgo_one: "il y a 1 jour",
    },

    // Devises et nombres
    format: {
      currency: "{{value, currency:EUR}}",
      percent: "{{value, percent}}",
      decimal: "{{value, decimal}}",
    },
  },
};
