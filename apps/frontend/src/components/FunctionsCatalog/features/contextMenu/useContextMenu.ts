// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/contextMenu/useContextMenu.ts

import React, { useCallback, useState } from "react";

/**
 * Basistyp für Kontextmenü-Elemente.
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

/**
 * Zustand des Kontextmenüs.
 */
export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

/**
 * API, die der Hook zurückliefert.
 */
export interface UseContextMenuApi {
  openAtMouse: (event: React.MouseEvent, items: ContextMenuItem[]) => void;
  openAtPosition: (x: number, y: number, items: ContextMenuItem[]) => void;
  close: () => void;
  state: ContextMenuState;
}

/**
 * Universeller Kontextmenü-Hook.
 */
export default function useContextMenu(): UseContextMenuApi {
  const [state, setState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  });

  const openAtMouse = useCallback(
    (event: React.MouseEvent, items: ContextMenuItem[]) => {
      event.preventDefault();

      setState({
        visible: true,
        x: event.clientX + 2,
        y: event.clientY + 2,
        items,
      });
    },
    [],
  );

  const openAtPosition = useCallback(
    (x: number, y: number, items: ContextMenuItem[]) => {
      setState({
        visible: true,
        x,
        y,
        items,
      });
    },
    [],
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    openAtMouse,
    openAtPosition,
    close,
    state,
  };
}
