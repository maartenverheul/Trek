"use server";

import { getMaps, deleteMap, updateMap, saveMap } from "@/lib/maps";
import { getMarkers, saveMarker, deleteMarker, updateMarker } from "../../lib/markers";
import type { Map, Marker, NewMap, NewMarker } from "../../lib/types";
import { removeSession, setSession } from "../session";
import { getCategoriesByMap, saveCategory } from "@/lib/categories";
import type { Category, NewCategory } from "@/lib/types";

export async function signIn(username: string) {
  await setSession({ username });
};

export async function signOut() {
  await removeSession();
};


export async function getMarkersAction(mapId: number): Promise<Marker[]> {
  return getMarkers(mapId);
}

export async function saveMarkerAction(m: NewMarker): Promise<Marker> {
  return saveMarker(m);
}

export async function updateMarkerAction(id: number, m: NewMarker): Promise<Marker> {
  return updateMarker(id, m);
}

export async function deleteMarkerAction(id: number): Promise<void> {
  return deleteMarker(id);
}

export async function getMapsAction(): Promise<Map[]> {
  return getMaps();
}

export async function deleteMapAction(id: number): Promise<void> {
  return deleteMap(id);
}

export async function updateMapAction(id: number, m: Partial<Pick<NewMap, 'title' | 'description'>>): Promise<Map> {
  return updateMap(id, m);
}

export async function saveMapAction(m: NewMap): Promise<Map> {
  return saveMap(m);
}

export async function getCategoriesAction(mapId: number): Promise<Category[]> {
  return getCategoriesByMap(mapId);
}

export async function saveCategoryAction(c: NewCategory): Promise<Category> {
  return saveCategory(c);
}
