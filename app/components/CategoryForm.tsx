"use client";

import { useState } from "react";

type Props = {
  initialTitle: string;
  initialColor: string;
  saving?: boolean;
  error?: string | null;
  onSubmit: (values: { title: string; color: string }) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
};

export default function CategoryForm({
  initialTitle,
  initialColor,
  saving = false,
  error,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState(initialColor);

  return (
    <form
      className="space-y-2 border border-white/20 rounded p-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        void onSubmit({ title: title.trim(), color });
      }}
    >
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="h-7 w-7 rounded border border-white/30 bg-transparent"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="Category color"
          title="Category color"
        />
        <input
          type="text"
          className="flex-1 rounded px-2 py-1 bg-black/40 border border-white/20 focus:border-white/60 outline-none text-xs"
          placeholder="Category title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-400 text-xs">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded px-3 py-1 bg-white/80 text-black hover:bg-white disabled:opacity-60 text-xs"
          disabled={saving}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          className="flex-1 rounded px-3 py-1 border border-white/40 hover:border-white/70 text-xs"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
