'use client';

import dynamic from 'next/dynamic';
import { Location } from '@/types';
import { Loader2 } from 'lucide-react';

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(
  () =>
    import('./map-component').then((mod) => ({ default: mod.MapComponent })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full rounded-lg border bg-muted flex items-center justify-center">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
  }
);

interface DynamicMapProps {
  locations: Location[];
  selectedLocation?: Location | null;
  height?: string;
  className?: string;
}

export function DynamicMap(props: DynamicMapProps) {
  return <MapComponent {...props} />;
}
