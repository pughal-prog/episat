import { create } from "zustand";

interface EpiSatState {
  selectedState: string;
  selectedLocation: string;
  selectedDisease: string; // "dengue", "malaria", "chikungunya", etc.
  horizonDays: number;
  activeLayer: string; // "risk", "bsi", "anomaly", "forecast", "citizen"
  floodMode: boolean;
  selectedCell: any | null;
  isAssistantOpen: boolean;
  isSimulatorOpen: boolean;
  isCitizenModalOpen: boolean;
  
  setSelectedState: (state: string) => void;
  setSelectedLocation: (loc: string) => void;
  setSelectedDisease: (disease: string) => void;
  setHorizonDays: (days: number) => void;
  setActiveLayer: (layer: string) => void;
  setFloodMode: (flood: boolean) => void;
  setSelectedCell: (cell: any) => void;
  toggleAssistant: () => void;
  toggleSimulator: () => void;
  toggleCitizenModal: () => void;
}

export const useEpiSatStore = create<EpiSatState>((set) => ({
  selectedState: "TN",
  selectedLocation: "Chennai",
  selectedDisease: "dengue",
  horizonDays: 21,
  activeLayer: "risk",
  floodMode: false,
  selectedCell: null,
  isAssistantOpen: false,
  isSimulatorOpen: false,
  isCitizenModalOpen: false,

  setSelectedState: (selectedState) => set({ selectedState }),
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  setSelectedDisease: (selectedDisease) => set({ selectedDisease }),
  setHorizonDays: (horizonDays) => set({ horizonDays }),
  setActiveLayer: (activeLayer) => set({ activeLayer }),
  setFloodMode: (floodMode) => set({ floodMode }),
  setSelectedCell: (selectedCell) => set({ selectedCell }),
  toggleAssistant: () => set((state) => ({ isAssistantOpen: !state.isAssistantOpen })),
  toggleSimulator: () => set((state) => ({ isSimulatorOpen: !state.isSimulatorOpen })),
  toggleCitizenModal: () => set((state) => ({ isCitizenModalOpen: !state.isCitizenModalOpen })),
}));
