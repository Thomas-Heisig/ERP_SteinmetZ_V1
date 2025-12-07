// SPDX-License-Identifier: MIT
// src/i18n/i18n.ts

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * Sprachdateien
 */
import de from "./de";
import en from "./en";
import ar from "./ar";
import zh from "./zh";
import ru from "./ru";
import nds from "./nds";
import fr from "./fr";
import it from "./it";
import pl from "./pl";
import tr from "./tr";

/**
 * Sprachen mit RTL-Schreibrichtung (ISO 15924)
 */
const RTL_LANGS: string[] = ["ar"];

/**
 * Schutz: i18next darf nicht mehrfach initialisiert werden.
 * Kommt sonst in React.StrictMode gelegentlich vor.
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    debug: false, // kann bei Bedarf aktiviert werden

    resources: {
      de: { translation: de },
      en: { translation: en },
      ar: { translation: ar },
      zh: { translation: zh },
      ru: { translation: ru },
      nds: { translation: nds },
      fr: { translation: fr },
      it: { translation: it },
      pl: { translation: pl },
      tr: { translation: tr },
    },

    /**
     * Standardsprache + Fallback
     */
    lng: "de",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false, // React schützt bereits vor XSS

      // Custom formatters for dates, numbers, and currency
      format: (value, format, lng) => {
        if (format === "uppercase") return value.toUpperCase();
        if (format === "lowercase") return value.toLowerCase();

        // Date formatting
        if (value instanceof Date) {
          const locale = lng || "de";
          if (format === "short") {
            return new Intl.DateTimeFormat(locale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(value);
          }
          if (format === "long") {
            return new Intl.DateTimeFormat(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(value);
          }
          if (format === "time") {
            return new Intl.DateTimeFormat(locale, {
              hour: "2-digit",
              minute: "2-digit",
            }).format(value);
          }
          if (format === "datetime") {
            return new Intl.DateTimeFormat(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(value);
          }
        }

        // Number formatting
        if (typeof value === "number") {
          const locale = lng || "de";
          if (format === "currency" || format?.startsWith("currency:")) {
            const currency = format.split(":")[1] || "EUR";
            return new Intl.NumberFormat(locale, {
              style: "currency",
              currency,
            }).format(value);
          }
          if (format === "percent") {
            return new Intl.NumberFormat(locale, {
              style: "percent",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(value / 100);
          }
          if (format === "decimal") {
            return new Intl.NumberFormat(locale, {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value);
          }
        }

        return value;
      },
    },

    react: {
      useSuspense: false, // verhindert visuelle "Lade-Glitches"
    },
  });
}

/**
 * HTML-Ausrichtung dynamisch umstellen
 * Wird bei jedem Sprachwechsel ausgeführt.
 */
i18n.on("languageChanged", (lang: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }
});

export default i18n;
