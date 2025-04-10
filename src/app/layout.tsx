import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FacelessFlow - Create Videos Without Showing Your Face',
  description: 'AI-driven SaaS platform for creating, scheduling, and publishing vertical short videos for YouTube Shorts and TikTok',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
