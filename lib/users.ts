import { knex } from "./knex";
import type { User, NewUser } from "./types";

type UserRow = {
  id: number;
  name: string;
  email: string;
};

export async function getUsers(): Promise<User[]> {
  const rows = await knex("users")
    .select("id", "name", "email")
    .orderBy("created_at", "desc");
  const typed = rows as unknown as UserRow[];
  return typed.map((r) => ({ id: r.id, name: r.name, email: r.email }));
}

export async function saveUser(u: NewUser): Promise<User> {
  const inserted = await knex("users")
    .insert({ name: u.name, email: u.email })
    .returning(["id", "name", "email"]);
  const r = (inserted as unknown as UserRow[])[0];
  return { id: r.id, name: r.name, email: r.email };
}

export async function deleteUser(id: number): Promise<void> {
  await knex("users").where({ id }).delete();
}
