'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Database,
  Calendar,
  Search,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  tab: 'verifier' | 'source';
  action: string;
  user_session: string;
  input: any;
  output: any;
}

export function LogsDisplay() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'verifier' | 'source'>(
    'all'
  );

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        console.error('Failed to fetch logs:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs =
    selectedTab === 'all'
      ? logs
      : logs.filter((log) => log.tab === selectedTab);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string, output: any) => {
    if (output?.error || output?.result === 'error') return 'destructive';
    if (output?.result === 'success' || output?.isValid === true)
      return 'default';
    if (output?.status === 'pending') return 'secondary';
    return 'outline';
  };

  const getActionIcon = (action: string, output: any) => {
    if (output?.error || output?.result === 'error')
      return <AlertTriangle className="h-3 w-3" />;
    if (output?.result === 'success' || output?.isValid === true)
      return <CheckCircle className="h-3 w-3" />;
    return <Search className="h-3 w-3" />;
  };

  const formatLogData = (data: any) => {
    if (!data) return 'null';
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  const getLogSummary = (log: LogEntry) => {
    const { tab, action, input, output } = log;

    if (tab === 'verifier' && action === 'validation') {
      const { postcode, suburb, state } = input || {};
      if (output?.result === 'success') {
        return `Validated: ${suburb}, ${state} ${postcode}`;
      } else if (output?.error) {
        return `Failed: ${suburb}, ${state} ${postcode} - ${output.error.substring(0, 50)}...`;
      } else if (output?.status === 'pending') {
        return `Validating: ${suburb}, ${state} ${postcode}...`;
      }
    }

    if (tab === 'source' && action === 'search') {
      const { query } = input || {};
      if (output?.result === 'success') {
        return `Found ${output.resultCount || 0} results for "${query}"`;
      } else if (output?.error) {
        return `Search failed for "${query}": ${output.error.substring(0, 40)}...`;
      } else if (output?.status === 'pending') {
        return `Searching for "${query}"...`;
      }
    }

    if (tab === 'source' && action === 'selection') {
      const selectedLocation = output?.selectedLocation;
      if (selectedLocation) {
        return `Selected: ${selectedLocation.location}, ${selectedLocation.state}`;
      }
    }

    return `${action} on ${tab}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Logs</h3>
          <p className="text-sm text-muted-foreground">
            Real-time logging of all user interactions stored in Elasticsearch
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Verifier Actions</p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.tab === 'verifier').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Source Actions</p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.tab === 'source').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value as any)}
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All Logs ({logs.length})</TabsTrigger>
              <TabsTrigger value="verifier">
                Verifier ({logs.filter((l) => l.tab === 'verifier').length})
              </TabsTrigger>
              <TabsTrigger value="source">
                Source ({logs.filter((l) => l.tab === 'source').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="font-medium text-lg mb-2">
                    No logs available
                  </h3>
                  <p className="text-sm mb-4">
                    Activity will appear here as you use the Verifier and Source
                    tabs
                  </p>
                  <Button
                    variant="outline"
                    onClick={fetchLogs}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                    />
                    Check for Logs
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="border rounded-lg p-4 space-y-3 bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {log.tab}
                            </Badge>
                            <Badge
                              variant={getActionColor(log.action, log.output)}
                            >
                              {getActionIcon(log.action, log.output)}
                              <span className="ml-1 capitalize">
                                {log.action}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>

                        <div className="text-sm font-medium text-foreground">
                          {getLogSummary(log)}
                        </div>

                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View technical details
                          </summary>
                          <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">
                                Input:
                              </p>
                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-32">
                                {formatLogData(log.input)}
                              </pre>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">
                                Output:
                              </p>
                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-32">
                                {formatLogData(log.output)}
                              </pre>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Session:{' '}
                            <code className="bg-muted px-1 rounded">
                              {log.user_session}
                            </code>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
