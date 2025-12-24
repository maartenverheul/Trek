import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { MapSettingsProvider } from "./context/MapSettingsContext";
import { FeaturesProvider } from "./context/FeaturesContext";
import { ActiveMapProvider } from "./context/ActiveMapContext";
import { MapViewportProvider } from "./context/MapViewportContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trek",
  description: "Place all your tracked features here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MapSettingsProvider>
          <ActiveMapProvider>
            <FeaturesProvider>
              <MapViewportProvider>
                {children}
              </MapViewportProvider>
            </FeaturesProvider>
          </ActiveMapProvider>
        </MapSettingsProvider>
      </body>
    </html>
  );
}
