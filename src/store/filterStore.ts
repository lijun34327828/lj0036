import { create } from 'zustand';
import type { FilterParams, TimePeriod } from '@shared/types';

interface FilterState {
  filters: FilterParams;
  timePeriod: TimePeriod;
  setFilters: (filters: Partial<FilterParams>) => void;
  resetFilters: () => void;
  setTimePeriod: (period: TimePeriod) => void;
  setDateRange: (start?: string, end?: string) => void;
  setCategories: (categories: string[]) => void;
  setMinViews: (min: number | undefined) => void;
  setSortBy: (sortBy: FilterParams['sortBy']) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  timePeriod: 'day',
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: {} }),
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
}));
