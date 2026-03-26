import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PremiumMode = "drivers" | "constructors";

export interface PublicPremiumFilters {
  mode: PremiumMode;
  leftEntityId: string;
  rightEntityId: string;
  trendWindow: number;
  raceScope: "completed" | "all";
}

interface PublicFiltersState {
  byCode: Record<string, PublicPremiumFilters>;
  getFilters: (code: string) => PublicPremiumFilters;
  setFilters: (code: string, patch: Partial<PublicPremiumFilters>) => void;
}

const DEFAULT_FILTERS: PublicPremiumFilters = {
  mode: "drivers",
  leftEntityId: "",
  rightEntityId: "",
  trendWindow: 5,
  raceScope: "completed"
};

export const usePublicFiltersStore = create<PublicFiltersState>()(
  persist(
    (set, get) => ({
      byCode: {},
      getFilters: (code) => get().byCode[code] || DEFAULT_FILTERS,
      setFilters: (code, patch) => {
        const current = get().byCode[code] || DEFAULT_FILTERS;
        set({
          byCode: {
            ...get().byCode,
            [code]: { ...current, ...patch }
          }
        });
      }
    }),
    {
      name: "f1_public_filters"
    }
  )
);
