// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Tabs.tsx

import React, { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  fullWidth?: boolean;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  fullWidth = false,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={`ui-tabs ${className}`}>
      <div
        className="ui-tabs__list"
        role="tablist"
        style={{
          display: "flex",
          gap: variant === "pills" ? "0.5rem" : "0",
          borderBottom:
            variant === "underline" ? "1px solid var(--border)" : "none",
          background:
            variant === "default"
              ? "var(--gray-100)"
              : "transparent",
          borderRadius: variant === "default" ? "8px" : "0",
          padding: variant === "default" ? "0.25rem" : "0",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            disabled={tab.disabled}
            style={{
              flex: fullWidth ? 1 : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color:
                activeTab === tab.id
                  ? variant === "underline"
                    ? "var(--primary-600)"
                    : "var(--text-primary)"
                  : "var(--text-secondary)",
              background:
                activeTab === tab.id
                  ? variant === "pills"
                    ? "var(--primary-100)"
                    : variant === "default"
                      ? "var(--surface)"
                      : "transparent"
                  : "transparent",
              border: "none",
              borderBottom:
                variant === "underline"
                  ? activeTab === tab.id
                    ? "2px solid var(--primary-500)"
                    : "2px solid transparent"
                  : "none",
              borderRadius:
                variant === "pills"
                  ? "6px"
                  : variant === "default"
                    ? "6px"
                    : "0",
              cursor: tab.disabled ? "not-allowed" : "pointer",
              opacity: tab.disabled ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={activeTab}
        className="ui-tabs__content"
        style={{
          padding: "1rem 0",
        }}
      >
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;
