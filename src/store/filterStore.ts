import { create } from 'zustand';
import type { FilterParams, TimePeriod } from '@shared/types';

interface FilterState {
  filters: FilterParams;
  timePeriod: TimePeriod;
  drillDownCategory: string | null;
  setFilters: (filters: Partial<FilterParams>) => void;
  resetFilters: () => void;
  setTimePeriod: (period: TimePeriod) => void;
  setDateRange: (start?: string, end?: string) => void;
  setCategories: (categories: string[]) => void;
  setMinViews: (min: number | undefined) => void;
  setSortBy: (sortBy: FilterParams['sortBy']) => void;
  setDrillDownCategory: (category: string | null) => void;
  clearDrillDown: () => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: {},
  timePeriod: 'day',
  drillDownCategory: null,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: {}, drillDownCategory: null }),
  setTimePeriod: (period) => set({ timePeriod: period }),
  setDateRange: (startDate, endDate) =>
    set((state) => ({
      filters: { ...state.filters, startDate, endDate },
    })),
  setCategories: (categories) =>
    set((state) => ({
      filters: { ...state.filters, categories },
    })),
  setMinViews: (minViews) =>
    set((state) => ({
      filters: { ...state.filters, minViews },
    })),
  setSortBy: (sortBy) =>
    set((state) => ({
      filters: { ...state.filters, sortBy },
    })),
  setDrillDownCategory: (category) => {
    const currentCategories = get().filters.categories || [];
    const newCategories = category ? [category] : currentCategories;
    set({
      drillDownCategory: category,
      filters: { ...get().filters, categories: newCategories },
    });
  },
  clearDrillDown: () => {
    const currentCategories = get().filters.categories || [];
    const drillDown = get().drillDownCategory;
    const newCategories = drillDown
      ? currentCategories.filter((c) => c !== drillDown)
      : currentCategories;
    set({
      drillDownCategory: null,
      filters: {
        ...get().filters,
        categories: newCategories.length > 0 ? newCategories : undefined,
      },
    });
  },
}));
