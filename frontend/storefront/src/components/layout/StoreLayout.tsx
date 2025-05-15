'use client';

import Header from './Header';
import Footer from './Footer';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Adiciona padding top para compensar o header fixo */}
      <main className="flex-grow pt-32 pb-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
