import { createTheme, type Theme } from "@mui/material/styles";

export type ColorMode = "light" | "dark";

const monoFamily =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const sansFamily =
  '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const lightPalette = {
  mode: "light" as const,
  primary: { main: "#4f46e5", dark: "#3730a3", light: "#818cf8" },
  secondary: { main: "#0891b2" },
  success: { main: "#059669" },
  warning: { main: "#d97706" },
  error: { main: "#dc2626" },
  background: {
    default: "#f1f5f9",
    paper: "#ffffff",
  },
  divider: "rgba(15, 23, 42, 0.08)",
  text: {
    primary: "#0f172a",
    secondary: "#475569",
  },
};

const darkPalette = {
  mode: "dark" as const,
  primary: { main: "#818cf8", dark: "#6366f1", light: "#a5b4fc" },
  secondary: { main: "#22d3ee" },
  success: { main: "#34d399" },
  warning: { main: "#fbbf24" },
  error: { main: "#f87171" },
  background: {
    default: "#0b1120",
    paper: "#111a2e",
  },
  divider: "rgba(148, 163, 184, 0.16)",
  text: {
    primary: "#e2e8f0",
    secondary: "#94a3b8",
  },
};

export const buildTheme = (mode: ColorMode): Theme => {
  const palette = mode === "light" ? lightPalette : darkPalette;
  const navBackground = mode === "light" ? "#ffffff" : "#070b18";
  const navTextColor = mode === "light" ? "#0f172a" : "#e2e8f0";
  const navBorderColor =
    mode === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(148, 163, 184, 0.12)";
  const sidebarBackground = mode === "light" ? "#ffffff" : "#0d1426";

  return createTheme({
    palette,
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: sansFamily,
      h1: {
        fontSize: "2rem",
        fontWeight: 800,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: "1.4rem",
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      overline: {
        fontFamily: monoFamily,
        letterSpacing: "0.16em",
        fontSize: "0.7rem",
        fontWeight: 600,
      },
      caption: {
        fontFamily: monoFamily,
        fontSize: "0.72rem",
        letterSpacing: "0.06em",
      },
      button: {
        fontWeight: 700,
        textTransform: "none",
        letterSpacing: 0,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage:
              mode === "dark"
                ? "radial-gradient(circle at 20% 0%, rgba(99, 102, 241, 0.10), transparent 40%), radial-gradient(circle at 80% 100%, rgba(34, 211, 238, 0.08), transparent 50%)"
                : "radial-gradient(circle at 20% 0%, rgba(79, 70, 229, 0.05), transparent 40%), radial-gradient(circle at 80% 100%, rgba(8, 145, 178, 0.05), transparent 50%)",
            backgroundAttachment: "fixed",
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: 40 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: navBackground,
            color: navTextColor,
            borderBottom: `1px solid ${navBorderColor}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: sidebarBackground,
            backgroundImage: "none",
            borderRight: `1px solid ${palette.divider}`,
          },
        },
      },
    },
  });
};
