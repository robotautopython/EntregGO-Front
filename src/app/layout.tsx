import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EntregGO',
  description: 'Plataforma web de entregas sob demanda.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
