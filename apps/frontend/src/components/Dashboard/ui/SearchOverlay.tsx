// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/SearchOverlay.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardSearch } from "../hooks/useDashboardSearch";
import { useDashboardShortcuts } from "../hooks/useDashboardShortcuts";
import { getNodeIcon, getNodeTypeLabel, getCategoryColor } from "../utils/mapping";
import { debounce } from "../utils/debounce";
import cls from "../utils/cls";

import type { SearchOverlayProps, SearchResult } from "../types";

// ============================================================================
// Type Definitions
// ============================================================================

interface SearchOverlayState {
  selectedIndex: number;
  searchQuery: string;
  isInputFocused: boolean;
  showFilters: boolean;
  activeFilter: string | null;
}

// ============================================================================
// Search Result Item Component
// ============================================================================

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: (result: SearchResult) => void;
  index: number;
}

const SearchResultItem: React.FC<SearchResultItemProps> = React.memo(({
  result,
  isSelected,
  onSelect,
  index
}) => {
  const { t } = useTranslation();
  const itemRef = useRef<HTMLDivElement>(null);
  const categoryColor = getCategoryColor(result.category || 'default');

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [isSelected]);

  const handleClick = () => {
    onSelect(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(result);
    }
  };

  const itemClasses = cls(
    'search-overlay__result-item',
    {
      'search-overlay__result-item--selected': isSelected,
      'search-overlay__result-item--category': result.type === 'CATEGORY',
      'search-overlay__result-item--node': result.type === 'NODE',
      'search-overlay__result-item--data': result.type === 'DATA'
    },
    undefined
  );

  return (
    <div
      ref={itemRef}
      className={itemClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={t('searchOverlay.selectResult', { title: result.title })}
      aria-selected={isSelected}
      data-index={index}
    >
      {/* Result Icon */}
      <div 
        className="search-overlay__result-icon"
        style={{ color: categoryColor.primary }}
      >
        {getNodeIcon(
          result.type === 'CATEGORY' ? 'CATEGORY' : 
          result.type === 'NODE' ? (result.metadata?.nodeType as any) || 'CUSTOM' : 'CUSTOM',
          'emoji'
        )}
      </div>

      {/* Result Content */}
      <div className="search-overlay__result-content">
        <div className="search-overlay__result-header">
          <h3 className="search-overlay__result-title">
            {result.title}
          </h3>
          
          <div className="search-overlay__result-meta">
            <span className="search-overlay__result-type">
              {getNodeTypeLabel(
                result.type === 'CATEGORY' ? 'CATEGORY' : 
                result.type === 'NODE' ? (result.metadata?.nodeType as any) || 'CUSTOM' : 'CUSTOM'
              )}
            </span>
            
            {result.category && (
              <>
                <span className="search-overlay__meta-separator">•</span>
                <span 
                  className="search-overlay__result-category"
                  style={{ color: categoryColor.primary }}
                >
                  {result.category}
                </span>
              </>
            )}
            
            {result.metadata?.lastModified && (
              <>
                <span className="search-overlay__meta-separator">•</span>
                <span className="search-overlay__result-date">
                  {new Date(result.metadata.lastModified).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {result.description && (
          <p className="search-overlay__result-description">
            {result.description}
          </p>
        )}

        {/* Tags */}
        {result.metadata?.tags && result.metadata.tags.length > 0 && (
          <div className="search-overlay__result-tags">
            {result.metadata.tags.slice(0, 3).map((tag, tagIndex) => (
              <span key={tagIndex} className="search-overlay__result-tag">
                {tag}
              </span>
            ))}
            {result.metadata.tags.length > 3 && (
              <span className="search-overlay__result-tag-more">
                +{result.metadata.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Relevance Score (debug) */}
        {import.meta.env.DEV && (
          <div className="search-overlay__result-debug">
            <small>Relevance: {result.relevance.toFixed(2)}</small>
          </div>
        )}
      </div>

      {/* Keyboard Shortcut Hint */}
      {isSelected && (
        <div className="search-overlay__result-hint">
          {t('searchOverlay.pressEnter')}
        </div>
      )}
    </div>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

// ============================================================================
// Main Component
// ============================================================================

/**
 * SearchOverlay - Full-screen search interface with advanced features
 * 
 * Features:
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Debounced search input
 * - Result highlighting and selection
 * - Filter options
 * - Accessibility support
 * - Responsive design
 * 
 * @component
 * @example
 * ```tsx
 * <SearchOverlay
 *   isOpen={true}
 *   onClose={handleClose}
 *   onResultSelect={handleResultSelect}
 *   query="initial query"
 *   results={searchResults}
 *   isLoading={false}
 * />
 * ```
 */
const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onResultSelect,
  query: initialQuery = "",
  results: externalResults = [],
  isLoading = false
}) => {
  const { t } = useTranslation();
  const { query, results, search, clearSearch, isLoading: searchLoading } = useDashboardSearch();
  const { registerShortcut, unregisterShortcut } = useDashboardShortcuts();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<SearchOverlayState>({
    selectedIndex: -1,
    searchQuery: initialQuery,
    isInputFocused: true,
    showFilters: false,
    activeFilter: null
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      search(searchQuery);
    }, 300),
    [search]
  );

  // Focus management
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setState(prev => ({
            ...prev,
            selectedIndex: Math.min(prev.selectedIndex + 1, displayResults.length - 1)
          }));
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setState(prev => ({
            ...prev,
            selectedIndex: Math.max(prev.selectedIndex - 1, -1)
          }));
          break;
          
        case 'Enter':
          e.preventDefault();
          if (state.selectedIndex >= 0 && state.selectedIndex < displayResults.length) {
            handleResultSelect(displayResults[state.selectedIndex]);
          }
          break;
          
        case '/':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            inputRef.current?.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, state.selectedIndex, results.length]);

  // Register keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      registerShortcut('escape', handleClose, t('searchOverlay.closeSearch'));
      registerShortcut('ctrl+/', () => inputRef.current?.focus(), t('searchOverlay.focusSearch'));
    }

    return () => {
      unregisterShortcut('escape');
      unregisterShortcut('ctrl+/');
    };
  }, [isOpen, registerShortcut, unregisterShortcut, t]);

  const displayResults = externalResults.length > 0 ? externalResults : results;
  const isLoadingState = isLoading || searchLoading;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setState(prev => ({ ...prev, searchQuery: newQuery, selectedIndex: -1 }));
    debouncedSearch(newQuery);
  };

  const handleInputFocus = () => {
    setState(prev => ({ ...prev, isInputFocused: true }));
  };

  const handleInputBlur = () => {
    setState(prev => ({ ...prev, isInputFocused: false }));
  };

  const handleClose = () => {
    setState({
      selectedIndex: -1,
      searchQuery: "",
      isInputFocused: false,
      showFilters: false,
      activeFilter: null
    });
    clearSearch();
    onClose();
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect(result);
    handleClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  const clearInput = () => {
    setState(prev => ({ ...prev, searchQuery: "", selectedIndex: -1 }));
    clearSearch();
    inputRef.current?.focus();
  };

  const toggleFilters = () => {
    setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  };

  if (!isOpen) return null;

  const overlayClasses = cls(
    'search-overlay',
    {
      'search-overlay--loading': isLoadingState,
      'search-overlay--has-results': displayResults.length > 0,
      'search-overlay--filters-visible': state.showFilters
    },
    undefined
  );

  return (
    <div
      ref={overlayRef}
      className={overlayClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-label={t('searchOverlay.dialogLabel')}
      aria-modal="true"
    >
      <div className="search-overlay__container">
        {/* Search Header */}
        <div className="search-overlay__header">
          <div className="search-overlay__input-container">
            {/* Search Icon */}
            <div className="search-overlay__search-icon">
              {getNodeIcon('CUSTOM', 'emoji')}
            </div>

            {/* Search Input */}
            <input
              ref={inputRef}
              type="text"
              className="search-overlay__input"
              placeholder={t('searchOverlay.placeholder')}
              value={state.searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              aria-label={t('searchOverlay.inputLabel')}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />

            {/* Clear Button */}
            {state.searchQuery && (
              <button
                className="search-overlay__clear-button"
                onClick={clearInput}
                aria-label={t('searchOverlay.clearSearch')}
              >
                ✕
              </button>
            )}

            {/* Loading Indicator */}
            {isLoadingState && (
              <div className="search-overlay__loading-indicator">
                <div className="search-overlay__loading-spinner"></div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="search-overlay__actions">
            <button
              className="search-overlay__filter-button"
              onClick={toggleFilters}
              aria-label={t('searchOverlay.toggleFilters')}
              aria-expanded={state.showFilters}
            >
              {getNodeIcon('CUSTOM', 'emoji')}
            </button>

            <button
              className="search-overlay__close-button"
              onClick={handleClose}
              aria-label={t('searchOverlay.close')}
            >
              {t('searchOverlay.close')}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {state.showFilters && (
          <div className="search-overlay__filters">
            <div className="search-overlay__filters-content">
              <h3 className="search-overlay__filters-title">
                {t('searchOverlay.filters')}
              </h3>
              {/* Filter options would go here */}
              <p className="search-overlay__filters-coming-soon">
                {t('searchOverlay.filtersComingSoon')}
              </p>
            </div>
          </div>
        )}

        {/* Results Container */}
        <div className="search-overlay__results-container">
          {/* Results Count */}
          {state.searchQuery && (
            <div className="search-overlay__results-info">
              {isLoadingState ? (
                <span className="search-overlay__loading-text">
                  {t('searchOverlay.searching')}
                </span>
              ) : (
                <span className="search-overlay__results-count">
                  {displayResults.length === 0
                    ? t('searchOverlay.noResults')
                    : t('searchOverlay.resultsCount', { count: displayResults.length })
                  }
                </span>
              )}
            </div>
          )}

          {/* Results List */}
          <div className="search-overlay__results" role="listbox">
            {displayResults.map((result, index) => (
              <SearchResultItem
                key={result.id}
                result={result}
                isSelected={index === state.selectedIndex}
                onSelect={handleResultSelect}
                index={index}
              />
            ))}
          </div>

          {/* Empty State */}
          {state.searchQuery && displayResults.length === 0 && !isLoadingState && (
            <div className="search-overlay__empty-state">
              <div className="search-overlay__empty-icon">
                {getNodeIcon('CUSTOM', 'emoji')}
              </div>
              <h3 className="search-overlay__empty-title">
                {t('searchOverlay.noResultsTitle')}
              </h3>
              <p className="search-overlay__empty-description">
                {t('searchOverlay.noResultsDescription')}
              </p>
            </div>
          )}

          {/* Keyboard Shortcuts Help */}
          <div className="search-overlay__shortcuts-help">
            <div className="search-overlay__shortcut-item">
              <kbd>↑↓</kbd>
              <span>{t('searchOverlay.navigate')}</span>
            </div>
            <div className="search-overlay__shortcut-item">
              <kbd>Enter</kbd>
              <span>{t('searchOverlay.select')}</span>
            </div>
            <div className="search-overlay__shortcut-item">
              <kbd>Esc</kbd>
              <span>{t('searchOverlay.close')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Display Name
// ============================================================================

SearchOverlay.displayName = 'SearchOverlay';

export default SearchOverlay;