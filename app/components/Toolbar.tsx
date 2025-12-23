"use client";

// Map settings consumed within MapSelector
import { useState } from "react";
import { XIcon, MapIcon, LayersIcon } from "lucide-react";
import MapSelector from "./MapSelector";

export default function Toolbar() {
  const [activePanel, setActivePanel] = useState<"map" | "layers" | null>(null);
  const isOpen = activePanel !== null;
  const panelToShow = activePanel ?? "map";

  function closeOverlay() {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
      setActivePanel(null);
    }
  }

  return (
    <div className="text-white bg-black flex md:flex-row flex-row w-full md:w-auto h-min py-2 md:h-full">
      {/* Toolbar */}
      <div className="flex md:flex-col flex-row items-center max-sm:justify-center md:py-2 gap-2 md:gap-3 md:w-12 w-full md:h-full border-black/50 md:border-r border-t md:border-t-0 z-10000">
        <button
          aria-label="Map Settings"
          title="Map Settings"
          onClick={() => setActivePanel(p => (p === "map" ? null : "map"))}
          className={`p-2 rounded hover:bg-white/10 ${activePanel === "map" ? "bg-white/10" : ""}`}
        >
          <MapIcon className="w-5 h-5" />
        </button>

        <button
          aria-label="Layers"
          title="Layers"
          onClick={() => setActivePanel(p => (p === "layers" ? null : "layers"))}
          className={`p-2 rounded hover:bg-white/10 ${activePanel === "layers" ? "bg-white/10" : ""}`}
        >
          <LayersIcon className="w-5 h-5" />
        </button>
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
        {panelToShow === "layers" && (
          <div className="w-full">
            <label className="text-sm mb-2 block">Map layer</label>
            <MapSelector onSelected={closeOverlay} />
          </div>
        )}

        {panelToShow === "map" && (
          <div className="w-full">
            <label className="text-sm mb-2 block">Maps</label>
          </div>
        )}
      </div>
    </div>
  );
}
