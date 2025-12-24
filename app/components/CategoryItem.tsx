"use client";

import { useState } from "react";
import type { Category, Marker } from "@/lib/types";
import { useCategories } from "../context/CategoriesContext";
import { useFeatures } from "../context/FeaturesContext";
import { EyeIcon } from "lucide-react";
import CategoryForm from "./CategoryForm";

type Props = {
  cat: Category;
  markers: Marker[];
  startEdit: (id: number) => void;
  setFocus: (v: { lat: number; lng: number; zoom?: number }) => void;
  editable?: boolean;
};

export default function CategoryItem({ cat, markers, startEdit, setFocus, editable = true }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { updateCategory, deleteCategory } = useCategories();
  const { refreshMarkers } = useFeatures();

  async function handleSave(values: { title: string; color: string }) {
    const { title, color } = values;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateCategory(cat.id, {
        title: title.trim(),
        color: color || undefined,
      });
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    const ok = window.confirm(`Delete ${cat.title}? Markers will become uncategorized.`);
    if (!ok) return;
    await deleteCategory(cat.id);
    // ensure markers are removed from the map/UI
    refreshMarkers();
    setEditing(false);
    alert('Category and all its markers have been deleted.');
  }

  return (
    <div>
      {editing && editable ? (
        <div className="mb-1">
          <CategoryForm
            initialTitle={cat.title}
            initialColor={cat.color ?? "#8888ff"}
            saving={saving}
            error={error}
            onSubmit={(values) => void handleSave(values)}
            onCancel={() => {
              setEditing(false);
              setError(null);
            }}
            submitLabel="Save"
          />
        </div>
      ) : (
        <div className="text-xs text-white/70 font-semibold mb-2 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            {cat.color && (
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: cat.color }} />
            )}
            <span>{cat.title}</span>
          </div>
          {editable && (
            <>
              <button
                type="button"
                className="text-white/70 hover:text-white px-1"
                title={`Options for ${cat.title}`}
                aria-label={`Options for ${cat.title}`}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                ⋮
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded border border-white/20 bg-black shadow-lg shadow-white/10 z-10">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-white/90"
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300 hover:text-red-200"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {markers.length > 0 && (
        <ul className="space-y-2">
          {markers.map((m) => (
            <li key={m.id}>
              <div
                className="w-full rounded border  px-1 py-1 border-white/20 hover:border-white/60 cursor-pointer group"
                onClick={() => startEdit(m.id)}
                title={m.description ?? m.title}
                aria-label={`Edit ${m.title}`}
              >
                <div className="flex items-start">
                  <div className="flex-1 flex flex-row gap-1 items-start min-w-0">
                    <div className="p-0.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: cat.color }} />
                    </div>
                    <div className="text-xs flex-col font-medium text-white gap-2">
                      <span className="truncate">{m.title}</span>
                      {m.description && (
                        <div className="text-xs text-white/70 line-clamp-2">{m.description}</div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 text-white/80 hover:text-white shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title={`View ${m.title}`}
                    aria-label={`View ${m.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocus({ lat: m.lat, lng: m.lng, zoom: 16 });
                    }}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
