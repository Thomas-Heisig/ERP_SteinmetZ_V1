// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/Business/OrganizationPage.tsx
/**
 * @module OrganizationPage
 * @description Organizational Structure Management (Organisationsstruktur)
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Department {
  id: string;
  name: string;
  code?: string;
  type?: string;
  description?: string;
  parent_id?: string;
  manager_id?: string;
  employee_count?: number;
  budget?: number;
  is_active: boolean;
}

interface Location {
  id: string;
  name: string;
  location_type: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  area_sqm?: number;
  capacity?: number;
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  annual_budget?: number;
  department_id?: string;
}

export const OrganizationPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"departments" | "locations" | "cost-centers">("departments");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for different entities
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);

  // Fetch data on mount and tab change
  useEffect(() => {
    if (activeTab === "departments") {
      fetchDepartments();
    } else if (activeTab === "locations") {
      fetchLocations();
    } else if (activeTab === "cost-centers") {
      fetchCostCenters();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/business/organization/departments");
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (err) {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/business/organization/locations");
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (err) {
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const fetchCostCenters = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/business/organization/cost-centers");
      const data = await response.json();
      setCostCenters(data.cost_centers || []);
    } catch (err) {
      setError("Failed to load cost centers");
    } finally {
      setLoading(false);
    }
  };

  const getLocationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      headquarters: "Hauptsitz",
      branch: "Filiale",
      production: "Produktionsstätte",
      warehouse: "Lager",
      sales_office: "Vertriebsbüro",
      service_center: "Service-Center",
      foreign: "Auslandsniederlassung",
      representative: "Repräsentanz",
      home_office: "Home-Office",
      temporary: "Temporär",
    };
    return labels[type] || type;
  };

  const getCostCenterTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      cost_center: "Kostenstelle",
      profit_center: "Profit-Center",
      investment_center: "Investment-Center",
      revenue_center: "Revenue-Center",
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Organisationsstruktur
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Abteilungen, Standorte und Kostenstellen verwalten
        </p>
      </div>

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
          <button
            onClick={() => setActiveTab("departments")}
            className={`pb-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === "departments"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Abteilungen
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`pb-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === "locations"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Standorte
          </button>
          <button
            onClick={() => setActiveTab("cost-centers")}
            className={`pb-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === "cost-centers"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Kostenstellen
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Departments Tab */}
            {activeTab === "departments" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Abteilungen ({departments.length})
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    + Neue Abteilung
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                        {dept.code && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {dept.code}
                          </span>
                        )}
                      </div>
                      {dept.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{dept.description}</p>
                      )}
                      <div className="space-y-1 text-sm">
                        {dept.type && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Typ:</span> {dept.type}
                          </p>
                        )}
                        {dept.employee_count !== undefined && dept.employee_count !== null && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Mitarbeiter:</span> {dept.employee_count}
                          </p>
                        )}
                        {dept.budget !== undefined && dept.budget !== null && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Budget:</span> €{dept.budget.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {departments.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Keine Abteilungen vorhanden
                  </p>
                )}
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === "locations" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Standorte ({locations.length})
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    + Neuer Standort
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{location.name}</h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                          {getLocationTypeLabel(location.location_type)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {location.street && (
                          <p className="text-gray-600 dark:text-gray-400">{location.street}</p>
                        )}
                        {location.city && (
                          <p className="text-gray-600 dark:text-gray-400">
                            {location.postal_code} {location.city}
                          </p>
                        )}
                        {location.phone && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Tel:</span> {location.phone}
                          </p>
                        )}
                        {location.area_sqm && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Fläche:</span> {location.area_sqm} m²
                          </p>
                        )}
                        {location.capacity && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Kapazität:</span> {location.capacity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {locations.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Keine Standorte vorhanden
                  </p>
                )}
              </div>
            )}

            {/* Cost Centers Tab */}
            {activeTab === "cost-centers" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Kostenstellen ({costCenters.length})
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    + Neue Kostenstelle
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Typ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Jahresbudget
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Beschreibung
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {costCenters.map((cc) => (
                        <tr key={cc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {cc.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{cc.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                              {getCostCenterTypeLabel(cc.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {cc.annual_budget ? `€${cc.annual_budget.toLocaleString()}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {cc.description || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {costCenters.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Keine Kostenstellen vorhanden
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
