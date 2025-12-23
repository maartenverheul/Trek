"use client";

import { useEffect, useState } from "react";
import type { Map } from "../../lib/types";
import { getMapsAction, deleteMapAction, updateMapAction, saveMapAction } from "../actions";
import { useActiveMap } from "../context/ActiveMapContext";
import { MoreVerticalIcon } from "lucide-react";
import EditMapForm from "./EditMapForm";

type Props = {
  onSelected?: (m: Map) => void;
};

export default function MapSelector({ onSelected }: Props) {
  const [maps, setMaps] = useState<Map[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingMap, setEditingMap] = useState<Map | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const { activeMap, setActiveMap } = useActiveMap();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const maps = await getMapsAction();
        if (!cancelled) setMaps(maps);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load maps");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !maps) {
    return <div className="text-sm text-white/70">Loading maps…</div>;
  }
  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }
  if (!maps || maps.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-white/70">No maps found.</div>
        <button
          className="text-xs px-2 py-1 border border-white/30 rounded hover:border-white/60"
          onClick={async () => {
            setLoading(true);
            try {
              const userId = 1; // fallback demo user
              const created = await saveMapAction({ title: "New Map", description: undefined, userId });
              const ms = await getMapsAction();
              setMaps(ms);
              setActiveMap(created);
              onSelected?.(created);
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : "Failed to create map");
            } finally {
              setLoading(false);
            }
          }}
        >
          New map
        </button>
      </div>
    );
  }

  if (editingMap) {
    return (
      <EditMapForm
        map={editingMap}
        onCancel={() => setEditingMap(null)}
        onSaved={(updated) => {
          setMaps((prev) => prev?.map((mm) => (mm.id === updated.id ? updated : mm)) ?? null);
          if (activeMap?.id === updated.id) setActiveMap(updated);
          setEditingMap(null);
        }}
        onDeleted={() => {
          setEditingMap(null);
          // Refresh list after delete
          setLoading(true);
          getMapsAction().then((ms) => setMaps(ms)).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false));
          if (activeMap?.id === editingMap.id) setActiveMap(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/80">Your maps</div>
        <button
          className="text-xs px-2 py-1 border border-white/30 rounded hover:border-white/60"
          title="Create a new map"
          aria-label="New map"
          onClick={async () => {
            setLoading(true);
            try {
              const userId = activeMap?.userId ?? (maps?.[0]?.userId ?? 1);
              const created = await saveMapAction({ title: "New Map", description: undefined, userId });
              const ms = await getMapsAction();
              setMaps(ms);
              setActiveMap(created);
              onSelected?.(created);
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : "Failed to create map");
            } finally {
              setLoading(false);
            }
          }}
        >
          New map
        </button>
      </div>
      <ul className="space-y-2">
        {maps.map((m) => (
          <li key={m.id} className="relative">
            <div className={`w-full rounded border ${activeMap?.id === m.id ? 'border-white/70 bg-white/5' : 'border-white/20 hover:border-white/60'}`}>
              <button
                className="w-full text-left px-2 py-2"
                onClick={() => { setActiveMap(m); onSelected?.(m); }}
                title={m.description ?? m.title}
                aria-label={m.title}
              >
                <div className="text-sm font-medium text-white pr-8">{m.title}</div>
                {m.description && (
                  <div className="text-xs text-white/70 line-clamp-2 pr-8">{m.description}</div>
                )}
              </button>
              <div className="absolute top-1.5 right-1.5">
                <button
                  aria-label={`More for ${m.title}`}
                  title="Options"
                  className="p-1 rounded hover:bg-white/10"
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId((id) => id === m.id ? null : m.id); }}
                >
                  <MoreVerticalIcon className="w-4 h-4" />
                </button>
                {openMenuId === m.id && (
                  <div className="absolute right-0 mt-1 w-28 bg-black/90 border border-white/20 rounded shadow-lg z-10">
                    <button
                      className="block w-full text-left text-xs px-3 py-2 hover:bg-white/10"
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setEditingMap(m); }}
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full text-left text-xs px-3 py-2 text-red-300 hover:bg-red-500/10"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        if (!confirm('Delete this map?')) return;
                        try {
                          setLoading(true);
                          await deleteMapAction(m.id);
                          const ms = await getMapsAction();
                          setMaps(ms);
                          if (activeMap?.id === m.id) setActiveMap(null);
                        } catch (e: unknown) {
                          setError(e instanceof Error ? e.message : 'Failed to delete map');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

