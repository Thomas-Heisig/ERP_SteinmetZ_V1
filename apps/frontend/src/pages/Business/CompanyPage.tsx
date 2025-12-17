// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/Business/CompanyPage.tsx
/**
 * @module CompanyPage
 * @description Unternehmensstammdaten-Verwaltung
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Company {
  id: string;
  name: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
}

export const CompanyPage: React.FC = () => {
  const { t } = useTranslation();
  const [company, setCompany] = useState<Company>({
    id: "1",
    name: "Steinmetz GmbH",
    taxId: "DE123456789",
    address: "Hauptstraße 1, 12345 Stadt",
    phone: "+49 123 456789",
    email: "info@steinmetz.de",
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("business.company.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("business.company.masterData")}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Firmenname
            </label>
            <input
              id="company-name"
              type="text"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="company-tax-id"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Steuernummer
            </label>
            <input
              id="company-tax-id"
              type="text"
              value={company.taxId}
              onChange={(e) =>
                setCompany({ ...company, taxId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="company-address"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Adresse
            </label>
            <input
              id="company-address"
              type="text"
              value={company.address}
              onChange={(e) =>
                setCompany({ ...company, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="company-phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Telefon
            </label>
            <input
              id="company-phone"
              type="tel"
              value={company.phone}
              onChange={(e) =>
                setCompany({ ...company, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="company-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              E-Mail
            </label>
            <input
              id="company-email"
              type="email"
              value={company.email}
              onChange={(e) =>
                setCompany({ ...company, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Speichern
          </button>
          <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
