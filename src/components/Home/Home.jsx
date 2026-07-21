import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] w-full px-4 pt-4 pb-8 sm:px-6 sm:pt-6 md:px-8 lg:px-12">
      <div className="relative mx-auto max-w-7xl aspect-[16/9] sm:aspect-[16/7.5] md:aspect-[2.2/1] w-full overflow-hidden rounded-[20px] sm:rounded-[32px] border border-border/40 shadow-2xl">
        <HeroCarousel />
      </div>
    </section>
  );
}

export default Home;
