import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, VerifierFormData, SourceSearchData } from '@/types';

// Initial states
const initialVerifierState: AppState['verifier'] = {
  formData: {
    postcode: '',
    suburb: '',
    state: '',
  },
  isValid: undefined,
  error: undefined,
  selectedLocation: undefined,
};

const initialSourceState: SourceSearchData = {
  query: '',
  selectedLocation: undefined,
  results: [],
  filters: {
    categories: [],
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'verifier' as 'verifier' | 'source' | 'logs',
      verifier: initialVerifierState,
      source: initialSourceState,
      setActiveTab: (tab: 'verifier' | 'source' | 'logs') => {
        set({ activeTab: tab });
      },

      setVerifierData: (data: Partial<AppState['verifier']>) => {
        set((state) => ({
          verifier: {
            ...state.verifier,
            ...data,
          },
        }));
      },

      setSourceData: (data: Partial<SourceSearchData>) => {
        set((state) => ({
          source: {
            ...state.source,
            ...data,
          },
        }));
      },

      resetVerifier: () => {
        set({ verifier: initialVerifierState });
      },

      resetSource: () => {
        set({ source: initialSourceState });
      },
    }),
    {
      name: 'lawpath-address-validator-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        verifier: {
          formData: state.verifier.formData,
          isValid: state.verifier.isValid,
          error: state.verifier.error,
          selectedLocation: state.verifier.selectedLocation,
        },
        source: {
          query: state.source.query,
          results: state.source.results?.slice(0, 20) || [], // Persist first 20 results
          selectedLocation: state.source.selectedLocation, // Persist selection
          filters: state.source.filters,
        },
      }),
      skipHydration: false,
    }
  )
);

// selectors
export const useActiveTab = () => useAppStore((state) => state.activeTab);
export const useVerifierFormData = () =>
  useAppStore((state) => state.verifier.formData);
export const useVerifierIsValid = () =>
  useAppStore((state) => state.verifier.isValid);
export const useVerifierError = () =>
  useAppStore((state) => state.verifier.error);
export const useVerifierSelectedLocation = () =>
  useAppStore((state) => state.verifier.selectedLocation);
export const useSourceQuery = () => useAppStore((state) => state.source.query);
export const useSourceResults = () =>
  useAppStore((state) => state.source.results);
export const useSourceSelectedLocation = () =>
  useAppStore((state) => state.source.selectedLocation);

// Individual action selectors
export const useSetActiveTab = () => useAppStore((state) => state.setActiveTab);
export const useSetVerifierData = () =>
  useAppStore((state) => state.setVerifierData);
export const useSetSourceData = () =>
  useAppStore((state) => state.setSourceData);
