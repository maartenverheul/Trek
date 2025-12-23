import { knex } from "./knex";
import type { Map, NewMap } from "./types";

type MapRow = {
  id: number;
  title: string;
  description: string | null;
  user_id: number;
};

export async function getMaps(): Promise<Map[]> {
  const rows = await knex("maps")
    .select("id", "title", "description", "user_id")
    .orderBy("created_at", "desc");
  const typed = rows as unknown as MapRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    userId: r.user_id,
  }));
}

export async function getMapsByUser(userId: string): Promise<Map[]> {
  const rows = await knex("maps")
    .where({ user_id: userId })
    .select("id", "title", "description", "user_id")
    .orderBy("created_at", "desc");
  const typed = rows as unknown as MapRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    userId: r.user_id,
  }));
}

export async function saveMap(m: NewMap): Promise<Map> {
  const inserted = await knex("maps")
    .insert({
      title: m.title,
      description: m.description ?? null,
      user_id: m.userId,
    })
    .returning(["id", "title", "description", "user_id"]);
  const r = (inserted as unknown as MapRow[])[0];
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    userId: r.user_id,
  };
}

export async function deleteMap(id: number): Promise<void> {
  await knex("maps").where({ id }).delete();
}
