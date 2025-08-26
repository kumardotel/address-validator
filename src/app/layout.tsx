import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/client-providers';
import { ModeToggle } from '@/components/mode-toggle';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lawpath Address Validator',
  description:
    'Australia Post address validation and location search application',
  keywords: [
    'address validation',
    'australia post',
    'postcode',
    'suburb',
    'location search',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Image
                      src="/logo.png"
                      alt="Lawpath"
                      width={120}
                      height={40}
                      className="h-8 w-auto"
                      priority
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
