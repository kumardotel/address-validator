'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifierTab } from './verifier-tab';
import { SourceTab } from './source-tab';
import { LogsDisplay } from './logs-display';
import { useActiveTab, useSetActiveTab } from '@/store/app-store';
import { CheckCircle, Search, Database } from 'lucide-react';

export function TabContainer() {
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'verifier' | 'source' | 'logs')
        }
      >
        <div className="px-6 pt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="verifier"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Verifier</span>
            </TabsTrigger>
            <TabsTrigger value="source" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Source</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="verifier" className="mt-0 tab-content">
            <div className="space-y-4">
              <div className="text-center space-y-2 pb-4 border-b">
                <h3 className="text-xl font-semibold">Address Verifier</h3>
                <p className="text-muted-foreground text-sm">
                  Validate that postcode, suburb, and state combinations are
                  correct
                </p>
              </div>
              <VerifierTab />
            </div>
          </TabsContent>

          <TabsContent value="source" className="mt-0 tab-content">
            <div className="space-y-4">
              <div className="text-center space-y-2 pb-4 border-b">
                <h3 className="text-xl font-semibold">Location Source</h3>
                <p className="text-muted-foreground text-sm">
                  Search for locations within suburbs or postcodes
                </p>
              </div>
              <SourceTab />
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-0 tab-content">
            <LogsDisplay />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
