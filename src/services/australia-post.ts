export interface Location {
  id: number;
  location: string;
  postcode: string;
  state: string;
  category: string;
  latitude?: number;
  longitude?: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  matchedLocation?: Location;
}

// Search locations by calling API route
export async function searchLocations(
  query: string,
  state?: string
): Promise<Location[]> {
  try {
    const params = new URLSearchParams({ q: query });
    if (state) {
      params.append('state', state);
    }

    const url = `/api/australia-post?${params}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      console.error('Services - API Error:', errorData);
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();

    return data.locations || [];
  } catch (error) {
    console.error('Services - Error searching locations:', error);
    throw new Error(
      `Failed to search locations: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Search suburbs with additional filtering
export async function searchSuburbs(
  query: string,
  options?: { state?: string; categories?: string[] }
): Promise<Location[]> {
  try {
    const locations = await searchLocations(query, options?.state);

    // Apply category filter
    if (options?.categories && options.categories.length > 0) {
      const filtered = locations.filter((location) =>
        options.categories!.includes(location.category)
      );
      return filtered;
    }

    return locations;
  } catch (error) {
    console.error('Services - Error searching suburbs:', error);
    throw new Error(
      `Failed to search suburbs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Validate address combination
export async function validateAddress(
  postcode: string,
  suburb: string,
  state: string
): Promise<ValidationResult> {
  try {
    const postcodeResults = await searchLocations(postcode);

    if (postcodeResults.length === 0) {
      return {
        isValid: false,
        error: `No locations found for postcode ${postcode}`,
      };
    }

    // Check if the provided state matches any results
    const stateMatches = postcodeResults.filter(
      (location) => location.state.toUpperCase() === state.toUpperCase()
    );

    if (stateMatches.length === 0) {
      const availableStates = [
        ...new Set(postcodeResults.map((loc) => loc.state)),
      ].join(', ');
      return {
        isValid: false,
        error: `The postcode ${postcode} does not exist in the state ${state}. Available in: ${availableStates}`,
      };
    }

    // Check if the suburb matches any location in the postcode
    const suburbMatches = stateMatches.filter((location) => {
      const locationName = location.location.toLowerCase();
      const suburbName = suburb.toLowerCase();

      if (locationName === suburbName) return true;

      if (
        locationName.includes(suburbName) ||
        suburbName.includes(locationName)
      )
        return true;

      // Try word matching
      const locationWords = locationName
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 0);
      const suburbWords = suburbName
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 0);

      return (
        locationWords.some((lw) => suburbWords.some((sw) => lw === sw)) ||
        suburbWords.some((sw) => locationWords.some((lw) => lw === sw))
      );
    });

    if (suburbMatches.length === 0) {
      const availableSuburbs = stateMatches
        .map((loc) => loc.location)
        .slice(0, 5)
        .join(', ');

      return {
        isValid: false,
        error: `The postcode ${postcode} does not match the suburb ${suburb}. Available locations: ${availableSuburbs}`,
      };
    }

    const exactMatch = suburbMatches.find(
      (location) => location.location.toLowerCase() === suburb.toLowerCase()
    );

    const matchedLocation = exactMatch || suburbMatches[0];

    return {
      isValid: true,
      matchedLocation: matchedLocation,
    };
  } catch (error) {
    console.error('Services - Error validating address:', error);
    return {
      isValid: false,
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
