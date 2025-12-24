"use client";

import { Point } from 'leaflet'
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import CustomMarker from './CustomMarker'
import { MAP_TYPES, useMapSettings } from "../context/MapSettingsContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import { useFeatures } from "../context/FeaturesContext";
import { useActiveMap } from "../context/ActiveMapContext";
import { getCategoriesAction } from "@/app/actions";
import type { Category, Marker } from "@/lib/types";
import { DEFAULT_MARKER_COLOR } from "@/lib/constants";
import { useMapViewport } from "../context/MapViewportContext";

export default function Map() {
  const { mapType, alwaysShowLabels } = useMapSettings();
  const cfg = MAP_TYPES[mapType];
  const [geojsonData, setGeojsonData] = useState<FeatureCollection[]>([]);
  const { markers, isLoading, startEdit, editingMarkerId } = useFeatures();
  const { activeMap } = useActiveMap();
  const maxZoom = 21;
  const [showOverlay, setShowOverlay] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories for current map to derive marker colors
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!activeMap) {
        setCategories([]);
        return;
      }
      try {
        const cats = await getCategoriesAction(activeMap.id);
        if (!cancelled) setCategories(cats);
      } catch {
        if (!cancelled) setCategories([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeMap]);

  const catColorById = useMemo(() => {
    const m = new globalThis.Map<number, string>();
    for (const c of categories) {
      m.set(c.id, c.color ?? DEFAULT_MARKER_COLOR);
    }
    return m;
  }, [categories]);

  useEffect(() => {
    if (isLoading) {
      const t = window.setTimeout(() => setShowOverlay(true), 0);
      return () => window.clearTimeout(t);
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

  function onMarkerClick(m: Marker) {
    startEdit(m.id);
  }

  return <div data-maxzoom={cfg.maxNativeZoom} className='w-full h-full relative' aria-busy={showOverlay}>
    <MapContainer className="h-full w-full relative z-0" center={[52, 5]} zoom={10} zoomControl={false} maxZoom={maxZoom}>
      <MapInteractions />
      <ViewportController />
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
        <CustomMarker
          key={m.id}
          position={[m.lat, m.lng]}
          color={catColorById.get(m.categoryId ?? 0) ?? DEFAULT_MARKER_COLOR}
          title={alwaysShowLabels || editingMarkerId === m.id ? m.title : ''}
          onClick={() => onMarkerClick(m)}
        />
      ))}
    </MapContainer>
    <div className={`absolute inset-0 z-1000 bg-black/40 transition-none duration-0 sm:transition-opacity sm:duration-300 ${showOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-white/70 border-t-transparent animate-spin" />
      </div>
    </div>
  </div>
}

function MapInteractions() {
  const { createMarker } = useFeatures();
  const { activeMap } = useActiveMap();
  const timerRef = useRef<number | null>(null);
  const latestActiveMapRef = useRef(activeMap);
  const LONG_PRESS_MS = 600;


  const addNewMarker = useCallback(async (mapId: number, lat: number, lng: number) => {
    return createMarker({
      title: 'New Marker',
      lat,
      lng,
      mapId,
      notes: '',
      visitations: []
    });
  }, [createMarker]);

  useEffect(() => {
    latestActiveMapRef.current = activeMap;
  }, [activeMap]);

  const map = useMapEvents({
    contextmenu(e) {
      const oe = (e as LeafletMouseEvent).originalEvent as Event | undefined;
      if (oe instanceof PointerEvent && oe.pointerType === 'touch') return;
      if (typeof TouchEvent !== 'undefined' && oe instanceof TouchEvent) return;
      if (!latestActiveMapRef.current) return;
      void addNewMarker(latestActiveMapRef.current.id, e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    let touchLat: number | null = null;
    let touchLng: number | null = null;
    const MOVE_TOLERANCE_PX = 15; // allow slight finger movement
    let startPoint: Point | null = null;
    const onTouchStart = (ev: TouchEvent) => {
      if (!ev.touches || ev.touches.length !== 1) return;
      const touch = ev.touches[0];
      const rect = map.getContainer().getBoundingClientRect();
      const containerX = touch.clientX - rect.left;
      const containerY = touch.clientY - rect.top;
      startPoint = new Point(containerX, containerY);
      const latlng = map.containerPointToLatLng(startPoint);
      touchLat = latlng.lat;
      touchLng = latlng.lng;
      // Any new touch interaction
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        if (touchLat != null && touchLng != null) {
          if (!latestActiveMapRef.current) return;
          void addNewMarker(latestActiveMapRef.current.id, touchLat, touchLng);
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
    const onTouchEnd = () => {
      startPoint = null;
      clearTimer();
    };
    const onTouchMove = (ev: TouchEvent) => {
      if (!startPoint || !ev.touches || ev.touches.length !== 1) return;
      const touch = ev.touches[0];
      const rect = map.getContainer().getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MOVE_TOLERANCE_PX) {
        // Cancel long-press if finger moves too far
        startPoint = null;
        clearTimer();
        // User is panning; cancel long-press
      }
    };
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [addNewMarker, map]);

  // no initial viewport handling needed
  return null;
}

function ViewportController() {
  const map = useMapEvents({});
  const { focus, setFocus } = useMapViewport();

  useEffect(() => {
    if (!focus) return;
    const targetZoom = Math.max(map.getZoom(), focus.zoom ?? 16);
    map.flyTo([focus.lat, focus.lng], targetZoom, { duration: 1 });
    setFocus(null);
  }, [focus, map, setFocus]);

  return null;
}
