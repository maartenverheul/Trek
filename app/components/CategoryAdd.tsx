"use client";

import { useState } from "react";
import { useActiveMap } from "../context/ActiveMapContext";
import { useCategories } from "../context/CategoriesContext";
import CategoryForm from "./CategoryForm";

export default function CategoryAdd() {
  const { activeMap } = useActiveMap();
  const { createCategory } = useCategories();
  const [adding, setAdding] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [seedColor, setSeedColor] = useState<string>("#8888ff");

  function randomHexColor() {
    const n = Math.floor(Math.random() * 0xffffff);
    return `#${n.toString(16).padStart(6, '0')}`;
  }

  if (!adding) {
    return (
      <button
        type="button"
        className="w-full rounded border border-white/20 hover:border-white/60 px-2 py-2 text-left text-xs text-white/80"
        onClick={() => {
          setSeedColor(randomHexColor());
          setAdding(true);
        }}
      >
        + Add category
      </button>
    );
  }

  return (
    <CategoryForm
      initialTitle=""
      initialColor={seedColor}
      saving={savingCat || !activeMap}
      error={catError}
      onSubmit={async ({ title, color }) => {
        if (!activeMap) return;
        if (!title.trim()) {
          setCatError("Title is required");
          return;
        }
        setSavingCat(true);
        setCatError(null);
        try {
          await createCategory({
            title,
            color: color || undefined,
            description: undefined,
            userId: activeMap.userId,
            mapId: activeMap.id,
          });
          setAdding(false);
        } catch (err: unknown) {
          setCatError(err instanceof Error ? err.message : "Failed to create category");
        } finally {
          setSavingCat(false);
        }
      }}
      onCancel={() => {
        setAdding(false);
        setCatError(null);
      }}
      submitLabel="Save"
    />
  );
}
