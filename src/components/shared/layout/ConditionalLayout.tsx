'use client';
import React, { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { usePlatformSettings } from '@/hooks/usePlatformQueries';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { CandidateDataProvider } from '@/components/shared/CandidateDataProvider';

export interface PlatformContextType {
  settings: any;
  homeHero: any;
  homeSections: any[];
  initialJobs: any[];
}

export const PlatformContext = createContext<PlatformContextType>({
  settings: null,
  homeHero: null,
  homeSections: [],
  initialJobs: []
});

export const usePlatformContext = () => useContext(PlatformContext);

export default function ConditionalLayout({ 
  children,
  initialSettings,
  initialHomeHero,
  initialHomeSections,
  initialJobs = []
}: { 
  children: React.ReactNode;
  initialSettings?: any;
  initialHomeHero?: any;
  initialHomeSections?: any[];
  initialJobs?: any[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isDashboard = pathname?.startsWith('/dashboard');

  const queryClient = useQueryClient();
  const { data: settings } = usePlatformSettings(initialSettings);
  const homeHero = initialHomeHero || null;
  const homeSections = initialHomeSections || [];

  useEffect(() => {
    const handleSettingsChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    };

    window.addEventListener('cs_settings_changed', handleSettingsChanged);
    window.addEventListener('cs_page_changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('cs_settings_changed', handleSettingsChanged);
      window.removeEventListener('cs_page_changed', handleSettingsChanged);
    };
  }, [queryClient]);

  if (isAdmin) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <PlatformContext.Provider value={{ settings, homeHero, homeSections, initialJobs: initialJobs || [] }}>
      <CandidateDataProvider>
        <Navbar initialSettings={settings} />
        <main className={`flex-grow ${isDashboard ? 'h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-hidden flex flex-col' : ''}`}>
          {children}
        </main>
        {!isDashboard && <Footer initialSettings={settings} />}
      </CandidateDataProvider>
    </PlatformContext.Provider>
  );
}
