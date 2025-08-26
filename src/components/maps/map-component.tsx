'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapComponentProps {
  locations: Location[];
  selectedLocation?: Location | null;
  height?: string;
  className?: string;
}

// Type guard to check if location has valid coordinates
function hasValidCoordinates(location: Location): location is Location & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude)
  );
}

export function MapComponent({
  locations,
  selectedLocation,
  height = 'h-64',
  className = '',
}: MapComponentProps) {
  // Default center (Melbourne, Australia)
  const defaultCenter: [number, number] = [-37.8136, 144.9631];

  const getMapCenter = (): [number, number] => {
    // Check selected location first
    if (selectedLocation && hasValidCoordinates(selectedLocation)) {
      return [selectedLocation.latitude, selectedLocation.longitude];
    }

    // Find first location with valid coordinates
    const validLocation = locations.find(hasValidCoordinates);

    if (validLocation) {
      return [validLocation.latitude, validLocation.longitude];
    }

    return defaultCenter;
  };

  const getZoomLevel = (): number => {
    if (selectedLocation || locations.length === 1) {
      return 13;
    }
    if (locations.length > 1) {
      return 10;
    }
    return 11;
  };

  return (
    <div
      className={`${height} w-full rounded-lg overflow-hidden border ${className}`}
    >
      <MapContainer
        center={getMapCenter()}
        zoom={getZoomLevel()}
        style={{ height: '100%', width: '100%' }}
        key={`${getMapCenter().join(',')}-${locations.length}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.filter(hasValidCoordinates).map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{location.location}</h3>
                <p className="text-sm text-gray-600">
                  {location.postcode}, {location.state}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {location.category}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {location.latitude.toFixed(4)}, Lng:{' '}
                  {location.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
