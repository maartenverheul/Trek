import { knex } from "./knex";
import type { Marker, NewMarker, Visitation } from "./types";

type MarkerRow = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  description: string | null;
  mapId: number;
  categoryId?: number | null;
  country: string | null;
  state: string | null;
  postal: string | null;
  city: string | null;
  street: string | null;
  houseNumber: string | null;
  notes: string | null;
  rating: number | null;
  visitations: unknown | null;
  categoryColor?: string | null;
};

// Round to 6 decimal places to normalize persisted coordinates
function roundCoordinate(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

export async function getMarkers(mapId?: number): Promise<Marker[]> {
  const query = knex('markers')
    .leftJoin('categories', 'markers.category_id', 'categories.id')
    .select(
      'markers.id as id',
      'markers.title as title',
      knex.raw('ST_Y(markers.geom) AS lat'),
      knex.raw('ST_X(markers.geom) AS lng'),
      'markers.description as description',
      'markers.map_id as mapId',
      'markers.category_id as categoryId',
      'markers.country as country',
      'markers.state as state',
      'markers.postal as postal',
      'markers.city as city',
      'markers.street as street',
      'markers.house_number as houseNumber',
      'markers.notes as notes',
      'markers.rating as rating',
      'markers.visitations as visitations',
      'categories.color as categoryColor'
    )
    .orderBy('markers.created_at', 'desc');
  if (typeof mapId === 'number') {
    query.where('markers.map_id', mapId);
  }
  const rows = await query;
  const typed = rows as unknown as MarkerRow[];
  return typed.map((r) => ({
    id: r.id,
    title: r.title,
    lat: Number(r.lat),
    lng: Number(r.lng),
    description: r.description ?? undefined,
    mapId: r.mapId,
    categoryId: r.categoryId ?? undefined,
    country: r.country ?? undefined,
    state: r.state ?? undefined,
    postal: r.postal ?? undefined,
    city: r.city ?? undefined,
    street: r.street ?? undefined,
    houseNumber: r.houseNumber ?? undefined,
    notes: r.notes ?? '',
    rating: r.rating ?? undefined,
    visitations: Array.isArray(r.visitations) ? (r.visitations as Visitation[]) : [],
    categoryColor: r.categoryColor ?? undefined,
  }));
}

// Types come from lib/types to avoid client bundling server-only code

export async function saveMarker(m: NewMarker): Promise<Marker> {
  const lat = roundCoordinate(m.lat);
  const lng = roundCoordinate(m.lng);
  if (m.mapId == null) {
    throw new Error('mapId is required when creating a marker');
  }
  const inserted = await knex('markers')
    .insert({
      title: m.title,
      description: m.description ?? null,
      map_id: m.mapId,
      category_id: m.categoryId ?? null,
      country: m.country ?? null,
      state: m.state ?? null,
      postal: m.postal ?? null,
      city: m.city ?? null,
      street: m.street ?? null,
      house_number: m.houseNumber ?? null,
      notes: m.notes ?? '',
      rating: m.rating ?? null,
      visitations: m.visitations ?? [],
      geom: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [lng, lat]),
    })
    .returning([
      'id',
      'title',
      knex.raw('ST_Y(geom) AS lat'),
      knex.raw('ST_X(geom) AS lng'),
      'description',
      'map_id as mapId',
      'category_id as categoryId',
      'country',
      'state',
      'postal',
      'city',
      'street',
      'house_number as houseNumber',
      'notes',
      'rating',
      'visitations',
    ]);
  const r = (inserted as unknown as MarkerRow[])[0];
  return {
    id: r.id,
    title: r.title,
    lat: Number(r.lat),
    lng: Number(r.lng),
    description: r.description ?? undefined,
    mapId: r.mapId,
    categoryId: r.categoryId ?? undefined,
    country: r.country ?? undefined,
    state: r.state ?? undefined,
    postal: r.postal ?? undefined,
    city: r.city ?? undefined,
    street: r.street ?? undefined,
    houseNumber: r.houseNumber ?? undefined,
    notes: r.notes ?? '',
    rating: r.rating ?? undefined,
    visitations: Array.isArray(r.visitations) ? (r.visitations as Visitation[]) : [],
  };
}

export async function deleteMarker(id: number): Promise<void> {
  await knex('markers').where({ id }).delete();
}

export async function updateMarker(id: number, m: NewMarker): Promise<Marker> {
  const lat = roundCoordinate(m.lat);
  const lng = roundCoordinate(m.lng);
  const updateFields: Record<string, unknown> = {
    title: m.title,
    description: m.description ?? null,
    geom: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [lng, lat]),
    updated_at: knex.fn.now(),
  };
  if (m.mapId != null) updateFields.map_id = m.mapId;
  if (m.categoryId !== undefined) updateFields.category_id = m.categoryId ?? null;
  if (m.country !== undefined) updateFields.country = m.country ?? null;
  if (m.state !== undefined) updateFields.state = m.state ?? null;
  if (m.postal !== undefined) updateFields.postal = m.postal ?? null;
  if (m.city !== undefined) updateFields.city = m.city ?? null;
  if (m.street !== undefined) updateFields.street = m.street ?? null;
  if (m.houseNumber !== undefined) updateFields.house_number = m.houseNumber ?? null;
  if (m.notes !== undefined) updateFields.notes = m.notes ?? '';
  if (m.rating !== undefined) updateFields.rating = m.rating ?? null;
  if (m.visitations !== undefined) updateFields.visitations = JSON.stringify(m.visitations ?? []);
  console.log(updateFields.visitations)
  const updated = await knex('markers')
    .where({ id })
    .update(updateFields)
    .returning([
      'id',
      'title',
      knex.raw('ST_Y(geom) AS lat'),
      knex.raw('ST_X(geom) AS lng'),
      'description',
      'map_id as mapId',
      'category_id as categoryId',
      'country',
      'state',
      'postal',
      'city',
      'street',
      'house_number as houseNumber',
      'notes',
      'rating',
      'visitations',
    ]);
  const r = (updated as unknown as MarkerRow[])[0];
  return {
    id: r.id,
    title: r.title,
    lat: Number(r.lat),
    lng: Number(r.lng),
    description: r.description ?? undefined,
    mapId: r.mapId,
    categoryId: r.categoryId ?? undefined,
    country: r.country ?? undefined,
    state: r.state ?? undefined,
    postal: r.postal ?? undefined,
    city: r.city ?? undefined,
    street: r.street ?? undefined,
    houseNumber: r.houseNumber ?? undefined,
    notes: r.notes ?? '',
    rating: r.rating ?? undefined,
    visitations: Array.isArray(r.visitations) ? (r.visitations as Visitation[]) : [],
  };
}
