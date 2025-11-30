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

/**
 * Sprachen mit RTL-Schreibrichtung (ISO 15924)
 */
const RTL_LANGS: string[] = ["ar"];

/**
 * Schutz: i18next darf nicht mehrfach initialisiert werden.
 * Kommt sonst in React.StrictMode gelegentlich vor.
 */
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      debug: false, // kann bei Bedarf aktiviert werden

      resources: {
        de: { translation: de },
        en: { translation: en },
        ar: { translation: ar },
        zh: { translation: zh },
        ru: { translation: ru },
        nds: { translation: nds },
        fr: { translation: fr },
      },

      /**
       * Standardsprache + Fallback
       */
      lng: "de",
      fallbackLng: "en",

      interpolation: {
        escapeValue: false, // React schützt bereits vor XSS
      },

      react: {
        useSuspense: false, // verhindert visuelle "Lade-Glitches"
      }
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
