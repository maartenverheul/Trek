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
  title?: string;
  textColor?: string;
  fontSize?: number;
  extraWidth?: number;
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
  title,
  textColor = '#ffffff',
  fontSize = 12,
  children,
}: CustomMarkerProps) {
  // When showing a title, elongate the square horizontally
  const squareWidth = 20;
  const pointerLeft = Math.round(squareWidth / 2 - pointerWidth / 2);
  const icon = useMemo(() => (
    divIcon({
      className: 'custom-square-marker',
      html: `
        <div style="position:relative;width:max-content;height:${size + pointerHeight}px;">
          <div style="position:relative;transform: translate(calc(-50% + 10px),0);width:max-content;padding:0 6px 0 6px;display:flex;align-items:center;justify-content:center;height:${size}px;background:${color};border-radius:${cornerRadius}px;">
            <div style="position:relative;width:${dotSize}px;height:${dotSize}px;background:${dotColor};border-radius:50%;"></div>
            ${title ? `<div style="position:relative;margin-left:4px;color:${textColor};font-size:${fontSize}px;white-space:nowrap;">${title}</div>` : ''}
          </div>
          <div style="position:absolute;left:${pointerLeft}px;top:${size - 1}px;width:0;height:0;border-left:${pointerWidth / 2}px solid transparent;border-right:${pointerWidth / 2}px solid transparent;border-top:${pointerHeight}px solid ${color};"></div>
        </div>
      `,
      iconSize: [squareWidth, size + pointerHeight],
      iconAnchor: [squareWidth / 2, size + pointerHeight],
    })
  ), [color, size, squareWidth, cornerRadius, pointerWidth, pointerHeight, dotColor, dotSize, pointerLeft, title, textColor, fontSize]);

  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
}