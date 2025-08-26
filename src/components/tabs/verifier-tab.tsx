'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useVerifierFormData,
  useVerifierIsValid,
  useVerifierError,
  useVerifierSelectedLocation,
  useSetVerifierData,
} from '@/store/app-store';
import { MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { logToElasticsearch, generateSessionId } from '@/lib/client-logging';
import { DynamicMap } from '@/components/maps/dynamic-map';
import { Location } from '@/types';

async function validateAddress(
  postcode: string,
  suburb: string,
  state: string
) {
  // Search by postcode AND state
  const params = new URLSearchParams({ q: postcode, state: state });

  const response = await fetch(`/api/australia-post?${params}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API error: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  const postcodeResults: Location[] = data.locations || [];

  if (postcodeResults.length === 0) {
    return {
      isValid: false,
      error: `The postcode ${postcode} does not match the suburb ${suburb}`,
    };
  }

  const suburbMatches = postcodeResults.filter((location) => {
    const locationName = location.location.toLowerCase().trim();
    const suburbName = suburb.toLowerCase().trim();

    if (locationName === suburbName) return true;

    if (locationName.includes(suburbName) || suburbName.includes(locationName))
      return true;

    const locationWords = locationName
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);
    const suburbWords = suburbName
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    return locationWords.some((lw) => suburbWords.some((sw) => lw === sw));
  });

  console.log('Suburb matches in state:', suburbMatches);

  if (suburbMatches.length === 0) {
    return {
      isValid: false,
      error: `The postcode ${postcode} does not match the suburb ${suburb}`,
    };
  }

  const matchedLocation = suburbMatches[0];

  return {
    isValid: true,
    matchedLocation: matchedLocation,
  };
}

export function VerifierTab() {
  const formData = useVerifierFormData() || {
    postcode: '',
    suburb: '',
    state: '',
  };
  const isValid = useVerifierIsValid();
  const error = useVerifierError();
  const selectedLocation = useVerifierSelectedLocation();
  const setVerifierData = useSetVerifierData();

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setVerifierData({
      formData: {
        ...formData,
        [field]: value,
      },
      isValid: undefined,
      error: undefined,
    });
  };

  const handleValidate = async () => {
    const { postcode, suburb, state } = formData;

    if (!postcode || !suburb || !state) {
      setVerifierData({
        isValid: false,
        error: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);

    try {
      const sessionId = generateSessionId();

      // Log the input to Elasticsearch via API
      await logToElasticsearch({
        tab: 'verifier',
        action: 'validation',
        input: { postcode, suburb, state },
        output: { status: 'pending' },
        user_session: sessionId,
      });

      // Call validation function
      const validationResult = await validateAddress(postcode, suburb, state);

      setVerifierData({
        isValid: validationResult.isValid,
        error: validationResult.error,
        selectedLocation: validationResult.matchedLocation,
      });

      // Log the result to Elasticsearch via API
      await logToElasticsearch({
        tab: 'verifier',
        action: 'validation',
        input: { postcode, suburb, state },
        output: {
          isValid: validationResult.isValid,
          error: validationResult.error,
          matchedLocation: validationResult.matchedLocation,
          result: validationResult.isValid ? 'success' : 'failed',
        },
        user_session: sessionId,
      });
    } catch (err) {
      console.error('Validation error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred during validation';

      setVerifierData({
        isValid: false,
        error: errorMessage,
      });

      // Log the error to Elasticsearch via API
      await logToElasticsearch({
        tab: 'verifier',
        action: 'validation',
        input: { postcode, suburb, state },
        output: { error: errorMessage, result: 'error' },
        user_session: generateSessionId(),
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.postcode && formData.suburb && formData.state;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                placeholder="e.g., 3000"
                value={formData.postcode || ''}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                maxLength={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suburb">Suburb</Label>
              <Input
                id="suburb"
                placeholder="e.g., Melbourne"
                value={formData.suburb || ''}
                onChange={(e) => handleInputChange('suburb', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="e.g., VIC"
                value={formData.state || ''}
                onChange={(e) =>
                  handleInputChange('state', e.target.value.toUpperCase())
                }
                maxLength={3}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Valid states: VIC, NSW, QLD, WA, SA, TAS, NT, ACT
              </p>
            </div>
          </div>

          <Button
            onClick={handleValidate}
            disabled={!isFormValid || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Validate Address
              </>
            )}
          </Button>

          {isValid !== undefined && (
            <div
              className={`p-4 rounded-lg border ${
                isValid
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-100'
                  : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isValid ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <p className="font-medium">
                  {isValid
                    ? 'The postcode, suburb, and state input are valid.'
                    : error || 'Validation failed'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isValid && selectedLocation && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Validated Location: {selectedLocation.location}
            </h4>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {selectedLocation.postcode}, {selectedLocation.state} •{' '}
                {selectedLocation.category}
              </p>
            </div>
            <DynamicMap
              locations={[selectedLocation]}
              selectedLocation={selectedLocation}
              height="h-80"
            />
          </CardContent>
        </Card>
      )}

      {isValid && !selectedLocation && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Location Map
            </h4>
            <div className="h-64 bg-muted flex items-center justify-center rounded-lg border">
              <p className="text-muted-foreground">
                No location coordinates available
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
