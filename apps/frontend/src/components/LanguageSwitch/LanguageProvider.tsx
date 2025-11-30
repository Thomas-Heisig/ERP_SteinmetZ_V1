// SPDX-License-Identifier: MIT
// src/components/LanguageSwitch/LanguageProvider.tsx

import React, { createContext, useState, ReactNode } from "react";
import i18n from "i18next";

/**
 * Verfügbare Locale-Codes.
 * Muss exakt zu den definierten Sprachen im i18n-System passen.
 */
export type Locale = "de" | "en" | "ar" | "zh" | "ru" | "nds" | "fr";

/**
 * Kontextdefinition
 */
interface LanguageContextProps {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
  locale: "de",
  setLocale: () => {},
});

/**
 * Sprachprovider
 */
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>("de");

  /**
   * Sprachwechsel-Funktion
   * - synchronisiert React-State und i18n
   * - RTL-Umschaltung wird primär über i18n erledigt
   *   (siehe i18n.ts)
   */
  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);

    // i18next kümmert sich um das Laden der Ressourcen und RTL-Handling
    i18n.changeLanguage(nextLocale).catch((err) => {
      console.error("Language change failed:", err);
    });

    // Falls i18n-Eventlistener (i18n.ts) nicht greift, fallback:
    if (typeof document !== "undefined") {
      document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};
