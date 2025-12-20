// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/CalendarFilters.tsx

/**
 * CalendarFilters Component
 *
 * Provides filtering and search functionality for calendar events:
 * - Category-based filtering
 * - Text search
 * - Date range selection
 * - Event type toggles (all-day, recurring)
 *
 * @remarks
 * - Fetches available categories from the backend
 * - Maintains filter state and notifies parent component of changes
 * - Displays active filters with clear functionality
 *
 * @example
 * ```tsx
 * <CalendarFilters
 *   onFilterChange={(filters) => console.log(filters)}
 * />
 * ```
 */

import React, { useState, useEffect } from "react";
import { Button, Input } from "../../components/ui";
import styles from "./Calendar.module.css";

interface FilterOptions {
  category: string[];
  search: string;
  dateRange: { start: Date; end: Date } | null;
  showAllDay: boolean;
  showRecurring: boolean;
}

interface CalendarFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  onFilterChange,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    category: [],
    search: "",
    dateRange: null,
    showAllDay: true,
    showRecurring: true,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load categories on component mount
    const loadCategories = async (): Promise<void> => {
      try {
        const response = await fetch("/api/calendar/categories");
        if (response.ok) {
          const data = (await response.json()) as {
            success: boolean;
            data: Array<{ category: string }>;
          };
          if (data.success) {
            setCategories(data.data.map((item) => item.category));
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: [],
      search: "",
      dateRange: null,
      showAllDay: true,
      showRecurring: true,
    });
  };

  const activeFilterCount =
    (filters.category.length > 0 ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.dateRange ? 1 : 0) +
    (!filters.showAllDay ? 1 : 0) +
    (!filters.showRecurring ? 1 : 0);

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterBar}>
        <Input
          placeholder="Termine suchen..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={styles.searchInput}
        />

        <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
          Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {isOpen && (
        <div className={styles.filterDropdown}>
          <div className={styles.filterSection}>
            <h4>Kategorien</h4>
            <div className={styles.filterOptions}>
              {categories.map((cat) => (
                <label key={cat} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={filters.category.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4>Eigenschaften</h4>
            <div className={styles.filterOptions}>
              <label className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={filters.showAllDay}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilters((prev) => ({
                      ...prev,
                      showAllDay: e.target.checked,
                    }))
                  }
                />
                <span>Ganztägige Termine anzeigen</span>
              </label>
              <label className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={filters.showRecurring}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilters((prev) => ({
                      ...prev,
                      showRecurring: e.target.checked,
                    }))
                  }
                />
                <span>Wiederkehrende Termine anzeigen</span>
              </label>
            </div>
          </div>

          <div className={styles.filterActions}>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Zurücksetzen
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Anwenden
            </Button>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className={styles.activeFilters}>
          {filters.category.length > 0 && (
            <div className={styles.filterTag}>
              Kategorien: {filters.category.join(", ")}
            </div>
          )}
          {filters.search && (
            <div className={styles.filterTag}>
              Suche: &ldquo;{filters.search}&rdquo;
            </div>
          )}
          {filters.dateRange && (
            <div className={styles.filterTag}>
              Datum: {filters.dateRange.start.toLocaleDateString()} -{" "}
              {filters.dateRange.end.toLocaleDateString()}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Alle löschen
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarFilters;
