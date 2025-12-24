"use client";

import { createContext, useContext, useEffect, useMemo, useTransition, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Category, NewCategory } from "@/lib/types";
import { getCategoriesAction, saveCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/actions";
import { useActiveMap } from "./ActiveMapContext";

type CategoriesContextValue = {
  categories: Category[];
  isLoadingCategories: boolean;
  refreshCategories: () => void;
  createCategory: (c: NewCategory) => Promise<Category>;
  updateCategory: (id: number, c: Partial<Pick<NewCategory, 'title' | 'description' | 'color'>>) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
};

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { activeMap } = useActiveMap();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchCategories = useCallback(() => {
    if (!activeMap) return;
    startTransition(() => {
      getCategoriesAction(activeMap.id)
        .then((cats) => setCategories(cats))
        .catch(() => setCategories([]));
    });
  }, [activeMap]);

  useEffect(() => {
    if (!activeMap) {
      const t = window.setTimeout(() => setCategories([]), 0);
      return () => window.clearTimeout(t);
    }
    fetchCategories();
  }, [activeMap, fetchCategories]);

  async function createCategory(c: NewCategory) {
    const created = await saveCategoryAction(c);
    setCategories((prev) => [created, ...prev]);
    return created;
  }

  async function updateCategory(id: number, c: Partial<Pick<NewCategory, 'title' | 'description' | 'color'>>) {
    const updated = await updateCategoryAction(id, c);
    setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
    return updated;
  }

  async function deleteCategory(id: number) {
    await deleteCategoryAction(id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  }

  const value: CategoriesContextValue = useMemo(() => ({
    categories,
    isLoadingCategories: isPending,
    refreshCategories: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }), [categories, isPending, fetchCategories]);

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}
