// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Select.tsx

import React, { forwardRef, useState, useRef, useEffect } from "react";

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

    return (
      <div ref={containerRef} className={`ui-select ${className}`}>
        {label && (
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            {label}
          </label>
        )}
        <div ref={ref} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 0.75rem",
              fontSize: "1rem",
              color: selectedOption
                ? "var(--text-primary)"
                : "var(--text-tertiary)",
              background: "var(--surface)",
              border: `1px solid ${error ? "var(--error-500)" : isOpen ? "var(--primary-500)" : "var(--border)"}`,
              borderRadius: "8px",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              transition: "border-color 0.2s ease",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {selectedOption?.icon}
              {selectedOption?.label || placeholder}
            </span>
            <span
              style={{
                transition: "transform 0.2s ease",
                transform: isOpen ? "rotate(180deg)" : "none",
              }}
            >
              ▼
            </span>
          </button>

          {isOpen && (
            <div
              className="ui-select__dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                maxHeight: "200px",
                overflowY: "auto",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
                zIndex: 1000,
              }}
            >
              {searchable && (
                <div
                  style={{
                    padding: "0.5rem",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Suchen..."
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
              )}
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Keine Optionen gefunden
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                    disabled={option.disabled}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      textAlign: "left",
                      background:
                        option.value === value
                          ? "var(--primary-50)"
                          : "transparent",
                      border: "none",
                      color: option.disabled
                        ? "var(--text-tertiary)"
                        : "var(--text-primary)",
                      cursor: option.disabled ? "not-allowed" : "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {error && (
          <span
            style={{
              display: "block",
              marginTop: "0.25rem",
              fontSize: "0.75rem",
              color: "var(--error-500)",
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
