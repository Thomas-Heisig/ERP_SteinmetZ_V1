// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/CategoryGrid.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import type { CategoryGridProps, Category } from "../types";
import { getCategoryColor, getNodeIcon } from "../utils/mapping";
import cls from "../utils/cls";

// ============================================================================
// Type Definitions
// ============================================================================

interface CategoryCardProps {
  category: Category;
  onSelect: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  displayMode?: "grid" | "list";
}

interface CategoryGridState {
  hoveredCategory: string | null;
  activeCategory: string | null;
}

// ============================================================================
// Category Card Component
// ============================================================================

/**
 * Individual category card component
 */
const CategoryCard: React.FC<CategoryCardProps> = React.memo(
  ({ category, onSelect, onEdit, onDelete, displayMode = "grid" }) => {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = React.useState(false);

    const categoryColor = getCategoryColor(category.id);
    const hasActions = !!(onEdit || onDelete);
    const itemCount = category.nodeIds?.length || 0;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      onSelect(category);
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(category);
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(category.id);
    };

    const conditionalClasses = [
      isHovered ? "category-card--hovered" : null,
      hasActions ? "category-card--has-actions" : null,
      itemCount === 0 ? "category-card--empty" : null,
    ].filter(Boolean) as string[];

    const cardClasses = cls(
      "category-card",
      `category-card--${displayMode}`,
      ...conditionalClasses,
      undefined, // <-- Options-Parameter (Pflicht laut Fehlermeldung)
    );

    const cardStyle: React.CSSProperties = {
      borderColor: categoryColor.primary,
      backgroundColor: "#ffffff",
      color: categoryColor.text,
    };

    return (
      <article
        className={cardClasses}
        style={cardStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={t("dashboard.categories.selectCategory", {
          name: category.name,
        })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(category);
          }
        }}
      >
        {/* Header Section */}
        <header className="category-card__header">
          <div
            className="category-card__icon"
            style={{ color: categoryColor.primary }}
          >
            {getNodeIcon("CATEGORY", "emoji")}
          </div>

          <div className="category-card__info">
            <h3 className="category-card__title" title={category.name}>
              {category.name}
            </h3>

            <div className="category-card__meta">
              <span className="category-card__count">
                {t("dashboard.categories.itemCount", { count: itemCount })}
              </span>
            </div>
          </div>
        </header>

        {/* Description Section (if available) */}
        {category.description && (
          <div className="category-card__description">
            {category.description}
          </div>
        )}

        {/* Tags Section (if available) */}
        {category.tags && category.tags.length > 0 && (
          <div className="category-card__tags">
            {category.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="category-card__tag">
                {tag}
              </span>
            ))}
            {category.tags.length > 3 && (
              <span className="category-card__tag-more">
                +{category.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions Section */}
        {hasActions && (
          <footer className="category-card__actions">
            {onEdit && (
              <button
                className="category-card__button category-card__button--edit"
                onClick={handleEdit}
                aria-label={t("dashboard.categories.editCategory", {
                  name: category.name,
                })}
                title={t("dashboard.categories.edit")}
              >
                {getNodeIcon("FORM", "emoji")}
                <span>{t("common.edit")}</span>
              </button>
            )}

            {onDelete && (
              <button
                className="category-card__button category-card__button--delete"
                onClick={handleDelete}
                aria-label={t("dashboard.categories.deleteCategory", {
                  name: category.name,
                })}
                title={t("common.delete")}
              >
                {getNodeIcon("CUSTOM", "emoji")}
                <span>{t("common.delete")}</span>
              </button>
            )}
          </footer>
        )}
      </article>
    );
  },
);

CategoryCard.displayName = "CategoryCard";

// ============================================================================
// Main Category Grid Component
// ============================================================================

/**
 * CategoryGrid - Responsive grid layout for dashboard categories
 *
 * Features:
 * - Responsive grid layout with CSS custom properties
 * - Accessibility support (ARIA labels, keyboard navigation)
 * - Hover and focus states
 * - Action buttons for edit/delete
 * - Empty state handling
 * - Loading state support
 *
 * @component
 * @example
 * ```tsx
 * <CategoryGrid
 *   categories={categories}
 *   onCategorySelect={handleSelect}
 *   onCategoryEdit={handleEdit}
 *   onCategoryDelete={handleDelete}
 *   displayMode="grid"
 *   isLoading={false}
 * />
 * ```
 */
const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  displayMode = "grid",
  isLoading = false,
  emptyStateMessage,
  className,
  ...rest
}) => {
  const { t } = useTranslation();

  const [state, setState] = React.useState<CategoryGridState>({
    hoveredCategory: null,
    activeCategory: null,
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, category: Category) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCategorySelect(category);
    }

    if (e.key === "Escape") {
      setState((prev) => ({ ...prev, activeCategory: null }));
    }
  };

  // Build CSS classes
  const gridClasses = cls(
    "category-grid",
    `category-grid--${displayMode}`,
    isLoading ? "category-grid--loading" : "",
    categories.length === 0 ? "category-grid--empty" : "",
    className ? className : undefined, // <-- jetzt korrekt
    undefined, // <-- der Options-Parameter
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={gridClasses} {...rest}>
        <div className="category-grid__loading">
          <div className="category-grid__loading-spinner"></div>
          <p>{t("dashboard.categories.loading")}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className={gridClasses} {...rest}>
        <div className="category-grid__empty">
          <div className="category-grid__empty-icon">
            {getNodeIcon("CATEGORY", "emoji")}
          </div>
          <h3 className="category-grid__empty-title">
            {emptyStateMessage || t("dashboard.categories.emptyTitle")}
          </h3>
          <p className="category-grid__empty-description">
            {t("dashboard.categories.emptyDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className={gridClasses}
      aria-label={t("dashboard.categories.gridLabel")}
      role="grid"
      {...rest}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onSelect={onCategorySelect}
          onEdit={onCategoryEdit}
          onDelete={onCategoryDelete}
          displayMode={displayMode}
        />
      ))}
    </section>
  );
};

// ============================================================================
// Display Name
// ============================================================================

CategoryGrid.displayName = "CategoryGrid";

export default CategoryGrid;
