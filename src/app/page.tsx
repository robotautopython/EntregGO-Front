import { BrandHeader } from '@/components/landing/BrandHeader';
import { CTABand } from '@/components/landing/CTABand';
import { CourierPitch } from '@/components/landing/CourierPitch';
import { FAQ } from '@/components/landing/FAQ';
import { Hero } from '@/components/landing/Hero';
import { RouteSteps } from '@/components/landing/RouteSteps';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA';
import { StorePitch } from '@/components/landing/StorePitch';
import { TrustSeals } from '@/components/landing/TrustSeals';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-paper text-asphalt-950">
      <BrandHeader />
      <Hero />
      <RouteSteps />
      <StorePitch />
      <CourierPitch />
      <TrustSeals />
      <FAQ />
      <CTABand />
      <SiteFooter />
      <StickyMobileCTA />
    </main>
  );
}
