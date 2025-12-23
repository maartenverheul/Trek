"use client";

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import type { Marker, NewMarker } from "@/lib/types";
import { getMarkersAction, saveMarkerAction, deleteMarkerAction, updateMarkerAction } from "@/app/actions/markers";

type FeaturesContextValue = {
  markers: Marker[];
  isLoading: boolean;
  refreshMarkers: () => void;
  createMarker: (m: NewMarker) => Promise<Marker>;
  updateMarker: (id: number, m: NewMarker) => Promise<Marker>;
  deleteMarker: (id: number) => Promise<void>;
};

const FeaturesContext = createContext<FeaturesContextValue | undefined>(undefined);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(() => {
      getMarkersAction()
        .then((data) => setMarkers(data))
        .catch(() => setMarkers([]));
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMarker = async (m: NewMarker) => {
    const created = await saveMarkerAction(m);
    setMarkers((prev) => [created, ...prev]);
    return created;
  };

  const updateMarker = async (id: number, m: NewMarker) => {
    const updated = await updateMarkerAction(id, m);
    setMarkers((prev) => prev.map((mk) => (mk.id === id ? updated : mk)));
    return updated;
  };

  const deleteMarker = async (id: number) => {
    await deleteMarkerAction(id);
    setMarkers((prev) => prev.filter((mk) => mk.id !== id));
  };

  const value: FeaturesContextValue = useMemo(
    () => ({
      markers,
      isLoading: isPending,
      refreshMarkers: load,
      createMarker,
      updateMarker,
      deleteMarker,
    }),
    [markers, isPending]
  );

  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>;
}

export function useFeatures() {
  const ctx = useContext(FeaturesContext);
  if (!ctx) throw new Error("useFeatures must be used within FeaturesProvider");
  return ctx;
}
