'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  useSourceQuery,
  useSourceResults,
  useSourceSelectedLocation,
  useSetSourceData,
} from '@/store/app-store';
import { Search, MapPin, Loader2, Filter, X } from 'lucide-react';
import { getUniqueCategories } from '@/lib/utils';
import { logToElasticsearch, generateSessionId } from '@/lib/client-logging';
import { DynamicMap } from '@/components/maps/dynamic-map';
import { searchLocations } from '@/services/australia-post';

function hasValidCoordinates(location: any): boolean {
  return (
    typeof location?.latitude === 'number' &&
    typeof location?.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude)
  );
}

export function SourceTab() {
  const query = useSourceQuery() || '';
  const results = useSourceResults() || [];
  const selectedLocation = useSourceSelectedLocation();
  const setSourceData = useSetSourceData();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const availableCategories = getUniqueCategories(results);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    const sessionId = generateSessionId();

    try {
      await logToElasticsearch({
        tab: 'source',
        action: 'search',
        input: { query: query.trim() },
        output: { status: 'pending' },
        user_session: sessionId,
      });

      const searchResults = await searchLocations(query.trim());

      setSourceData({
        results: searchResults,
        selectedLocation: undefined,
      });

      await logToElasticsearch({
        tab: 'source',
        action: 'search',
        input: { query: query.trim() },
        output: {
          resultCount: searchResults.length,
          hasResults: searchResults.length > 0,
          result: 'success',
        },
        user_session: sessionId,
      });
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);

      // Log search error
      await logToElasticsearch({
        tab: 'source',
        action: 'search',
        input: { query: query.trim() },
        output: { error: errorMessage, result: 'error' },
        user_session: sessionId,
      });

      setSourceData({
        results: [],
        selectedLocation: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setSourceData({
      query: value,
      results: value.length < 2 ? [] : results,
      selectedLocation: undefined,
    });
  };

  const handleLocationSelect = async (location: any) => {
    setSourceData({
      selectedLocation: location,
    });

    // Log location selection
    try {
      await logToElasticsearch({
        tab: 'source',
        action: 'selection',
        input: {
          query: query,
          selectedLocationId: location.id,
          appliedFilters: selectedCategories,
        },
        output: {
          selectedLocation: location,
          totalResultsAvailable: results.length,
          filteredResultsCount: filteredResults.length,
        },
        user_session: generateSessionId(),
      });
    } catch (error) {
      console.error('Failed to log location selection:', error);
    }
  };

  const toggleCategoryFilter = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);

    // Clear selected location when changing filters so map shows all available markers
    setSourceData({
      selectedLocation: undefined,
    });
  };

  const clearCategoryFilters = () => {
    setSelectedCategories([]);

    // Clear selected location when clearing filters
    setSourceData({
      selectedLocation: undefined,
    });
  };

  // Filter results by selected categories
  const filteredResults =
    selectedCategories.length > 0
      ? results.filter((location) =>
          selectedCategories.includes(location.category)
        )
      : results;

  // Check how many filtered results have valid coordinates
  const locationsWithCoordinates = filteredResults.filter(
    (location) =>
      location.latitude &&
      location.longitude &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
  );

  const locationsWithoutCoordinates =
    filteredResults.length - locationsWithCoordinates.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search-query">Search Suburb or Postcode</Label>
              <Input
                id="search-query"
                placeholder="e.g., Melbourne or 3000"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {availableCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter by Category</span>
                </Label>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCategoryFilters}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      selectedCategories.includes(category)
                        ? 'default'
                        : 'secondary'
                    }
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? 'hover:bg-primary/90'
                        : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
                    onClick={() => toggleCategoryFilter(category)}
                  >
                    {category} {selectedCategories.includes(category) && '✓'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <p className="text-sm">Search Error: {error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredResults && filteredResults.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center justify-between">
              <span>Search Results ({filteredResults.length})</span>
              {selectedCategories.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  Filtered by: {selectedCategories.join(', ')}
                </span>
              )}
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredResults.map((location) => (
                <div
                  key={location.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedLocation?.id === location.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{location.location}</h5>
                      <p className="text-sm text-muted-foreground">
                        {location.postcode}, {location.state}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {location.category}
                      </Badge>
                    </div>
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredResults.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {selectedLocation
                ? `Selected: ${selectedLocation.location}`
                : `All Search Results (${filteredResults.length} locations)`}
            </h4>

            {selectedLocation ? (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {selectedLocation.postcode}, {selectedLocation.state} •{' '}
                  {selectedLocation.category}
                </p>
                {!hasValidCoordinates(selectedLocation) && (
                  <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      Selected location cannot be shown on map (no coordinates
                      available)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Click on a location above to focus the map, or click on
                  markers for details.
                </p>
                {locationsWithoutCoordinates > 0 &&
                  locationsWithCoordinates.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Showing {locationsWithCoordinates.length} of{' '}
                        {filteredResults.length} locations on map.{' '}
                        {locationsWithoutCoordinates} location
                        {locationsWithoutCoordinates !== 1 ? 's' : ''} don't
                        have coordinates.
                      </p>
                    </div>
                  )}
                {locationsWithoutCoordinates > 0 &&
                  locationsWithCoordinates.length === 0 && (
                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {locationsWithoutCoordinates} location
                        {locationsWithoutCoordinates !== 1 ? 's' : ''} cannot be
                        shown on map (no coordinates available)
                      </p>
                    </div>
                  )}
              </div>
            )}

            {selectedLocation ? (
              // For selected location - show map only if it has coordinates
              hasValidCoordinates(selectedLocation) ? (
                <DynamicMap
                  locations={[selectedLocation]}
                  selectedLocation={selectedLocation}
                  height="h-80"
                />
              ) : (
                <div className="h-80 bg-muted flex items-center justify-center rounded-lg border">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">
                      Selected location cannot be shown on map
                    </p>
                    <p className="text-sm">
                      This location doesn't have coordinate data available
                    </p>
                  </div>
                </div>
              )
            ) : // For all locations view
            locationsWithCoordinates.length > 0 ? (
              <DynamicMap
                locations={locationsWithCoordinates}
                selectedLocation={selectedLocation}
                height="h-80"
              />
            ) : (
              <div className="h-80 bg-muted flex items-center justify-center rounded-lg border">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">
                    No locations can be shown on map
                  </p>
                  <p className="text-sm">
                    The search results don't have coordinate data
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {query && results && results.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Search className="mx-auto h-8 w-8 mb-2" />
            <p>No locations found for "{query}"</p>
            <p className="text-sm">
              Try searching with a different suburb or postcode
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
