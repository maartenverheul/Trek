"use client";

import { useFeatures } from "../context/FeaturesContext";
import { EditMarkerForm } from "./EditMarkerForm";
import { useEffect, useMemo, useState } from "react";
import { useActiveMap } from "../context/ActiveMapContext";
import { getCategoriesAction, saveCategoryAction } from "@/app/actions";
import type { Category } from "@/lib/types";

export default function FeaturesPanel() {
  const { markers, isLoading, editingMarker, startEdit, stopEdit } = useFeatures();
  const { activeMap } = useActiveMap();
  const [categories, setCategories] = useState<Category[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState<string>("#8888ff");
  const [savingCat, setSavingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!activeMap) {
        setCategories([]);
        return;
      }
      try {
        const cats = await getCategoriesAction(activeMap.id);
        if (!cancelled) setCategories(cats);
      } catch {
        if (!cancelled) setCategories([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activeMap]);
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
        {!adding ? (
          <button
            type="button"
            className="w-full rounded border border-white/20 hover:border-white/60 px-2 py-2 text-left text-xs text-white/80"
            onClick={() => setAdding(true)}
          >
            + Add category
          </button>
        ) : (
          <form
            className="space-y-2 border border-white/20 rounded p-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!activeMap) return;
              if (!newTitle.trim()) {
                setCatError("Title is required");
                return;
              }
              setSavingCat(true);
              setCatError(null);
              try {
                const created = await saveCategoryAction({
                  title: newTitle.trim(),
                  color: newColor || undefined,
                  description: undefined,
                  userId: activeMap.userId,
                  mapId: activeMap.id,
                });
                setCategories((prev) => [created, ...prev]);
                setNewTitle("");
                setNewColor("#8888ff");
                setAdding(false);
              } catch (err: unknown) {
                setCatError(err instanceof Error ? err.message : "Failed to create category");
              } finally {
                setSavingCat(false);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-7 w-7 rounded border border-white/30 bg-transparent"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                aria-label="Category color"
                title="Category color"
              />
              <input
                type="text"
                className="flex-1 rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none text-xs"
                placeholder="Category title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            {catError && <div className="text-red-400 text-xs">{catError}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded px-3 py-1 bg-white/80 text-black hover:bg-white disabled:opacity-60 text-xs"
                disabled={!activeMap || savingCat}
              >
                Save
              </button>
              <button
                type="button"
                className="flex-1 rounded px-3 py-1 border border-white/40 hover:border-white/70 text-xs"
                onClick={() => {
                  setAdding(false);
                  setCatError(null);
                }}
                disabled={savingCat}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {isLoading && markers.length === 0 && categories.length === 0 && (
        <div className="text-sm text-white/70">Loading features…</div>
      )}

      {!isLoading && markers.length === 0 && categories.length === 0 && (
        <div className="text-sm text-white/70">No markers yet.</div>
      )}

      {categories.map((cat) => {
        const list = markersByCat.get(cat.id) ?? [];
        return (
          <div key={`cat-${cat.id}`}>
            <div className="text-xs text-white/70 font-semibold mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cat.color && (
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: cat.color }} />
                )}
                <span>{cat.title}</span>
              </div>
              <button
                type="button"
                className="text-white/70 hover:text-white px-1"
                title={`Options for ${cat.title}`}
                aria-label={`Options for ${cat.title}`}
              >
                ⋮
              </button>
            </div>
            {list.length > 0 && (
              <ul className="space-y-2">
                {list.map((m) => (
                  <li key={m.id}>
                    <button
                      className="w-full text-left rounded border px-2 py-2 border-white/20 hover:border-white/60"
                      onClick={() => startEdit(m.id)}
                      title={m.description ?? m.title}
                      aria-label={`Edit ${m.title}`}
                    >
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: m.categoryColor ?? '#ff3b3b' }} />
                        {m.title}
                      </div>
                      {m.description && (
                        <div className="text-xs text-white/70 line-clamp-2">{m.description}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {uncategorized.length > 0 && (
        <div key="uncategorized">
          <div className="text-xs text-white/70 font-semibold mb-1 flex items-center gap-2">
            <span>Uncategorized</span>
          </div>
          <ul className="space-y-2">
            {uncategorized.map((m) => (
              <li key={m.id}>
                <button
                  className="w-full text-left rounded border px-2 py-2 border-white/20 hover:border-white/60"
                  onClick={() => startEdit(m.id)}
                  title={m.description ?? m.title}
                  aria-label={`Edit ${m.title}`}
                >
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ background: m.categoryColor ?? '#ff3b3b' }} />
                    {m.title}
                  </div>
                  {m.description && (
                    <div className="text-xs text-white/70 line-clamp-2">{m.description}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}



