import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Claude Forkoor | The Rug Stops Here',
  description: 'Automated Contract Surgeon - Finding bugs, fixing contracts, forking the future. Safe forks for rugged tokens on Solana.',
  keywords: ['solana', 'defi', 'token', 'fork', 'rug pull', 'protection', 'token-2022'],
  authors: [{ name: 'Claude Forkoor' }],
  openGraph: {
    title: 'Claude Forkoor | The Rug Stops Here',
    description: 'Automated Contract Surgeon - Forked, Fixed, and Fired Up.',
    url: 'https://claudeforkoor.xyz',
    siteName: 'Claude Forkoor',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Claude Forkoor - Contract Surgeon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claude Forkoor | The Rug Stops Here',
    description: 'Automated Contract Surgeon - Forked, Fixed, and Fired Up.',
    creator: '@ClaudeForkoor',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans bg-slate-950 text-white min-h-screen antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
