// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/index.ts

/* ============================================================
   Hauptkomponente
============================================================ */
export { default as FunctionsCatalog } from "./FunctionsCatalog";

/* ============================================================
   Types
============================================================ */
export * from "./types";

/* ============================================================
   Search Components
============================================================ */
export { default as SearchBar } from "./search/SearchBar";
export { default as SearchResults } from "./search/SearchResults";
export { default as SearchItem } from "./search/SearchItem";

/* ============================================================
   Node-Detail Components
============================================================ */
export { default as NodeDetails } from "./details/NodeDetails";
export { default as NodeHeader } from "./details/NodeHeader";
export { default as Breadcrumbs } from "./details/Breadcrumbs";
export { default as NodeInfoGrid } from "./details/NodeInfoGrid";
export { default as NodeMetaBlocks } from "./details/NodeMetaBlocks";

/* ============================================================
   Lint Components
============================================================ */
export { default as LintPanel } from "./lint/LintPanel";

/* ============================================================
   Layout Components
============================================================ */
export { default as CatalogLayout } from "./layout/CatalogLayout";
export { default as TopBar } from "./layout/TopBar";
export { default as Panel } from "./layout/Panel";

/* ============================================================
   Feature: Code / Monaco
============================================================ */
export { default as MonacoCode } from "./features/code/MonacoCode";
export { useMonacoThemeSync } from "./features/code/useMonacoThemeSync";

/* ============================================================
   Feature: Kontextmenü
============================================================ */
export { default as ContextMenu } from "./features/contextMenu/ContextMenu";
export { default as useContextMenu } from "./features/contextMenu/useContextMenu";

/* ============================================================
   Feature: Export
============================================================ */
export { 
  exportNodeAsJSON, 
  exportAnyJSON 
} from "./features/export/exportJSON";

export { 
  exportNodeAsMarkdown, 
  exportAnyMarkdown 
} from "./features/export/exportMarkdown";

export { 
  exportNodeAsYAML 
} from "./features/export/exportYAML";

/* ============================================================
   Feature: Favoriten
============================================================ */
export { default as FavoritesStore } from "./features/favorites/FavoritesStore";
export { default as useFavorites } from "./features/favorites/useFavorites";

/* ============================================================
   Feature: History
============================================================ */
export { default as HistoryStore } from "./features/history/HistoryStore";
export { default as useHistory } from "./features/history/useHistory";

/* ============================================================
   Styles
============================================================ */
import "./styles/index.css";
