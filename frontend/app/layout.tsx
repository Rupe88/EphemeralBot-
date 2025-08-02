import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EphemeralBot - Snapchat for Discord',
  description:
    'Auto-delete Discord messages after set time periods. Keep your Discord clean and organized.',
  keywords: ['discord', 'bot', 'ephemeral', 'messages', 'auto-delete'],
  authors: [{ name: 'EphemeralBot Team' }],
  openGraph: {
    title: 'EphemeralBot - Snapchat for Discord',
    description:
      'Auto-delete Discord messages after set time periods. Keep your Discord clean and organized.',
    type: 'website',
    url: 'https://ephemeralbot.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EphemeralBot - Snapchat for Discord',
    description:
      'Auto-delete Discord messages after set time periods. Keep your Discord clean and organized.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
