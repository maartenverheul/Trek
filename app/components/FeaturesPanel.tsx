"use client";

import { useFeatures } from "../context/FeaturesContext";
import { EditMarkerForm } from "./EditMarkerForm";
import { useMemo } from "react";
import { useActiveMap } from "../context/ActiveMapContext";
// no local Category state used here
import CategoryAdd from "./CategoryAdd";
import CategoryItem from "./CategoryItem";
import { useMapViewport } from "../context/MapViewportContext";
import { useCategories } from "../context/CategoriesContext";

export default function FeaturesPanel() {
  const { markers, isLoading, editingMarker, startEdit, stopEdit } = useFeatures();
  const { activeMap } = useActiveMap();
  const { setFocus } = useMapViewport();
  const { categories } = useCategories();
  // category editing state handled within CategoryItem
  // Precompute markers by category id
  const markersByCat = useMemo(() => {
    const map = new Map<number, typeof markers>();
    for (const m of markers) {
      if (m.categoryId == null) continue;
      const arr = map.get(m.categoryId) ?? [];
      arr.push(m);
      map.set(m.categoryId, arr);
    }
    return map;
  }, [markers]);

  const uncategorized = useMemo(() => markers.filter((m) => m.categoryId == null), [markers]);

  if (editingMarker) {
    return (
      <EditMarkerForm
        marker={editingMarker}
        onCancel={() => stopEdit()}
        onSaved={() => stopEdit()}
        onDeleted={() => stopEdit()}
      />
    );
  }


  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <CategoryAdd />
      </div>

      {isLoading && markers.length === 0 && categories.length === 0 && (
        <div className="text-sm text-white/70">Loading features…</div>
      )}

      {!isLoading && markers.length === 0 && categories.length === 0 && (
        <div className="text-sm text-white/70">No markers yet.</div>
      )}

      {categories.map((cat) => (
        <div key={`cat-${cat.id}`}>
          <CategoryItem
            cat={cat}
            markers={markersByCat.get(cat.id) ?? []}
            startEdit={startEdit}
            setFocus={setFocus}
          />
        </div>
      ))}

      {uncategorized.length > 0 && (
        <CategoryItem
          cat={{
            id: -1,
            title: 'Uncategorized',
            color: '#888',
            userId: activeMap?.userId ?? 0,
            mapId: activeMap?.id ?? 0,
          }}
          markers={uncategorized}
          startEdit={startEdit}
          setFocus={setFocus}
          editable={false}
        />
      )}
    </div>
  );
}



