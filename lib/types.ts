export type Marker = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
  color?: string;
};

export type NewMarker = Omit<Marker, 'id'>;
