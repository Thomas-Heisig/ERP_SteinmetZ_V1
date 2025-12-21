// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/FunctionsCatalog.tsx

/**
 * Functions Catalog Component
 * 
 * A comprehensive catalog interface for browsing, searching, and managing 
 * ERP function nodes. Provides search capabilities, node details viewing,
 * linting functionality, and customizable actions.
 * 
 * @module FunctionsCatalog
 * @category Components
 * 
 * @example
 * ```tsx
 * import FunctionsCatalog from './components/FunctionsCatalog/FunctionsCatalog';
 * 
 * function App() {
 *   return (
 *     <FunctionsCatalog
 *       roles={['admin', 'user']}
 *       features={{ search: true, lint: true }}
 *       onNodeSelect={(node) => console.log('Selected:', node)}
 *     />
 *   );
 * }
 * ```
 */

import React, { useCallback } from "react";

import { useFunctionsCatalog } from "../../hooks/useFunctionsCatalog";
import type { FunctionsCatalogProps } from "./types";

import CatalogLayout from "./layout/CatalogLayout";
import TopBar from "./layout/TopBar";
import SearchResults from "./search/SearchResults";
import NodeDetails from "./details/NodeDetails";
import LintPanel from "./lint/LintPanel";
import Panel from "./layout/Panel";

/**
 * Main Functions Catalog component for browsing and managing function nodes
 * 
 * @param {FunctionsCatalogProps} props - Component configuration props
 * @returns {React.FC} Functions catalog interface
 */
export default function FunctionsCatalog({
  roles,
  features,
  baseUrl,
  theme: _theme = "auto",
  locale: _locale,
  permissions: _permissions,
  config: _config,
  onNodeSelect: _onNodeSelect,
  onSearch,
  onError: _onError,
  onExport: _onExport,
  customActions: _customActions,
}: FunctionsCatalogProps) {
  const {
    rules,

    // Menü / Laden
    menuLoading,
    menuError,

    // Node Handling
    selectNode,

    node,
    nodeLoading,
    nodeError,

    // Suchsystem
    searchQuery,
    searchResults,
    search,
    searchLoading,

    // Reload / Lint
    reloadIndex,
    loadLint,
    findings,
  } = useFunctionsCatalog({
    baseUrl,
    initialContext: { roles, features },
  });

  /* ============================================================
     Node Auswahl
     - onNodeSelect soll den NEU geladenen Node erhalten
  ============================================================ */
  const handleSelectNode = useCallback(
    (id: string) => {
      selectNode(id);

      // OnNodeSelect darf erst feuern,
      // wenn der Node tatsächlich geladen wurde.
      // hook-Node ist aber erst NACH dem Laden gesetzt.
      // Lösung: Parent kann selbst auf "node" hören.
      //
      // → kein sofortiger Aufruf hier!
    },
    [selectNode],
  );

  /* ============================================================
     Suche
  ============================================================ */
  const handleSearch = useCallback(
    (q: string) => {
      search(q);

      if (onSearch) {
        // nur die Query weiterreichen – Ergebnisse ändern sich asynchron
        onSearch(q, searchResults);
      }
    },
    [search, onSearch, searchResults],
  );

  /* ============================================================
     Leerer Zustand
  ============================================================ */
  const hasEmptyState =
    !node &&
    !nodeLoading &&
    !menuLoading &&
    !menuError &&
    !searchQuery &&
    searchResults.length === 0;

  /* ============================================================
     Rendering
  ============================================================ */
  return (
    <CatalogLayout>
      {/* Top Bar */}
      <TopBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onReload={reloadIndex}
        onLint={loadLint}
        menuLoading={menuLoading}
        searchLoading={searchLoading}
        nodeLoading={nodeLoading}
        menuError={menuError}
        nodeError={nodeError}
      />

      {/* Suchergebnisse */}
      {searchResults.length > 0 && (
        <Panel title={`Treffer (${searchResults.length})`}>
          <SearchResults results={searchResults} onSelect={handleSelectNode} />
        </Panel>
      )}

      {/* Node Details */}
      {node && <NodeDetails node={node} onNavigate={handleSelectNode} />}

      {/* Lint Ergebnisse */}
      {findings.length > 0 && <LintPanel findings={findings} />}

      {/* Leerer Startzustand */}
      {hasEmptyState && (
        <Panel>
          <div className="text-gray-500">
            Wähle links eine Funktion aus oder nutze die Suche.
          </div>

          {rules && (
            <div className="text-xs text-gray-400 mt-2">
              Regeln geladen (v{rules.version}, {rules.locale})
            </div>
          )}
        </Panel>
      )}
    </CatalogLayout>
  );
}
