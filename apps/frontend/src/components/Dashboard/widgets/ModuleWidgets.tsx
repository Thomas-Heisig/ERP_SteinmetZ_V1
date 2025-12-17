// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/widgets/ModuleWidgets.tsx
/**
 * @module ModuleWidgets
 * @description Dashboard-Widgets für alle Hauptfunktionsmodule
 */

import React from "react";
import { useTranslation } from "react-i18next";

/* ---------------------------------------------------------
   ICONS (Sie können hier Ihre Icon-Library verwenden)
--------------------------------------------------------- */
const IconBriefcase = () => <span>💼</span>;
const IconCoin = () => <span>💰</span>;
const IconTrending = () => <span>📈</span>;
const IconShoppingCart = () => <span>🛒</span>;
const IconFactory = () => <span>🏭</span>;
const IconPackage = () => <span>📦</span>;
const IconUsers = () => <span>👥</span>;
const IconChartBar = () => <span>📊</span>;
const IconMail = () => <span>💬</span>;
const IconSettings = () => <span>⚙️</span>;
const IconArrowUp = () => <span className="text-green-600">↑</span>;
// const IconArrowDown = () => <span className="text-red-600">↓</span>; // Unused

interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon,
  children,
  onClick,
}) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <div className="text-2xl">{icon}</div>
    </div>
    <div>{children}</div>
  </div>
);

/* ---------------------------------------------------------
   GESCHÄFTSVERWALTUNG WIDGET
--------------------------------------------------------- */
export const BusinessWidget: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Geschäftsverwaltung")}
      icon={<IconBriefcase />}
      onClick={() => onNavigate("/business")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Aktive Prozesse
          </span>
          <span className="text-xl font-bold text-blue-600">12</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Compliance Status
          </span>
          <span className="text-sm font-semibold text-green-600">
            ✓ Compliant
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Offene Risiken
          </span>
          <span className="text-xl font-bold text-orange-600">3</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   FINANZEN & CONTROLLING WIDGET
--------------------------------------------------------- */
export const FinanceWidget: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Finanzen")}
      icon={<IconCoin />}
      onClick={() => onNavigate("/finance")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Umsatz (Monat)
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-green-600">450k €</span>
            <IconArrowUp />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Offene Forderungen
          </span>
          <span className="text-xl font-bold text-blue-600">125k €</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Liquidität
          </span>
          <span className="text-sm font-semibold text-green-600">Sehr gut</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   VERTRIEB & MARKETING WIDGET
--------------------------------------------------------- */
export const SalesWidget: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Vertrieb")}
      icon={<IconTrending />}
      onClick={() => onNavigate("/sales")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Pipeline-Wert
          </span>
          <span className="text-xl font-bold text-purple-600">2.45M €</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Neue Leads
          </span>
          <span className="text-xl font-bold text-blue-600">45</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Conversion Rate
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-green-600">32%</span>
            <IconArrowUp />
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   EINKAUF & BESCHAFFUNG WIDGET
--------------------------------------------------------- */
export const ProcurementWidget: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Einkauf")}
      icon={<IconShoppingCart />}
      onClick={() => onNavigate("/procurement")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Offene Bestellungen
          </span>
          <span className="text-xl font-bold text-blue-600">18</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Lieferanten
          </span>
          <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
            47
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Nachbestellungen
          </span>
          <span className="text-xl font-bold text-orange-600">4</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   PRODUKTION & FERTIGUNG WIDGET
--------------------------------------------------------- */
export const ProductionWidget: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Produktion")}
      icon={<IconFactory />}
      onClick={() => onNavigate("/production")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Auslastung
          </span>
          <span className="text-xl font-bold text-blue-600">87%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Laufende Aufträge
          </span>
          <span className="text-xl font-bold text-green-600">23</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Qualitätsrate
          </span>
          <span className="text-xl font-bold text-green-600">97.8%</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   LAGER & LOGISTIK WIDGET
--------------------------------------------------------- */
export const WarehouseWidget: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Lager")}
      icon={<IconPackage />}
      onClick={() => onNavigate("/warehouse")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Lagerbestand
          </span>
          <span className="text-xl font-bold text-blue-600">485k €</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Mindestbestand
          </span>
          <span className="text-xl font-bold text-red-600">12</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Versendungen heute
          </span>
          <span className="text-xl font-bold text-green-600">8</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   PERSONAL & HR WIDGET
--------------------------------------------------------- */
export const HRWidget: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Personal")}
      icon={<IconUsers />}
      onClick={() => onNavigate("/hr")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Mitarbeiter
          </span>
          <span className="text-xl font-bold text-blue-600">45</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Anwesenheit
          </span>
          <span className="text-xl font-bold text-green-600">96.5%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Überstunden
          </span>
          <span className="text-xl font-bold text-orange-600">156h</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   REPORTING & ANALYTICS WIDGET
--------------------------------------------------------- */
export const ReportingWidget: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Reporting")}
      icon={<IconChartBar />}
      onClick={() => onNavigate("/reporting")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Aktive Reports
          </span>
          <span className="text-xl font-bold text-blue-600">24</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            KI-Insights
          </span>
          <span className="text-xl font-bold text-purple-600">7</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Prognosegenauigkeit
          </span>
          <span className="text-xl font-bold text-green-600">87%</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   KOMMUNIKATION WIDGET
--------------------------------------------------------- */
export const CommunicationWidget: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("Kommunikation")}
      icon={<IconMail />}
      onClick={() => onNavigate("/communication")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Ungelesene E-Mails
          </span>
          <span className="text-xl font-bold text-blue-600">23</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Chat-Nachrichten
          </span>
          <span className="text-xl font-bold text-green-600">8</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Meetings heute
          </span>
          <span className="text-xl font-bold text-purple-600">5</span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   SYSTEM & ADMINISTRATION WIDGET
--------------------------------------------------------- */
export const SystemWidget: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={t("System")}
      icon={<IconSettings />}
      onClick={() => onNavigate("/system")}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            System-Status
          </span>
          <span className="text-sm font-semibold text-green-600">
            ✓ Healthy
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Aktive Benutzer
          </span>
          <span className="text-xl font-bold text-blue-600">38</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Letzte Sicherung
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            vor 2h
          </span>
        </div>
      </div>
    </WidgetCard>
  );
};

/* ---------------------------------------------------------
   ALL WIDGETS CONTAINER
--------------------------------------------------------- */
export const AllModuleWidgets: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <BusinessWidget onNavigate={onNavigate} />
      <FinanceWidget onNavigate={onNavigate} />
      <SalesWidget onNavigate={onNavigate} />
      <ProcurementWidget onNavigate={onNavigate} />
      <ProductionWidget onNavigate={onNavigate} />
      <WarehouseWidget onNavigate={onNavigate} />
      <HRWidget onNavigate={onNavigate} />
      <ReportingWidget onNavigate={onNavigate} />
      <CommunicationWidget onNavigate={onNavigate} />
      <SystemWidget onNavigate={onNavigate} />
    </div>
  );
};
