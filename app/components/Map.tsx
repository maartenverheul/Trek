"use client";

import { MapContainer, Popup, TileLayer, GeoJSON, ZoomControl, useMapEvents } from 'react-leaflet'
import { Point } from 'leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import CustomMarker from './CustomMarker'
import { MAP_TYPES, useMapSettings } from "../context/MapSettingsContext";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import { useFeatures } from "../context/FeaturesContext";
import { useActiveMap } from "../context/ActiveMapContext";

export default function Map() {
  const { mapType } = useMapSettings();
  const cfg = MAP_TYPES[mapType];
  const [geojsonData, setGeojsonData] = useState<FeatureCollection[]>([]);
  const { markers, isLoading, startEdit } = useFeatures();
  const markerColor = '#888';
  const maxZoom = 21;
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowOverlay(true);
    } else {
      const t = window.setTimeout(() => setShowOverlay(false), 250);
      return () => window.clearTimeout(t);
    }
  }, [isLoading]);

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
    const { activeMap } = useActiveMap();
    const timerRef = useRef<number | null>(null);
    const latestActiveMapRef = useRef(activeMap);
    const LONG_PRESS_MS = 600;

    useEffect(() => {
      latestActiveMapRef.current = activeMap;
    }, [activeMap]);

    const map = useMapEvents({
      contextmenu(e) {
        const oe = (e as LeafletMouseEvent).originalEvent as Event | undefined;
        if (oe instanceof PointerEvent && oe.pointerType === 'touch') return;
        if (typeof TouchEvent !== 'undefined' && oe instanceof TouchEvent) return;
        if (!latestActiveMapRef.current) return;
        void createMarker({
          title: 'New Marker',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          mapId: latestActiveMapRef.current.id,
          notes: '',
          visitations: []
        });
      },
      mousedown(e) {
        const oe = (e as LeafletMouseEvent).originalEvent as Event | undefined;
        if (oe instanceof PointerEvent && oe.pointerType === 'touch') return;
        if (typeof TouchEvent !== 'undefined' && oe instanceof TouchEvent) return;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          if (!latestActiveMapRef.current) return;
          void createMarker({
            title: 'New Marker',
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            mapId: latestActiveMapRef.current.id,
            notes: '',
            visitations: []
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
      // no-op for viewport bounds; showing all loaded markers
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
            if (!latestActiveMapRef.current) return;
            void createMarker({
              title: 'New Marker', lat: touchLat, lng: touchLng, mapId: latestActiveMapRef.current.id,
              notes: '',
              visitations: []
            });
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

    // no initial viewport handling needed
    return null;
  }

  return <div data-maxzoom={cfg.maxNativeZoom} className='w-full h-full relative' aria-busy={showOverlay}>
    <MapContainer className="h-full w-full relative z-0" center={[52, 5]} zoom={10} zoomControl={false} maxZoom={maxZoom}>
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
        <CustomMarker key={m.id} position={[m.lat, m.lng]} color={m.categoryColor ?? markerColor} title={m.title} onClick={() => startEdit(m.id)}>
          {/* <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{m.title}</div>
              {m.description && <div className="text-xs opacity-80">{m.description}</div>}
            </div>
          </Popup> */}
        </CustomMarker>
      ))}
    </MapContainer>
    <div className={`absolute inset-0 z-1000 bg-black/40 transition-none duration-0 sm:transition-opacity sm:duration-300 ${showOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-white/70 border-t-transparent animate-spin" />
      </div>
    </div>
  </div>
}