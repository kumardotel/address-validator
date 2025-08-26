'use client';

import { ApolloProvider } from '@apollo/client/react';
import apolloClient from '@/lib/apollo-client';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ApolloProvider client={apolloClient}>
        {children}
        <Toaster position="top-right" richColors />
      </ApolloProvider>
    </ThemeProvider>
  );
}
