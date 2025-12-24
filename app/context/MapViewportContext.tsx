"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type ViewportBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type MapViewportValue = {
  bounds: ViewportBounds | null;
  setBounds: (b: ViewportBounds | null) => void;
  focus: { lat: number; lng: number; zoom?: number } | null;
  setFocus: (f: { lat: number; lng: number; zoom?: number } | null) => void;
};

const MapViewportContext = createContext<MapViewportValue | undefined>(undefined);

export function MapViewportProvider({ children }: { children: React.ReactNode }) {
  const [bounds, setBounds] = useState<ViewportBounds | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const value = useMemo(() => ({ bounds, setBounds, focus, setFocus }), [bounds, focus]);
  return <MapViewportContext.Provider value={value}>{children}</MapViewportContext.Provider>;
}

export function useMapViewport() {
  const ctx = useContext(MapViewportContext);
  if (!ctx) throw new Error("useMapViewport must be used within MapViewportProvider");
  return ctx;
}
