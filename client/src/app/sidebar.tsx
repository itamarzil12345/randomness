import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "pip:sidebarCollapsed";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => undefined,
});

const readStored = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const SidebarProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [collapsed, setCollapsed] = useState<boolean>(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggle: () => setCollapsed((c) => !c),
    }),
    [collapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = (): SidebarContextValue => useContext(SidebarContext);
