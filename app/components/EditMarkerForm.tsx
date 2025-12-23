import { Visitation, NewMarker, Marker, Category } from "@/lib/types";
import { useState, useEffect } from "react";
import { useFeatures } from "../context/FeaturesContext";
import { useActiveMap } from "../context/ActiveMapContext";
import { getCategoriesAction } from "@/app/actions";
import VisitationEditor from "./VisitationEditor";

export function EditMarkerForm({ marker, onSaved, onCancel, onDeleted }: { marker: Marker; onSaved?: () => void; onCancel?: () => void; onDeleted?: () => void; }) {
  const { updateMarker, deleteMarker } = useFeatures();
  const { activeMap } = useActiveMap();
  const [title, setTitle] = useState<string>(marker.title);
  const [description, setDescription] = useState<string>(marker.description ?? "");
  const [country, setCountry] = useState<string>(marker.country ?? "");
  const [state, setState] = useState<string>(marker.state ?? "");
  const [postal, setPostal] = useState<string>(marker.postal ?? "");
  const [city, setCity] = useState<string>(marker.city ?? "");
  const [street, setStreet] = useState<string>(marker.street ?? "");
  const [houseNumber, setHouseNumber] = useState<string>(marker.houseNumber ?? "");
  const [notes, setNotes] = useState<string>(marker.notes ?? "");
  const [rating, setRating] = useState<number | undefined>(marker.rating);
  const [visitations, setVisitations] = useState<Visitation[]>(marker.visitations ?? []);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryValue, setCategoryValue] = useState<string>(marker.categoryId != null ? String(marker.categoryId) : "");

  useEffect(() => {
    setTitle(marker.title);
    setDescription(marker.description ?? "");
    setCountry(marker.country ?? "");
    setState(marker.state ?? "");
    setPostal(marker.postal ?? "");
    setCity(marker.city ?? "");
    setStreet(marker.street ?? "");
    setHouseNumber(marker.houseNumber ?? "");
    setNotes(marker.notes ?? "");
    setRating(marker.rating);
    setVisitations(marker.visitations ?? []);
    setCategoryValue(marker.categoryId != null ? String(marker.categoryId) : "");
  }, [marker.id]);

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
    return () => { cancelled = true; };
  }, [activeMap]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: NewMarker = {
        title,
        description: description.trim() ? description : undefined,
        lat: marker.lat,
        lng: marker.lng,
        mapId: marker.mapId,
        categoryId: categoryValue === "" ? undefined : Number(categoryValue),
        country: country || undefined,
        state: state || undefined,
        postal: postal || undefined,
        city: city || undefined,
        street: street || undefined,
        houseNumber: houseNumber || undefined,
        notes: notes ?? "",
        rating,
        visitations,
      };
      await updateMarker(marker.id, payload);
      onSaved?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save marker");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this marker?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteMarker(marker.id);
      onDeleted?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete marker");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-xs">
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
        <label className="text-xs mb-1 block text-white/80">Category</label>
        <select
          className="w-full rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none"
          value={categoryValue}
          onChange={(e) => setCategoryValue(e.target.value)}
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
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
      <div>
        <label className="text-xs mb-1 block text-white/80">Address</label>
        <div className="grid grid-cols-2 gap-2">
          <input className="rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          <input className="rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
          <input className="rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none" placeholder="Postal" value={postal} onChange={(e) => setPostal(e.target.value)} />
          <input className="rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input className="rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none" placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
          <input className="rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none" placeholder="House number" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs mb-1 block text-white/80">Notes</label>
        <textarea
          className="w-full rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none resize-y"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs mb-1 block text-white/80">Rating (1-10)</label>
        <input
          type="number"
          min={1}
          max={10}
          className="w-full rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none"
          value={rating ?? ''}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            setRating(v);
          }}
        />
      </div>
      <div>
        <label className="text-xs mb-1 block text-white/80">Visitations</label>
        <VisitationEditor visitations={visitations} onChange={setVisitations} />
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
          Cancel
        </button>
      </div>
      <div>
        <button
          type="button"
          className="w-full rounded px-3 py-1 border border-red-400 text-red-300 hover:bg-red-500/10"
          onClick={onDelete}
          disabled={saving}
        >
          Delete marker
        </button>
      </div>
    </form>
  );
}