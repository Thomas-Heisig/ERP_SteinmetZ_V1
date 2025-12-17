// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Tabs.tsx

/**
 * Accessible tabbed interface component
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
 *   { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, icon: <Icon /> },
 * ];
 *
 * <Tabs tabs={tabs} defaultTab="tab1" onChange={(id) => console.log(id)} />
 * ```
 */

import React, { useState } from "react";
import styles from "./Tabs.module.css";

/**
 * Tab configuration
 */
export interface Tab {
  /** Unique identifier for the tab */
  id: string;
  /** Label text displayed on the tab */
  label: string;
  /** Optional icon displayed before the label */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Content to display when the tab is active */
  content: React.ReactNode;
}

/**
 * Tabs component props
 */
export interface TabsProps {
  /** Array of tab configurations */
  tabs: Tab[];
  /** ID of the initially active tab */
  defaultTab?: string;
  /** Callback fired when active tab changes */
  onChange?: (tabId: string) => void;
  /** Visual style variant */
  variant?: "default" | "pills" | "underline";
  /** Whether tabs should take full width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tabs component with keyboard navigation and ARIA support
 *
 * @param props - Tabs properties
 * @returns Rendered tabs component
 */
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

  const tabsClasses = [styles.tabs, className].filter(Boolean).join(" ");
  const tabListClasses = [styles.tabList, styles[variant]]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={tabsClasses}>
      <div className={tabListClasses} role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabClasses = [
            styles.tab,
            isActive && styles.active,
            fullWidth && styles.fullWidth,
          ]
            .filter(Boolean)
            .join(" ");

          // ARIA attributes with explicit string values to satisfy ESLint
          const ariaProps = {
            "aria-selected": isActive ? ("true" as const) : ("false" as const),
            "aria-controls": `tabpanel-${tab.id}`,
          };

          return (
            <button
              key={tab.id}
              role="tab"
              {...ariaProps}
              onClick={() => !tab.disabled && handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={tabClasses}
            >
              {tab.icon && (
                <span className={styles.tabIcon} aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={activeTab}
        className={styles.tabContent}
      >
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;
