// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Select.tsx

import React, { forwardRef, useState, useRef, useEffect } from "react";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Auswählen...",
      label,
      error,
      disabled = false,
      searchable = false,
      className = "",
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearch("");
    };

    const triggerClasses = [
      styles.trigger,
      error && styles.error,
      isOpen && styles.open,
    ]
      .filter(Boolean)
      .join(" ");

    const iconClasses = [styles.icon, isOpen && styles.iconOpen]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={containerRef} className={`${styles.wrapper} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <div ref={ref} className={styles.selectWrapper}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={triggerClasses}
          >
            <span className={styles.value}>
              {selectedOption?.icon}
              <span className={selectedOption ? "" : styles.placeholder}>
                {selectedOption?.label || placeholder}
              </span>
            </span>
            <span className={iconClasses}>▼</span>
          </button>

          {isOpen && (
            <div className={styles.dropdown}>
              {searchable && (
                <div className={styles.searchWrapper}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Suchen..."
                    autoFocus
                    className={styles.searchInput}
                  />
                </div>
              )}
              {filteredOptions.length === 0 ? (
                <div className={styles.noResults}>Keine Optionen gefunden</div>
              ) : (
                <div className={styles.optionsList}>
                  {filteredOptions.map((option) => {
                    const optionClasses = [
                      styles.option,
                      option.value === value && styles.optionSelected,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          !option.disabled && handleSelect(option.value)
                        }
                        disabled={option.disabled}
                        className={optionClasses}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
