"use client";

import dynamic from "next/dynamic";
import Toolbar from "./components/Toolbar";

export default function Home() {
  const Map = dynamic(() => import('./components/Map'), { ssr: false });


  return (
    <main className="w-screen h-screen overflow-hidden flex flex-col-reverse md:flex-row">
      <Toolbar />
      <div className='grow bg-black h-full min-h-0'>
        <Map />
      </div>

    </main>
  );
}
