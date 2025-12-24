"use client";

// Map settings consumed within MapSelector
import { useState } from "react";
import { XIcon, MapIcon, LayersIcon, MapPinIcon } from "lucide-react";
import LayerSelector from "./LayerSelector";
import MapSelector from "./MapSelector";
import FeaturesPanel from "./FeaturesPanel";
import { useFeatures } from "../context/FeaturesContext";

export default function Toolbar() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const DEFAULT_PANEL = "map";
  const { editingMarkerId } = useFeatures();
  const panelToShow = editingMarkerId != null ? "features" : (activePanel ?? DEFAULT_PANEL);
  const isOpen = activePanel !== null || editingMarkerId != null;

  function closeOverlay() {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    setActivePanel(null);
  }

  const PANELS = [
    {
      id: "layers" as const,
      label: "Layers",
      icon: LayersIcon,
      render: () => (
        <div className="w-full">
          <label className="text-sm mb-2 block">Map layer</label>
          <LayerSelector onSelected={closeOverlay} />
        </div>
      ),
    },
    {
      id: "map" as const,
      label: "Map Settings",
      icon: MapIcon,
      render: () => (
        <div className="w-full">
          <label className="text-sm mb-2 block">Maps</label>
          <MapSelector onSelected={() => {
            const isMobile = window.matchMedia("(max-width: 767px)").matches;
            if (isMobile) closeOverlay();
            else setActivePanel("features");
          }} />
        </div>
      ),
    },
    {
      id: "features" as const,
      label: "Features",
      icon: MapPinIcon,
      render: () => (
        <div className="w-full">
          <label className="text-sm mb-2 block">Features</label>
          <FeaturesPanel />
        </div>
      ),
    },
  ];

  // Fast lookup removed as it wasn't used



  return (
    <div className="text-white bg-black flex md:flex-row flex-row w-full md:w-auto h-min py-2 md:h-full">
      {/* Toolbar */}
      <div className="flex md:flex-col flex-row items-center max-sm:justify-center md:py-2 gap-2 md:gap-3 md:w-12 w-full md:h-full border-black/50 md:border-r border-t md:border-t-0 z-10000">
        {PANELS.map((p) => (
          <button
            key={p.id}
            aria-label={p.label}
            title={p.label}
            onClick={() => setActivePanel(ap => (ap === p.id ? null : p.id))}
            className={`p-2 rounded hover:bg-white/10 ${activePanel === p.id ? "bg-white/10" : ""}`}
          >
            <p.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Slide-out panel */}
      <div
        className={`
          md:w-64 w-full md:h-full h-full min-h-0
          ${isOpen ? "flex md:flex" : "hidden md:flex"}
          bg-black/90 border-black/50 md:border-r border-t md:border-t-0 p-3
          fixed md:static inset-x-0 top-0 bottom-12 md:inset-auto z-9999 md:z-auto shadow-lg md:shadow-none
          overflow-auto
        `}
      >
        {/* Mobile close button */}
        <button
          aria-label="Close panel"
          title="Close"
          className="md:hidden absolute top-3 right-3 p-2 rounded hover:bg-white/10"
          onClick={closeOverlay}
        >
          <XIcon className="w-5 h-5" />
        </button>
        {/* Keep all panels mounted to preserve state and avoid refetch flicker */}
        <div className="w-full">
          {PANELS.map((p) => (
            <div
              key={`panel-${p.id}`}
              className={`${panelToShow === p.id ? "block" : "hidden"}`}
            >
              {p.render()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
