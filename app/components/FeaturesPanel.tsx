"use client";

import { useFeatures } from "../context/FeaturesContext";
import { EditMarkerForm } from "./EditMarkerForm";

type FeaturesPanelProps = {
  onClose?: () => void;
};

export default function FeaturesPanel({ onClose }: FeaturesPanelProps) {
  const { markers, isLoading, editingMarker, startEdit, stopEdit } = useFeatures();

  if (isLoading && markers.length === 0) {
    return <div className="text-sm text-white/70">Loading features…</div>;
  }

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

  if (markers.length === 0) {
    return <div className="text-sm text-white/70">No markers yet.</div>;
  }

  // Group markers by categoryId, with undefined/null under "Uncategorized"
  const grouped = new Map<string, { title: string; color?: string; items: typeof markers }>();
  for (const m of markers) {
    const key = m.categoryId != null ? String(m.categoryId) : "uncategorized";
    const existing = grouped.get(key);
    if (existing) {
      existing.items.push(m);
      // Prefer the first non-undefined color
      if (!existing.color && m.categoryColor) existing.color = m.categoryColor;
    } else {
      grouped.set(key, {
        title: m.categoryId != null ? "Category" : "Uncategorized",
        color: m.categoryColor,
        items: [m],
      });
    }
  }

  const groups = Array.from(grouped.entries()).map(([key, g]) => ({ key, ...g }));
  // Ensure "Uncategorized" appears last for readability
  groups.sort((a, b) => (a.key === "uncategorized" ? 1 : b.key === "uncategorized" ? -1 : 0));

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="text-xs text-white/70 font-semibold mb-1 flex items-center gap-2">
            {group.color && (
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: group.color }} />
            )}
            {group.title}
          </div>
          <ul className="space-y-2">
            {group.items.map((m) => (
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
      ))}
    </div>
  );
}



