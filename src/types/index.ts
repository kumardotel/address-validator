export interface Location {
  category: string;
  id: number;
  latitude?: number;
  location: string;
  longitude?: number;
  postcode: string;
  state: string;
}

export interface AustraliaPostResponse {
  localities: {
    locality: Array<{
      category: string;
      id: number;
      latitude: number;
      longitude: number;
      location: string;
      postcode: string;
      state: string;
    }>;
  };
}

export interface VerifierFormData {
  postcode: string;
  suburb: string;
  state: string;
}

export interface SourceSearchData {
  query: string;
  selectedLocation?: Location;
  results: Location[];
  filters: {
    categories: string[];
  };
}

export interface AppState {
  activeTab: 'verifier' | 'source' | 'logs';
  verifier: {
    formData: VerifierFormData;
    isValid?: boolean;
    error?: string;
    selectedLocation?: Location;
  };
  source: SourceSearchData;

  setActiveTab: (tab: 'verifier' | 'source' | 'logs') => void;
  setVerifierData: (data: Partial<AppState['verifier']>) => void;
  setSourceData: (data: Partial<SourceSearchData>) => void;
  resetVerifier: () => void;
  resetSource: () => void;
}

export interface ElasticsearchLog {
  timestamp: string;
  tab: 'verifier' | 'source';
  action: 'search' | 'validation' | 'selection';
  input: Record<string, any>;
  output: Record<string, any>;
  user_session: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  matchedLocation?: Location;
}

export const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' },
] as const;

export type AustralianStateCode = (typeof AUSTRALIAN_STATES)[number]['value'];
