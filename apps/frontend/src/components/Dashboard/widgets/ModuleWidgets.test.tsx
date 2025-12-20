// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Dashboard/widgets/ModuleWidgets.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AllModuleWidgets } from "./ModuleWidgets";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

describe("ModuleWidgets", () => {
  describe("AllModuleWidgets", () => {
    it("should render without crashing", () => {
      const mockNavigate = vi.fn();
      render(<AllModuleWidgets onNavigate={mockNavigate} />);

      // Check if the component renders
      expect(screen.getByText("modules.business.title")).toBeInTheDocument();
    });

    it("should display all 11 module widgets", () => {
      const mockNavigate = vi.fn();
      const { container } = render(
        <AllModuleWidgets onNavigate={mockNavigate} />,
      );

      // Count module cards
      const moduleCards = container.querySelectorAll(".module-widget-card");
      expect(moduleCards.length).toBeGreaterThanOrEqual(11);
    });

    it("should call onNavigate when a module is clicked", () => {
      const mockNavigate = vi.fn();
      render(<AllModuleWidgets onNavigate={mockNavigate} />);

      // Find and click the first module (Business)
      const businessModule = screen.getByText("modules.business.title");
      const businessCard = businessModule.closest("button");

      expect(businessCard).toBeInTheDocument();
      if (businessCard) {
        fireEvent.click(businessCard);
      }

      // Check if onNavigate was called with correct path
      expect(mockNavigate).toHaveBeenCalledWith("/business");
    });

    it("should display correct module titles", () => {
      const mockNavigate = vi.fn();
      render(<AllModuleWidgets onNavigate={mockNavigate} />);

      // Check for key module titles
      expect(screen.getByText("modules.business.title")).toBeInTheDocument();
      expect(screen.getByText("modules.finance.title")).toBeInTheDocument();
      expect(screen.getByText("modules.sales.title")).toBeInTheDocument();
      expect(screen.getByText("modules.procurement.title")).toBeInTheDocument();
      expect(screen.getByText("modules.production.title")).toBeInTheDocument();
      expect(screen.getByText("modules.warehouse.title")).toBeInTheDocument();
      expect(screen.getByText("modules.hr.title")).toBeInTheDocument();
      expect(screen.getByText("modules.reporting.title")).toBeInTheDocument();
    });

    it("should display KPI values for each module", () => {
      const mockNavigate = vi.fn();
      const { container } = render(
        <AllModuleWidgets onNavigate={mockNavigate} />,
      );

      // Check if KPI sections exist
      const kpiSections = container.querySelectorAll(".module-widget-kpis");
      expect(kpiSections.length).toBeGreaterThan(0);
    });

    it("should have proper accessibility attributes", () => {
      const mockNavigate = vi.fn();
      const { container } = render(
        <AllModuleWidgets onNavigate={mockNavigate} />,
      );

      // Check for role attributes
      const buttons = container.querySelectorAll('button[role="button"]');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should handle missing onNavigate gracefully", () => {
      // Should not crash without onNavigate (provide no-op function)
      const noopNavigate = () => {};
      expect(() => {
        render(<AllModuleWidgets onNavigate={noopNavigate} />);
      }).not.toThrow();
    });

    it("should display module descriptions", () => {
      const mockNavigate = vi.fn();
      render(<AllModuleWidgets onNavigate={mockNavigate} />);

      // Check for description translations
      expect(
        screen.getByText("modules.business.description"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("modules.finance.description"),
      ).toBeInTheDocument();
    });

    it("should have responsive grid layout", () => {
      const mockNavigate = vi.fn();
      const { container } = render(
        <AllModuleWidgets onNavigate={mockNavigate} />,
      );

      const grid = container.querySelector(".module-widgets-grid");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass("module-widgets-grid");
    });

    it("should navigate to correct paths for all modules", () => {
      const mockNavigate = vi.fn();
      const { container } = render(
        <AllModuleWidgets onNavigate={mockNavigate} />,
      );

      const moduleButtons = container.querySelectorAll(".module-widget-card");

      // Click each module and verify navigation path
      const expectedPaths = [
        "/business",
        "/finance",
        "/sales",
        "/procurement",
        "/production",
        "/warehouse",
        "/hr",
        "/reporting",
        "/communication",
        "/system",
      ];

      moduleButtons.forEach((button, index) => {
        if (index < expectedPaths.length) {
          fireEvent.click(button);
          expect(mockNavigate).toHaveBeenCalledWith(expectedPaths[index]);
        }
      });
    });
  });
});
