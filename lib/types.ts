export type Marker = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  description?: string;
  color?: string;
};

export type NewMarker = Omit<Marker, 'id'>;

export type User = {
  id: number;
  name: string;
  email: string;
};

export type NewUser = Omit<User, 'id'>;

export type Map = {
  id: number;
  title: string;
  description?: string;
  userId: number;
};

export type NewMap = Omit<Map, 'id'>;

export type Category = {
  id: number;
  title: string;
  description?: string;
  color?: string;
  userId: number;
};

export type NewCategory = Omit<Category, 'id'>;
