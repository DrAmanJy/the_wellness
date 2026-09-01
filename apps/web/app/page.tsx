import CTA from '@/components/sections/home/CTA';
import DailyDeals from '@/components/sections/home/DailyDeals';
import FeaturedCategories from '@/components/sections/home/FeaturedCategories';
import Hero from '@/components/sections/home/Hero';
import PopularProducts from '@/components/sections/home/PopularProducts';
import PromoBanners from '@/components/sections/home/PromoBanners';
import SpecialPromoBanner from '@/components/sections/home/SpecialPromoBanner';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <SpecialPromoBanner />
      <DailyDeals />
      <PopularProducts />
      <PromoBanners />
      <CTA />
    </>
  );
}
