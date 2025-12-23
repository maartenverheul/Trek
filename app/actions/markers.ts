"use server";

import { getMarkers, saveMarker, deleteMarker, updateMarker } from "../../lib/markers";
import type { Marker, NewMarker } from "../../lib/types";

export async function getMarkersAction(): Promise<Marker[]> {
  return getMarkers();
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
