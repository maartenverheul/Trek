/* eslint-disable @next/next/no-img-element */
"use client";

import { MapType, MAP_TYPES, useMapSettings, TileSource } from "../context/MapSettingsContext";

type PreviewTile = { x: number; y: number; z: number };

const PREVIEW: PreviewTile = { x: 1051, y: 673, z: 11 }; // Amsterdam area for decent detail

function buildTileUrlFromSource(src: TileSource, { x, y, z }: PreviewTile) {
  const sub = Array.isArray(src.subdomains)
    ? src.subdomains[0]
    : typeof src.subdomains === "string"
      ? src.subdomains[0]
      : undefined;
  return src.url
    .replace("{s}", sub ?? "a")
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y))
    .replace("{r}", "");
}

function buildBaseTileUrl(type: MapType, coords: PreviewTile) {
  return buildTileUrlFromSource(MAP_TYPES[type].base, coords);
}

const OPTIONS: { type: MapType; label: string }[] = Object.entries(MAP_TYPES).map(([k, v]) => ({
  type: k as MapType,
  label: v.label,
}));

export default function LayerSelector({ onSelected }: { onSelected?: () => void }) {
  const { mapType, setMapType, alwaysShowLabels, setAlwaysShowLabels } = useMapSettings();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
        {OPTIONS.map((opt) => {
          const baseUrl = buildBaseTileUrl(opt.type, PREVIEW);
          const selected = mapType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => {
                setMapType(opt.type);
                onSelected?.();
              }}
              aria-label={opt.label}
              title={opt.label}
              className={`group text-left rounded overflow-hidden border ${selected ? "border-white/70" : "border-white/20"
                } hover:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/40`}
            >
              <div className="relative w-full h-24 md:h-32">
                <img
                  src={baseUrl}
                  alt={`${opt.label} preview tile`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {MAP_TYPES[opt.type].overlays?.map((ol, i) => (
                  <img
                    key={`ol-${i}`}
                    src={buildTileUrlFromSource(ol, PREVIEW)}
                    alt={`${opt.label} overlay ${i}`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                ))}
              </div>
              <div className="px-2 py-1 text-xs text-white/80 bg:black/40">
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-xs text-white/80">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-white/30 bg-transparent"
          checked={alwaysShowLabels}
          onChange={(e) => setAlwaysShowLabels(e.target.checked)}
        />
        <span>Always show feature titles</span>
      </label>
    </div>
  );
}
