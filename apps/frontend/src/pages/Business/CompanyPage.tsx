// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/Business/CompanyPage.tsx
/**
 * @module CompanyPage
 * @description Comprehensive Company Master Data Management (Unternehmensstammdaten-Verwaltung)
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface CompanyInfo {
  id?: string;
  official_name: string;
  trade_name?: string;
  company_purpose?: string;
  founded_date?: string;
  employee_count?: number;
  revenue_class?: string;
  industry_classification?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  country: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  timezone: string;
  notes?: string;
}

interface BankAccount {
  id?: string;
  bank_name: string;
  account_name: string;
  iban: string;
  bic?: string;
  is_primary: boolean;
}

interface CommunicationChannel {
  id?: string;
  channel_type: string;
  channel_name: string;
  value: string;
  description?: string;
  is_primary: boolean;
}

export const CompanyPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "legal" | "tax" | "bank" | "communication"
  >("basic");
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    official_name: "",
    country: "Deutschland",
    timezone: "Europe/Berlin",
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [communications, setCommunications] = useState<CommunicationChannel[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch companies list
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fetch company details when selected
  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyDetails(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/business/company");
      const data = await response.json();
      setCompanies(data.companies || []);
      if (data.companies.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data.companies[0].id);
      }
    } catch (err) {
      setError("Failed to load companies");
    }
  };

  const fetchCompanyDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/business/company/${id}`);
      const data = await response.json();
      setCompanyInfo(data.company);
      setBankAccounts(data.bank_accounts || []);
      setCommunications(data.communications || []);
    } catch (err) {
      setError("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = companyInfo.id
        ? `/api/business/company/${companyInfo.id}`
        : "/api/business/company";
      const method = companyInfo.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyInfo),
      });

      if (!response.ok) {
        throw new Error("Failed to save company");
      }

      const data = await response.json();
      setSuccess("Company information saved successfully");

      if (!companyInfo.id && data.id) {
        setSelectedCompanyId(data.id);
      }

      fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async (account: BankAccount) => {
    if (!selectedCompanyId) return;

    try {
      const response = await fetch(
        `/api/business/company/${selectedCompanyId}/bank-accounts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(account),
        },
      );

      if (!response.ok) throw new Error("Failed to add bank account");

      setSuccess("Bank account added successfully");
      fetchCompanyDetails(selectedCompanyId);
    } catch (err) {
      setError("Failed to add bank account");
    }
  };

  const handleAddCommunication = async (channel: CommunicationChannel) => {
    if (!selectedCompanyId) return;

    try {
      const response = await fetch(
        `/api/business/company/${selectedCompanyId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(channel),
        },
      );

      if (!response.ok) throw new Error("Failed to add communication channel");

      setSuccess("Communication channel added successfully");
      fetchCompanyDetails(selectedCompanyId);
    } catch (err) {
      setError("Failed to add communication channel");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Geschäftsverwaltung
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Unternehmens-Stammdaten und Organisation
        </p>
      </div>

      {/* Company Selector */}
      {companies.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unternehmen auswählen
          </label>
          <select
            value={selectedCompanyId || ""}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.official_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {["basic", "legal", "tax", "bank", "communication"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab === "basic" && "Grunddaten"}
              {tab === "legal" && "Rechtsform"}
              {tab === "tax" && "Steuern"}
              {tab === "bank" && "Bankverbindungen"}
              {tab === "communication" && "Kommunikation"}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Offizieller Firmenname *
              </label>
              <input
                type="text"
                value={companyInfo.official_name}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    official_name: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Handelsname / DBA
              </label>
              <input
                type="text"
                value={companyInfo.trade_name || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, trade_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gründungsdatum
              </label>
              <input
                type="date"
                value={companyInfo.founded_date || ""}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    founded_date: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mitarbeiteranzahl
              </label>
              <input
                type="number"
                value={companyInfo.employee_count || ""}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? undefined
                      : parseInt(e.target.value, 10);
                  if (value === undefined || !isNaN(value)) {
                    setCompanyInfo({ ...companyInfo, employee_count: value });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branche
              </label>
              <input
                type="text"
                value={companyInfo.industry_classification || ""}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    industry_classification: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adresse
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Straße
              </label>
              <input
                type="text"
                value={companyInfo.street || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, street: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PLZ
              </label>
              <input
                type="text"
                value={companyInfo.postal_code || ""}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    postal_code: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stadt
              </label>
              <input
                type="text"
                value={companyInfo.city || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Land
              </label>
              <input
                type="text"
                value={companyInfo.country}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, country: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Kontaktdaten
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={companyInfo.phone || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={companyInfo.email || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={companyInfo.website || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, website: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fax
              </label>
              <input
                type="tel"
                value={companyInfo.fax || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, fax: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notizen
              </label>
              <textarea
                value={companyInfo.notes || ""}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, notes: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "bank" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bankverbindungen
            </h3>
            <div className="space-y-4">
              {bankAccounts.map((account, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bank
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.bank_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kontoname
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.account_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        IBAN
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.iban}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        BIC
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.bic || "-"}
                      </p>
                    </div>
                  </div>
                  {account.is_primary && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                      Hauptkonto
                    </span>
                  )}
                </div>
              ))}
              {bankAccounts.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  Keine Bankverbindungen vorhanden
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "communication" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Kommunikationskanäle
            </h3>
            <div className="space-y-4">
              {communications.map((channel, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Typ
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {channel.channel_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Name
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {channel.channel_name}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Wert
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {channel.value}
                      </p>
                    </div>
                  </div>
                  {channel.is_primary && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                      Primär
                    </span>
                  )}
                </div>
              ))}
              {communications.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  Keine Kommunikationskanäle vorhanden
                </p>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSaveBasicInfo}
            disabled={loading || !companyInfo.official_name}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Speichern..." : "Speichern"}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
