import { CssBaseline, ThemeProvider } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildTheme, type ColorMode } from "../theme";

const STORAGE_KEY = "pip:colorMode";

type ColorModeContextValue = {
  mode: ColorMode;
  toggle: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "dark",
  toggle: () => undefined,
});

const readStoredMode = (): ColorMode => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") {
      return value;
    }
  } catch {
    // ignore
  }
  return "dark";
};

export const ColorModeProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [mode, setMode] = useState<ColorMode>(readStoredMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggle: () => setMode((current) => (current === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = (): ColorModeContextValue => useContext(ColorModeContext);
