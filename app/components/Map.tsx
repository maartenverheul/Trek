"use client";

import { MapContainer, Popup, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet'
import CustomMarker from './CustomMarker'
import { MAP_TYPES, useMapSettings } from "../context/MapSettingsContext";
import { useEffect, useState, useTransition } from "react";
import type { FeatureCollection } from "geojson";
import { getMarkersAction } from "@/app/actions/markers";
import type { Marker as MarkerType } from "@/lib/types";

export default function Map() {
  const { mapType } = useMapSettings();
  const cfg = MAP_TYPES[mapType];
  const [geojsonData, setGeojsonData] = useState<FeatureCollection[]>([]);
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [isPending, startTransition] = useTransition();
  const markerColor = '#ff3b3b';

  useEffect(() => {
    let cancelled = false;
    async function loadGeojson() {
      if (!cfg.geojson || cfg.geojson.length === 0) {
        setGeojsonData([]);
        return;
      }
      try {
        const results = await Promise.all(
          cfg.geojson.map(async (g) => {
            const res = await fetch(g.url);
            if (!res.ok) throw new Error(`Failed to fetch ${g.url}`);
            return res.json();
          })
        );
        if (!cancelled) setGeojsonData(results);
      } catch (err) {
        if (!cancelled) setGeojsonData([]);
        console.error(err);
      }
    }
    loadGeojson();
    return () => {
      cancelled = true;
    };
  }, [mapType]);

  // Load markers via server action — client side
  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      getMarkersAction()
        .then(data => {
          if (!cancelled) setMarkers(data);
        })
        .catch(() => {
          if (!cancelled) setMarkers([]);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <MapContainer className="h-full w-full" center={[52, 5]} zoom={10} zoomControl={false}>
    <TileLayer
      attribution={cfg.base.attribution}
      url={cfg.base.url}
      {...(cfg.base.subdomains ? { subdomains: cfg.base.subdomains } : {})}
    />
    {cfg.overlays?.map((ol, idx) => (
      <TileLayer
        key={`overlay-${idx}`}
        attribution={ol.attribution}
        url={ol.url}
        {...(ol.subdomains ? { subdomains: ol.subdomains } : {})}
      />
    ))}
    {cfg.geojson && geojsonData.map((data, idx) => (
      <GeoJSON key={`geojson-${idx}`} data={data} style={() => cfg.geojson![idx].style ?? {}} />
    ))}
    <ZoomControl position="bottomright" />
    {markers.map((m) => (
      <CustomMarker key={m.id} position={[m.lat, m.lng]} color={m.color ?? markerColor}>
        <Popup>
          <div className="space-y-1">
            <div className="font-semibold">{m.title}</div>
            {m.description && <div className="text-xs opacity-80">{m.description}</div>}
          </div>
        </Popup>
      </CustomMarker>
    ))}
  </MapContainer>
}