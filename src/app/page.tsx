'use client';

import { TabContainer } from '@/components/tabs/tab-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MapPin, Search, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Australian Address Validation & Location Search
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Validate postal addresses and search for locations across Australia
          using the official Australia Post API. Switch between verification and
          search modes.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">Address Verification</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Validate postcode, suburb, and state combinations to ensure
              accuracy
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Location Search</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Search and explore locations within suburbs or postcodes with
              filtering
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Map Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              View validated addresses and search results on an interactive map
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <TabContainer />
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
              1
            </div>
            <p>
              <strong>Verifier Tab:</strong> Enter a postcode, suburb, and state
              to validate if they match according to Australia Post records.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
              2
            </div>
            <p>
              <strong>Source Tab:</strong> Search for locations within a suburb
              or postcode, filter by categories, and view results on the map.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
              3
            </div>
            <p>
              Your selections and search data are automatically saved and will
              be restored when you return to the application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
