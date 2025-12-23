import { knex } from "./knex";
import type { Marker, NewMarker } from "./types";

type MarkerRow = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  description: string | null;
  color: string | null;
};

// Round to 6 decimal places to normalize persisted coordinates
function roundCoordinate(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

export async function getMarkers(): Promise<Marker[]> {
  const rows = await knex('markers')
    .select(
      'id',
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
  const lat = roundCoordinate(m.lat);
  const lng = roundCoordinate(m.lng);
  const inserted = await knex('markers')
    .insert({
      title: m.title,
      description: m.description ?? null,
      color: m.color ?? null,
      geom: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [lng, lat]),
    })
    .returning([
      'id',
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

export async function deleteMarker(id: number): Promise<void> {
  await knex('markers').where({ id }).delete();
}

export async function updateMarker(id: number, m: NewMarker): Promise<Marker> {
  const lat = roundCoordinate(m.lat);
  const lng = roundCoordinate(m.lng);
  const updated = await knex('markers')
    .where({ id })
    .update({
      title: m.title,
      description: m.description ?? null,
      color: m.color ?? null,
      geom: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [lng, lat]),
      updated_at: knex.fn.now(),
    })
    .returning([
      'id',
      'title',
      knex.raw('ST_Y(geom) AS lat'),
      knex.raw('ST_X(geom) AS lng'),
      'description',
      'color',
    ]);
  const r = (updated as unknown as MarkerRow[])[0];
  return {
    id: r.id,
    title: r.title,
    lat: Number(r.lat),
    lng: Number(r.lng),
    description: r.description ?? undefined,
    color: r.color ?? undefined,
  };
}
