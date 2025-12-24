"use client";

import { createContext, useContext, useMemo } from "react";
import useLocalStorageState from "use-local-storage-state";

export type MapType = string;

type MapSettings = {
  mapType: MapType;
  setMapType: (type: MapType) => void;
  alwaysShowLabels: boolean;
  setAlwaysShowLabels: (val: boolean) => void;
};

const MapSettingsContext = createContext<MapSettings | undefined>(undefined);

export function MapSettingsProvider({ children }: { children: React.ReactNode }) {
  const [mapType, setMapType] = useLocalStorageState<MapType>("mapType", {
    defaultValue: "osm",
  });
  const [alwaysShowLabels, setAlwaysShowLabels] = useLocalStorageState<boolean>("alwaysShowLabels", {
    defaultValue: false,
  });

  const value = useMemo(
    () => ({ mapType, setMapType, alwaysShowLabels, setAlwaysShowLabels }),
    [mapType, setMapType, alwaysShowLabels, setAlwaysShowLabels]
  );

  return <MapSettingsContext.Provider value={value}>{children}</MapSettingsContext.Provider>;
}

export function useMapSettings() {
  const ctx = useContext(MapSettingsContext);
  if (!ctx) throw new Error("useMapSettings must be used within MapSettingsProvider");
  return ctx;
}

export type TileSource = { url: string; attribution: string; subdomains?: string | string[] };
export type GeoJsonOverlay = { url: string; style?: { color?: string; weight?: number; opacity?: number } };
export type MapConfig = {
  label: string;
  base: TileSource;
  overlays?: TileSource[];
  geojson?: GeoJsonOverlay[];
  // Highest native zoom level where imagery exists
  maxNativeZoom: number;
};

export const MAP_TYPES: Record<MapType, MapConfig> = {
  osm: {
    label: "OpenStreetMap",
    base: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors",
      subdomains: "abc",
    },
    maxNativeZoom: 19,
  },
  voyager: {
    label: "CARTO Voyager",
    base: {
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      subdomains: "abcd",
    },
    maxNativeZoom: 20,
  },
  satellite: {
    label: "Satellite",
    base: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution:
        "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
    maxNativeZoom: 21,
  },
  hybrid: {
    label: "Satellite + labels",
    base: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution:
        "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
    overlays: [
      {
        url: "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        subdomains: "abcd",
      },
    ],
    geojson: [
      {
        url: "/geojson/country_borders_compressed.geojson",
        style: { color: "#ffffff", weight: 1, opacity: 0.8 },
      },
    ],
    maxNativeZoom: 21,
  },
};
