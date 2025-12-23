"use client";

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import type { Marker, NewMarker } from "@/lib/types";
import { getMarkersAction, saveMarkerAction, deleteMarkerAction, updateMarkerAction } from "@/app/actions";
import { useActiveMap } from "@/app/context/ActiveMapContext";

type FeaturesContextValue = {
  markers: Marker[];
  isLoading: boolean;
  refreshMarkers: () => void;
  createMarker: (m: NewMarker) => Promise<Marker>;
  updateMarker: (id: number, m: NewMarker) => Promise<Marker>;
  deleteMarker: (id: number) => Promise<void>;
  editingMarkerId: number | null;
  editingMarker: Marker | null;
  startEdit: (id: number) => void;
  stopEdit: () => void;
};

const FeaturesContext = createContext<FeaturesContextValue | undefined>(undefined);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [fetchedMarkers, setFetchedMarkers] = useState<Marker[]>([]);
  const [isPending, startTransition] = useTransition();
  const { activeMap } = useActiveMap();
  const [editingMarkerId, setEditingMarkerId] = useState<number | null>(null);

  useEffect(() => {
    if (!activeMap) return;
    startTransition(() => {
      getMarkersAction(activeMap.id)
        .then((data) => setFetchedMarkers(data))
        .catch(() => setFetchedMarkers([]));
    });
  }, [activeMap]);

  async function createMarker(m: NewMarker) {
    const created = await saveMarkerAction(m);
    setFetchedMarkers((prev) => [created, ...prev]);
    return created;
  };

  async function updateMarker(id: number, m: NewMarker) {
    const updated = await updateMarkerAction(id, m);
    setFetchedMarkers((prev) => prev.map((mk) => (mk.id === id ? updated : mk)));
    return updated;
  };

  async function deleteMarker(id: number) {
    await deleteMarkerAction(id);
    setFetchedMarkers((prev) => prev.filter((mk) => mk.id !== id));
  };

  const value: FeaturesContextValue = useMemo(() => {
    const markers = activeMap ? fetchedMarkers : [];
    return {
      markers,
      isLoading: isPending,
      refreshMarkers: () => {
        if (!activeMap) return;
        startTransition(() => {
          getMarkersAction(activeMap.id)
            .then((data) => setFetchedMarkers(data))
            .catch(() => setFetchedMarkers([]));
        });
      },
      createMarker,
      updateMarker,
      deleteMarker,
      editingMarkerId,
      editingMarker: editingMarkerId != null ? (markers.find(m => m.id === editingMarkerId) ?? null) : null,
      startEdit: (id: number) => setEditingMarkerId(id),
      stopEdit: () => setEditingMarkerId(null),
    };
  }, [fetchedMarkers, isPending, activeMap, editingMarkerId]);

  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>;
}

export function useFeatures() {
  const ctx = useContext(FeaturesContext);
  if (!ctx) throw new Error("useFeatures must be used within FeaturesProvider");
  return ctx;
}
