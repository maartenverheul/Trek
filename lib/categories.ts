import { knex } from "./knex";
import type { Category, NewCategory } from "./types";

type CategoryRow = {
  id: number;
  title: string;
  description: string | null;
  color: string | null;
  // from maps join
  user_id: number;
  map_id: number;
};

export async function getCategories(): Promise<Category[]> {
  const rows = await knex("categories")
    .leftJoin("maps", "categories.map_id", "maps.id")
    .select(
      "categories.id",
      "categories.title",
      "categories.description",
      "categories.color",
      "categories.map_id",
      knex.ref("maps.user_id").as("user_id")
    )
    .orderBy("categories.created_at", "desc");
  const typed = rows as unknown as CategoryRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
    mapId: r.map_id,
  }));
}

export async function getCategoriesByUser(userId: string): Promise<Category[]> {
  const rows = await knex("categories")
    .leftJoin("maps", "categories.map_id", "maps.id")
    .where("maps.user_id", userId)
    .select(
      "categories.id",
      "categories.title",
      "categories.description",
      "categories.color",
      "categories.map_id",
      knex.ref("maps.user_id").as("user_id")
    )
    .orderBy("categories.created_at", "desc");
  const typed = rows as unknown as CategoryRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
    mapId: r.map_id,
  }));
}

export async function getCategoriesByMap(mapId: number): Promise<Category[]> {
  const rows = await knex("categories")
    .leftJoin("maps", "categories.map_id", "maps.id")
    .where("categories.map_id", mapId)
    .select(
      "categories.id",
      "categories.title",
      "categories.description",
      "categories.color",
      "categories.map_id",
      knex.ref("maps.user_id").as("user_id")
    )
    .orderBy("categories.created_at", "desc");
  const typed = rows as unknown as CategoryRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
    mapId: r.map_id,
  }));
}

export async function saveCategory(c: NewCategory): Promise<Category> {
  const inserted = await knex("categories")
    .insert({
      title: c.title,
      description: c.description ?? null,
      color: c.color ?? null,
      map_id: c.mapId,
    })
    .returning(["id", "title", "description", "color", "map_id"]);
  const rBasic = (inserted as unknown as Omit<CategoryRow, "user_id">[])[0];
  const mapRow = await knex("maps").select("user_id").where({ id: rBasic.map_id }).first();
  const user_id = (mapRow as { user_id: number } | undefined)?.user_id ?? 0;
  const r = { ...rBasic, user_id } as CategoryRow;
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
    mapId: r.map_id,
  };
}

export async function updateCategory(
  id: number,
  c: Partial<Pick<NewCategory, 'title' | 'description' | 'color'>>
): Promise<Category> {
  const updateFields: Record<string, unknown> = {
    updated_at: knex.fn.now(),
  };
  if (c.title !== undefined) updateFields.title = c.title;
  if (c.description !== undefined) updateFields.description = c.description ?? null;
  if (c.color !== undefined) updateFields.color = c.color ?? null;

  const updated = await knex('categories')
    .where({ id })
    .update(updateFields)
    .returning(['id', 'title', 'description', 'color', 'map_id']);
  const rBasic = (updated as unknown as Omit<CategoryRow, 'user_id'>[])[0];
  const mapRow = await knex('maps').select('user_id').where({ id: rBasic.map_id }).first();
  const user_id = (mapRow as { user_id: number } | undefined)?.user_id ?? 0;
  const r = { ...rBasic, user_id } as CategoryRow;
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    color: r.color ?? undefined,
    userId: r.user_id,
    mapId: r.map_id,
  };
}

export async function deleteCategory(id: number): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx("markers").where({ category_id: id }).delete();
    await trx("categories").where({ id }).delete();
  });
}
