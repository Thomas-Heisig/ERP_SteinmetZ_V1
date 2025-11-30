{
  "version": 2,

  "locale": "de",
  "indentToken": "│   ",
  "branchTokens": ["├──", "└──"],
  "headerPattern": "^##\\\\s*(?<title>.+)$",
  "allowPlainBullets": true,

  "maxDepth": 6,
  "pruneBeyondMax": true,
  "itemIfNoChildren": true,

  "idPolicy": {
    "slug": { "asciiOnly": false, "maxLen": 64, "dedupe": true },
    "preferExplicitId": true,
    "idCase": "kebab"
  },

  "order": {
    "strategy": "weightThenAlpha",
    "weightPattern": "\\\\(w:(-?\\\\d+)\\\\)$",
    "defaultWeight": 0,
    "groupOverflowLimit": 12,
    "overflowGroupTitle": "Weitere"
  },

  "kinds": {
    "default": "group",
    "allowed": ["category", "group", "record", "workflow", "report", "dataset", "item"]
  },

  "emojiKindMap": {
    "🏛️": "record",
    "📄": "report",
    "🎯": "workflow",
    "📦": "dataset",
    "💬": "item"
  },
  "emojiAsKind": true,

  "rbac": {
    "enabled": true,
    "defaultAnyOf": ["role:user"],
    "nodeFence": "rbac",
    "denyIfMissing": false
  },

  "flags": {
    "enabled": true,
    "nodeFence": "flags",
    "hiddenDefault": false
  },

  "validation": {
    "requireMetaForKinds": ["record", "workflow", "report"],
    "requireAAForKinds": ["workflow"],
    "requireSchemaForKinds": ["record"],
    "requireRBAC": true
  },

  "i18n": {
    "defaultLocale": "de",
    "fallbackLocale": "en",
    "nodeTitleFenceKey": "title",
    "localizableFields": ["title", "description", "help"]
  },

  "pii": {
    "classes": ["none", "low", "medium", "high"],
    "defaultClass": "none",
    "masking": { "iban": "last4", "email": "nameOnly" },
    "nodeFence": "pii"
  },

  "indentTolerance": ["│   ", "    "]
}
