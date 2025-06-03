// data/types/village.ts
export type VillageStatus = 'visited' | 'not_visited' | 'planned';

export interface Village {
  id: string;
  name: string;
  status: VillageStatus;
  location: {
    lat: number;
    lng: number;
  };
  lastVisit?: string;
  parentsName?: string;
  parentsContact?: string;
  interactionHistory?: string;
} 