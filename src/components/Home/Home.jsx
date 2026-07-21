import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] w-full overflow-hidden pt-[88px] sm:pt-[96px] lg:pt-[104px]">
      <div className="relative h-[80vh] min-h-[560px] max-h-[800px] w-full overflow-hidden border-b border-border/30 shadow-2xl">
        <HeroCarousel />
      </div>
    </section>
  );
}

export default Home;
