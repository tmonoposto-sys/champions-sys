import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourState {
  fullTourDone: boolean;
  newFeaturesTourDone: boolean;
  activeTour: "full" | "newFeatures" | null;
  markFullTourDone: () => void;
  markNewFeaturesTourDone: () => void;
  startTour: (tour: "full" | "newFeatures") => void;
  stopTour: () => void;
  resetTours: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      fullTourDone: false,
      newFeaturesTourDone: false,
      activeTour: null,
      markFullTourDone: () => set({ fullTourDone: true, activeTour: null }),
      markNewFeaturesTourDone: () => set({ newFeaturesTourDone: true, activeTour: null }),
      startTour: (tour) => set({ activeTour: tour }),
      stopTour: () => set({ activeTour: null }),
      resetTours: () => set({ fullTourDone: false, newFeaturesTourDone: false, activeTour: null }),
    }),
    {
      name: "f1_tours",
      partialize: (state) => ({
        fullTourDone: state.fullTourDone,
        newFeaturesTourDone: state.newFeaturesTourDone,
      }),
    }
  )
);
