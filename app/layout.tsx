import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Tour de Gunung Batu 2026 | PEADERAL x Rudeboys Cyclist',
  description: 'Website resmi pendaftaran event gowes amal gratis Tour de Gunung Batu 2026 & Pre-Order (PO) Jersey donasi sepeda untuk anak yatim/dhuafa. 0% fee platform.',
  keywords: ['Tour de Gunung Batu', 'PEADERAL', 'Rudeboys Cyclist', 'Gowes Amal', 'Jersey Sepeda', 'Jonggol', 'Gunung Batu'],
  openGraph: {
    title: 'Tour de Gunung Batu 2026 — Gowes Amal & PO Jersey',
    description: 'Pendaftaran event gowes amal gratis 27 September 2026. 100% keuntungan jersey donasi sepeda.',
    url: 'https://tourdegunungbatu.vercel.app',
    siteName: 'Tour de Gunung Batu',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-yellow selection:text-brand-navy">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
