// SPDX-License-Identifier: MIT
// src/components/LanguageSwitch/LanguageContext.tsx

import { createContext } from "react";

/**
 * Verfügbare Sprachen
 */
export type Locale = "de" | "en" | "ar" | "zh" | "ru" | "nds" | "fr" | "it" | "pl" | "tr";

/**
 * Sprach-Kontext-Interface
 */
export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/**
 * Sprach-Kontext
 */
export const LanguageContext = createContext<LanguageContextType>({
  locale: "de",
  setLocale: () => {},
});
