import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Theme = "light" | "dark" | "lcars";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";

    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark" || saved === "lcars") {
      return saved;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.setAttribute("data-theme", theme);

    // body-Klasse setzen
    document.body.classList.remove("light", "dark", "lcars");
    document.body.classList.add(theme);

    localStorage.setItem("theme", theme);

    const themes = ["light", "dark", "lcars"];

    // Bestehende Stylesheets entfernen
    themes.forEach((t) => {
      const link = document.getElementById(`theme-${t}`);
      if (link) {
        link.remove();
      }
    });

    // Light-Theme ist bereits in base.css -> kein erneutes Laden
    if (theme !== "light") {
      const link = document.createElement("link");
      link.id = `theme-${theme}`;
      link.rel = "stylesheet";
      link.href = `/src/styles/${theme}.css`;

      // Stylesheet einfügen
      document.head.appendChild(link);
    }
  }, [theme]);

  const toggleTheme = () => {
    const order: Theme[] = ["light", "dark", "lcars"];
    setTheme((current) => {
      const idx = order.indexOf(current);
      return order[(idx + 1) % order.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
