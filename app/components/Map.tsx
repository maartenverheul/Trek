"use client";

import { MapContainer, Popup, TileLayer, GeoJSON, ZoomControl, useMapEvents } from 'react-leaflet'
import { Point } from 'leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import CustomMarker from './CustomMarker'
import { MAP_TYPES, useMapSettings } from "../context/MapSettingsContext";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import { useFeatures } from "../context/FeaturesContext";

export default function Map() {
  const { mapType } = useMapSettings();
  const cfg = MAP_TYPES[mapType];
  const [geojsonData, setGeojsonData] = useState<FeatureCollection[]>([]);
  const { markers } = useFeatures();
  const markerColor = '#ff3b3b';
  const maxZoom = 21;

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
  }, [mapType, cfg.geojson]);

  // Markers now provided by FeaturesContext

  function MapInteractions() {
    const { createMarker } = useFeatures();
    const timerRef = useRef<number | null>(null);
    const LONG_PRESS_MS = 600;

    const map = useMapEvents({
      contextmenu(e) {
        const oe = (e as LeafletMouseEvent).originalEvent as Event | undefined;
        if (oe instanceof PointerEvent && oe.pointerType === 'touch') return;
        if (typeof TouchEvent !== 'undefined' && oe instanceof TouchEvent) return;
        void createMarker({
          title: 'New Marker',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      },
      mousedown(e) {
        const oe = (e as LeafletMouseEvent).originalEvent as Event | undefined;
        if (oe instanceof PointerEvent && oe.pointerType === 'touch') return;
        if (typeof TouchEvent !== 'undefined' && oe instanceof TouchEvent) return;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          void createMarker({
            title: 'New Marker',
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          });
          if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }, LONG_PRESS_MS);
      },
      mouseup() {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      },
    });

    useEffect(() => {
      const container = map.getContainer();
      let touchLat: number | null = null;
      let touchLng: number | null = null;
      const onTouchStart = (ev: TouchEvent) => {
        if (!ev.touches || ev.touches.length !== 1) return;
        const touch = ev.touches[0];
        const rect = map.getContainer().getBoundingClientRect();
        const containerX = touch.clientX - rect.left;
        const containerY = touch.clientY - rect.top;
        const latlng = map.containerPointToLatLng(new Point(containerX, containerY));
        touchLat = latlng.lat;
        touchLng = latlng.lng;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          if (touchLat != null && touchLng != null) {
            void createMarker({ title: 'New Marker', lat: touchLat, lng: touchLng });
          }
          if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }, LONG_PRESS_MS);
      };
      const clearTimer = () => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
      const onTouchEnd = () => clearTimer();
      const onTouchMove = () => clearTimer();
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchend', onTouchEnd, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: true });
      return () => {
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchend', onTouchEnd);
        container.removeEventListener('touchmove', onTouchMove);
      };
    }, [map, createMarker]);
    return null;
  }

  return <div data-maxzoom={cfg.maxNativeZoom} className='w-full h-full'><MapContainer className="h-full w-full" center={[52, 5]} zoom={10} zoomControl={false} maxZoom={maxZoom}>
    <MapInteractions />
    <TileLayer
      key={`base-${cfg.maxNativeZoom}-${cfg.base.url}`}
      attribution={cfg.base.attribution}
      url={cfg.base.url}
      maxZoom={maxZoom}
      maxNativeZoom={cfg.maxNativeZoom}
      {...(cfg.base.subdomains ? { subdomains: cfg.base.subdomains } : {})}
    />
    {cfg.overlays?.map((ol, idx) => (
      <TileLayer
        key={`overlay-${idx}-${cfg.maxNativeZoom}-${ol.url}`}
        attribution={ol.attribution}
        url={ol.url}
        maxZoom={maxZoom}
        maxNativeZoom={cfg.maxNativeZoom}
        {...(ol.subdomains ? { subdomains: ol.subdomains } : {})}
      />
    ))}
    {cfg.geojson && geojsonData.map((data, idx) => (
      <GeoJSON key={`geojson-${idx}`} data={data} style={() => cfg.geojson![idx].style ?? {}} />
    ))}
    <ZoomControl position="bottomright" />
    {markers.map((m) => (
      <CustomMarker key={m.id} position={[m.lat, m.lng]} color={m.color ?? markerColor} title={m.title}>
        <Popup>
          <div className="space-y-1">
            <div className="font-semibold">{m.title}</div>
            {m.description && <div className="text-xs opacity-80">{m.description}</div>}
          </div>
        </Popup>
      </CustomMarker>
    ))}
  </MapContainer></div>
}