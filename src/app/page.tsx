'use client';

import { Suspense, lazy, useEffect } from 'react';
import { useQualityStore } from '@/lib/store';
import { detectAndSetQuality } from '@/lib/quality';
import LoadingScreen from '@/components/ui/LoadingScreen';
import HeroSection from '@/components/sections/HeroSection';
import ProblemSection from '@/components/sections/ProblemSection';
import ServicesSection from '@/components/sections/ServicesSection';
import SocialProofSection from '@/components/sections/SocialProofSection';
import AboutSection from '@/components/sections/AboutSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import BlogSection from '@/components/sections/BlogSection';
import ContactSection from '@/components/sections/ContactSection';

const Scene3D = lazy(() => import('@/components/canvas/Scene3D'));

export default function Home() {
  const { qualityTier, isLoading } = useQualityStore();
  const show3D = qualityTier !== 'fallback';

  // Initialize quality detection on mount
  useEffect(() => {
    detectAndSetQuality();
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}

      {show3D && (
        <div className="canvas-container">
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </div>
      )}

      <div className="content-layer">
        <main>
          {/* Conversion Funnel Flow */}
          <HeroSection />
          <ProblemSection />
          <ServicesSection />
          <SocialProofSection />
          <AboutSection />
          <HowItWorksSection />
          <ProjectsSection />
          <BlogSection />
          <ContactSection />
        </main>
      </div>
    </>
  );
}

