"use client";

import { Marker } from 'react-leaflet';
import { divIcon, type LatLngExpression } from 'leaflet';
import { useMemo } from 'react';

type CustomMarkerProps = {
  position: LatLngExpression;
  color?: string;
  size?: number;
  cornerRadius?: number;
  pointerWidth?: number;
  pointerHeight?: number;
  dotColor?: string;
  dotSize?: number;
  dotOffsetX?: number;
  dotOffsetY?: number;
  children?: React.ReactNode;
};

export default function CustomMarker({
  position,
  color = '#ff3b3b',
  size = 18,
  cornerRadius = 6,
  pointerWidth = 10,
  pointerHeight = 8,
  dotColor = '#ffffff',
  dotSize = 6,
  dotOffsetX = 0,
  dotOffsetY = 0,
  children,
}: CustomMarkerProps) {
  const dotLeft = Math.round(size / 2 - dotSize / 2 + dotOffsetX);
  const dotTop = Math.round(size / 2 - dotSize / 2 + dotOffsetY);
  const icon = useMemo(() => (
    divIcon({
      className: 'custom-square-marker',
      html: `
        <div style="position:relative;width:${size}px;height:${size + pointerHeight}px;">
          <div style="position:relative;width:${size}px;height:${size}px;background:${color};border-radius:${cornerRadius}px;">
            <div style="position:absolute;left:${dotLeft}px;top:${dotTop}px;width:${dotSize}px;height:${dotSize}px;background:${dotColor};border-radius:50%;"></div>
          </div>
          <div style="position:absolute;left:${size / 2 - pointerWidth / 2}px;top:${size - 1}px;width:0;height:0;border-left:${pointerWidth / 2}px solid transparent;border-right:${pointerWidth / 2}px solid transparent;border-top:${pointerHeight}px solid ${color};"></div>
        </div>
      `,
      iconSize: [size, size + pointerHeight],
      iconAnchor: [size / 2, size + pointerHeight],
    })
  ), [color, size, cornerRadius, pointerWidth, pointerHeight, dotColor, dotSize, dotLeft, dotTop]);

  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
}