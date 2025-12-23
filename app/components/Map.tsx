"use client";

import { MapContainer, Popup, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet'
import CustomMarker from './CustomMarker'
import { MAP_TYPES, useMapSettings } from "../context/MapSettingsContext";
import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

export default function Map() {
  const { mapType } = useMapSettings();
  const cfg = MAP_TYPES[mapType];
  const [geojsonData, setGeojsonData] = useState<FeatureCollection[]>([]);
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
    <CustomMarker position={[52, 5]} color={markerColor}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </CustomMarker>
  </MapContainer>
}