export type Visitation = { date: string; text: string };

export type Marker = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  description?: string;
  mapId: number;
  categoryId?: number;
  // Address
  country?: string;
  state?: string;
  postal?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  // Notes
  notes: string;
  // Rating 1-10
  rating?: number;
  // Visitations
  visitations: Visitation[];
  // Derived from category
  categoryColor?: string;
};

export type NewMarker = Omit<Marker, 'id' | 'categoryColor'>;

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
  mapId: number;
};

export type NewCategory = Omit<Category, 'id'>;
