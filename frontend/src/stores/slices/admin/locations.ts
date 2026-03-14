import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminLocationDatabaseHostSchema, adminLocationSchema } from '@/lib/schemas/admin/locations.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface LocationsSlice {
  locations: Pagination<z.infer<typeof adminLocationSchema>>;
  locationDatabaseHosts: Pagination<z.infer<typeof adminLocationDatabaseHostSchema>>;

  setLocations: (locations: Pagination<z.infer<typeof adminLocationSchema>>) => void;
  addLocation: (location: z.infer<typeof adminLocationSchema>) => void;
  removeLocation: (location: z.infer<typeof adminLocationSchema>) => void;

  setLocationDatabaseHosts: (databaseHosts: Pagination<z.infer<typeof adminLocationDatabaseHostSchema>>) => void;
  addLocationDatabaseHost: (databaseHost: z.infer<typeof adminLocationDatabaseHostSchema>) => void;
  removeLocationDatabaseHost: (databaseHost: z.infer<typeof adminLocationDatabaseHostSchema>) => void;
}

export const createLocationsSlice: StateCreator<AdminStore, [], [], LocationsSlice> = (set): LocationsSlice => ({
  locations: getEmptyPaginationSet<z.infer<typeof adminLocationSchema>>(),
  locationDatabaseHosts: getEmptyPaginationSet<z.infer<typeof adminLocationDatabaseHostSchema>>(),

  setLocations: (value) => set((state) => ({ ...state, locations: value })),
  addLocation: (location) =>
    set((state) => ({
      locations: {
        ...state.locations,
        data: [...state.locations.data, location],
        total: state.locations.total + 1,
      },
    })),
  removeLocation: (location) =>
    set((state) => ({
      locations: {
        ...state.locations,
        data: state.locations.data.filter((l) => l.uuid !== location.uuid),
        total: state.locations.total - 1,
      },
    })),

  setLocationDatabaseHosts: (value) => set((state) => ({ ...state, locationDatabaseHosts: value })),
  addLocationDatabaseHost: (databaseHost) =>
    set((state) => ({
      locationDatabaseHosts: {
        ...state.locationDatabaseHosts,
        data: [...state.locationDatabaseHosts.data, databaseHost],
        total: state.locationDatabaseHosts.total + 1,
      },
    })),
  removeLocationDatabaseHost: (databaseHost) =>
    set((state) => ({
      locationDatabaseHosts: {
        ...state.locationDatabaseHosts,
        data: state.locationDatabaseHosts.data.filter((l) => l.databaseHost.uuid !== databaseHost.databaseHost.uuid),
        total: state.locationDatabaseHosts.total - 1,
      },
    })),
});
