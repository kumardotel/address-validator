import { gql } from '@apollo/client';
import { Location, ValidationResult } from '@/types'; // Import from types

// Search for locations by query (postcode or suburb)
export const SEARCH_LOCATIONS = gql`
  query SearchLocations($query: String!, $state: String) {
    searchLocations(query: $query, state: $state) {
      id
      location
      postcode
      state
      category
      latitude
      longitude
    }
  }
`;

// Validate address combination
export const VALIDATE_ADDRESS = gql`
  query ValidateAddress($postcode: String!, $suburb: String!, $state: String!) {
    validateAddress(postcode: $postcode, suburb: $suburb, state: $state) {
      isValid
      error
      matchedLocation {
        id
        location
        postcode
        state
        category
        latitude
        longitude
      }
    }
  }
`;

// Search suburbs with filtering options
export const SEARCH_SUBURBS = gql`
  query SearchSuburbs($query: String!, $state: String, $categories: [String]) {
    searchSuburbs(query: $query, state: $state, categories: $categories) {
      id
      location
      postcode
      state
      category
      latitude
      longitude
    }
  }
`;

// GraphQL Response Types
export interface SearchLocationsResponse {
  searchLocations: Location[];
}

export interface ValidateAddressResponse {
  validateAddress: ValidationResult;
}

export interface SearchSuburbsResponse {
  searchSuburbs: Location[];
}

// Re-export types for convenience
export type { Location, ValidationResult } from '@/types';
