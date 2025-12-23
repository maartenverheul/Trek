import { useState, useEffect } from "react";
import { updateMapAction, deleteMapAction } from "../actions";
import { Map } from "@/lib/types";

export default function EditMapForm({ map, onSaved, onCancel, onDeleted }: { map: Map; onSaved?: (m: Map) => void; onCancel?: () => void; onDeleted?: () => void; }) {
  const [title, setTitle] = useState<string>(map.title);
  const [description, setDescription] = useState<string>(map.description ?? "");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(map.title);
    setDescription(map.description ?? "");
  }, [map.id, map.title, map.description]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMapAction(map.id, { title, description: description.trim() ? description : undefined });
      onSaved?.(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save map");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this map?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteMapAction(map.id);
      onDeleted?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete map");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs mb-1 block text-white/80">Title</label>
        <input
          type="text"
          className="w-full rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-xs mb-1 block text-white/80">Description</label>
        <textarea
          className="w-full rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded px-3 py-1 bg-white/80 text-black hover:bg-white disabled:opacity-60"
          disabled={saving}
        >
          Save
        </button>
        <button
          type="button"
          className="flex-1 rounded px-3 py-1 border border-white/40 hover:border-white/70"
          onClick={onCancel}
          disabled={saving}
        >
          Discard
        </button>
      </div>
      <div>
        <button
          type="button"
          className="w-full rounded px-3 py-1 border border-red-400 text-red-300 hover:bg-red-500/10"
          onClick={onDelete}
          disabled={saving}
        >
          Delete map
        </button>
      </div>
    </form>
  );
}
