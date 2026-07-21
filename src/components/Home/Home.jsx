import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] w-full overflow-hidden pt-16 sm:pt-20">
      <div className="relative h-[82vh] min-h-[580px] max-h-[820px] w-full overflow-hidden border-b border-border/30 shadow-2xl">
        <HeroCarousel />
      </div>
    </section>
  );
}

export default Home;
