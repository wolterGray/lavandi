import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] w-full px-4 pt-4 pb-8 sm:px-6 sm:pt-6 md:px-8 lg:px-12">
      <div className="relative mx-auto max-w-7xl h-[54vh] min-h-[400px] max-h-[560px] w-full overflow-hidden rounded-[24px] sm:rounded-[32px]">
        <HeroCarousel />
      </div>
    </section>
  );
}

export default Home;
