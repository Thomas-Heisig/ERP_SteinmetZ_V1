// SPDX-License-Identifier: MIT
// src/components/LanguageSwitch/LanguageSwitcher.tsx

import React, { useContext } from "react";
import { LanguageContext, Locale } from "./LanguageProvider";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useContext(LanguageContext);
  const { t } = useTranslation();

  /**
   * Verfügbare Sprachen zur Auswahl.
   * Flags sind optisch, nicht technisch relevant.
   */
  const LANGUAGES: Array<{ code: Locale; label: string; flag: string }> = [
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "nds", label: "Plattdüütsch", flag: "🧱" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "pl", label: "Polski", flag: "🇵🇱" },
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as Locale;
    setLocale(selected);
    // Keine DOM-Manipulation hier.
    // RTL wird zentral in src/i18n/i18n.ts gesetzt.
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="language-switcher"
      aria-label={t("dashboard.languageSwitcher")}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
};
