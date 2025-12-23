import { knex } from "./knex";
import type { Category, NewCategory } from "./types";

type CategoryRow = {
  id: number;
  title: string;
  description: string | null;
  color: string | null;
  user_id: number;
};

export async function getCategories(): Promise<Category[]> {
  const rows = await knex("categories")
    .select("id", "title", "description", "color", "user_id")
    .orderBy("created_at", "desc");
  const typed = rows as unknown as CategoryRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
  }));
}

export async function getCategoriesByUser(userId: string): Promise<Category[]> {
  const rows = await knex("categories")
    .where({ user_id: userId })
    .select("id", "title", "description", "color", "user_id")
    .orderBy("created_at", "desc");
  const typed = rows as unknown as CategoryRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
  }));
}

export async function saveCategory(c: NewCategory): Promise<Category> {
  const inserted = await knex("categories")
    .insert({
      title: c.title,
      description: c.description ?? null,
      color: c.color ?? null,
      user_id: c.userId,
    })
    .returning(["id", "title", "description", "color", "user_id"]);
  const r = (inserted as unknown as CategoryRow[])[0];
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
  };
}

export async function deleteCategory(id: number): Promise<void> {
  await knex("categories").where({ id }).delete();
}
