import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Property {
  type: "Feature"
  properties: {
    id: string
    city: string
    province: string
    postal_code: string
    bedrooms_total: string
    bathroom_total: string
    price: string
    type: string
    street_address: string
    photo_url: string
    listing_id: string
    [key: string]: any
  }
  geometry: {
    type: "Point"
    coordinates: [number, number, number?]
  }
}

interface PropertyStore {
  properties: Property[]
  visibleProperties: Property[]
  totalVisibleCount: number
  setProperties: (properties: Property[]) => void
  selectedProperty: string | null
  setSelectedProperty: (id: string | null) => void
  hoveredProperty: string | null
  setHoveredProperty: (id: string | null) => void
  favorites: string[]
  toggleFavorite: (id: string) => void
  filters: {
    type: string | null
    priceRange: string | null
    beds: string | null
    baths: string | null
    propertyType: string | null
  }
  setFilter: (key: keyof PropertyStore["filters"], value: any) => void
  resetFilters: () => void
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set) => ({
      properties: [],
      visibleProperties: [],
      totalVisibleCount: 0,
      setProperties: (properties) => set({ properties, visibleProperties: properties }),
      selectedProperty: null,
      setSelectedProperty: (id) => set({ selectedProperty: id }),
      hoveredProperty: null,
      setHoveredProperty: (id) => set({ hoveredProperty: id }),
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((fid) => fid !== id)
            : [...state.favorites, id],
        })),
      filters: {
        type: null,
        priceRange: null,
        beds: null,
        baths: null,
        propertyType: null,
      },
      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),
      resetFilters: () =>
        set({
          filters: {
            type: null,
            priceRange: null,
            beds: null,
            baths: null,
            propertyType: null,
          },
        }),
    }),
    {
      name: "property-store",
      partialize: (state) => ({ favorites: state.favorites, filters: state.filters }),
    },
  ),
)

