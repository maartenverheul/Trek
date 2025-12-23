"use client";

import { createContext, useContext, useMemo } from "react";
import useLocalStorageState from "use-local-storage-state";
import type { Map } from "@/lib/types";

type ActiveMapValue = {
  activeMap: Map | null;
  setActiveMap: (m: Map | null) => void;
};

const ActiveMapContext = createContext<ActiveMapValue | undefined>(undefined);

export function ActiveMapProvider({ children }: { children: React.ReactNode }) {
  const [activeMap, setActiveMap] = useLocalStorageState<Map | null>("activeMap", {
    defaultValue: null,
  });

  const value = useMemo(() => ({ activeMap, setActiveMap }), [activeMap, setActiveMap]);
  return <ActiveMapContext.Provider value={value}>{children}</ActiveMapContext.Provider>;
}

export function useActiveMap() {
  const ctx = useContext(ActiveMapContext);
  if (!ctx) throw new Error("useActiveMap must be used within ActiveMapProvider");
  return ctx;
}
