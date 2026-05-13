import type { Metadata } from 'next';
import { Geist, Geist_Mono, Orbitron } from 'next/font/google';
import './globals.css';
import { Web3Providers } from '@/components/Web3Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
});

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? '6a0428d9acef3c7a49b15edf';

export const metadata: Metadata = {
  title: 'Pipe Mania',
  description: 'Neon cyberpunk pipe puzzle on Base',
  icons: {
    icon: [{ url: '/app-icon.jpg', type: 'image/jpeg', sizes: '1024x1024' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="font-sans min-h-dvh bg-background text-foreground">
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
