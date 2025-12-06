// SPDX-License-Identifier: MIT
// apps/frontend/src/utils/accessibility.ts
// Accessibility utilities and keyboard navigation helpers

/**
 * Trap focus within a container (e.g., for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);
  firstElement?.focus();

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(
  message: string,
  politeness: "polite" | "assertive" = "polite"
): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", politeness);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export class KeyboardShortcuts {
  private shortcuts = new Map<string, (e: KeyboardEvent) => void>();
  private enabled = true;

  register(key: string, handler: (e: KeyboardEvent) => void): void {
    this.shortcuts.set(key.toLowerCase(), handler);
  }

  unregister(key: string): void {
    this.shortcuts.delete(key.toLowerCase());
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled) return;

    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.contentEditable === "true"
    ) {
      return;
    }

    const key = this.getKeyString(e);
    const handler = this.shortcuts.get(key);

    if (handler) {
      e.preventDefault();
      handler(e);
    }
  };

  private getKeyString(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push("ctrl");
    if (e.altKey) parts.push("alt");
    if (e.shiftKey) parts.push("shift");
    parts.push(e.key.toLowerCase());
    return parts.join("+");
  }

  start(): void {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  stop(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
}
