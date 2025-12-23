import { knex } from "./knex";
import type { Marker, NewMarker } from "./types";

type MarkerRow = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description: string | null;
  color: string | null;
};

export async function getMarkers(): Promise<Marker[]> {
  const rows = await knex('markers')
    .select(
      knex.raw('id::text as id'),
      'title',
      knex.raw('ST_Y(geom) AS lat'),
      knex.raw('ST_X(geom) AS lng'),
      'description',
      'color'
    )
    .orderBy('created_at', 'desc');
  const typed = rows as unknown as MarkerRow[];
  return typed.map(r => ({
    id: r.id,
    title: r.title,
    lat: Number(r.lat),
    lng: Number(r.lng),
    description: r.description ?? undefined,
    color: r.color ?? undefined,
  }));
}

// Types come from lib/types to avoid client bundling server-only code

export async function saveMarker(m: NewMarker): Promise<Marker> {
  const inserted = await knex('markers')
    .insert({
      title: m.title,
      description: m.description ?? null,
      color: m.color ?? null,
      geom: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [m.lng, m.lat]),
    })
    .returning([
      knex.raw('id::text as id'),
      'title',
      knex.raw('ST_Y(geom) AS lat'),
      knex.raw('ST_X(geom) AS lng'),
      'description',
      'color',
    ]);
  const r = (inserted as unknown as MarkerRow[])[0];
  return {
    id: r.id,
    title: r.title,
    lat: Number(r.lat),
    lng: Number(r.lng),
    description: r.description ?? undefined,
    color: r.color ?? undefined,
  };
}

export async function deleteMarker(id: string): Promise<void> {
  await knex('markers').where({ id }).delete();
}
